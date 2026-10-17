/* Vercel Serverless Function — re-check a project's website now.
   POST { clientId, label? } with Authorization: Bearer <Clerk token>
   Clients may re-check their own site once every 24 hours; admins any time.
   Stores the full Webmins result (with Google scores) in public.scores. */
import { configured, caller, projectFor, db, body, fail } from './_lib/portal.js';
import { runAudit } from './audit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!configured()) return res.status(503).json({ error: 'Portal not configured' });
  try {
    const who = await caller(req);
    const { clientId, label } = body(req);
    const p = await projectFor(who, clientId);
    const url = p.live_url || p.website;
    if (!url) return res.status(400).json({ error: 'There is no website address on this project yet.' });
    if (!who.isAdmin) {
      const { data: last } = await db().from('scores').select('checked_at').eq('client_id', p.id).order('checked_at', { ascending: false }).limit(1).maybeSingle();
      if (last && Date.now() - new Date(last.checked_at).getTime() < 24 * 3600e3) return res.status(429).json({ error: 'Your site was checked in the last 24 hours. Try again tomorrow.' });
    }
    const r = await runAudit(url, { psi: true });
    if (r.status !== 200) return res.status(r.status).json(r.body);
    const { data, error } = await db().from('scores').insert({ client_id: p.id, url: r.body.url, data: r.body, label: (who.isAdmin && label) ? String(label).slice(0, 40) : (p.stage === 'live' ? 'Check' : 'Before') }).select().single();
    if (error) throw error;
    return res.status(200).json({ ok: true, score: data });
  } catch (e) { return fail(res, e); }
}
