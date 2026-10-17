/* Vercel Cron — monthly re-check of every live client site (see vercel.json).
   Vercel calls this with Authorization: Bearer <CRON_SECRET>. Each live
   project gets a 'Monthly' entry in public.scores for its Performance tab. */
import { configured, db } from './_lib/portal.js';
import { runAudit } from './audit.js';

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorised' });
  if (!configured()) return res.status(503).json({ error: 'Portal not configured' });
  const { data: projects, error } = await db().from('clients').select('id, live_url, website, stage').eq('stage', 'live');
  if (error) return res.status(500).json({ error: error.message });
  let done = 0, failed = 0;
  for (const p of projects || []) {
    const url = p.live_url || p.website; if (!url) continue;
    try {
      const r = await runAudit(url, { psi: true });
      if (r.status === 200) { await db().from('scores').insert({ client_id: p.id, url: r.body.url, data: r.body, label: 'Monthly' }); done++; } else failed++;
    } catch { failed++; }
  }
  return res.status(200).json({ ok: true, checked: done, failed });
}
