"""Personalised outreach drafts for every contact we can genuinely help.
Run: python3 scripts/research/drafts.py
Takes every contact with a published email whose website scored under 70
(needs work or falling behind) and has at least two specific fixes, and writes
a three-email sequence in the right sector voice, signed from hello@.
Batches: A = confirmed limited companies; B = could be sole traders (PECR risk).
Output: research/raw/outreach/queue.jsonl (for the sender) and
~/Downloads/Minshall prospects/Outreach drafts.xlsx (for review). Nothing is sent."""
import csv, glob, json, os, re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

RAW = 'research/raw'; MAX_SCORE = 70
OUTDIR = f'{RAW}/outreach'; os.makedirs(OUTDIR, exist_ok=True)
BOOK = os.path.expanduser('~/Downloads/Minshall prospects/Outreach drafts.xlsx')
REGION = {'yorkshire': 'Yorkshire', 'lincolnshire': 'Lincolnshire', 'north-east': 'North East', 'lancashire': 'Lancashire'}

# ---------- fixes (same order and wording as the prospect builder) ----------
ESS_FIX = {
 'Menu on the site': 'Put your menu on the site', 'Opening hours': 'Show today’s opening hours near the top', 'Map or directions': 'Add a map and directions',
 'Book a table or order online': 'Add online booking or ordering', 'Reviews shown': 'Show your reviews on the homepage', 'Instagram linked': 'Link your Instagram',
 'Tap-to-call phone number': 'Add a tap-to-call phone number', 'Buy online': 'Let people buy online', 'Prices shown': 'Show your prices', 'Delivery information': 'Add delivery information',
 'Returns policy': 'Add a returns policy', 'Newsletter sign-up': 'Add a newsletter sign-up', 'Social links': 'Link your social accounts', 'Quote or enquiry form': 'Add a quote form near the top of the homepage',
 'Accreditations shown': 'Show your accreditations', 'Photos of past work': 'Add photos of past work', 'Areas covered': 'List the areas you cover', 'Address or location': 'Show your address',
 'Book online': 'Add online booking', 'Practitioners introduced': 'Introduce your practitioners', 'Professional registration shown': 'Show professional registration', 'Privacy notice': 'Add a privacy notice',
 'Case studies or clients': 'Add short client case studies', 'Team introduced': 'Introduce your team', 'News or insights': 'Add news or insights', 'Enquiry form': 'Add an enquiry form',
 'LinkedIn linked': 'Link your LinkedIn page', 'Structured data for search': 'Tell Google and AI search who you are (structured data)', 'Rooms or spaces described': 'Describe your rooms or spaces',
 'Photo gallery': 'Add a photo gallery', 'Video tour': 'Add a short video tour', 'Class timetable': 'Put your class timetable online', 'Membership options': 'Show membership options',
 'Free trial offer': 'Offer a free trial or first class', 'Donate online': 'Add online donations', 'Charity number shown': 'Show your charity number', 'News or stories': 'Share news or stories', 'Contact or volunteer form': 'Add a contact or volunteer form'}
def fixes(r):
    c, s, out = r.get('checks') or {}, r.get('signals') or {}, []
    if c.get('mobile') is False: out.append('Make the site work properly on phones')
    for label, ok in r.get('ess') or []:
        if not ok and label in ESS_FIX: out.append(ESS_FIX[label])
    if c.get('form') is False and not any('form' in x.lower() for x in out): out.append('Add an enquiry form to the homepage')
    if c.get('speed') is False: out.append('Speed up the site on mobile')
    if s.get('ld') is False and not any('structured' in x for x in out): out.append('Tell Google and AI search who you are (structured data)')
    if c.get('desc') is False: out.append('Write a search description for Google')
    if c.get('analytics') is False: out.append('Add privacy-friendly visitor analytics')
    return list(dict.fromkeys(out))

