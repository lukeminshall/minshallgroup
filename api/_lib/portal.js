/* Shared helpers for the client-portal functions (files in api/_lib are not
   routes). Verifies the Clerk session token sent by the browser, gives a
   service-role Supabase client for server-side reads/writes, and sends
   notification emails through Resend.
   Env: CLERK_SECRET_KEY, VITE_SUPABASE_URL (or SUPABASE_URL),
        SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, CONTACT_TO (team notifications, default luke@), CONTACT_FROM. */
import { verifyToken } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';

export const SITE = 'https://minshallgroup.com';

export function configured() {
  return !!(process.env.CLERK_SECRET_KEY && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function db() {
  return createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

/* returns { userId, isAdmin } or throws */
export async function caller(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) throw Object.assign(new Error('Not signed in'), { status: 401 });
  let payload;
  try { payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY }); }
  catch { throw Object.assign(new Error('Session expired, please sign in again'), { status: 401 }); }
  const userId = payload.sub;
  /* an admin is in public.admins, or signed up with a team address listed in public.admin_emails */
  const { data } = await db().from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  if (data) return { userId, isAdmin: true };
  const { data: su } = await db().from('signups').select('email').eq('user_id', userId).maybeSingle();
  const { data: te } = su?.email ? await db().from('admin_emails').select('email').eq('email', su.email.toLowerCase()).maybeSingle() : { data: null };
  return { userId, isAdmin: !!te };
}

/* the project, if the caller may see it */
export async function projectFor(who, clientId) {
  const { data } = await db().from('clients').select('*').eq('id', clientId).maybeSingle();
  if (!data) throw Object.assign(new Error('Project not found'), { status: 404 });
  if (!who.isAdmin && data.owner_id !== who.userId) throw Object.assign(new Error('Not your project'), { status: 403 });
  return data;
}

export async function sendEmail({ to, subject, text, html, replyTo, from }) {
  const key = process.env.RESEND_API_KEY; if (!key || !to) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: from || process.env.CONTACT_FROM || 'Minshall Group <website@minshallgroup.com>', to, subject, text, ...(html ? { html } : {}), ...(replyTo ? { reply_to: replyTo } : {}) })
  }).catch(() => null);
  if (!r || !r.ok) console.error('Portal email failed', r && r.status, r && await r.text());
  return !!(r && r.ok);
}

/* behind-the-scenes notifications go to Luke; what clients see and reply to stays hello@ */
export const TEAM = () => process.env.CONTACT_TO || 'luke@minshallgroup.com';
export const PUBLIC_REPLY = 'hello@minshallgroup.com';

export function body(req) {
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  return b || {};
}

export function fail(res, e) {
  if (!e.status) console.error('Portal error', e);
  return res.status(e.status || 500).json({ error: e.status ? e.message : 'Something went wrong' });
}
