/* Electronic signatures for agreements, called from api/portal-notify.js.
   A signer signs in with their verified email (Clerk), reads the document,
   types their name (and may draw a signature), and confirms. The server then
   re-checks the document's fingerprint, records who signed, when, from where
   and what they were shown, and once everyone has signed it produces a signed
   copy: the original PDF with a certificate page, emailed to every signer.
   Nothing about a signature comes from the browser except the typed name,
   the drawing and the two confirmations. */
import { createHash } from 'node:crypto';
import { createClerkClient } from '@clerk/backend';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { db, sendEmail, TEAM, PUBLIC_REPLY, SITE, projectFor } from './portal.js';
import { brandEmail, FROM } from './email.js';

const err = (m, status = 400) => Object.assign(new Error(m), { status });
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const signLink = id => `${SITE}/sign?a=${id}`;
const first = n => (n || '').trim().split(/\s+/)[0] || '';
const when = d => new Date(d).toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' (UK time)';

/* the caller's verified email, straight from Clerk */
async function verifiedEmail(who) {
  if (who.verified !== undefined) return who.verified;
  const u = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(who.userId);
  const ok = (u.emailAddresses || []).filter(e => e.verification?.status === 'verified').map(e => e.emailAddress.toLowerCase());
  const primary = (u.primaryEmailAddress?.emailAddress || '').toLowerCase();
  who.verifiedName = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return (who.verified = ok.includes(primary) ? primary : ok[0] || '');
}

export const consentFor = (a, s) => `I have read "${a.title}"${a.file_id ? '' : ''}${a.terms_url ? ` and the terms at ${a.terms_url}` : ''}. By typing my name and pressing Sign, I agree to it and intend this to be my signature, with the same effect as signing on paper. I confirm that I am authorised to sign on behalf of ${s.signs_for}.`;

async function load(id) {
  const { data: a } = await db().from('agreements').select('*').eq('id', id).maybeSingle();
  if (!a) throw err('Agreement not found', 404);
  const { data: signers } = await db().from('agreement_signers').select('*').eq('agreement_id', a.id).order('sort');
  const { data: p } = await db().from('clients').select('id,business_name,owner_id').eq('id', a.client_id).single();
  const file = a.file_id ? (await db().from('files').select('*').eq('id', a.file_id).maybeSingle()).data : null;
  return { a, signers: signers || [], p, file };
}
async function bytesOf(path) {
  const { data, error } = await db().storage.from('client-files').download(path);
  if (error || !data) throw err('Could not read the document', 500);
  return Buffer.from(await data.arrayBuffer());
}
const url = async (path, name) => (await db().storage.from('client-files').createSignedUrl(path, 3600, name ? { download: name } : undefined)).data?.signedUrl || '';
async function onTeam(who, clientId) { try { await projectFor(who, clientId); return true; } catch { return false; } }

const mailSigner = (s, a, org, o) => sendEmail({ to: s.email, from: FROM, replyTo: PUBLIC_REPLY, subject: o.subject, ...(o.attachments ? { attachments: o.attachments } : {}), ...brandEmail({
  greeting: `Hello${first(s.name) ? ' ' + first(s.name) : ''},`, eyebrow: o.eyebrow, heading: o.heading, paras: o.paras, button: o.button,
  after: o.after || ['Sign in with this email address to read and sign. You can reply to this email with any questions.'],
  reason: `You are receiving this because you are a signatory to "${a.title}" for ${org}.` }) });

