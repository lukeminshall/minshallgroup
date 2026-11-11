/* Checks the Xero invoice calls against a stand-in Xero (no network, no real keys).
   Run: node supabase/tests/xero.test.mjs   Every line should start with PASS. */
process.env.XERO_CLIENT_ID = 'test-id'; process.env.XERO_CLIENT_SECRET = 'test-secret';
const calls = [];
let contacts = [];
globalThis.fetch = async (url, o = {}) => {
  const u = String(url), body = o.body && typeof o.body === 'string' && o.body.startsWith('{') ? JSON.parse(o.body) : o.body;
  calls.push({ u, method: o.method || 'GET', body, auth: o.headers?.Authorization });
  const json = (j, status = 200) => new Response(JSON.stringify(j), { status, headers: { 'Content-Type': 'application/json' } });
  if (u.includes('identity.xero.com')) return json({ access_token: 'tok', expires_in: 1800 });
  if (u.includes('/Contacts?where=')) return json({ Contacts: contacts });
  if (u.endsWith('/Contacts')) return json({ Contacts: [{ ContactID: 'c-new' }] });
  if (u.endsWith('/Invoices')) { if (body.Invoices[0].LineItems[0].UnitAmount < 0) return json({ Elements: [{ ValidationErrors: [{ Message: 'Amount must be positive' }] }] }, 400); return json({ Invoices: [{ InvoiceID: 'inv-1', InvoiceNumber: 'INV-0042', Total: 14400 }] }); }
  if (u.endsWith('/Email')) return new Response(null, { status: 204 });
  if (u.endsWith('/OnlineInvoice')) return json({ OnlineInvoices: [{ OnlineInvoiceUrl: 'https://in.xero.com/abc' }] });
  return json({}, 404);
};
const { raiseInvoice, xeroReady } = await import('../../api/_lib/xero.js');
let fails = 0; const ok = (n, c) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n); };

ok('ready when both keys are set', xeroReady());
const r = await raiseInvoice({ name: 'IML Healthcare', email: 'accounts@client.test', reference: 'Specification, version 2', label: 'IML Healthcare: Project costs', amount: 12000, send: true });
const tok = calls.find(c => c.u.includes('identity'));
ok('signs in with the custom connection and granular scopes', tok.auth === 'Basic ' + Buffer.from('test-id:test-secret').toString('base64') && String(tok.body).includes('scope=accounting.invoices+accounting.contacts'));
ok('creates the contact when none matches', calls.some(c => c.u.endsWith('/Contacts') && c.method === 'POST' && c.body.Contacts[0].Name === 'IML Healthcare' && c.body.Contacts[0].EmailAddress === 'accounts@client.test'));
const inv = calls.find(c => c.u.endsWith('/Invoices')).body.Invoices[0];
ok('sales invoice, authorised, amounts before VAT', inv.Type === 'ACCREC' && inv.Status === 'AUTHORISED' && inv.LineAmountTypes === 'Exclusive' && inv.LineItems[0].UnitAmount === 12000 && inv.LineItems[0].AccountCode === '200' && inv.Contact.ContactID === 'c-new');
ok('due in 14 days, with the sign-off as the reference', inv.Reference === 'Specification, version 2' && (Date.parse(inv.DueDate) - Date.parse(inv.Date)) / 864e5 === 14);
ok('asks Xero to email it', calls.some(c => c.u.endsWith('/Invoices/inv-1/Email') && c.method === 'POST'));
ok('returns the number, total and online link', r.number === 'INV-0042' && r.total === 14400 && r.url === 'https://in.xero.com/abc' && r.sent === true && r.contactId === 'c-new');

calls.length = 0; contacts = [{ ContactID: 'c-existing', ContactStatus: 'ACTIVE' }];
const d = await raiseInvoice({ name: 'IML Healthcare', email: 'accounts@client.test', reference: 'x', label: 'y', amount: 500, send: false });
ok('reuses an existing Xero contact', d.contactId === 'c-existing' && !calls.some(c => c.u.endsWith('/Contacts') && c.method === 'POST'));
ok('draft mode leaves a draft and sends nothing', calls.find(c => c.u.endsWith('/Invoices')).body.Invoices[0].Status === 'DRAFT' && !calls.some(c => c.u.endsWith('/Email')) && d.sent === false);

calls.length = 0;
const e = await raiseInvoice({ contactId: 'c-saved', name: 'n', email: 'e', reference: 'x', label: 'y', amount: -1 }).then(() => null, err => err.message);
ok('a saved contact skips the lookup', calls.every(c => !c.u.includes('/Contacts')));
ok('Xero’s reason is passed on when it refuses', String(e).includes('Amount must be positive'));

console.log(fails ? `\n${fails} FAILED` : '\nAll Xero tests passed');
process.exit(fails ? 1 : 0);
