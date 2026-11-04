/* Vercel Serverless Function — the home page's short conversation.
   The visitor says what brings them here; we ask at most two natural
   follow-up questions; then we write them a short page: a headline, a
   few lines, three things to consider, and an invitation to talk
   properly. Uses Claude when ANTHROPIC_API_KEY is set in Vercel
   (Project → Settings → Environment Variables); without it, or if the
   call fails, falls back to keywords and a plain page. Nothing is
   stored server-side.
   POST { turns: [{q, a}, ...] }  →  { sector, job, word, question | page } */
import Anthropic from '@anthropic-ai/sdk';

const SECTORS = ['health', 'sport', 'public'];
const JOBS = ['fund', 'prove', 'build', 'who'];
const MAX_QUESTIONS = 2;

const KW = {
  health: /\b(nhs|health|patient|clinic|gp|hospital|trust|icb|care|diagnos|medical|wellbeing|therap|surgery|pharma|dental)/i,
  sport: /\b(sport|club|leisure|active|activity|gym|pitch|stadium|fitness|football|rugby|cricket|swim|athlet|coach|participat|pool|ground)/i,
  public: /\b(town|bid|high street|council|place|community|communities|market|footfall|visitor|centre|center|street|borough|parish|village|city|event|cafe|café|shop|restaurant|business)/i,
};
const KWJ = {
  fund: /\b(fund|funding|money|bid for|grant|business case|case for|investment|revenue|income|commercial|sponsor|budget|pay for)/i,
  prove: /\b(prove|evidence|measure|impact|evaluat|outcome|report|show|data|track|kpi|return)/i,
  build: /\b(build|website|web|app|tool|platform|system|digital|booking|dashboard|software|site|portal|develop)/i,
  who: /\b(who are you|about you|what do you do|curious|looking around|just looking|browsing)/i,
};
const FALLBACK_Q = ['What is it for, and who is it for?', 'Where are you, and what would need to be true in a year for it to have worked?'];
const plainPage = (sector, job) => ({
  headline: job === 'build' ? 'Build it to be measured' : job === 'fund' ? 'The case is the numbers' : job === 'prove' ? 'Prove it changed something' : 'Where to start',
  intro: 'A quick sketch from what you have told us. The point of anything we build or plan with you is the same: that the people it is for feel the difference, and that you can show it.',
  points: [
    { t: 'Start with the outcome', d: 'One sentence on what should be different in a year, for whom. Everything else is designed backwards from that.' },
    { t: 'Count the right thing', d: 'Not visits, likes or logins. Whether anyone got there sooner, moved more, or came back. We set that measure up first.' },
    { t: 'Keep it small to begin', d: 'A fixed-price first piece that proves the idea, before anything bigger is committed.' },
  ],
  close: 'This is a sketch, not a proposal. The useful next step is a conversation.',
});
const fallback = turns => {
  const text = turns.map(t => t.a).join(' ');
  const sector = SECTORS.find(s => KW[s].test(text)) || '';
  const job = JOBS.find(j => KWJ[j].test(text)) || '';
  const m = text.match(/\b([a-z][a-z' -]{2,22})\b/i);
  const word = sector === 'health' ? 'health' : sector === 'sport' ? 'sport' : sector === 'public' ? 'places' : (m ? m[1].toLowerCase().trim() : 'you');
  const asked = turns.length - 1;
  if (asked < MAX_QUESTIONS) return { sector, job, word, question: FALLBACK_Q[asked], source: 'keywords' };
  return { sector, job, word, page: plainPage(sector, job), source: 'keywords' };
};

const SYSTEM = `You are the home page of Minshall Group, a UK consultancy. We build services that change lives, develop strategy that allows growth and deliver value, through strategy and commercial thinking, and through digital tools, data and the web. We work in health (NHS, private care, clinics, patients), sport and physical activity (clubs, leisure, governing bodies, facilities), and places and communities (towns, high streets, BIDs, councils, the businesses on those streets). Most of our work is national. We measure services on whether anyone's life changed, not on activity.

A visitor is answering a short conversation on our home page. You get the turns so far: our question and their answer, in order. Reply with JSON only.

Rules:
- Classify: sector is "health", "sport", "public" (a place, a community, a town, or a business on a high street such as a cafe or shop) or "". job is "fund" (the case for money or revenue), "prove" (evidence, impact, measurement), "build" (a website, app, tool, platform or service), "who" (curious about us) or "".
- word: one or two of the visitor's own words, lower case, no punctuation, under 20 characters, naming what they are here about (for example "leisure centres", "the cafe", "footfall"). Fall back to the sector name.
- If you have asked fewer than ${MAX_QUESTIONS} questions so far and you do not yet know (a) what the thing is for and who it is for, and (b) where they are or what success would look like, set "question" to ONE short, natural follow-up in plain British English that asks for what is missing. It may ask two things in one sentence. No preamble, no "great!", no exclamation marks. Set "page" to null.
- Otherwise set "question" to null and write "page": a headline (under 8 words, no full stop, specific to them), an intro (40 to 70 words, written to them, plain, warm, no hype, no jargon, British spelling), exactly three points each with t (under 6 words) and d (under 32 words) that are genuinely useful thoughts for their situation, and a close (one sentence: this is a quick sketch to spark ideas, not a proposal, and we would like a proper conversation).
- Never invent facts about them, never quote prices, never promise results, never name other clients. If their answer is unclear, nonsense or hostile, ask a gentle clarifying question once; if still unclear, write a general page for their sector or for "" with sector "".
- If they say they are just looking, set sector "", job "who", question null, and write a short page about who we are.`;

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['sector', 'job', 'word', 'question', 'page'],
  properties: {
    sector: { type: 'string', enum: [...SECTORS, ''] },
    job: { type: 'string', enum: [...JOBS, ''] },
    word: { type: 'string' },
    question: { type: ['string', 'null'] },
    page: { type: ['object', 'null'], additionalProperties: false, required: ['headline', 'intro', 'points', 'close'],
      properties: {
        headline: { type: 'string' }, intro: { type: 'string' }, close: { type: 'string' },
        points: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['t', 'd'], properties: { t: { type: 'string' }, d: { type: 'string' } } } },
      } },
  },
};

