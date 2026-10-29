/* Vercel Serverless Function — client-portal notifications.
   POST { event, clientId, requestId? } with Authorization: Bearer <Clerk token>
   The browser says *what happened*; the server reads the record itself and
   writes the email, so nothing in the email comes from the request body.
   Client actions email the team (hello@); team actions email the client. */
import { configured, caller, projectFor, db, sendEmail, TEAM, PUBLIC_REPLY, SITE, body, fail } from './_lib/portal.js';
import { brandEmail, FROM } from './_lib/email.js';
import { createClerkClient } from '@clerk/backend';

const STAGE = { onboarding: 'Onboarding', design: 'Design', build: 'Build', review: 'Review', live: 'Live', discovery: 'Discovery', analysis: 'Analysis', recommendations: 'Recommendations', complete: 'Complete' };
const SERVICE = { website: 'Website', strategy: 'Commercial strategy', digital: 'Digital, data and AI' };
/* what each stage means for a strategy or digital project, for the client email */
const CONSULT = {
  onboarding: ['Your project is at kick-off.', 'Complete your brief in the portal if you have not yet, then we will agree the plan with you.'],
  discovery: ['Discovery has started.', 'We are meeting your people and gathering the data. Your plan and milestones are in your portal.'],
  analysis: ['We are into the analysis.', 'We are sizing the opportunity and testing the options. We will share findings as they firm up.'],
  recommendations: ['Your recommendations are ready.', 'Read them in Documents in your portal, then raise any questions in Requests.'],
  design: ['Designs are ready to review.', 'Open the preview from your portal and tell us what you think in Requests.'],
  build: ['We are building.', 'We build in usable slices. You will see progress in your portal as we go.'],
  live: ['It is live.', 'From now on your portal shows the results we agreed to measure.'],
  complete: ['Your project is complete.', 'Your final documents are in the portal, and we will keep tracking the numbers with you.']
};
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
        if (email) await sendEmail({ to: email, from: FROM, replyTo: PUBLIC_REPLY, subject: 'Welcome to Minshall Group', ...brandEmail({
          preheader: 'Your account is ready. Your brief takes 10 to 15 minutes, in your own time.',
          eyebrow: 'Welcome', heading: 'Your account is ready.', greeting: `Hello${u.firstName ? ' ' + u.firstName : ''},`,
          paras: ['Thank you for choosing Minshall Group. Everything about your project now happens in one place, your client portal.'],
          list: ['Start your project: commercial strategy, digital, or a website. If you priced a website online, your choices are already filled in.', 'Answer your brief in your own time. Your answers save as you go.', 'Follow the plan, the results and your documents, raise requests and see invoices, all in the portal.'],
          button: { label: 'Open your portal', url: `${SITE}/portal` },
          after: ['We confirm the scope, the fee and the dates with you before any work starts. No payment is taken until we do.', 'Questions at any point? Just reply to this email.'],
          reason: 'You are receiving this because you created an account at minshallgroup.com.' }) });
      }
      return res.status(200).json({ ok: true, new: !!(added && added.length) });
    }

    const p = await projectFor(who, clientId);
    const lastMsg = async fromAdmin => requestId ? (await db().from('request_messages').select('body').eq('request_id', requestId).eq('from_admin', fromAdmin).order('created_at', { ascending: false }).limit(1).maybeSingle()).data?.body || '' : '';
    const link = `${SITE}/portal`;
    const req_ = requestId ? (await db().from('requests').select('*').eq('id', requestId).eq('client_id', p.id).maybeSingle()).data : null;

    const toTeam = (subject, lines) => sendEmail({ to: TEAM(), subject: `[Portal] ${subject} · ${p.business_name}`, text: [...lines, '', `Open the portal: ${link}#admin`].join('\n'), replyTo: p.owner_email });
    /* client emails: branded layout, from hello@, with one clear button into the portal */
    const toClient = (subject, o) => sendEmail({ to: p.owner_email, from: FROM, replyTo: PUBLIC_REPLY, subject, ...brandEmail({
      greeting: `Hello${p.owner_name ? ' ' + p.owner_name.split(' ')[0] : ''},`, button: { label: o.cta || 'Open your portal', url: o.url || link },
      after: ['You can reply to this email, or message us from your portal.'], reason: `You are receiving this because you have a project with us: ${p.business_name}.`, ...o }) });

    switch (event) {
      case 'project_started':
        if ((p.service || 'website') !== 'website') {
          await toTeam(`New ${SERVICE[p.service]} project`, [`${p.owner_name || ''} <${p.owner_email || ''}> started a project.`, `Organisation: ${p.business_name}`, `Service: ${SERVICE[p.service]}`, `Aim: ${p.summary || '—'}`, `Website: ${p.website || '—'}`, '', 'Their brief follows. Reply within two working days to agree the plan and the fee.']);
          await toClient(`Your project has started: ${p.business_name}`, { preheader: 'Next: your brief, about 10 minutes.', eyebrow: SERVICE[p.service], heading: 'Your project has started.',
            paras: ['Thank you for starting your project with us. Your next step is the brief: it takes about 10 minutes and saves as you go, so our first meeting is about decisions, not background.', 'Once we have it, we will be in touch within two working days to agree the plan, the fee and the numbers we will measure.'],
            cta: 'Complete your brief', url: `${link}#onboarding` });
          break;
        }
        await toTeam('New project started', [`${p.owner_name || ''} <${p.owner_email || ''}> started a project.`, `Business: ${p.business_name}`, `Website: ${p.website || '—'}`, `Package: ${p.package || '—'}, ${p.pages || '?'} pages, quote ${p.quote_total ? gbp(p.quote_total) : '—'}`, `Hosting: ${p.hosting}`, `Domain: ${p.domain_mode === 'need' ? 'please secure ' + (p.domain || '') : p.domain || '—'}`]);
        await toClient(`Your project has started: ${p.business_name}`, { preheader: 'Next: your onboarding questions, about 15 minutes.', eyebrow: 'Project started', heading: 'Your website project has started.',
          paras: ['Thank you for starting your project with us. We will confirm your quote and dates within one working day.', 'Your next step is the onboarding questions. They replace a kick-off call, take about 15 minutes and save as you go, so you can stop and come back.'],
          list: ['Your business, customers and what you want the site to do', 'The look you like, with examples you can pick from', 'Your logo and photos, with permission to use them'],
          cta: 'Start your onboarding', url: `${link}#onboarding` });
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
        if ((p.service || 'website') !== 'website') {
          const [h, para] = CONSULT[p.stage] || ['Your project has moved on.', 'Your project stage has been updated in your portal.'];
          await toClient(`${p.business_name}: ${STAGE[p.stage] || p.stage}`, { eyebrow: STAGE[p.stage] || p.stage, heading: h, paras: [para],
            cta: p.stage === 'recommendations' ? 'Read your recommendations' : 'Open your portal', url: p.stage === 'recommendations' ? `${link}#documents` : link });
          break;
        }
        await toClient(p.stage === 'design' ? 'Your design is ready to review' : p.stage === 'live' ? 'Your new website is live' : `Your project is now at: ${STAGE[p.stage] || p.stage}`, {
          eyebrow: STAGE[p.stage] || p.stage,
          heading: p.stage === 'design' ? 'Your design is ready.' : p.stage === 'build' ? 'We are building your site.' : p.stage === 'review' ? 'Your site is ready for a final check.' : p.stage === 'live' ? 'Your website is live.' : 'Your project has moved on.',
          paras: [p.stage === 'design' ? 'Open the preview from your portal. When you are happy, press Approve design, or raise a change and we will update it.' :
            p.stage === 'build' ? 'Thank you for approving the design. We are now building the rest of your site, and we will let you know when it is ready to check.' :
            p.stage === 'review' ? 'Have a look through every page. Raise any last changes in your portal and we will make them before launch.' :
            p.stage === 'live' ? `Your new website is live${p.live_url ? ' at ' + p.live_url : ''}. From now on, your Performance tab tracks its Webmins Score every month.` : 'Your project stage has been updated in your portal.'],
          cta: p.stage === 'design' ? 'Review your design' : p.stage === 'live' && p.live_url ? 'Visit your website' : 'Open your portal', url: p.stage === 'live' && p.live_url ? p.live_url : link }); break;
      case 'request_quoted':
        if (!who.isAdmin || !req_) break;
        await toClient(`Quote ready: ${req_.title}`, { eyebrow: 'Quote ready', heading: `${gbp(req_.quote_gbp)} for “${req_.title}”`, paras: ['We have priced your request. You can approve it or decline it in your portal, and nothing starts until you approve.'], cta: 'See the quote', url: `${link}#requests` }); break;
      case 'request_updated':
        if (!who.isAdmin || !req_) break;
        await toClient(`Update on: ${req_.title}`, { eyebrow: 'Update', heading: `“${req_.title}” is now ${req_.status.replace('_', ' ')}.`, paras: ['You can see the details and any messages in your portal.'], cta: 'See the update', url: `${link}#requests` }); break;
      case 'team_message':
        if (!who.isAdmin || !req_) break;
        await toClient(`New message about: ${req_.title}`, { eyebrow: 'New message', heading: `We have replied about “${req_.title}”.`, quote: await lastMsg(true), cta: 'Reply in your portal', url: `${link}#requests` }); break;
      case 'team_message_new':
        if (!who.isAdmin || !req_ || req_.kind !== 'message') break;
        await toClient(req_.title, { eyebrow: 'Message from the team', heading: req_.title, quote: req_.body || '', cta: 'Reply in your portal', url: `${link}#requests` }); break;
      case 'invoice_issued':
        if (!who.isAdmin) break;
        await toClient('New invoice from Minshall Group', { eyebrow: 'Billing', heading: 'A new invoice is ready.', paras: ['You will find it in your portal under Billing, with what it covers and how to pay.'], cta: 'View your invoice', url: `${link}#billing` }); break;
      case 'deliverable_added': {
        if (!who.isAdmin) break;
        const { fileId } = body(req);
        const f = fileId ? (await db().from('files').select('name').eq('id', fileId).eq('client_id', p.id).eq('kind', 'deliverable').maybeSingle()).data : null;
        if (!f) break;
        const title = String(f.name || '').split(': ')[0];
        await toClient(`New document: ${title}`, { eyebrow: 'New document', heading: `“${title}” is ready.`, paras: ['You will find it in your portal under Documents. Raise any questions in Requests.'], cta: 'Open the document', url: `${link}#documents` }); break;
      }
      default:
        return res.status(400).json({ error: 'Unknown event' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) { return fail(res, e); }
}
