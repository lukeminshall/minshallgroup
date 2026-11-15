/* Outreach sender: Microsoft 365 (via scripts/research/msgraph.mjs), one email
   at a time, from our own mailboxes.
   Dry run (default, sends nothing):  node scripts/research/send.mjs
   Send for real:                      SEND=1 node scripts/research/send.mjs
   Options:
     MAILBOXES=hello@minshallgroup.com,team@minshallgroup.com   (default: hello@ only)
     BATCH=A      A = limited companies (default); A,B = also contacts that may be sole traders
     GAP=75       average seconds between emails
   Warm-up per mailbox, from its first day sending through Microsoft:
     hello@: 15 a day in week 1, 25 in week 2, then 40 (the BID sender also
       uses hello@: 10, 15, then 20, so hello@ never passes 60 a day in all)
     others: 10 on day 1, rising by 3 a day, up to 50
   Weekdays 08:30 to 17:00 only.
   Before sending, each run reads every inbox (last 30 days): replies stop the
   sequence, "no thanks"/"unsubscribe" suppresses for good, bounces are dropped.
   Follow-ups go 4 days after email 1 and 6 days after that, from the same
   mailbox, in the same thread.
   State: research/raw/outreach/state.json · log: research/raw/outreach/sent.log
   Microsoft sign-in details live in the macOS Keychain, never in the project
   (see the top of msgraph.mjs for the three commands).
*/
import fs from 'node:fs';
import { mailer, messages, graphReady, graphMissing } from './msgraph.mjs';

const DIR = 'research/raw/outreach';
const SEND = process.env.SEND === '1';
const GAP = Number(process.env.GAP || 75);
const BATCHES = (process.env.BATCH || 'A').split(',').map(s => s.trim().toUpperCase());
const MAILBOXES = (process.env.MAILBOXES || 'hello@minshallgroup.com').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const NAME = process.env.FROM_NAME || 'Minshall Group';
const STEP_GAP_DAYS = [0, 4, 6], DAY = 864e5;
const STEP = ['email 1', 'follow-up', 'last note'];

const queue = fs.readFileSync(`${DIR}/queue.jsonl`, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const statePath = `${DIR}/state.json`;
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
state.contacts ||= {}; state.suppressed ||= []; state.sent ||= {}; state.firstDay ||= {}; state.msFirstDay ||= {};
const save = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 1));
const log = line => { fs.appendFileSync(`${DIR}/sent.log`, `${new Date().toISOString()} ${line}\n`); console.log(line); };
const sup = new Set(state.suppressed.map(e => e.toLowerCase()));
const today = new Date().toISOString().slice(0, 10);

function cap(box) {
  /* warm-up restarts on Microsoft: a new sender there has no reputation yet.
     Zoho blocked hello@ for "unusual sending activity" after 84 a day (10 Nov 2026),
     and a block on Microsoft would stop all company email, so stay well under. */
  const first = state.msFirstDay[box]; const d = first ? Math.floor((Date.parse(today) - Date.parse(first)) / DAY) : 0;
  if (box.startsWith('hello@')) return d < 7 ? 15 : d < 14 ? 25 : 40;
  return Math.min(50, 10 + 3 * d);
}
const sentToday = box => (state.sent[today] || {})[box] || 0;

/* replies can come from a colleague's address, sit in any folder (or already be
   in Trash), or be an Apple Mail "unsubscribe": match on the company's domain,
   read every folder except Sent and Drafts, and treat any real reply as a stop.
   Opt-outs suppress the whole domain for good. Auto-replies are ignored. */
const FREE = /^(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|btinternet|aol|sky|talktalk|virginmedia|ntlworld|karoo|protonmail)\./;
const domOf = e => e.split('@')[1] || '';
async function readInbox(box) {
  const byEmail = new Set(queue.map(c => c.email.toLowerCase()));
  const byDomain = new Map();
  for (const [e, s] of Object.entries(state.contacts)) if ((s.sent || []).length && !FREE.test(domOf(e))) byDomain.set(domOf(e), e);
  let replies = 0, optouts = 0, bounces = 0;
      for await (const { from, subject, raw } of messages(box, Date.now() - 30 * DAY)) {
        if (/mailer-daemon|postmaster/.test(from) || /delivery status notification|undeliverable|returned mail|delivery failure|failure notice/i.test(subject)) {
          const low = raw.toLowerCase();
          for (const e of byEmail) if (low.includes(e)) { const s = (state.contacts[e] ||= {}); if (s.status !== 'bounced') { s.status = 'bounced'; bounces++; } }
          continue;
        }
        const target = byEmail.has(from) && state.contacts[from]?.sent?.length ? from : byDomain.get(domOf(from));
        const unsub = /^\s*unsubscribe\s*$/i.test(subject);
        if (!target && !unsub) continue;
        if (!unsub && (/^auto-submitted:\s*auto-(replied|generated)/im.test(raw) || /out of (the )?office|office closed|automatic reply|auto.?reply|canned\.response|new email address|no longer (use|work|with)/i.test(subject + ' ' + from))) continue;
        const theirs = (raw.split(/\r?\n\r?\n/).slice(1).join('\n').split(/\n>|\nOn .{5,120}wrote:|-----Original Message-----|\nFrom: /)[0] || '').slice(0, 3000);
        const optout = unsub || /\b(no thanks|no thank you|unsubscribe|remove|take me off|take us off|stop emailing|stop sending|not interested|not looking|opt out|won'?t need|do not contact|don'?t contact)\b/i.test(theirs);
        const ids = [target, from].filter(Boolean);
        if (optout) {
          for (const e of ids) if (!sup.has(e)) { sup.add(e); state.suppressed.push(e); }
          const d = domOf(target || from); if (d && !FREE.test(d)) { state.suppressedDomains ||= []; if (!state.suppressedDomains.includes(d)) { state.suppressedDomains.push(d); optouts++; } }
          if (target) state.contacts[target].status = 'optout';
        } else if (target && !['optout', 'replied'].includes(state.contacts[target].status)) { state.contacts[target].status = 'replied'; state.contacts[target].repliedAt = new Date().toISOString(); replies++; }
      }
  save();
  log(`${box} inbox: ${replies} new replies, ${optouts} opt-outs, ${bounces} bounces`);
}