const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let data = req.body; if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
  let turns = Array.isArray(data && data.turns) ? data.turns : [];
  turns = turns.slice(0, 1 + MAX_QUESTIONS).map(t => ({ q: clean(t && t.q).slice(0, 300), a: clean(t && t.a).slice(0, 400) })).filter(t => t.a);
  if (!turns.length) return res.status(400).json({ error: 'Nothing to read' });
  res.setHeader('Cache-Control', 'no-store');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(200).json(fallback(turns));

  try {
    const client = new Anthropic({ apiKey, timeout: 20000, maxRetries: 0 });
    const asked = turns.length - 1;
    const transcript = turns.map((t, i) => `Our question ${i + 1}: ${t.q || 'What brings you here?'}\nTheir answer: ${t.a}`).join('\n\n');
    const r = await client.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 1200,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Questions asked so far: ${asked} of ${MAX_QUESTIONS}.${asked >= MAX_QUESTIONS ? ' You must write the page now.' : ''}\n\n${transcript}` }],
    });
    if (r.stop_reason === 'refusal') return res.status(200).json(fallback(turns));
    const out = r.content.find(b => b.type === 'text');
    const j = JSON.parse(out ? out.text : '{}');
    const sector = SECTORS.includes(j.sector) ? j.sector : '';
    const job = JOBS.includes(j.job) ? j.job : '';
    const word = clean(j.word).toLowerCase().replace(/[^a-z' -]/g, '').slice(0, 20) || sector || 'you';
    if (j.question && asked < MAX_QUESTIONS) return res.status(200).json({ sector, job, word, question: clean(j.question).slice(0, 200), source: 'claude' });
    const p = j.page || plainPage(sector, job);
    const page = { headline: clean(p.headline).replace(/\.$/, '').slice(0, 80), intro: clean(p.intro).slice(0, 600), close: clean(p.close).slice(0, 240),
      points: (Array.isArray(p.points) ? p.points : []).slice(0, 3).map(x => ({ t: clean(x.t).slice(0, 60), d: clean(x.d).slice(0, 240) })) };
    while (page.points.length < 3) page.points.push(plainPage(sector, job).points[page.points.length]);
    return res.status(200).json({ sector, job, word, page, source: 'claude' });
  } catch (err) {
    console.error('intent:', err && err.message);
    return res.status(200).json(fallback(turns));
  }
}
