/* Vercel Serverless Function — client-portal notifications.
   POST { event, clientId, requestId? } with Authorization: Bearer <Clerk token>
   The browser says *what happened*; the server reads the record itself and
   writes the email, so nothing in the email comes from the request body.
   Client actions email the team (hello@); team actions email the client. */
import { configured, caller, projectFor, db, sendEmail, TEAM, SITE, body, fail } from './_lib/portal.js';
import { createClerkClient } from '@clerk/backend';

const STAGE = { onboarding: 'Onboarding', design: 'Design', build: 'Build', review: 'Review', live: 'Live' };
const gbp = n => '£' + Number(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!configured()) return res.status(503).json({ error: 'Portal not configured' });
  try {
    const who = await caller(req);
    const { event, clientId, requestId, quote } = body(req);

    /* a new account: email the team once, and welcome the person. The name and
       email come from Clerk, never from the request. */
    if (event === 'signed_up') {
      const u = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(who.userId);
      const email = u.primaryEmailAddress?.emailAddress || u.emailAddresses?.[0]?.emailAddress || '';
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
      const { data: added } = await db().from('signups').upsert({ user_id: who.userId, email, name }, { onConflict: 'user_id', ignoreDuplicates: true }).select('user_id');
      if (added && added.length) {
        /* the quote they built on the website, if any: plain values only, clipped */
        const cl = (v, n = 120) => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').slice(0, n);
        const q = quote && typeof quote === 'object' ? quote : null;
        const total = q && Number.isFinite(+q.total) ? Math.round(+q.total) : 0;
        const qLine = q ? `Quote built on the website: ${cl(q.package, 20)}, ${cl(q.pages, 5)} pages, £${total.toLocaleString('en-GB')} build${q.organisation ? `, for ${cl(q.organisation)}` : ''}${q.website ? ` (current site ${cl(q.website)})` : ''}.` : 'No website quote on their device.';
        await sendEmail({ to: TEAM(), subject: `[Portal] New account${total ? ` with a £${total.toLocaleString('en-GB')} quote` : ''}: ${name || email}`, replyTo: email || undefined,
          text: [`${name || 'Someone'} <${email}> has created a client portal account.`, qLine, '', 'They have not started their project yet. If they have not within a day, a short personal note usually helps: reply to this email to reach them.', '', `Open the portal: ${SITE}/portal#admin`].join('\n') });
        if (email) await sendEmail({ to: email, subject: 'Welcome to your Minshall Group portal',
          text: [`Hello${u.firstName ? ' ' + u.firstName : ''},`, '', 'Thank you for creating your account. Your next step is to start your project: it takes two minutes, and if you built a quote on our website it is already filled in.', '', `Start your project: ${SITE}/portal`, '', 'From then on, everything happens in the portal: your onboarding questions, design approval, changes and invoices. We email you whenever something needs you.', '', 'Minshall Group', 'hello@minshallgroup.com'].join('\n') });
      }
      return res.status(200).json({ ok: true, new: !!(added && added.length) });
    }

    const p = await projectFor(who, clientId);
    const lastMsg = async fromAdmin => requestId ? (await db().from('request_messages').select('body').eq('request_id', requestId).eq('from_admin', fromAdmin).order('created_at', { ascending: false }).limit(1).maybeSingle()).data?.body || '' : '';
    const link = `${SITE}/portal`;
    const req_ = requestId ? (await db().from('requests').select('*').eq('id', requestId).eq('client_id', p.id).maybeSingle()).data : null;

    const toTeam = (subject, lines) => sendEmail({ to: TEAM(), subject: `[Portal] ${subject} · ${p.business_name}`, text: [...lines, '', `Open the portal: ${link}#admin`].join('\n'), replyTo: p.owner_email });
    const toClient = (subject, lines) => sendEmail({ to: p.owner_email, subject, text: [`Hello${p.owner_name ? ' ' + p.owner_name.split(' ')[0] : ''},`, '', ...lines, '', `Log in to your portal: ${link}`, '', 'Minshall Group', 'hello@minshallgroup.com'].join('\n'), replyTo: TEAM() });

    switch (event) {
      case 'project_started':
        await toTeam('New project started', [`${p.owner_name || ''} <${p.owner_email || ''}> started a project.`, `Business: ${p.business_name}`, `Website: ${p.website || '—'}`, `Package: ${p.package || '—'}, ${p.pages || '?'} pages, quote ${p.quote_total ? gbp(p.quote_total) : '—'}`, `Hosting: ${p.hosting}`, `Domain: ${p.domain_mode === 'need' ? 'please secure ' + (p.domain || '') : p.domain || '—'}`]);
        await toClient('Your project has started', ['Thank you for starting your website project with us.', 'Next step: complete your onboarding questions in the portal. It replaces a kick-off call and takes about 15 minutes. Your progress saves as you go.']);
        break;
      case 'brief_submitted':
        await toTeam('Onboarding brief submitted', ['The onboarding questionnaire has been submitted and is ready to review.']); break;
      case 'request_created':
        if (!req_) break;
        await toTeam(`New ${req_.kind}: ${req_.title}`, [`Type: ${req_.kind}`, `Title: ${req_.title}`, '', req_.body || '']); break;
      case 'design_approved':
        await toTeam('Design approved', ['The client has approved the design. Move the project to Build and issue the halfway invoice.']); break;
      case 'quote_response':
        if (!req_) break;
        await toTeam(`Quote ${req_.status}: ${req_.title}`, [`The client has ${req_.status} the quote of ${gbp(req_.quote_gbp)} for "${req_.title}".`]); break;
      case 'client_message':
        if (!req_) break;
        await toTeam(`New message on: ${req_.title}`, ['The client wrote:', '', await lastMsg(false)]); break;
      /* team → client */
      case 'stage_changed':
        if (!who.isAdmin) break;
        await toClient(`Your project is now at: ${STAGE[p.stage] || p.stage}`, [
          p.stage === 'design' ? 'Your design is ready to review. Open the preview from your portal and press "Approve design" when you are happy, or raise a change request.' :
          p.stage === 'build' ? 'Thank you for approving the design. We are now building the rest of your site.' :
          p.stage === 'review' ? 'Your site is built and ready for a final check. Have a look and raise any last changes in the portal.' :
          p.stage === 'live' ? `Your new website is live${p.live_url ? ' at ' + p.live_url : ''}. Your Performance tab will now track its Webmins Score each month.` :
          'Your project stage has been updated.']); break;
      case 'request_quoted':
        if (!who.isAdmin || !req_) break;
        await toClient(`Quote ready: ${req_.title}`, [`We have priced your request "${req_.title}" at ${gbp(req_.quote_gbp)}.`, 'You can approve or decline it in your portal.']); break;
      case 'request_updated':
        if (!who.isAdmin || !req_) break;
        await toClient(`Update on: ${req_.title}`, [`Your request "${req_.title}" is now: ${req_.status.replace('_', ' ')}.`]); break;
      case 'team_message':
        if (!who.isAdmin || !req_) break;
        await toClient(`New message about: ${req_.title}`, ['We have replied:', '', await lastMsg(true), '', 'You can reply in your portal.']); break;
      case 'team_message_new':
        if (!who.isAdmin || !req_ || req_.kind !== 'message') break;
        await toClient(req_.title, [req_.body || '', '', 'You can reply in your portal, under Requests.']); break;
      case 'invoice_issued':
        if (!who.isAdmin) break;
        await toClient('New invoice', ['A new invoice has been added to your portal, under Billing.']); break;
      default:
        return res.status(400).json({ error: 'Unknown event' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) { return fail(res, e); }
}
