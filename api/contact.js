import { brandEmail, FROM } from './_lib/email.js';
/* Vercel Serverless Function — contact form → email via Resend.
   Set in Vercel → Project → Settings → Environment Variables:
     RESEND_API_KEY  (required)  — from resend.com
     CONTACT_TO      (optional, default luke@minshallgroup.com: team notifications)
     CONTACT_FROM    (optional, default 'Minshall Group Website <onboarding@resend.dev>')
       For production, use a Resend-verified sender on your domain, e.g.
       'Minshall Group Website <website@minshallgroup.com>'. Until a domain is verified,
       Resend's onboarding@resend.dev only delivers to the Resend account owner. */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
  data = data || {};

  const str = v => (v == null ? '' : String(v)).trim();
  const name = str(data.name);
  const email = str(data.email);
  const organisation = str(data.organisation);
  const message = str(data.message);
  const interest = str(data.interest);
  const timeline = str(data.timeline);
  const botField = str(data['bot-field']);

  // Honeypot: pretend success so bots don't retry, but send nothing.
  if (botField) return res.status(200).json({ ok: true });

  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (name.length > 200 || email.length > 200 || organisation.length > 200 || interest.length > 300 || timeline.length > 100 || message.length > 5000)
    return res.status(400).json({ error: 'Field too long' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Email not configured' });

  /* Primary: from our verified Resend domain to hello@. Fallback: if Resend
     refuses that sender (e.g. domain not yet verified), use Resend's test
     sender, which can only deliver to the Resend account owner. */
  const to = process.env.CONTACT_TO || 'luke@minshallgroup.com';
  const from = process.env.CONTACT_FROM || 'Minshall Group Website <website@minshallgroup.com>';
  const fallbackTo = process.env.CONTACT_FALLBACK_TO || 'luke.minshall@knexu.co.uk';
  const fallbackFrom = 'Minshall Group Website <onboarding@resend.dev>';

  const subject = `New enquiry from ${name}${organisation ? ' (' + organisation + ')' : ''}`;
  const text =
    `New contact form submission from minshallgroup.com\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Organisation: ${organisation || '—'}\n` +
    `Interested in: ${interest || '—'}\n` +
    `Timeline: ${timeline || '—'}\n\n` +
    `Message:\n${message}\n`;

  const send = (f, t) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: f, to: t, subject, text, reply_to: email })
  });
  /* Auto-reply to the enquirer. Fixed wording only, never echoing what
     they typed (apart from a short first name), so the form cannot be used
     to send arbitrary content to other people. */
  const autoReply = async () => {
    const first = name.split(/\s+/)[0].replace(/[^\p{L}' -]/gu, '').slice(0, 30);
    const isQuote = /^website (refresh|quote)/i.test(interest);
    const mail = brandEmail(isQuote ? {
      preheader: 'We confirm your price and dates within one working day.', eyebrow: 'Quote received', heading: 'Thank you. Your quote is with us.', greeting: `Hello${first ? ' ' + first : ''},`,
      paras: ['We will confirm your price and your dates within one working day. You do not need to book a call.'],
      list: ['Create your client account', 'Answer your onboarding questions in your own time', 'Upload your logo and photos, and follow every stage'],
      button: { label: 'Create your account', url: 'https://minshallgroup.com/portal' },
      after: ['Our offer terms are at minshallgroup.com/digitalsme/terms.'],
      reason: 'You are receiving this because this address was entered on our website. If that was not you, you can ignore this email.'
    } : {
      preheader: 'Someone senior will reply within two working days.', eyebrow: 'Message received', heading: 'Thank you for getting in touch.', greeting: `Hello${first ? ' ' + first : ''},`,
      paras: ['Your message is with us, and someone senior will reply within two working days. We will tell you honestly whether we are the right people.'],
      button: { label: 'See our recent work', url: 'https://minshallgroup.com/work' },
      after: ['Need a website for a small business? You can check your current site and price a new one in minutes at minshallgroup.com/digitalsme.'],
      reason: 'You are receiving this because this address was entered on our contact form. If that was not you, you can ignore this email.'
    });
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject: isQuote ? 'Your website quote: Minshall Group' : 'Thank you for getting in touch: Minshall Group', text: mail.text, html: mail.html, reply_to: 'hello@minshallgroup.com' })
    }).catch(() => null);
    if (!r || !r.ok) console.error('Auto-reply failed', r && r.status);
  };

  try {
    let r = await send(from, to);
    if (r.ok) { console.log('Enquiry sent via primary route to', to); await autoReply(); return res.status(200).json({ ok: true }); }
    console.error('Resend primary route failed', r.status, await r.text());
    r = await send(fallbackFrom, fallbackTo);
    if (r.ok) { console.log('Enquiry sent via fallback route to', fallbackTo); return res.status(200).json({ ok: true }); }
    console.error('Resend fallback failed', r.status, await r.text());
    return res.status(502).json({ error: 'Send failed' });
  } catch (err) {
    console.error('Contact handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
