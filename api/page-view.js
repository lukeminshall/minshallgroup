/* Vercel Serverless Function — tells the team when a watched page is opened.
   The page sends one beacon per visit (see initPetersfield). We email the time,
   rough location from Vercel's IP geolocation, device and where they came from.
   Nothing identifies the person, and no IP address is stored or sent.
   Uses RESEND_API_KEY and CONTACT_TO, as api/contact.js does. */
const WATCHED = { '/petersfield': 'Petersfield tender page' };
const BOTS = /bot|crawl|spider|preview|slurp|facebookexternalhit|headless|lighthouse/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  let data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
  data = data || {};
  const path = String(data.path || '');
  const label = WATCHED[path];
  const ua = String(req.headers['user-agent'] || '');
  /* only pages we watch, only real browsers; answer 204 either way so nothing leaks */
  if (!label || !/Mozilla/.test(ua) || BOTS.test(ua)) return res.status(204).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(204).end();

  const h = k => { try { return decodeURIComponent(String(req.headers[k] || '')); } catch { return ''; } };
  const place = [h('x-vercel-ip-city'), h('x-vercel-ip-country-region'), h('x-vercel-ip-country')].filter(Boolean).join(', ') || 'Unknown';
  const device = /iPhone|Android.+Mobile/.test(ua) ? 'Phone' : /iPad|Android/.test(ua) ? 'Tablet' : 'Computer';
  let from = 'Direct, or a link in an email or document';
  try { if (data.ref) { const r = new URL(String(data.ref)); if (r.hostname !== 'minshallgroup.com') from = r.hostname; else from = `Another page on our site (${r.pathname})`; } } catch {}
  const when = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  const text = `Someone opened the ${label}.\n\n` +
    `When: ${when}\n` +
    `Rough location: ${place}\n` +
    `Device: ${device}\n` +
    `Came from: ${from}\n\n` +
    `Location comes from the network, so it can be a nearby town or the provider's hub.\n` +
    `https://minshallgroup.com${path}\n`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Minshall Group Website <website@minshallgroup.com>',
      to: process.env.CONTACT_TO || 'luke@minshallgroup.com',
      subject: `${label} opened · ${place}`,
      text
    })
  }).catch(() => {});
  return res.status(204).end();
}
