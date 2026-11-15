/* Placeboard BID sender: signed Luke, sent from hello@ through Microsoft 365
   (scripts/research/msgraph.mjs), Catherine in CC, one email at a time. Replies land in hello@.
   BID_FROM=luke@minshallgroup.com sends from that mailbox instead, once the app is allowed to use it.
   Dry run (default, sends nothing):  node scripts/research/bid-send.mjs
   Send for real:                      SEND=1 node scripts/research/bid-send.mjs
   Queue: research/raw/outreach/bid-queue.jsonl, built from the "Emails" sheet of
   Placeboard-BID-prospects.xlsx (only rows marked "Send after: Now"), A first.
   Warm-up from the first day on Microsoft: 10 a day in week 1, 15 in week 2,
   then 20 (the main outreach also uses hello@, so the two together stay under 60).
   Weekdays 09:00 to 16:30 only.
   Before sending, reads every hello@ folder (last 45 days): any real reply from
   the BID's address or domain stops its follow-up; "no thanks"/"unsubscribe"
   suppresses the domain for good; bounces are dropped.
   Follow-up goes 6 days after email 1, in the same thread, Catherine in CC again.
   Microsoft sign-in details live in the macOS Keychain, never in the project
   (see the top of msgraph.mjs for the three commands).
*/
import fs from 'node:fs';
import { mailer, messages, graphReady, graphMissing } from './msgraph.mjs';

const DIR = 'research/raw/outreach';
const SEND = process.env.SEND === '1';
const GAP = Number(process.env.GAP || 90);
const BOX = process.env.BID_FROM || 'hello@minshallgroup.com', NAME = 'Luke Minshall';
const FOLLOW_DAYS = 6, DAY = 864e5;
const STEP = ['email 1', 'follow-up'];

const queue = fs.readFileSync(`${DIR}/bid-queue.jsonl`, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const statePath = `${DIR}/bid-state.json`;
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
state.contacts ||= {}; state.suppressed ||= []; state.suppressedDomains ||= []; state.sent ||= {};
const save = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 1));
const log = line => { fs.appendFileSync(`${DIR}/bid-sent.log`, `${new Date().toISOString()} ${line}\n`); console.log(line); };
const today = new Date().toISOString().slice(0, 10);

/* opt-outs from the hello@ outreach count here too */
const main = fs.existsSync(`${DIR}/state.json`) ? JSON.parse(fs.readFileSync(`${DIR}/state.json`, 'utf8')) : {};
const sup = new Set([...state.suppressed, ...(main.suppressed || [])].map(e => e.toLowerCase()));
const supDom = new Set([...state.suppressedDomains, ...(main.suppressedDomains || [])]);

/* warm-up restarts on Microsoft (see send.mjs for why hello@ stays low) */
const msDays = state.msFirstDay ? Math.floor((Date.parse(today) - Date.parse(state.msFirstDay)) / DAY) : 0;
const cap = msDays < 7 ? 10 : msDays < 14 ? 15 : 20;
const sentToday = () => state.sent[today] || 0;

