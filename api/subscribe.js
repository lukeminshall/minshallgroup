/* Vercel Serverless Function — newsletter opt-in → Resend contact.
   POST { email, name?, company?, source?, consent: true }
   Adds the person to Resend Contacts so they can receive Broadcasts. Only
   explicit opt-ins are accepted (consent must be ticked); every broadcast
   carries Resend's unsubscribe link.
   Env: RESEND_API_KEY (needs full access, not sending-only, to manage
   contacts); optional RESEND_SEGMENT_ID to add sign-ups to a segment. */
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let d = req.body; if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
  d = d || {};
  const str = v => (v == null ? '' : String(v)).trim();
  const email = str(d.email).toLowerCase(), name = str(d.name), company = str(d.company), source = str(d.source).slice(0, 60);
  if (str(d['bot-field'])) return res.status(200).json({ ok: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (d.consent !== true && d.consent !== 'on' && d.consent !== 'true') return res.status(400).json({ error: 'Please tick the box to confirm you would like our emails.' });
  if (name.length > 100 || company.length > 150) return res.status(400).json({ error: 'That is a little long.' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'Sign-up is not configured yet.' });
  const [first, ...rest] = name.split(/\s+/);
  const when = new Date().toISOString();
  const body = {
    email, unsubscribed: false,
    ...(first ? { first_name: first } : {}), ...(rest.length ? { last_name: rest.join(' ') } : {}),
    ...(process.env.RESEND_SEGMENT_ID ? { segments: [{ id: process.env.RESEND_SEGMENT_ID }] } : {})
  };
  try {
    const r = await fetch('https://api.resend.com/contacts', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (!r.ok && r.status !== 409) {
      console.error('Resend contacts error', r.status, await r.text());
      return res.status(502).json({ error: 'We could not sign you up just now. Please try again later.' });
    }
    /* consent record: a dated note to our own inbox (best effort) */
    await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Minshall Group Website <website@minshallgroup.com>',
        to: process.env.CONTACT_TO || 'hello@minshallgroup.com',
        subject: `Newsletter sign-up: ${email}`,
        text: `New newsletter opt-in on minshallgroup.com\n\nEmail: ${email}\nName: ${name || '—'}\nCompany: ${company || '—'}\nSigned up on: ${source || 'website'}\nConsent ticked: yes\nTime (UTC): ${when}\n\nKeep this email as the record of consent.\n`
      })
    }).catch(() => {});
    console.log('Newsletter opt-in', { email, source: source || 'website', when });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
