/* Vercel Serverless Function — instant website check for /digitalsme.
   POST { url } → scores from Google PageSpeed Insights (Lighthouse, mobile)
   plus our own plain-English checks on the page HTML, suggestions and a
   recommended package.
   Optional env: PSI_API_KEY (Google PageSpeed Insights API key). Without it
   Google's anonymous quota applies and busy periods may return no scores;
   the HTML checks still run.
   Safety: only public http(s) hosts are fetched. Private, loopback and
   link-local addresses are refused, including via redirects. */
import { lookup } from 'node:dns/promises';
import net from 'node:net';

const UA = 'Mozilla/5.0 (compatible; MinshallGroupSiteCheck/1.0; +https://minshallgroup.com/digitalsme)';

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') ||
    (v.startsWith('::ffff:') && isPrivateIp(v.slice(7)));
}

async function assertPublic(u) {
  if (!/^https?:$/.test(u.protocol)) throw new Error('Only http and https links can be checked.');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('That does not look like a public website address.');
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) throw new Error('That address is not a public website.');
}

async function fetchPage(start) {
  let u = start;
  for (let hop = 0; hop < 4; hop++) {
    await assertPublic(u);
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 9000);
    const t0 = Date.now();
    try {
      const r = await fetch(u, { redirect: 'manual', signal: ac.signal, headers: { 'User-Agent': UA, Accept: 'text/html' } });
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { u = new URL(r.headers.get('location'), u); continue; }
      const reader = r.body?.getReader(); let html = '', size = 0;
      if (reader) {
        const dec = new TextDecoder();
        while (size < 1_500_000) { const { done, value } = await reader.read(); if (done) break; size += value.length; html += dec.decode(value, { stream: true }); }
        reader.cancel().catch(() => {});
      }
      return { finalUrl: u.toString(), status: r.status, ms: Date.now() - t0, html };
    } finally { clearTimeout(t); }
  }
  throw new Error('Too many redirects.');
}

async function pagespeed(url) {
  const key = process.env.PSI_API_KEY ? `&key=${encodeURIComponent(process.env.PSI_API_KEY)}` : '';
  const cats = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'].map(c => `&category=${c}`).join('');
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 50000);
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${cats}${key}`, { signal: ac.signal });
    if (!r.ok) return { error: `Google's speed check is busy (${r.status}). Try again in a minute.` };
    const j = await r.json(); const lr = j.lighthouseResult || {}; const c = lr.categories || {}; const a = lr.audits || {};
    const sc = k => (c[k] && typeof c[k].score === 'number') ? Math.round(c[k].score * 100) : null;
    const failing = id => a[id] && typeof a[id].score === 'number' && a[id].score < 0.9;
    return {
      scores: { performance: sc('performance'), accessibility: sc('accessibility'), bestPractices: sc('best-practices'), seo: sc('seo') },
      lcp: a['largest-contentful-paint']?.displayValue || null,
      flags: {
        slowLcp: failing('largest-contentful-paint'), images: failing('uses-optimized-images') || failing('modern-image-formats') || failing('uses-responsive-images'),
        renderBlocking: failing('render-blocking-resources'), contrast: failing('color-contrast'), alt: failing('image-alt'),
        tapTargets: failing('tap-targets') || failing('target-size'), fontSize: failing('font-size')
      }
    };
  } catch (e) {
    return { error: 'Google’s speed check took too long. Your page may be slow, or try again shortly.' };
  } finally { clearTimeout(t); }
}