/* ---------- the signed copy: the original PDF plus a certificate page ---------- */
const SAFE = s => String(s ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
export async function signedPdf({ a, signers, org, original }) {
  const doc = original ? await PDFDocument.load(original, { ignoreEncryption: true }) : await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold), ital = await doc.embedFont(StandardFonts.HelveticaOblique);
  const NAVY = rgb(10 / 255, 26 / 255, 63 / 255), PINK = rgb(214 / 255, 22 / 255, 75 / 255), MUTED = rgb(.36, .40, .47);
  const W = 595.28, H = 841.89, M = 56;
  let page, y;
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; page.drawText('minshall', { x: M, y: H - 40, size: 14, font: bold, color: NAVY }); page.drawText('GROUP', { x: M + 63, y: H - 40, size: 7, font: bold, color: PINK }); y = H - 80; };
  const need = h => { if (y - h < M + 30) newPage(); };
  const wrap = (t, f, size, width) => { const words = SAFE(t).split(/\s+/); const lines = []; let l = ''; for (const w of words) { const n = l ? l + ' ' + w : w; if (f.widthOfTextAtSize(n, size) > width && l) { lines.push(l); l = w; } else l = n; } if (l) lines.push(l); return lines; };
  const text = (t, { f = font, size = 10, color = rgb(.08, .09, .1), gap = 4, x = M, width = W - 2 * M } = {}) => { for (const line of wrap(t, f, size, width)) { need(size + gap); page.drawText(line, { x, y: y - size, size, font: f, color }); y -= size + gap; } };
  const row = (k, v) => { need(14); page.drawText(SAFE(k), { x: M, y: y - 9, size: 9, font: bold, color: MUTED }); const lines = wrap(v, font, 9.5, W - 2 * M - 130); lines.forEach((l, i) => page.drawText(l, { x: M + 130, y: y - 9 - i * 13, size: 9.5, font, color: rgb(.08, .09, .1) })); y -= Math.max(1, lines.length) * 13 + 3; };

  if (!original) {   /* terms on the website only: a cover page saying what was agreed */
    newPage();
    text(a.title, { f: bold, size: 20, color: NAVY, gap: 8 }); y -= 6;
    text(`Between Minshall Group Limited and ${org}`, { size: 11, color: MUTED }); y -= 12;
    if (a.summary) { text(a.summary, { size: 11, gap: 5 }); y -= 10; }
    if (a.terms_url) text(`The terms agreed are those published at ${a.terms_url} on ${when(a.sent_at)}, when this agreement was sent for signature.`, { size: 11, gap: 5 });
  }
  newPage();
  text('Signature certificate', { f: bold, size: 20, color: NAVY, gap: 10 });
  text('This page records how and when each person signed. It forms part of the signed agreement.', { size: 10, color: MUTED }); y -= 10;
  row('Agreement', a.title);
  row('Between', `Minshall Group Limited and ${org}`);
  row('Sent for signature', when(a.sent_at));
  row('Completed', when(a.completed_at || new Date()));
  if (a.doc_sha256) row('Document fingerprint', `SHA-256 ${a.doc_sha256}`);
  if (a.terms_url) row('Terms', a.terms_url);
  row('Agreement reference', a.id);
  for (const s of signers) {
    y -= 14; need(150);
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: .6, color: rgb(.88, .9, .93) }); y -= 16;
    text(`${s.signed_name || s.name}, for ${s.signs_for}`, { f: bold, size: 12, color: NAVY, gap: 6 });
    if (s.signature_png) {
      try { const img = await doc.embedPng(Buffer.from(s.signature_png.split(',')[1], 'base64')); const sc = Math.min(180 / img.width, 56 / img.height); need(64); page.drawImage(img, { x: M, y: y - img.height * sc, width: img.width * sc, height: img.height * sc }); y -= img.height * sc + 8; } catch { }
    } else { need(30); page.drawText(SAFE(s.signed_name || ''), { x: M, y: y - 22, size: 22, font: ital, color: NAVY }); y -= 32; }
    row('Typed name', s.signed_name || '');
    row('Signed in as', `${s.email} (email verified at sign-in)`);
    row('Signed at', `${when(s.signed_at)}, ${new Date(s.signed_at).toISOString()}`);
    row('IP address', s.ip || 'not recorded');
    row('Browser', (s.user_agent || '').slice(0, 160));
    row('Document fingerprint', s.doc_sha256 ? `SHA-256 ${s.doc_sha256}` : 'Terms by link');
    row('They confirmed', s.consent || '');
  }
  y -= 16; text('Signed electronically through the Minshall Group client portal at minshallgroup.com. Each person signed in with their own verified email address before signing. Minshall Group Limited, company 17529393, 66 Paul Street, London EC2A 4NA.', { size: 8.5, color: MUTED });
  doc.setTitle(SAFE(`Signed: ${a.title}`)); doc.setAuthor('Minshall Group Limited'); doc.setProducer('Minshall Group client portal'); doc.setCreationDate(new Date());
  return Buffer.from(await doc.save());
}

