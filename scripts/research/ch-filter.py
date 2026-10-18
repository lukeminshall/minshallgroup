"""Companies House basic company data -> small business prospects by region.
Run: python3 scripts/research/ch-filter.py <BasicCompanyDataAsOneFile.csv>
Keeps active companies (not dormant) registered in Yorkshire, Lincolnshire,
the North East (Northumbria) and Lancashire, in small business trades and
sport. Output: research/raw/ch/companies.csv (kept out of git).
Note: the address is the registered office, which can be an accountant's."""
import csv, re, sys, collections

REGIONS = {
  'Yorkshire': ['BD','HD','HG','HU','HX','LS','S','WF','YO'],
  'Lincolnshire': ['LN'],
  'North East': ['NE','DH','SR','TS'],
  'Lancashire': ['LA','PR','BB','FY','BL'],
}
# districts in shared areas
DISTRICT = {'DN': lambda n: 'Lincolnshire' if n >= 15 and n not in (55,) and n <= 41 else 'Yorkshire',
            'PE': lambda n: 'Lincolnshire' if n in (9,10,11,12,20,21,22,23,24,25) else None,
            'NG': lambda n: 'Lincolnshire' if 31 <= n <= 34 else None,
            'DL': lambda n: 'North East' if n in (1,2,3,4,5,12,13,14,15,16,17) else 'Yorkshire'}
AREA = {a: r for r, l in REGIONS.items() for a in l}

def region(pc):
    m = re.match(r'^([A-Z]{1,2})(\d{1,2})', pc.replace(' ', '').upper())
    if not m: return None
    a, n = m.group(1), int(m.group(2))
    if a in DISTRICT: return DISTRICT[a](n)
    return AREA.get(a)

# SIC prefix -> our category (longest prefix wins)
SIC = {
 '412':'Builders and construction','42':'Builders and construction','431':'Builders and construction','432':'Electrical, plumbing and heating',
 '433':'Builders and construction','439':'Builders and construction','4332':'Joinery and fitting','43341':'Painting and decorating','43342':'Glazing',
 '43210':'Electrical, plumbing and heating','43220':'Electrical, plumbing and heating','43910':'Roofing',
 '47760':'Garden centres and florists','47':'Independent shops','4520':'Garages and vehicle repair','4532':'Garages and vehicle repair',
 '561':'Cafés, pubs and restaurants','563':'Cafés, pubs and restaurants','5621':'Caterers and events','55':'Hotels and places to stay',
 '9602':'Hair and beauty','9604':'Hair and beauty','8623':'Dentists and clinics','8690':'Dentists and clinics','8621':'Dentists and clinics','8622':'Dentists and clinics',
 '75000':'Vets','6910':'Professional services','6920':'Professional services','7111':'Professional services','7112':'Professional services','6831':'Estate agents',
 '7311':'Professional services','7021':'Professional services','7022':'Professional services','7420':'Photographers and creatives','7410':'Photographers and creatives',
 '8121':'Cleaning','8122':'Cleaning','8129':'Cleaning','8130':'Landscaping and gardening','8891':'Childcare and nurseries','8510':'Childcare and nurseries',
 '9311':'Sports clubs and facilities','9312':'Sports clubs and facilities','9313':'Gyms and fitness','9319':'Sports clubs and facilities','8551':'Sports clubs and facilities',
 '9604':'Hair and beauty','8230':'Caterers and events','9329':'Leisure and attractions','9321':'Leisure and attractions','1071':'Bakers and food makers','1107':'Bakers and food makers','1105':'Bakers and food makers',
 '4941':'Removals and haulage','4942':'Removals and haulage','4932':'Taxis','7729':'Hire businesses','7721':'Hire businesses','9601':'Laundry and dry cleaning','9529':'Repairs','9523':'Repairs','9512':'Repairs',
 '8559':'Tutors and training','8552':'Tutors and training',
}
KEYS = sorted(SIC, key=len, reverse=True)
def cat(sics):
    for s in sics:
        code = s.split(' ')[0]
        for k in KEYS:
            if code.startswith(k): return code, SIC[k]
    return None, None

src = sys.argv[1]
out = open('research/raw/ch/companies.csv', 'w', newline='')
w = csv.writer(out)
w.writerow(['company','company_number','category','sic','region','post_town','postcode','address','incorporated','company_type','accounts'])
cnt = collections.Counter(); seen = 0
with open(src, newline='', encoding='utf-8', errors='replace') as f:
    r = csv.reader(f); hdr = [h.strip() for h in next(r)]; I = {h: i for i, h in enumerate(hdr)}
    for row in r:
        seen += 1
        if len(row) < len(hdr) - 5: continue
        if row[I['CompanyStatus']] != 'Active': continue
        acc = row[I['Accounts.AccountCategory']]
        if 'DORMANT' in acc.upper(): continue
        reg = region(row[I['RegAddress.PostCode']])
        if not reg: continue
        sics = [row[I[f'SICCode.SicText_{k}']] for k in range(1, 5) if row[I[f'SICCode.SicText_{k}']]]
        code, c = cat(sics)
        if not c: continue
        addr = ', '.join(x for x in [row[I['RegAddress.AddressLine1']], row[I['RegAddress.AddressLine2']], row[I['RegAddress.PostTown']]] if x.strip())
        w.writerow([row[I['CompanyName']], row[I['CompanyNumber']], c, code, reg, row[I['RegAddress.PostTown']].title(), row[I['RegAddress.PostCode']], addr,
                    row[I['IncorporationDate']], row[I['CompanyCategory']], acc])
        cnt[(reg, c)] += 1
out.close()
print('rows read', seen)
by_reg = collections.Counter(); by_cat = collections.Counter()
for (rg, c), n in cnt.items(): by_reg[rg] += n; by_cat[c] += n
print('by region', dict(by_reg)); print('total', sum(by_reg.values()))
for c, n in by_cat.most_common(): print(f'  {c}: {n}')
