"""Combine every prospect source into one spreadsheet.
Run: python3 scripts/research/contacts-book.py [output.xlsx]
Sources (all in research/raw, kept out of git):
  - prospects.json (Yorkshire, scored websites) and <region>/prospects.json
  - ch/enriched.jsonl (Companies House companies with a verified website)
  - ch/companies.csv (every active company in the four regions)
Sheets: Read me · Ready to email · Email, check first · Companies, no email yet (CSV beside it).
Re-run any time: the lists grow as the background runs finish."""
import csv, json, os, sys, glob, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

RAW = 'research/raw'
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/Minshall prospects/Minshall Group prospects.xlsx')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
REGION = {'yorkshire': 'Yorkshire', 'lincolnshire': 'Lincolnshire', 'north-east': 'North East', 'lancashire': 'Lancashire'}
SECTOR = {'cafe': 'Cafés, pubs and restaurants', 'retail': 'Independent shops', 'trades': 'Builders and trades', 'clinic': 'Health, beauty and wellbeing',
          'professional': 'Professional services', 'hospitality': 'Hotels and places to stay', 'fitness': 'Sport, gyms and fitness', 'charity': 'Charities and community'}

import re
# Companies House by normalised name and region, to confirm website businesses that are companies
def nkey(n): return re.sub(r'[^a-z0-9]', '', re.sub(r'\b(limited|ltd|llp|plc|the|and|co|company)\b', '', n.lower().replace('&', ' and ')))
CH = {}
with open(f'{RAW}/ch/all-names.csv' if os.path.exists(f'{RAW}/ch/all-names.csv') else f'{RAW}/ch/companies.csv', newline='') as f:
    for c in csv.DictReader(f):
        k = (nkey(c['company']), c['region'])
        if len(k[0]) >= 5: CH[k] = None if k in CH else c['company_number']   # None marks an ambiguous name
ready, check, seen = [], [], set()
def add(row, ok):
    key = (row['email'] or '').lower() or row['website']
    if not key or key in seen: return
    seen.add(key); (ready if ok else check).append(row)

# 1. scored websites from OpenStreetMap (Yorkshire + other regions)
for path in [f'{RAW}/prospects.json'] + glob.glob(f'{RAW}/*/prospects.json'):
    reg = os.path.basename(os.path.dirname(path)) if os.path.dirname(path) != RAW else 'yorkshire'
    for p in json.load(open(path)):
        if not p.get('email'): continue
        if not p.get('company_number'):
            m = CH.get((nkey(p['business']), REGION.get(reg, reg)))
            if m: p['company_number'] = m; p['pecr'] = 'company: matched on Companies House by name'
        add({'business': p['business'], 'type': SECTOR.get(p['sector'], p['sector']) + (f" ({p['type']})" if p.get('type') else ''), 'region': REGION.get(reg, reg), 'town': p.get('town') or '',
             'website': p['website'], 'email': p['email'], 'other_emails': p.get('other_emails', ''), 'phone': p.get('phone', ''), 'score': p.get('score'), 'fix_1': p.get('fix_1', ''), 'fix_2': p.get('fix_2', ''),
             'company_number': p.get('company_number', ''), 'source': 'Website research (OpenStreetMap)', 'note': p.get('pecr', '')}, bool(p.get('company_number')))

# 2. Companies House companies with a verified website: all are companies, so all can be emailed
ch_with_email = set()
if os.path.exists(f'{RAW}/ch/enriched.jsonl'):
    for l in open(f'{RAW}/ch/enriched.jsonl'):
        c = json.loads(l)
        if not c.get('email'): continue
        ch_with_email.add(c['company_number'])
        add({'business': c['company'].title().replace("'S ", "'s "), 'type': c['category'], 'region': c['region'], 'town': c['town'], 'website': c['website'], 'email': c['email'],
             'other_emails': c.get('other_emails', ''), 'phone': c.get('phone', ''), 'score': None, 'fix_1': '', 'fix_2': '', 'company_number': c['company_number'],
             'source': 'Companies House + own website', 'note': c['match']}, True)