async function complete(who, { a, signers, p, file }) {
  const original = file ? await bytesOf(file.path) : null;
  if (original && sha256(original) !== a.doc_sha256) throw err('The document has changed since it was sent, so it cannot be completed. Please contact Minshall Group.', 409);
  const done = { ...a, completed_at: new Date().toISOString() };
  const pdf = await signedPdf({ a: done, signers, org: p.business_name, original });
  const safeName = a.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'agreement';
  const path = `${p.id}/signed/${Date.now()}-${safeName}-signed.pdf`;
  const up = await db().storage.from('client-files').upload(path, pdf, { contentType: 'application/pdf', upsert: false });
  if (up.error) throw err('Could not save the signed copy', 500);
  const { data: f } = await db().from('files').insert({ client_id: p.id, path, name: `Signed: ${a.title}`, kind: 'deliverable', size: pdf.length, uploaded_by: who.userId }).select('id').single();
  const { data: claimed } = await db().from('agreements').update({ status: 'signed', completed_at: done.completed_at, signed_file_id: f?.id || null }).eq('id', a.id).eq('status', 'out').select('id');
  if (!claimed || !claimed.length) return false;   /* someone else completed it at the same moment */
  const attachments = [{ filename: `${safeName}-signed.pdf`, content: pdf.toString('base64') }];
  for (const s of signers) await mailSigner(s, a, p.business_name, { subject: `Signed by everyone: ${a.title}`, eyebrow: 'Agreement signed', heading: `"${a.title}" is signed.`,
    paras: ['Everyone has signed. The signed copy is attached, with a certificate page showing who signed, when and how.', 'It is also kept in your client portal under Documents.'],
    button: { label: 'View the signed agreement', url: signLink(a.id) }, attachments, after: ['Please keep this email for your records.'] });
  await sendEmail({ to: TEAM(), subject: `[Portal] Signed by everyone: ${a.title} · ${p.business_name}`, attachments,
    text: [`"${a.title}" for ${p.business_name} is fully signed.`, ...signers.map(s => `- ${s.signed_name} for ${s.signs_for}, ${when(s.signed_at)}, IP ${s.ip || '-'}`), '', `Signed copy attached and saved to the project's Documents. ${signLink(a.id)}`].join('\n') });
  return true;
}

