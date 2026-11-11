/* Xero: raise a sales invoice and have Xero email it to the client.
   Uses a Xero Custom Connection (server to server, no login needed), set up
   once in the Xero developer portal against the Minshall Group organisation.
   Env (Vercel → Project → Settings → Environment Variables):
     XERO_CLIENT_ID, XERO_CLIENT_SECRET   from the custom connection
     XERO_SCOPES          optional, default "accounting.invoices accounting.contacts"
     XERO_SALES_ACCOUNT   optional, the revenue account code, default 200
     XERO_TAX_TYPE        optional, e.g. OUTPUT2 for 20% VAT; omitted = the account's default
     XERO_DUE_DAYS        optional, default 14
   Amounts are before VAT (line amounts exclusive). */
const API = 'https://api.xero.com/api.xro/2.0';

export const xeroReady = () => !!(process.env.XERO_CLIENT_ID && process.env.XERO_CLIENT_SECRET);

async function token() {
  const basic = Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString('base64');
  const r = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: process.env.XERO_SCOPES || 'accounting.invoices accounting.contacts' })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Xero sign-in failed (${r.status}${j.error ? ': ' + j.error : ''})`);
  return j.access_token;
}

/* Xero's validation messages, in plain words */
const why = j => (j?.Elements || []).flatMap(e => (e.ValidationErrors || []).map(v => v.Message)).filter(Boolean).join('; ') || j?.Message || j?.Detail || '';

async function call(tok, path, { method = 'GET', body } = {}) {
  const r = await fetch(API + path, {
    method, headers: { Authorization: `Bearer ${tok}`, Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await r.text(); let j = {}; try { j = text ? JSON.parse(text) : {}; } catch { }
  if (!r.ok) throw new Error(`Xero ${method} ${path.split('?')[0]} failed (${r.status})${why(j) ? ': ' + why(j) : ''}`);
  return j;
}

const q = s => String(s).replace(/"/g, '');
async function findOrCreateContact(tok, { contactId, name, email }) {
  if (contactId) return contactId;
  for (const where of [email && `EmailAddress=="${q(email)}"`, name && `Name=="${q(name)}"`].filter(Boolean)) {
    const j = await call(tok, `/Contacts?where=${encodeURIComponent(where)}`);
    const c = (j.Contacts || []).find(x => x.ContactStatus !== 'ARCHIVED');
    if (c) return c.ContactID;
  }
  const j = await call(tok, '/Contacts', { method: 'POST', body: { Contacts: [{ Name: name, EmailAddress: email || undefined }] } });
  return j.Contacts[0].ContactID;
}

/* Returns { contactId, invoiceId, number, total, dueDate, url, sent }.
   send=true authorises the invoice and emails it from Xero; send=false leaves a draft in Xero to check first. */
export async function raiseInvoice({ contactId, name, email, reference, label, amount, send = true }) {
  const tok = await token();
  const cid = await findOrCreateContact(tok, { contactId, name, email });
  const today = new Date(), due = new Date(today.getTime() + (Number(process.env.XERO_DUE_DAYS) || 14) * 864e5);
  const d = x => x.toISOString().slice(0, 10);
  const line = { Description: label, Quantity: 1, UnitAmount: Number(amount), AccountCode: process.env.XERO_SALES_ACCOUNT || '200', ...(process.env.XERO_TAX_TYPE ? { TaxType: process.env.XERO_TAX_TYPE } : {}) };
  const j = await call(tok, '/Invoices', { method: 'POST', body: { Invoices: [{ Type: 'ACCREC', Contact: { ContactID: cid }, Date: d(today), DueDate: d(due), Reference: reference, LineAmountTypes: 'Exclusive', Status: send ? 'AUTHORISED' : 'DRAFT', LineItems: [line] }] } });
  const inv = j.Invoices[0];
  let sent = false, url = '';
  if (send) {
    await call(tok, `/Invoices/${inv.InvoiceID}/Email`, { method: 'POST', body: {} });
    sent = true;
    try { url = (await call(tok, `/Invoices/${inv.InvoiceID}/OnlineInvoice`)).OnlineInvoices?.[0]?.OnlineInvoiceUrl || ''; } catch { }
  }
  return { contactId: cid, invoiceId: inv.InvoiceID, number: inv.InvoiceNumber || '', total: inv.Total, dueDate: d(due), url, sent };
}