# ---------- sector voice, using our published Yorkshire figures ----------
Y = json.load(open('src/data/yorkshire-2026.json'))
SEC = {s['id']: s for s in Y['sectors']}
def pct(sec, label): return next((e['pct'] for e in SEC[sec]['ess'] if e['t'] == label), None)
VOICE = {
 'cafe': dict(hook=f"cafés, pubs and restaurants came out lowest of any sector, at {SEC['cafe']['avg']} out of 100. Only {pct('cafe','Opening hours')}% show their opening hours and {pct('cafe','Reviews shown')}% show their reviews, two of the first things people look for before they visit.",
   tip='The change that usually makes the biggest difference for cafés and pubs is putting today’s opening hours and a tap-to-book or tap-to-call button at the very top of the page on a phone. Most visitors are on their phone, often outside.',
   example='minshallgroup.com/examples/cafe'),
 'trades': dict(hook=f"only {pct('trades','Areas covered')}% of trades and construction websites say which areas they cover, {pct('trades','Accreditations shown')}% show accreditations and {pct('trades','Reviews shown')}% show reviews. Those are the things that turn a search into a quote request.",
   tip='One thing helps trades websites more than anything else: a short quote form at the top of the homepage, with a tap-to-call number beside it and the areas you cover underneath.',
   example='minshallgroup.com/examples/trades'),
 'clinic': dict(hook=f"health, beauty and wellbeing websites scored best of any sector, but only {pct('clinic','Professional registration shown')}% show professional registration, {pct('clinic','Prices shown')}% show prices and {pct('clinic','Reviews shown')}% show reviews. Those are the trust signals people check before they book.",
   tip='A small change that tends to lift bookings: show prices and each practitioner’s registration on the treatment pages, with the booking button right beside them.',
   example='minshallgroup.com/examples/clinic'),
 'retail': dict(hook=f"only {pct('retail','Buy online')}% of independent shops let people buy online, {pct('retail','Prices shown')}% show prices and {pct('retail','Returns policy')}% show a returns policy. Shoppers check all three before they visit or buy.",
   tip='If a full online shop is not right for you, showing a few best sellers with prices and a reserve-and-collect button often does most of the job, at a fraction of the cost.', example=''),
 'hospitality': dict(hook=f"only {pct('hospitality','Photo gallery')}% of places to stay have a proper photo gallery, {pct('hospitality','Prices shown')}% show prices and {pct('hospitality','Reviews shown')}% show reviews, so guests go back to the booking sites and you pay the commission.",
   tip='The quickest way to win more direct bookings is usually a clear best-rate-when-you-book-direct line beside the booking button, with a gallery and reviews on the same page.', example=''),
 'fitness': dict(hook=f"just {pct('fitness','Free trial offer')}% of gym and sports websites offer a free trial, {pct('fitness','Prices shown')}% show prices and {pct('fitness','Class timetable')}% show a timetable. Those are the things that turn a visitor into a member.",
   tip='One idea: a free first session or a taster pass, offered at the top of the homepage with a simple sign-up form. It gives people a reason to act today rather than sometime.', example=''),
 'professional': dict(hook=f"only {pct('professional','Case studies or clients')}% of professional services websites show case studies or clients, {pct('professional','Enquiry form')}% have an enquiry form and {pct('professional','LinkedIn linked')}% link to LinkedIn. For firms that win work on trust, that is a lot left unsaid.",
   tip='Two or three short client stories, each with the problem, what you did and the result, usually do more for a professional firm’s website than any redesign.', example=''),
 'charity': dict(hook=f"only {pct('charity','Newsletter sign-up')}% of charity and community websites offer a newsletter sign-up and {pct('charity','Charity number shown')}% show their charity number, both of which help supporters trust and stay in touch.",
   tip='A simple newsletter sign-up and a clear donate button at the top of the homepage are often the two quickest wins for a charity website.', example=''),
 'other': dict(hook=f"the average scored {Y['avg']} out of 100, and {Y['noForm']}% had no enquiry form on the homepage. Most sites were not broken; they had simply stopped keeping up.",
   tip='The quickest win for most small business websites is a short enquiry form and a tap-to-call number at the top of the homepage, where people on a phone can see them straight away.', example=''),
}
FOOTER = ('Best wishes,\nThe Minshall Group team\n\nMinshall Group · hello@minshallgroup.com · minshallgroup.com\n'
          'Minshall Group Limited, registered in England and Wales, company 17529393. Registered office: 66 Paul Street, London EC2A 4NA.\n'
          'If you would rather not hear from us, reply "no thanks" and we will not contact you again.')

import html
def nice(name):
    n = html.unescape(html.unescape(name)).strip().replace("'", '’')
    n = re.sub(r'\s*\([^)]*\)', '', n).strip()   # drop "(Leeds)" and similar
    if n.isupper():
        keep = {'AND', 'THE', 'OF', 'FOR', 'CO', 'UK', 'LTD'}
        n = ' '.join(w if (len(w) <= 3 and w.isalpha() and w not in keep and not re.search(r'[AEIOU]', w[1:] if len(w) > 1 else '')) else w.title().replace('’S', '’s') for w in n.split())
        n = n.replace(' Ltd', ' Ltd').replace(' Llp', ' LLP').replace('Uk ', 'UK ')
    return re.sub(r'\s+(Ltd|Limited|LLP|Llp)\.?$', '', n).strip()