/* returns a JSON-able result, or undefined if the event is not about agreements */
export async function signEvent(event, req, who, b) {
  if (!['agreement_send', 'agreement_view', 'agreement_sign'].includes(event)) return undefined;
  const pack = await load(String(b.agreementId || ''));
  const { a, signers, p, file } = pack;

  if (event === 'agreement_send') {
    if (!who.isAdmin) throw err('Only Minshall Group can send an agreement', 403);
    if (a.status !== 'draft') throw err('This agreement has already been sent');
    if (!signers.length) throw err('Add at least one signer first');
    let hash = null;
    if (file) { if (!/\.pdf$/i.test(file.path)) throw err('The document must be a PDF'); hash = sha256(await bytesOf(file.path)); }
    const { error } = await db().from('agreements').update({ status: 'out', doc_sha256: hash, sent_at: new Date().toISOString() }).eq('id', a.id).eq('status', 'draft');
    if (error) throw err('Could not send', 500);
    for (const s of signers) await mailSigner(s, a, p.business_name, { subject: `For your signature: ${a.title}`, eyebrow: 'Signature needed', heading: a.title,
      paras: [a.summary || `Please read and sign "${a.title}".`, `You are signing on behalf of ${s.signs_for}. It takes a couple of minutes: sign in with this email address, read the document, then type your name to sign.`],
      button: { label: 'Read and sign', url: signLink(a.id) } });
    return { ok: true, sent: signers.length };
  }

  const email = await verifiedEmail(who);
  const mine = signers.find(s => s.email === email) || null;
  const team = await onTeam(who, a.client_id);
  if (!mine && !team) throw err(email ? `This agreement is not addressed to ${email}. Sign in with the email address the invitation was sent to.` : 'Please verify your email address, then try again.', 403);
  if (a.status === 'draft' && !team) throw err('This agreement has not been sent yet', 403);

  if (event === 'agreement_view') {
    const signedFile = a.signed_file_id ? (await db().from('files').select('path').eq('id', a.signed_file_id).maybeSingle()).data : null;
    return {
      agreement: { id: a.id, title: a.title, summary: a.summary, terms_url: a.terms_url, status: a.status, sent_at: a.sent_at, completed_at: a.completed_at, doc_sha256: a.doc_sha256 },
      org: p.business_name, email,
      signers: signers.map(s => ({ name: s.name, signs_for: s.signs_for, signed_at: s.signed_at, signed_name: s.signed_name, me: s.email === email, ...(who.isAdmin ? { email: s.email, ip: s.ip } : {}) })),
      me: mine && !mine.signed_at && a.status === 'out' ? { name: who.verifiedName || mine.name, signs_for: mine.signs_for, consent: consentFor(a, mine) } : null,
      docUrl: file ? await url(file.path) : '', signedUrl: signedFile ? await url(signedFile.path, `${a.title} - signed.pdf`) : ''
    };
  }

  /* agreement_sign */
  if (!mine) throw err('You are not a signatory to this agreement', 403);
  if (a.status !== 'out') throw err(a.status === 'signed' ? 'This agreement is already signed' : 'This agreement is not open for signature');
  if (mine.signed_at) throw err('You have already signed this agreement');
  const name = String(b.name || '').replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 120 || !/\p{L}/u.test(name)) throw err('Please type your full name to sign');
  if (b.agree !== true || b.authorised !== true) throw err('Please tick both boxes to confirm');
  const png = typeof b.signature === 'string' && b.signature ? b.signature : null;
  if (png && (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(png) || png.length > 400000)) throw err('The drawn signature could not be read; clear it and try again');
  let hash = null;
  if (file) { hash = sha256(await bytesOf(file.path)); if (hash !== a.doc_sha256) throw err('The document has changed since it was sent, so it cannot be signed. Please contact Minshall Group.', 409); }
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim().slice(0, 64) || null;
  const { data: rec } = await db().from('agreement_signers').update({ signed_at: new Date().toISOString(), signed_name: name, signature_png: png, ip, user_agent: String(req.headers['user-agent'] || '').slice(0, 300), doc_sha256: hash, consent: consentFor(a, mine) })
    .eq('agreement_id', a.id).eq('email', email).is('signed_at', null).select('*');
  if (!rec || !rec.length) throw err('You have already signed this agreement');
  const now = signers.map(s => s.email === email ? rec[0] : s);
  const waiting = now.filter(s => !s.signed_at);
  await sendEmail({ to: TEAM(), subject: `[Portal] ${name} signed: ${a.title} · ${p.business_name}`, text: [`${name} (${email}) signed "${a.title}" for ${mine.signs_for}, ${when(rec[0].signed_at)}, IP ${ip || '-'}.`, waiting.length ? `Still to sign: ${waiting.map(s => s.name).join(', ')}.` : 'Everyone has now signed.', '', signLink(a.id)].join('\n') });
  if (waiting.length) return { ok: true, complete: false, waiting: waiting.length };
  const finished = await complete(who, { a, signers: now, p, file });
  return { ok: true, complete: finished };
}
