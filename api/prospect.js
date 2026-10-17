/* Vercel Serverless Function — internal prospecting tool (/tools/prospect).
   POST { url, psi? } with header x-tool-key: <TOOL_PASSWORD>
   Runs the same Webmins check as the public page. Locked by the
   TOOL_PASSWORD environment variable; without it the tool is disabled. */
import crypto from 'node:crypto';
import { runAudit } from './audit.js';

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const pw = process.env.TOOL_PASSWORD;
  if (!pw) return res.status(503).json({ error: 'The tool is switched off. Add TOOL_PASSWORD in Vercel to turn it on.' });
  if (!same(req.headers['x-tool-key'] || '', pw)) return res.status(401).json({ error: 'Wrong password.' });
  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (body?.ping) return res.status(200).json({ ok: true });
  const r = await runAudit(body?.url, { psi: body?.psi === true });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(r.status).json(r.body);
}