def sequence(c):
    v = VOICE.get(c['sector'], VOICE['other']); named = not is_domain(c['business']); biz = nice(c['business']) if named else ''; f1, f2 = c['fixes'][:2]
    poss = (biz + ('’' if biz.lower().endswith('s') else '’s')) if named else 'your'
    where = 'Yorkshire' if c['region'] == 'Yorkshire' else 'Yorkshire, and we are now extending it across the North'
    s1 = f'{poss} website scored {c["score"]} out of 100' if named else f'Your website scored {c["score"]} out of 100'
    e1 = (f'Hello,\n\nWe have just published a study of 3,628 small business websites across {where}. Among them, {v["hook"]}\n\n'
          f'We ran {poss} website through the same check. It scored {c["score"]} out of 100. The two things we would fix first:\n\n- {f1}\n- {f2}\n\n'
          f'Neither needs a whole new website. Your full breakdown is free, and this link runs it on your site straight away: minshallgroup.com/digitalsme?url={c["website"]}\n\n'
          'If you would rather we just sorted it, our website packages start at £495, fixed, with no calls needed.\n\n' + FOOTER)
    e2 = (f'Hello,\n\nA quick follow-up on {poss} website. {v["tip"]}\n\n'
          + (f'Here is an example we built for a similar business: {v["example"]}\n\n' if v['example'] else '')
          + 'Happy to send over exactly what we would change on your homepage. No charge, and no call needed.\n\n' + FOOTER)
    e3 = (f'Hello,\n\nWe will leave it here. If the website moves up your list, you can see your full report and price a refresh online in two minutes, and start the same evening: minshallgroup.com/digitalsme?url={c["website"]}\n\n'
          + FOOTER)
    return [(s1, e1), ('Re: ' + s1, e2), ('Re: ' + s1, e3)]

# ---------- choosing the right address ----------
FREE = {'gmail.com','googlemail.com','hotmail.com','hotmail.co.uk','outlook.com','outlook.co.uk','live.co.uk','live.com','yahoo.co.uk','yahoo.com','btinternet.com','btconnect.com','icloud.com','me.com','aol.com','sky.com','talktalk.net','virginmedia.com','ntlworld.com','tiscali.co.uk','mail.com','protonmail.com'}
ROLE = re.compile(r'^(webmaster|privacy|gdpr|dpo|data|press|media|marketing|jobs|careers|recruit\w*|hr|accounts|invoices?|billing|payroll|legal|compliance|abuse|postmaster|noreply|no-reply|donotreply|unsubscribe|support|sales-ops)@')
def label(d): return re.sub(r'[^a-z0-9]', '', d.split('.')[0])
def own(email, site):
    d = email.split('@')[1]
    if d in FREE: return True
    return site.endswith(d) or d.endswith(site) or label(d) == label(site) or (len(label(d)) >= 5 and (label(d) in label(site) or label(site) in label(d)))
def pick(primary, others, site):
    for e in [primary] + [x for x in (others or '').split() if x]:
        e = e.strip().lower()
        if e and own(e, site) and not ROLE.match(e): return e
    return ''
def is_domain(n): return bool(re.search(r'\.(co\.uk|com|org|uk|net|ca|coffee|io|org\.uk)$', n.strip().lower()))

# ---------- gather contacts ----------
contacts, seen = [], set()
def push(c):
    key = c['email'].lower(); site = c['website']
    if key in seen or site in seen: return
    seen.add(key); seen.add(site); contacts.append(c)

def nkey(n): return re.sub(r'[^a-z0-9]', '', re.sub(r'\b(limited|ltd|llp|plc|the|and|co|company)\b', '', n.lower().replace('&', ' and ')))
CH, ACC = {}, {}
LARGE = {'FULL', 'GROUP', 'MEDIUM', 'AUDIT EXEMPTION SUBSIDIARY', 'DORMANT'}   # bigger companies or parts of groups: not our market
for c in csv.DictReader(open(f'{RAW}/ch/all-names.csv', newline='')):
    ACC[c['company_number']] = c.get('accounts', '')
    k = (nkey(c['company']), c['region'])
    if len(k[0]) >= 5: CH[k] = None if k in CH else c['company_number']
def plausible(r):
    # a very low score with almost no text usually means the site blocked our check or needs JavaScript, not that it is bad
    words = (r.get('signals') or {}).get('words', 0) or 0
    return r.get('total', 0) >= 20 and words >= 120

