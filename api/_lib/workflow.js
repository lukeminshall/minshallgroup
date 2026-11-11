/* Client-team workflow emails, and the invoice raised when a sign-off is approved.
   Called from api/portal-notify.js. As there, the browser only says what
   happened: every name, address, amount and decision is read from the
   database here, never taken from the request. */
import { db, sendEmail, TEAM, PUBLIC_REPLY, SITE, emailOf } from './portal.js';
import { brandEmail, FROM } from './email.js';
import { xeroReady, raiseInvoice } from './xero.js';

const link = `${SITE}/portal`;
const gbp = n => '£' + Number(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const ROLE = { approver: 'the final approver', reviewer: 'a reviewer', contributor: 'a contributor', viewer: 'a viewer' };
const first = n => (n || '').trim().split(/\s+/)[0] || '';
const err = (m, status = 400) => Object.assign(new Error(m), { status });

async function members(clientId) {
  const { data } = await db().from('project_members').select('*').eq('client_id', clientId);
  return data || [];
}

/* one branded email to one person on the client's team */
function toPerson(p, person, subject, o) {
  if (!person?.email) return Promise.resolve(false);
  return sendEmail({ to: person.email, from: FROM, replyTo: PUBLIC_REPLY, subject, ...brandEmail({
    greeting: `Hello${first(person.name) ? ' ' + first(person.name) : ''},`, button: { label: o.cta || 'Open the project', url: o.url || `${link}#workflow` },
    after: ['Sign in with this email address to see the project. You can reply to this email with any questions.'],
    reason: `You are receiving this because you are on the ${p.business_name} project team in the Minshall Group client portal.`, ...o }) });
}
const toTeam = (p, subject, lines) => sendEmail({ to: TEAM(), subject: `[Portal] ${subject} · ${p.business_name}`, text: [...lines, '', `Open the portal: ${link}#workflow`].join('\n') });

async function signoffFor(p, signoffId) {
  const { data: s } = await db().from('signoffs').select('*').eq('id', signoffId).eq('client_id', p.id).maybeSingle();
  if (!s) throw err('Sign-off not found', 404);
  const { data: reviews } = await db().from('signoff_reviews').select('*').eq('signoff_id', s.id);
  return { s, reviews: reviews || [] };
}

/* the welcome for someone who was added to a project before they signed up */
export async function welcomeMember(email, name) {
  const { data: rows } = await db().from('project_members').select('client_id,role').eq('email', (email || '').toLowerCase());
  if (!rows || !rows.length) return false;
  const { data: projects } = await db().from('clients').select('id,business_name').in('id', rows.map(r => r.client_id));
  const names = (projects || []).map(x => x.business_name).join(', ');
  await sendEmail({ to: TEAM(), subject: `[Portal] ${name || email} joined the ${names} team`, text: `${name || ''} <${email}> has signed in to the client portal and can now see: ${names}.\n\nOpen the portal: ${link}#admin` });
  await sendEmail({ to: email, from: FROM, replyTo: PUBLIC_REPLY, subject: `You are in: ${names}`, ...brandEmail({
    eyebrow: 'Welcome', heading: 'Your account is ready.', greeting: `Hello${first(name) ? ' ' + first(name) : ''},`,
    paras: [`You can now see ${names} in the Minshall Group client portal: the plan and phases, the documents, your tasks, and anything waiting for your review or sign-off.`],
    button: { label: 'Open the project', url: `${link}#workflow` }, reason: 'You are receiving this because you created an account at minshallgroup.com.' }) });
  return true;
}

/* raise the invoice attached to an approved sign-off, once */
async function invoiceFor(p, s, { retry = false } = {}) {
  if (s.status !== 'approved' || s.invoice_amount == null || !s.invoice_label) return null;
  /* claim it first, so two clicks can never raise two invoices; a retry may pick up a failed or never-started one */
  let claim = db().from('signoffs').update({ invoice_state: 'raising', invoice_error: null }).eq('id', s.id).eq('status', 'approved');
  claim = retry ? claim.or('invoice_state.is.null,invoice_state.eq.failed') : claim.is('invoice_state', null);
  const { data: got } = await claim.select('id');
  if (!got || !got.length) return null;                       // already raised, or being raised
  const label = `${p.business_name}: ${s.invoice_label}`;
  const to = { name: p.billing_name || p.business_name, email: (p.billing_email || p.owner_email || '').toLowerCase() };
  if (!xeroReady()) {
    const { data: inv } = await db().from('invoices').insert({ client_id: p.id, label: s.invoice_label, amount_gbp: s.invoice_amount, status: 'draft' }).select('id').single();
    await db().from('signoffs').update({ invoice_state: 'manual', invoice_ref: inv?.id || null }).eq('id', s.id);
    await toTeam(p, `Raise invoice: ${s.invoice_label}`, [`"${s.title}" has been signed off, so the invoice for ${gbp(s.invoice_amount)} + VAT is due.`, 'Xero is not connected yet, so nothing was sent. Raise it in Xero, then add the number and link to the draft in the portal.', `Bill to: ${to.name} <${to.email || 'no billing email set'}>`]);
    return 'manual';
  }
  try {
    const x = await raiseInvoice({ contactId: p.xero_contact_id, name: to.name, email: to.email, reference: s.title, label, amount: s.invoice_amount, send: s.invoice_auto_send !== false });
    if (x.contactId && x.contactId !== p.xero_contact_id) await db().from('clients').update({ xero_contact_id: x.contactId }).eq('id', p.id);
    const { data: inv } = await db().from('invoices').insert({ client_id: p.id, label: s.invoice_label, number: x.number || null, amount_gbp: s.invoice_amount, status: x.sent ? 'due' : 'draft',
      issued_on: x.sent ? new Date().toISOString().slice(0, 10) : null, due_on: x.dueDate, view_url: x.url || null, xero_invoice_id: x.invoiceId }).select('id').single();
    await db().from('signoffs').update({ invoice_state: 'raised', invoice_ref: inv?.id || null }).eq('id', s.id);
    await toTeam(p, `Invoice ${x.sent ? 'sent' : 'drafted'} in Xero: ${x.number || s.invoice_label}`, [`"${s.title}" was signed off, so Xero ${x.sent ? 'has emailed' : 'holds a draft of'} invoice ${x.number || ''} for ${gbp(s.invoice_amount)} + VAT (total ${gbp(x.total)}).`, `Bill to: ${to.name} <${to.email || '—'}>`, x.sent ? '' : 'Check it in Xero, then approve and send it from there.']);
    return x.sent ? 'sent' : 'draft';
  } catch (e) {
    await db().from('signoffs').update({ invoice_state: 'failed', invoice_error: String(e.message || e).slice(0, 500) }).eq('id', s.id);
    await toTeam(p, `Invoice NOT raised: ${s.invoice_label}`, [`"${s.title}" was signed off, but Xero refused the invoice for ${gbp(s.invoice_amount)}.`, `Xero said: ${e.message}`, 'Fix it in Xero or the portal, then press "Try the invoice again" on the sign-off.']);
    return 'failed';
  }
}

/* returns a JSON-able result, or undefined if the event is not a workflow one */
export async function workflowEvent(event, who, p, b) {
  const manage = () => { if (!p.canManage) throw err('Only the project lead can do that', 403); };
  switch (event) {
    case 'member_added': {
      manage();
      const email = String(b.email || '').toLowerCase().trim();
      const { data: m } = await db().from('project_members').select('*').eq('client_id', p.id).eq('email', email).maybeSingle();
      if (!m) throw err('Not on the team');
      await toPerson(p, m, `You have been added to ${p.business_name}`, { preheader: `You are ${ROLE[m.role]} on the project.`, eyebrow: 'Project team', heading: `You are on the ${p.business_name} team.`,
        paras: [`You have been added as ${ROLE[m.role]}. Everything for the project is in one place: the phases of the build, the specification and other documents, tasks, and the points where your sign-off is needed.`,
          m.role === 'approver' ? 'As the final approver, you give the last sign-off at each stage, once the reviewers have had their say.' : m.role === 'reviewer' ? 'As a reviewer, you can read each document, comment, and approve it or ask for changes.' : m.role === 'contributor' ? 'Tasks allocated to you appear in the portal, and you can update them as you go.' : 'You can follow progress and read the documents.'],
        cta: 'Create your account', url: `${link}?invite=1`, after: [`Use this email address (${m.email}) when you create your account, so the project appears straight away.`] });
      return { ok: true };
    }
    case 'task_assigned': {
      manage();
      const { data: t } = await db().from('tasks').select('*').eq('id', b.taskId).eq('client_id', p.id).maybeSingle();
      if (!t || !t.assignee_email) return { ok: true };
      const m = (await members(p.id)).find(x => x.email === t.assignee_email) || { email: t.assignee_email };
      await toPerson(p, m, `New task: ${t.title}`, { eyebrow: 'Task for you', heading: t.title, quote: t.detail || '', paras: [t.due_on ? `Due ${new Date(t.due_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.` : 'Update it in the portal as you go.'], cta: 'Open the task' });
      return { ok: true };
    }
    case 'task_updated': {
      const { data: t } = await db().from('tasks').select('*').eq('id', b.taskId).eq('client_id', p.id).maybeSingle();
      if (t && ['review', 'done'].includes(t.status)) await toTeam(p, `Task ${t.status === 'done' ? 'done' : 'ready for review'}: ${t.title}`, [`${t.assignee_email || 'Someone'} moved "${t.title}" to ${t.status}.`]);
      return { ok: true };
    }
    case 'signoff_opened': case 'signoff_reopened': {
      manage();
      const { s, reviews } = await signoffFor(p, b.signoffId);
      const team = await members(p.id);
      const again = event === 'signoff_reopened';
      const due = s.due_on ? ` by ${new Date(s.due_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : '';
      for (const r of reviews) await toPerson(p, team.find(x => x.email === r.email) || r, `${again ? 'New version to review' : 'Please review'}: ${s.title}`, { eyebrow: 'Your review', heading: `${s.title}${again ? `, version ${s.version}` : ''}`, quote: s.detail || '',
        paras: [`Please read it and either approve it or ask for changes${due}. Comments are shared with the whole project team.`], cta: 'Review it now', url: `${link}#workflow` });
      const ap = s.approver_email && (team.find(x => x.email === s.approver_email) || { email: s.approver_email });
      if (ap) await toPerson(p, ap, `For your sign-off: ${s.title}`, { eyebrow: 'Final sign-off', heading: s.title, quote: s.detail || '',
        paras: [reviews.length ? `${reviews.length} reviewer${reviews.length > 1 ? 's are' : ' is'} looking at it first. We will email you when it is ready for your final sign-off.` : `It is ready for your sign-off${due}.`], cta: 'Open it' });
      return { ok: true };
    }
    case 'signoff_comment': {
      const { s } = await signoffFor(p, b.signoffId);
      const { data: c } = await db().from('comments').select('*').eq('signoff_id', s.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (c && !c.from_admin) await toTeam(p, `Comment on: ${s.title}`, [`${c.author_name || 'Someone'} wrote:`, '', c.body]);
      return { ok: true };
    }
    case 'signoff_decided': {
      const { s, reviews } = await signoffFor(p, b.signoffId);
      const team = await members(p.id);
      const me = await emailOf(who);
      const mine = reviews.find(r => r.email === me);
      const who_ = (team.find(x => x.email === me)?.name) || me;
      if (s.status === 'approved') {
        const inv = await invoiceFor(p, s);
        await toTeam(p, `Signed off: ${s.title}`, [`${who_} gave the final sign-off on "${s.title}" (version ${s.version}).`, s.final_note ? `Note: ${s.final_note}` : '', inv ? `Invoice: ${inv}` : '']);
        for (const m of team) if (m.email !== me) await toPerson(p, m, `Signed off: ${s.title}`, { eyebrow: 'Signed off', heading: `${s.title} is signed off.`, paras: [`${who_} has given the final sign-off. Every comment and decision is kept on the record in the portal.`] });
        return { ok: true, invoice: inv };
      }
      if (s.status === 'ready') {
        const ap = s.approver_email && (team.find(x => x.email === s.approver_email) || { email: s.approver_email });
        if (ap) await toPerson(p, ap, `Ready for your sign-off: ${s.title}`, { eyebrow: 'Final sign-off', heading: `${s.title} is ready for you.`, paras: [`All ${reviews.length} reviewer${reviews.length === 1 ? ' has' : 's have'} approved it. You can now give the final sign-off, or ask for changes.`], cta: 'Sign it off' });
        await toTeam(p, `All reviewers approved: ${s.title}`, ['Waiting for the final approver now.']);
        return { ok: true };
      }
      if (s.status === 'changes') {
        const why = (mine?.note || s.final_note || '');
        await toTeam(p, `Changes requested: ${s.title}`, [`${who_} asked for changes:`, '', why, '', 'Upload a new version and send it back out for review from the sign-off.']);
        return { ok: true };
      }
      await toTeam(p, `${who_} approved: ${s.title}`, [`${reviews.filter(r => r.decision === 'approved').length} of ${reviews.length} reviewers have approved.`]);
      return { ok: true };
    }
    case 'signoff_invoice_retry': {
      if (!who.isAdmin) throw err('Only Minshall Group can do that', 403);
      const { s } = await signoffFor(p, b.signoffId);
      return { ok: true, invoice: await invoiceFor(p, s, { retry: true }) };
    }
  }
  return undefined;
}
