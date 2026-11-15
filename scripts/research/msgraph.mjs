/* Microsoft 365 mail for the outreach scripts, through Microsoft Graph.
   Microsoft no longer accepts mailbox passwords from scripts, so this signs in
   as an app (Entra ID app registration, application permissions Mail.Send and
   Mail.Read, limited to hello@ in Exchange) and sends/reads as the mailbox.
   Works for shared mailboxes. Nothing secret lives in the project: the tenant
   ID, client ID and client secret are read from the macOS Keychain:
     security add-generic-password -s minshall-graph -a tenant -w
     security add-generic-password -s minshall-graph -a client -w
     security add-generic-password -s minshall-graph -a secret -w
   (each command prompts for the value, so it never appears in shell history)

   mailer(box) has the same shape the scripts used with nodemailer:
     await m.verify(); const { messageId } = await m.sendMail({ from, to, cc, subject, text, replyTo, headers, inReplyTo, references })
   The message is built as MIME by nodemailer and handed to Graph whole, so the
   Message-ID, In-Reply-To/References (threading) and List-Unsubscribe headers
   go out as written. A copy is saved in the mailbox's Sent Items.

   messages(box, sinceMs) yields { from, subject, raw } for every message
   received since then in any folder except Sent Items, Drafts and Outbox.
   raw is the headers, a blank line, then the plain-text body, which is the
   shape the reply/opt-out/bounce checks already read. */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';

const kc = a => {
  try { return execFileSync('security', ['find-generic-password', '-s', 'minshall-graph', '-a', a, '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
};
const cfg = { tenant: kc('tenant'), client: kc('client'), secret: kc('secret') };
export const graphReady = () => !!(cfg.tenant && cfg.client && cfg.secret);
export const graphMissing = () => ['tenant', 'client', 'secret'].filter(k => !cfg[k]);

let tok = '', exp = 0;
async function token() {
  if (tok && Date.now() < exp) return tok;
  const r = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant)}/oauth2/v2.0/token`, {
    method: 'POST',
    body: new URLSearchParams({ client_id: cfg.client, client_secret: cfg.secret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Microsoft sign-in failed: ${j.error_description || j.error || r.status}`);
  tok = j.access_token; exp = Date.now() + (Number(j.expires_in || 3600) - 120) * 1000;
  return tok;
}
async function graph(path, opt = {}) {
  const url = path.startsWith('https://') ? path : `https://graph.microsoft.com/v1.0${path}`;
  const r = await fetch(url, { ...opt, headers: { Authorization: `Bearer ${await token()}`, ...(opt.headers || {}) } });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    let msg = t; try { const e = JSON.parse(t).error; msg = `${e.code}: ${e.message}`; } catch {}
    throw new Error(`Microsoft ${r.status} ${msg}`.slice(0, 400));
  }
  return r.status === 202 || r.status === 204 ? null : r.json();
}
const u = box => `/users/${encodeURIComponent(box)}`;

export function mailer(box) {
  return {
    async verify() { await graph(`${u(box)}/mailFolders/inbox?$select=id`); },
    async sendMail(mail) {
      const messageId = `<${crypto.randomUUID()}@${box.split('@')[1]}>`;
      const raw = await new MailComposer({ ...mail, messageId }).compile().build();
      await graph(`${u(box)}/sendMail`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: raw.toString('base64') });
      return { messageId, response: '202 Accepted by Microsoft' };
    }
  };
}

export async function* messages(box, sinceMs) {
  const skip = new Set();
  for (const w of ['sentitems', 'drafts', 'outbox']) { try { skip.add((await graph(`${u(box)}/mailFolders/${w}?$select=id`)).id); } catch {} }
  const since = new Date(sinceMs).toISOString();
  let url = `${u(box)}/messages?$filter=${encodeURIComponent(`receivedDateTime ge ${since}`)}&$select=from,subject,body,internetMessageHeaders,parentFolderId&$top=50`;
  while (url) {
    const j = await graph(url, { headers: { Prefer: 'outlook.body-content-type="text"' } });
    for (const m of j.value || []) {
      if (skip.has(m.parentFolderId)) continue;
      const hdr = (m.internetMessageHeaders || []).map(h => `${h.name}: ${h.value}`).join('\n');
      yield { from: (m.from?.emailAddress?.address || '').toLowerCase(), subject: m.subject || '', raw: `${hdr}\n\n${m.body?.content || ''}`.slice(0, 30000) };
    }
    url = j['@odata.nextLink'] || '';
  }
}