function htmlChecks(page) {
  const h = page.html || ''; const lower = h.toLowerCase();
  const m = (re) => h.match(re);
  const title = (m(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim()
    .replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
  const desc = m(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] || m(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1] || '';
  const year = new Date().getFullYear();
  const copyYears = [...h.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map(x => +x[1]).filter(y => y > 1995 && y <= year);
  const latestCopy = copyYears.length ? Math.max(...copyYears) : null;
  const checks = [
    { id: 'https', label: 'Secure connection (HTTPS)', ok: page.finalUrl.startsWith('https://') },
    { id: 'speed', label: 'Server responds quickly', ok: page.ms < 1500, detail: `${(page.ms / 1000).toFixed(1)}s to respond` },
    { id: 'mobile', label: 'Set up for mobile screens', ok: /<meta[^>]+name=["']viewport["']/i.test(h) },
    { id: 'title', label: 'Clear page title for Google', ok: title.length >= 15 && title.length <= 65, detail: title ? `“${title.slice(0, 70)}”` : 'No title found' },
    { id: 'desc', label: 'Search description written', ok: desc.trim().length >= 50, detail: desc ? `${desc.trim().length} characters` : 'None found' },
    { id: 'h1', label: 'One clear main heading', ok: (h.match(/<h1[\s>]/gi) || []).length === 1 },
    { id: 'form', label: 'Enquiry or contact form', ok: /<form[\s>]/i.test(h) },
    { id: 'contact', label: 'Phone or email easy to find', ok: /href=["'](tel:|mailto:)/i.test(h) },
    { id: 'social', label: 'Looks good when shared (preview image)', ok: /property=["']og:image["']/i.test(h) },
    { id: 'analytics', label: 'Visitor analytics installed', ok: /googletagmanager|gtag\(|google-analytics|clarity\.ms|plausible|fathom/i.test(lower) },
    { id: 'fresh', label: 'Looks up to date', ok: latestCopy === null || latestCopy >= year - 1, detail: latestCopy ? `Copyright ${latestCopy}` : undefined }
  ];
  const signals = { login: /(log\s?in|sign\s?in|my account)/i.test(h), booking: /(book (now|online|an appointment)|booking|reserve)/i.test(h) };
  return { checks, signals, title };
}

/* ---------- Webmins Score: our own signals and pillars ----------
   Every signal is read from the page itself, so the score works without
   Google. Pillars are 0–100 from weighted signals; the overall score and
   the industry fit are combined in the browser (see src/content.ts SCORE). */
function textOf(h) {
  return h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
}
function readSignals(page, extras) {
  const h = page.html || ''; const text = textOf(h); const t = text.toLowerCase(); const all = h.toLowerCase();
  const has = re => re.test(all);
  const imgs = h.match(/<img\b[^>]*>/gi) || []; const imgCount = imgs.length;
  const withAlt = imgs.filter(i => /\balt=["'][^"']+["']/i.test(i)).length;
  const ctaRe = /<(a|button)\b[^>]*>([\s\S]{0,120}?)<\/\1>/gi; let cta = 0, m;
  while ((m = ctaRe.exec(h))) { if (/\b(book|contact|call|quote|request|buy|order|enquire|get started|sign up|donate|reserve|shop|join|apply|start)\b/i.test(textOf(m[2]))) cta++; }
  const words = text ? text.split(' ').length : 0;
  return {
    https: page.finalUrl.startsWith('https://'),
    viewport: has(/<meta[^>]+name=["']viewport["']/),
    h1One: (h.match(/<h1[\s>]/gi) || []).length === 1,
    nav: has(/<nav[\s>]/) || has(/class=["'][^"']*\b(nav|menu)\b/),
    cta, ctaAny: cta > 0,
    tel: has(/href=["']tel:/), mailto: has(/href=["']mailto:/),
    altCoverage: imgs.length ? withAlt / imgs.length : 1, images: imgs.length,
    words,
    title: !!(h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim(),
    desc: has(/<meta[^>]+name=["']description["'][^>]*content=["'][^"']{50,}/) || has(/<meta[^>]+content=["'][^"']{50,}["'][^>]*name=["']description/),
    canonical: has(/<link[^>]+rel=["']canonical["']/),
    ld: has(/application\/ld\+json/),
    og: has(/property=["']og:(title|image)["']/),
    sitemap: !!extras.sitemap, robots: !!extras.robots,
    lang: has(/<html[^>]+lang=["'][a-z]/),
    form: has(/<form[\s>]/),
    address: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/.test(text),
    privacy: has(/(privacy|cookie)/),
    reviews: /(review|testimonial|trustpilot|feefo|google reviews|★|5 stars|five stars)/i.test(text),
    social: has(/(facebook\.com|instagram\.com|linkedin\.com|tiktok\.com|x\.com\/|twitter\.com)/),
    instagram: has(/instagram\.com/), linkedin: has(/linkedin\.com/),
    chat: has(/(wa\.me|api\.whatsapp|whatsapp|intercom|tawk\.to|crisp\.chat|livechat|drift\.com|tidio|zendesk)/),
    video: has(/(<video|youtube\.com\/embed|youtube-nocookie|player\.vimeo)/),
    newsletter: /(newsletter|subscribe|mailing list)/.test(t),
    booking: /(book now|book online|book a|booking|reserve|appointment)/.test(t) || has(/(calendly|fresha|resdiary|opentable|setmore|acuity|simplybook|booksy|mindbody|treatwell)/),
    ecommerce: /(add to (cart|basket)|checkout|your basket|shopping cart)/.test(t) || has(/(shopify|woocommerce|cdn\.shopify|bigcommerce)/),
    pricing: /£\s?\d/.test(text),
    hours: /(opening (hours|times)|open (daily|7 days|every day)|mon(day)?\s*[-–to]+\s*(fri|sat|sun))/i.test(text),
    map: has(/(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|maps\.google|<iframe[^>]+maps)/) || /(find us|directions|how to find)/.test(t),
    menu: /\b(our menu|food menu|drinks menu|view menu|menu)\b/.test(t) && /(coffee|food|drink|breakfast|lunch|brunch|dinner|cake)/.test(t),
    gallery: /(gallery|portfolio|our work|recent projects|case stud)/.test(t),
    accreditations: /(gas safe|checkatrade|trustmark|niceic|napit|federation of master builders|fmb|which\? trusted|rated people|chas|constructionline|safecontractor|accredited)/.test(t),
    serviceAreas: /(areas we cover|areas covered|service area|we cover|serving [a-z]+ and)/.test(t),
    team: /(our team|meet the team|meet our|about us|who we are)/.test(t),
    caseStudies: /(case stud|our clients|client stories|success stories)/.test(t),
    blog: /\b(blog|news|insights|articles|latest posts)\b/.test(t),
    donate: /\bdonat/.test(t), charityNo: /(registered charity|charity (no|number|reg))/.test(t),
    timetable: /(timetable|class schedule|classes|schedule)/.test(t), membership: /\bmembership/.test(t), freeTrial: /(free trial|free class|first class free|free pass|free session)/.test(t),
    registration: /(cqc|care quality commission|hcpc|gmc|gdc|nmc|gphc|registered with)/.test(t),
    delivery: /\b(delivery|shipping)\b/.test(t), returns: /\breturns?\b/.test(t),
    rooms: /\b(rooms|suites|check-in|check in|accommodation)\b/.test(t),
    /* a site with no photos has nothing to optimise, so these pass */
    modernImages: !imgCount || has(/\.(webp|avif)\b/) || has(/image\/(webp|avif)/),
    lazy: imgCount < 3 || has(/loading=["']lazy["']/),
    analytics: has(/(googletagmanager|gtag\(|google-analytics|clarity\.ms|plausible|fathom|hotjar)/),
    freshCopy: (() => { const y = new Date().getFullYear(); const ys = [...h.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map(x => +x[1]).filter(v => v > 1995 && v <= y); return ys.length ? Math.max(...ys) >= y - 1 : true; })()
  };
}
const w = (pairs) => Math.round(pairs.reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0));
function pillars(sig, page, psi) {
  const perf = psi?.scores?.performance;
  const speedPts = perf != null ? perf / 100 * 20 : page.ms < 600 ? 18 : page.ms < 1500 ? 12 : 4;
  return {
    experience: Math.min(100, w([[sig.viewport, 15], [sig.h1One, 10], [sig.ctaAny, 15], [sig.nav, 10], [sig.tel || sig.mailto, 10], [sig.altCoverage >= 0.8, 10], [sig.words >= 150 && sig.words <= 2500, 10]]) + Math.round(speedPts)),
    findability: w([[sig.title, 20], [sig.desc, 20], [sig.h1One, 10], [sig.canonical, 10], [sig.ld, 15], [sig.og, 10], [sig.sitemap, 10], [sig.robots, 5]]),
    trust: w([[sig.https, 25], [sig.tel || sig.mailto, 15], [sig.address, 10], [sig.privacy, 15], [sig.freshCopy, 15], [sig.reviews, 10], [sig.social, 10]]),
    conversion: w([[sig.form, 30], [sig.cta >= 2, 20], [sig.tel, 15], [sig.booking || sig.ecommerce, 20], [sig.newsletter, 5], [sig.pricing, 10]]),
    modern: w([[sig.modernImages, 15], [sig.lazy, 10], [sig.ld, 15], [sig.chat, 10], [sig.video, 5], [sig.booking || sig.ecommerce || sig.form, 15], [sig.reviews, 10], [sig.analytics, 10], [sig.lang, 10]])
  };
}
const INDUSTRY_WORDS = {
  cafe: /\b(coffee|café|cafe|brunch|bakery|restaurant|bistro|eatery|tea room|takeaway)/g,
  retail: /\b(shop now|add to basket|add to cart|our products|free delivery|boutique|store)/g,
  trades: /\b(plumb|electrician|electrical|builder|building|roof|joinery|carpent|construction|heating|boiler|landscap|decorat|plaster|kitchen fitt)/g,
  clinic: /\b(clinic|physio|dental|dentist|therapy|therapist|treatment|patients|aesthetic|osteopath|chiropract|massage|optician)/g,
  professional: /\b(consult|accountan|solicitor|law firm|legal|advis|agency|architect|recruit|financial planning)/g,
  hospitality: /\b(hotel|rooms|stay with us|guest house|b&b|bed and breakfast|holiday cottage|spa\b|venue|wedding)/g,
  fitness: /\b(gym|fitness|personal train|yoga|pilates|crossfit|bootcamp|martial arts|swim|classes)/g,
  charity: /\b(charity|donate|volunteer|fundrais|our mission|community interest)/g
};
function guessIndustry(page) {
  const t = textOf(page.html || '').toLowerCase(); let best = 'other', top = 1;
  for (const [k, re] of Object.entries(INDUSTRY_WORDS)) { const n = (t.match(re) || []).length; if (n > top) { top = n; best = k; } }
  return best;
}
async function smallFetch(u) {
  try { await assertPublic(u); const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 3500);
    const r = await fetch(u, { redirect: 'follow', signal: ac.signal, headers: { 'User-Agent': UA } }); clearTimeout(t);
    if (!r.ok) return false; const body = (await r.text()).slice(0, 2000).toLowerCase();
    return !body.includes('<html'); } catch { return false; }
}

const ADVICE = {
  https: 'Move the site to HTTPS. Browsers warn visitors away from sites without it.',
  speed: 'Your server is slow to respond. Better hosting alone would make a visible difference.',
  mobile: 'The site is not set up for phones, where most visitors now arrive.',
  title: 'Rewrite the page title so it says what you do and where. It is the headline people see in Google.',
  desc: 'Add a search description: the two lines under your link in Google that persuade people to click.',
  h1: 'Give each page one clear main heading so visitors and Google know what it is about.',
  form: 'Add an enquiry form. Many visitors will not email or phone, but they will fill in a short form.',
  contact: 'Make your phone number and email tappable so mobile visitors can contact you in one tap.',
  social: 'Add a preview image so your link looks professional when shared on LinkedIn, WhatsApp or email.',
  analytics: 'Install visitor analytics so you can see what people do on your site and where they drop off.',
  fresh: 'The copyright year is out of date, which quietly tells visitors the site is not looked after.'
};

function suggestions(checks, psi) {
  const out = checks.filter(c => !c.ok).map(c => ADVICE[c.id]);
  const f = psi?.flags || {};
  if (f.slowLcp) out.unshift(`Your main content takes ${psi.lcp || 'too long'} to appear on mobile. Aim for under 2.5 seconds.`);
  if (f.images) out.push('Images are larger than they need to be. Compressing them would speed the site up.');
  if (f.renderBlocking) out.push('Scripts and styles are holding up the first view of the page.');
  if (f.contrast) out.push('Some text is hard to read against its background.');
  if (f.alt) out.push('Images are missing descriptions for screen readers and Google.');
  if (f.tapTargets || f.fontSize) out.push('Buttons or text are too small to use comfortably on a phone.');
  return out.slice(0, 8);
}

function recommend(checks, psi, signals) {
  if (signals.login) return 'grow';
  const fails = checks.filter(c => !c.ok).length;
  const s = psi?.scores ? Object.values(psi.scores).filter(v => v !== null) : [];
  const avg = s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
  if (signals.booking && fails >= 3) return 'grow';
  if (!checks.find(c => c.id === 'form').ok || fails >= 4 || (avg !== null && avg < 60)) return 'rebuild';
  return 'refresh';
}

/* Shared by /api/audit (public page) and /api/prospect (internal tool).
   Returns { status, body }. Set psi:false to skip Google for speed. */
import { db } from './_lib/portal.js';

export async function runAudit(rawUrl, { psi: usePsi = true } = {}) {
  let raw = String(rawUrl || '').trim();
  if (!raw || raw.length > 500) return { status: 400, body: { error: 'Enter your website address.' } };
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let u; try { u = new URL(raw); } catch { return { status: 400, body: { error: 'That does not look like a website address.' } }; }
  try { await assertPublic(u); } catch (e) { return { status: 400, body: { error: e.message } }; }

  const [pageR, psi] = await Promise.all([
    fetchPage(u).then(p => ({ p }), e => ({ e })),
    usePsi ? pagespeed(u.toString()) : Promise.resolve({ error: 'Google check skipped for speed.' })
  ]);
  if (pageR.e) {
    const msg = pageR.e.name === 'AbortError' ? 'The site took too long to respond.' : (pageR.e.message || 'We could not reach that website.');
    return { status: 422, body: { error: msg } };
  }
  const { checks, signals, title } = htmlChecks(pageR.p);
  const origin = new URL(pageR.p.finalUrl).origin;
  const [robots, sitemap] = await Promise.all([smallFetch(new URL('/robots.txt', origin)), smallFetch(new URL('/sitemap.xml', origin))]);
  const sig = readSignals(pageR.p, { robots, sitemap });
  return { status: 200, body: {
    url: pageR.p.finalUrl, title, checks,
    signals: sig, pillars: pillars(sig, pageR.p, psi), industry: guessIndustry(pageR.p),
    scores: psi.scores || null, lcp: psi.lcp || null, psiError: psi.error || null,
    suggestions: suggestions(checks, psi), recommended: recommend(checks, psi, signals)
  } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const r = await runAudit(body?.url);
  /* record which site was checked (address and time only, nothing personal), so outreach clicks can be matched to the businesses we emailed */
  if (r.status === 200 && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const site = String(r.body?.url || body?.url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().slice(0, 200);
      if (site) await db().from('site_checks').insert({ site, from_link: body?.from === 'link' });
    } catch (e) { console.error('site_checks insert failed', e?.message); }
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(r.status).json(r.body);
}