COLS = [('business', 'Business', 34), ('type', 'Type', 30), ('region', 'Region', 13), ('town', 'Town', 18), ('website', 'Website', 30), ('email', 'Email', 34), ('other_emails', 'Other emails', 28),
        ('phone', 'Phone', 16), ('score', 'Webmins Score', 9), ('fix_1', 'Fix 1', 36), ('fix_2', 'Fix 2', 36), ('company_number', 'Company no.', 12), ('source', 'Source', 26), ('note', 'How we know', 30)]
NAVY, PINK = '0A1A3F', 'FF2E63'
wb = Workbook()
ws = wb.active; ws.title = 'Read me'
today = datetime.date.today().strftime('%-d %B %Y')
lines = [('Minshall Group prospects', 18, True), (f'Built {today}. Re-run scripts/research/contacts-book.py to refresh as more contacts come in.', 11, False), ('', 11, False),
  (f'Ready to email: {len(ready):,} contacts. Confirmed limited companies (company number on their site, or found via Companies House), so they can be emailed under PECR with a clear opt-out.', 11, False),
  (f'Email, check first: {len(check):,} contacts. Could be sole traders or partnerships. Check Companies House before emailing; otherwise call, write or visit.', 11, False),
  ('Companies, no email yet: every active company in our trades across Yorkshire, Lincolnshire, the North East and Lancashire, in the CSV beside this file. Good for letters and calls.', 11, False), ('', 11, False),
  ('Rules before sending', 13, True),
  ('Every email must say who we are, give our postal address and offer an easy opt-out (the footer in marketing/outreach-emails.md does this).', 11, False),
  ('Send one-to-one, 20 to 40 a day at first, from hello@minshallgroup.com. Never email anyone who has opted out.', 11, False),
  ('Emails were taken from each business’s own public website (or OpenStreetMap). Webmins Score and fixes come from our own check of their homepage.', 11, False),
  ('Companies House addresses are registered offices, which are sometimes an accountant’s address rather than the trading address.', 11, False),
  ('Sources: OpenStreetMap contributors (ODbL); Companies House basic company data, October 2026 (Open Government Licence).', 11, False)]
for i, (t, sz, b) in enumerate(lines, 1):
    c = ws.cell(row=i, column=1, value=t); c.font = Font(size=sz, bold=b, color=NAVY if b else '14171A'); c.alignment = Alignment(wrap_text=True, vertical='top')
ws.column_dimensions['A'].width = 120

def sheet(title, rows):
    s = wb.create_sheet(title)
    for j, (_, h, w) in enumerate(COLS, 1):
        c = s.cell(row=1, column=j, value=h); c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor=NAVY)
        s.column_dimensions[get_column_letter(j)].width = w
    rows.sort(key=lambda r: (r['region'], r['type'], r['town'] or '', r['business']))
    for i, r in enumerate(rows, 2):
        for j, (k, _, _) in enumerate(COLS, 1): s.cell(row=i, column=j, value=r.get(k))
    s.freeze_panes = 'B2'; s.auto_filter.ref = f'A1:{get_column_letter(len(COLS))}{len(rows) + 1}'
sheet('Ready to email', ready); sheet('Email, check first', check)
wb.save(OUT)

# companies without an email yet: CSV (too many rows to be comfortable in a sheet)
csv_out = os.path.join(os.path.dirname(OUT), 'Companies with no email yet (Companies House).csv')
n = 0
with open(f'{RAW}/ch/companies.csv', newline='') as f, open(csv_out, 'w', newline='') as g:
    r = csv.DictReader(f); w = csv.writer(g)
    w.writerow(['Company', 'Company no.', 'Type', 'Region', 'Town', 'Postcode', 'Registered address', 'Incorporated'])
    for c in r:
        if c['company_number'] in ch_with_email: continue
        w.writerow([c['company'].title(), c['company_number'], c['category'], c['region'], c['post_town'], c['postcode'], c['address'].title(), c['incorporated']]); n += 1
print(json.dumps({'ready_to_email': len(ready), 'check_first': len(check), 'companies_no_email': n, 'xlsx': OUT, 'csv': csv_out}))