function due() {
  const now = Date.now(), out = [];
  for (const c of queue) {
    const e = c.email.toLowerCase();
    if (!BATCHES.includes(c.batch[0]) || sup.has(e) || (state.suppressedDomains || []).includes(domOf(e))) continue;
    const s = state.contacts[e] || {};
    if (['replied', 'optout', 'bounced', 'done'].includes(s.status)) continue;
    const sent = s.sent || [];
    if (sent.length >= 3) continue;
    if (sent.length && now - Date.parse(sent[sent.length - 1]) < STEP_GAP_DAYS[sent.length] * DAY) continue;
    if (sent.length && s.mailbox && !MAILBOXES.includes(s.mailbox)) continue;
    out.push({ c, step: sent.length, box: s.mailbox || null });
  }
  return out.sort((a, b) => (b.step > 0) - (a.step > 0) || a.c.score - b.c.score);
}
function plan() {
  const room = Object.fromEntries(MAILBOXES.map(b => [b, Math.max(0, cap(b) - sentToday(b))]));
  const out = [];
  for (const item of due()) {
    let box = item.box || MAILBOXES.filter(b => room[b] > 0).sort((a, b) => room[b] - room[a])[0];
    if (!box || room[box] <= 0) continue;
    room[box]--; out.push({ ...item, box });
  }
  return out;
}

if (SEND && !graphReady()) { console.error(`Microsoft sign-in details missing from the Keychain: ${graphMissing().join(', ')}\nSee the top of scripts/research/msgraph.mjs. Nothing sent.`); process.exit(1); }
for (const b of MAILBOXES) {
  if (!graphReady()) { console.log(`(${b}: Microsoft sign-in not set up yet, so its inbox was not checked. Fine for a dry run.)`); continue; }
  try { await readInbox(b); } catch (e) { console.error(`Could not read ${b}:`, e.message); if (SEND) { console.error('Nothing sent.'); process.exit(1); } }
}

const list = plan();
const wd = new Date().getDay(), hm = new Date().getHours() * 60 + new Date().getMinutes();
const inHours = wd >= 1 && wd <= 5 && hm >= 510 && hm <= 1020;
console.log(`${SEND ? 'SENDING' : 'DRY RUN: nothing will be sent'} · batch ${BATCHES.join('+')} · ${queue.filter(c => BATCHES.includes(c.batch[0])).length} contacts in batch · suppressed ${sup.size}`);
for (const b of MAILBOXES) console.log(`  ${b}: cap today ${cap(b)}, already sent ${sentToday(b)}, planned ${list.filter(x => x.box === b).length}`);
if (!SEND) {
  for (const { c, step, box } of list) console.log(`  [${STEP[step].padEnd(9)}] ${box.split('@')[0].padEnd(6)} → ${c.email.padEnd(36)} ${c.steps[step].subject}`);
  if (!inHours) console.log('Note: outside sending hours (weekdays 08:30 to 17:00), so a real run now would send nothing.');
  process.exit(0);
}
if (!inHours) { console.log('Outside sending hours (weekdays 08:30 to 17:00). Nothing sent.'); process.exit(0); }

const tx = {};
for (const b of MAILBOXES) { tx[b] = mailer(b); await tx[b].verify(); }
const stopped = new Set();
for (const [i, { c, step, box }] of list.entries()) {
  if (stopped.has(box)) continue;
  const e = c.email.toLowerCase(), s = (state.contacts[e] ||= {}); s.sent ||= [];
  const st = c.steps[step];
  try {
    const info = await tx[box].sendMail({
      from: `${NAME} <${box}>`, to: c.email, subject: st.subject, text: st.text, replyTo: box,
      headers: { 'List-Unsubscribe': `<mailto:${box}?subject=unsubscribe>` },
      ...(s.messageId ? { inReplyTo: s.messageId, references: s.messageId } : {})
    });
    if (step === 0) { s.messageId = info.messageId; s.mailbox = box; }
    s.sent.push(new Date().toISOString()); if (s.sent.length >= 3) s.status = 'done';
    state.firstDay[box] ||= today; state.msFirstDay[box] ||= today;
    (state.sent[today] ||= {})[box] = sentToday(box) + 1; save();
    log(`sent [${STEP[step]}] from ${box} to ${c.email} (${c.business})`);
  } catch (err) {
    log(`FAILED from ${box} to ${c.email}: ${err.message}`);
    /* any Microsoft refusal stops the run: a sign-in or permission fault fails every email, and a limit must not be pushed */
    if (/Microsoft (4\d\d|5\d\d)|rate|limit|throttl|quota|exceeded|restrict|blocked|spam|suspend/i.test(err.message)) { log(`${box}: provider limit or block reached; stopping this mailbox for today.`); stopped.add(box); }
  }
  if (i < list.length - 1) await new Promise(r => setTimeout(r, (GAP * 0.6 + Math.random() * GAP * 0.8) * 1000));
}
log(`done: ${MAILBOXES.map(b => `${b} ${sentToday(b)}`).join(', ')} sent today`);