const FREE = /^(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|btinternet|aol|sky|talktalk|virginmedia|ntlworld|protonmail)\./;
const domOf = e => e.split('@')[1] || '';
async function readInbox() {
  const byEmail = new Set(queue.map(c => c.email));
  const byDomain = new Map();
  for (const [e, s] of Object.entries(state.contacts)) if ((s.sent || []).length && !FREE.test(domOf(e))) byDomain.set(domOf(e), e);
  let replies = 0, optouts = 0, bounces = 0;
      for await (const { from, subject, raw } of messages(BOX, Date.now() - 45 * DAY)) {
        if (/mailer-daemon|postmaster/.test(from) || /delivery status notification|undeliverable|returned mail|delivery failure|failure notice/i.test(subject)) {
          const low = raw.toLowerCase();
          for (const e of byEmail) if (state.contacts[e]?.sent?.length && low.includes(e) && state.contacts[e].status !== 'bounced') { state.contacts[e].status = 'bounced'; bounces++; }
          continue;
        }
        const target = byEmail.has(from) && state.contacts[from]?.sent?.length ? from : byDomain.get(domOf(from));
        const unsub = /^\s*unsubscribe\s*$/i.test(subject);
        if (!target && !(unsub && byEmail.has(from))) continue;
        if (!unsub && (/^auto-submitted:\s*auto-(replied|generated)/im.test(raw) || /out of (the )?office|office closed|automatic reply|auto.?reply|canned\.response|new email address|no longer (use|work|with)/i.test(subject + ' ' + from))) continue;
        const theirs = (raw.split(/\r?\n\r?\n/).slice(1).join('\n').split(/\n>|\nOn .{5,120}wrote:|-----Original Message-----|\nFrom: /)[0] || '').slice(0, 3000);
        const optout = unsub || /\b(no thanks|no thank you|unsubscribe|remove|take me off|take us off|stop emailing|stop sending|not interested|opt out|do not contact|don'?t contact)\b/i.test(theirs);
        const t = target || from, s = (state.contacts[t] ||= {});
        if (optout) {
          for (const e of [t, from]) if (!sup.has(e)) { sup.add(e); state.suppressed.push(e); }
          const d = domOf(t); if (d && !FREE.test(d) && !supDom.has(d)) { supDom.add(d); state.suppressedDomains.push(d); optouts++; }
          s.status = 'optout';
        } else if (!['optout', 'replied'].includes(s.status)) { s.status = 'replied'; s.repliedAt = new Date().toISOString(); replies++; }
      }
  save();
  log(`${BOX} inbox: ${replies} new replies, ${optouts} opt-outs, ${bounces} bounces`);
}

function plan() {
  const now = Date.now(), follow = [], fresh = [];
  for (const c of queue) {
    if (sup.has(c.email) || supDom.has(domOf(c.email))) continue;
    const s = state.contacts[c.email] || {};
    if (['replied', 'optout', 'bounced', 'done'].includes(s.status)) continue;
    const sent = s.sent || [];
    if (sent.length >= 2) continue;
    if (sent.length) { if (now - Date.parse(sent[0]) >= FOLLOW_DAYS * DAY) follow.push({ c, step: 1 }); }
    else fresh.push({ c, step: 0 });
  }
  return [...follow, ...fresh].slice(0, Math.max(0, cap - sentToday()));
}

if (SEND && !graphReady()) { console.error(`Microsoft sign-in details missing from the Keychain: ${graphMissing().join(', ')}\nSee the top of scripts/research/msgraph.mjs. Nothing sent.`); process.exit(1); }
if (graphReady()) { try { await readInbox(); } catch (e) { console.error(`Could not read ${BOX}:`, e.message); if (SEND) { console.error('Nothing sent.'); process.exit(1); } } }
else console.log(`(${BOX}: Microsoft sign-in not set up yet, so the inbox was not checked. Fine for a dry run.)`);

const list = plan();
const wd = new Date().getDay(), hm = new Date().getHours() * 60 + new Date().getMinutes();
const inHours = wd >= 1 && wd <= 5 && hm >= 540 && hm <= 990;
const left = queue.filter(c => !(state.contacts[c.email]?.sent || []).length).length;
console.log(`${SEND ? 'SENDING' : 'DRY RUN: nothing will be sent'} · ${queue.length} BIDs in queue, ${left} not yet emailed · cap today ${cap}, already sent ${sentToday()}, planned ${list.length}`);
if (!SEND) {
  for (const { c, step } of list) console.log(`  [${STEP[step].padEnd(9)}] ${c.priority} → ${c.email.padEnd(40)} ${c.bid}`);
  if (!inHours) console.log('Note: outside sending hours (weekdays 09:00 to 16:30), so a real run now would send nothing.');
  process.exit(0);
}
if (!inHours) { console.log('Outside sending hours (weekdays 09:00 to 16:30). Nothing sent.'); process.exit(0); }

const tx = mailer(BOX);
await tx.verify();
for (const [i, { c, step }] of list.entries()) {
  const s = (state.contacts[c.email] ||= {}); s.sent ||= [];
  try {
    const info = await tx.sendMail({
      from: `${NAME} <${BOX}>`, to: c.email, cc: c.cc || undefined, replyTo: BOX,
      subject: step ? `Re: ${c.subject}` : c.subject, text: c.steps[step],
      headers: { 'List-Unsubscribe': `<mailto:${BOX}?subject=unsubscribe>` },
      ...(s.messageId ? { inReplyTo: s.messageId, references: s.messageId } : {})
    });
    if (step === 0) s.messageId = info.messageId;
    s.sent.push(new Date().toISOString()); if (s.sent.length >= 2) s.status = 'done';
    state.msFirstDay ||= today;
    state.sent[today] = sentToday() + 1; save();
    log(`sent [${STEP[step]}] to ${c.email} (${c.bid})`);
  } catch (err) {
    log(`FAILED to ${c.email}: ${err.message}`);
    if (/Microsoft (4\d\d|5\d\d)|rate|limit|throttl|quota|exceeded|restrict|blocked|spam|suspend/i.test(err.message)) { log('Provider limit or block reached; stopping for today.'); break; }
  }
  if (i < list.length - 1) await new Promise(r => setTimeout(r, (GAP * 0.6 + Math.random() * GAP * 0.8) * 1000));
}
log(`done: ${sentToday()} BID emails sent today`);
