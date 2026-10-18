/* Vercel Serverless Function — "Email me my report" on /digitalsme.
   POST { url, email, sector, total, grade, optin, consent, bot-field }
   Re-runs the check on the server and writes the email from its own
   results, so nobody can send arbitrary content through it. The headline
   score/grade/sector come from the page but are validated and clamped.
   Also emails the team a lead notification, and adds the person to the
   newsletter only if they ticked the separate opt-in. */
import { runAudit } from './audit.js';
import { brandEmail, FROM } from './_lib/email.js';

const SECTORS = { cafe: 'café, bar or restaurant', retail: 'shop or online retail', trades: 'trades and construction', clinic: 'health, clinic or wellbeing', professional: 'professional services', hospitality: 'hotel, venue or holiday let', fitness: 'gym, fitness or sport', charity: 'charity or community', other: 'business' };
const GRADES = ['Excellent', 'Good', 'Needs work', 'Falling behind'];
const PILLARS = [['experience', 'Experience'], ['findability', 'Findability'], ['trust', 'Trust'], ['conversion', 'Conversion'], ['modern', 'Modern & relevant']];

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let d = req.body; if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
  d = d || {};
  if (String(d['bot-field'] || '')) return res.status(200).json({ ok: true });
  const email = String(d.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (d.consent !== true) return res.status(400).json({ error: 'Please tick the box so we can email your report.' });
  const key = process.env.RESEND_API_KEY; if (!key) return res.status(503).json({ error: 'Email is not configured yet.' });

  const r = await runAudit(d.url, { psi: false });
  if (r.status !== 200) return res.status(r.status).json(r.body);
  const a = r.body;
  const sector = SECTORS[d.sector] ? d.sector : (SECTORS[a.industry] ? a.industry : 'other');
  const total = Math.max(0, Math.min(100, Math.round(Number(d.total) || 0)));
  const grade = GRADES.includes(d.grade) ? d.grade : '';
  const site = a.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const link = `https://minshallgroup.com/digitalsme?url=${encodeURIComponent(site)}`;
  const from = process.env.CONTACT_FROM || 'Minshall Group <website@minshallgroup.com>';
  const team = process.env.CONTACT_TO || 'hello@minshallgroup.com';

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const mail = brandEmail({
    preheader: `${site} scored ${total}/100. Here is what to fix first.`, eyebrow: 'Your website check', heading: `${site} scored ${total} out of 100.`,
    greeting: 'Hello,', paras: [`Here is your Webmins Score report, checked on ${date} and measured against what customers expect from a ${SECTORS[sector]} website.`],
    score: { total, grade, rows: PILLARS.map(([k, t]) => [t, a.pillars?.[k] ?? '–']) },
    listTitle: 'What we would fix first', list: a.suggestions?.length ? a.suggestions.slice(0, 6) : ['Your site covers the basics well. The quickest gains are in content and design.'],
    button: { label: 'See your full report', url: link },
    after: ['Want it fixed? Our website packages start at £495, fixed, paid in three stages, with no calls needed: minshallgroup.com/digitalsme'],
    reason: 'You are receiving this because you asked for your report on our website. We will not email you again unless you opted in to our newsletter.'
  });

  const send = body => fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
  const sent = await send({ from: FROM, to: email, reply_to: team, subject: `Your Webmins Score: ${total}/100 for ${site}`, text: mail.text, html: mail.html });
  if (!sent || !sent.ok) { console.error('Report email failed', sent && sent.status, sent && await sent.text()); return res.status(502).json({ error: 'We could not send the email just now. Please try again.' }); }

  const optin = d.optin === true;
  await send({ from, to: team, reply_to: email, subject: `New website check lead: ${site} (${total}/100)`, text: [`Email: ${email}`, `Website: ${a.url}`, `Webmins Score: ${total}/100 ${grade}`, `Sector: ${SECTORS[sector]}`, `Recommended package: ${a.recommended}`, `Newsletter opt-in: ${optin ? 'yes' : 'no'}`, '', `Their report: ${link}`, '', 'They asked for this report. Follow up personally, once.'].join('\n') });
  if (optin) {
    await fetch('https://api.resend.com/contacts', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, unsubscribed: false, ...(process.env.RESEND_SEGMENT_ID ? { segments: [{ id: process.env.RESEND_SEGMENT_ID }] } : {}) }) }).catch(() => null);
  }
  return res.status(200).json({ ok: true });
}