for res_path in [f'{RAW}/results.jsonl'] + glob.glob(f'{RAW}/*/results.jsonl'):
    d = os.path.dirname(res_path); reg = 'yorkshire' if d == RAW else os.path.basename(d)
    pp = f'{d}/prospects.json'
    if not os.path.exists(pp): continue
    pros = {p['website']: p for p in json.load(open(pp))}
    for l in open(res_path):
        r = json.loads(l)
        if not r.get('ok'): continue
        site = re.sub(r'^www\.', '', re.sub(r'^https?://', '', r.get('final') or r['url']).split('/')[0].lower())
        p = pros.get(site)
        if not p or not p.get('email'): continue
        em = pick(p['email'], p.get('other_emails'), site)
        if not em: continue
        p['email'] = em
        fx = fixes(r)
        company = p.get('company_number') or CH.get((nkey(p['business']), REGION[reg]))
        push(dict(business=p['business'], email=p['email'], website=site, sector=r['sector'], region=REGION[reg], town=p.get('town', ''), score=r['total'], fixes=fx, ok_check=plausible(r),
                  company_number=company or '', batch='A: limited company' if company else 'B: check first (may be a sole trader)', source='Website research'))

scores = {}
if os.path.exists(f'{RAW}/ch/scores.jsonl'):
    for l in open(f'{RAW}/ch/scores.jsonl'):
        x = json.loads(l)
        if x.get('ok'): scores[x['website']] = x
for l in open(f'{RAW}/ch/enriched.jsonl'):
    c = json.loads(l); s = scores.get(c.get('website'))
    if not c.get('email') or not s: continue
    if c['match'].startswith('likely: own name'):
        # weakest match: only long, distinctive names (no "Solar Solar" lookalikes)
        lab = re.sub(r'[^a-z0-9]', '', c['website'].split('.')[0]); ws = re.findall(r'[a-z]+', c['company'].lower())
        if len(lab) < 14 or len(ws) != len(set(ws)): continue
    c['email'] = pick(c['email'], c.get('other_emails'), c['website'])
    if not c['email']: continue
    push(dict(business=c['company'], email=c['email'], website=c['website'], sector=s['sector'], region=c['region'], town=c['town'], score=s['total'], fixes=fixes(s), ok_check=plausible(s),
              company_number=c['company_number'], batch='A: limited company', source='Companies House'))

eligible = [c for c in contacts if c['score'] < MAX_SCORE and len(c['fixes']) >= 2 and c.get('ok_check', True) and ACC.get(c['company_number'], '') not in LARGE]
eligible.sort(key=lambda c: (c['batch'], c['score']))

with open(f'{OUTDIR}/queue.jsonl', 'w') as q:
    for c in eligible:
        seq = sequence(c)
        q.write(json.dumps({**c, 'id': c['email'].lower(), 'steps': [{'subject': s, 'text': t} for s, t in seq]}) + '\n')

# ---------- review workbook ----------
wb = Workbook(); ws = wb.active; ws.title = 'Drafts'
cols = [('Batch', 26), ('Business', 30), ('Email', 32), ('Sector', 13), ('Region', 12), ('Town', 16), ('Score', 7), ('Subject', 40), ('Email 1', 70), ('Follow-up (day 4)', 60), ('Last note (day 10)', 50)]
for j, (h, w) in enumerate(cols, 1):
    cell = ws.cell(row=1, column=j, value=h); cell.font = Font(bold=True, color='FFFFFF'); cell.fill = PatternFill('solid', fgColor='0A1A3F')
    ws.column_dimensions[get_column_letter(j)].width = w
for i, c in enumerate(eligible, 2):
    seq = sequence(c)
    for j, v in enumerate([c['batch'], nice(c['business']), c['email'], c['sector'], c['region'], c['town'], c['score'], seq[0][0], seq[0][1], seq[1][1], seq[2][1]], 1):
        cell = ws.cell(row=i, column=j, value=v); cell.alignment = Alignment(wrap_text=j >= 9, vertical='top')
ws.freeze_panes = 'C2'; ws.auto_filter.ref = f'A1:K{len(eligible) + 1}'
wb.save(BOOK)
from collections import Counter
print(json.dumps({'contacts_with_email_and_score': len(contacts), 'eligible_under_70': len(eligible), 'by_batch': Counter(c['batch'] for c in eligible),
                  'by_sector': Counter(c['sector'] for c in eligible), 'by_region': Counter(c['region'] for c in eligible), 'book': BOOK}, indent=1, default=str))
