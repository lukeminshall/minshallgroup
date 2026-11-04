/* Vercel Serverless Function — reads a visitor's free-text answer to
   "What brings you here?" on the home page and returns which sector and
   job it points at, plus one or two of their own words for the dots to
   spell back. Uses Claude when ANTHROPIC_API_KEY is set in Vercel
   (Project → Settings → Environment Variables); without it, or if the
   call fails, falls back to keywords so the page still works. Nothing
   is stored. */
import Anthropic from '@anthropic-ai/sdk';

const SECTORS = ['health', 'sport', 'public'];
const JOBS = ['fund', 'prove', 'build', 'who'];

const KW = {
  health: /\b(nhs|health|patient|clinic|gp|hospital|trust|icb|care|diagnos|medical|wellbeing|therap|surgery|pharma|dental)/i,
  sport: /\b(sport|club|leisure|active|activity|gym|pitch|stadium|fitness|football|rugby|cricket|swim|athlet|coach|participat|pool|ground)/i,
  public: /\b(town|bid|high street|council|place|community|communities|market|footfall|visitor|centre|center|street|borough|parish|village|city|event)/i,
};
const KWJ = {
  fund: /\b(fund|funding|money|bid for|grant|business case|case for|investment|revenue|income|commercial|sponsor|budget|pay for)/i,
  prove: /\b(prove|evidence|measure|impact|evaluat|outcome|report|show|data|track|kpi|return)/i,
  build: /\b(build|website|web|app|tool|platform|system|digital|booking|dashboard|software|site|portal|develop)/i,
  who: /\b(who are you|about you|what do you do|curious|looking around|just looking|browsing)/i,
};
const guess = text => {
  const sector = SECTORS.find(s => KW[s].test(text)) || '';
  const job = JOBS.find(j => KWJ[j].test(text)) || '';
  const m = text.match(/\b([a-z][a-z' -]{2,22})\b/i);
  return { sector, job, word: m ? m[1].toLowerCase().trim() : '', source: 'keywords' };
};

const SYSTEM = `You read one sentence a visitor typed on the home page of Minshall Group, a UK consultancy that builds services that change lives, develops strategy that allows growth and delivers value, working in health, sport and physical activity, and places and communities (towns, BIDs, councils). Classify the sentence.
sector: "health" (NHS, private care, clinics, patients, wellbeing), "sport" (clubs, leisure, physical activity, governing bodies, facilities), "public" (a town, high street, BID, council, community, place), or "" if none fits.
job: "fund" (make the case for money, funding, revenue, a business case), "prove" (evidence, impact, measuring whether it worked), "build" (a website, app, tool, platform or service to be built), "who" (curious about the company), or "" if unclear.
word: one or two of the visitor's own words, lower case, no punctuation, that best name what they are here about (for example "leisure centres", "footfall", "referrals"). If nothing fits, use the sector name. Keep it under 20 characters.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let data = req.body; if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
  const text = String((data && data.text) || '').trim().slice(0, 300);
  if (!text) return res.status(400).json({ error: 'Nothing to read' });
  res.setHeader('Cache-Control', 'no-store');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(200).json(guess(text));

  try {
    const client = new Anthropic({ apiKey, timeout: 8000, maxRetries: 0 });
    const r = await client.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 200,
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: {
          type: 'object', additionalProperties: false, required: ['sector', 'job', 'word'],
          properties: { sector: { type: 'string', enum: [...SECTORS, ''] }, job: { type: 'string', enum: [...JOBS, ''] }, word: { type: 'string' } },
        } },
      },
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    });
    if (r.stop_reason === 'refusal') return res.status(200).json(guess(text));
    const out = r.content.find(b => b.type === 'text');
    const j = JSON.parse(out ? out.text : '{}');
    const sector = SECTORS.includes(j.sector) ? j.sector : '';
    const job = JOBS.includes(j.job) ? j.job : '';
    const word = String(j.word || '').toLowerCase().replace(/[^a-z' -]/g, '').trim().slice(0, 20) || sector;
    return res.status(200).json({ sector, job, word, source: 'claude' });
  } catch (err) {
    console.error('intent:', err && err.message);
    return res.status(200).json(guess(text));
  }
}
