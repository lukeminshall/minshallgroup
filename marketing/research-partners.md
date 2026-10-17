# Research partners: chambers of commerce and BIDs

Goal: next year's report covers far more businesses, with partners sharing their member lists (with permission) and co-badging the results. Each partner gets a free, area-specific briefing for their members.

## Who to approach first

Check current contact names on their websites before sending.

- West & North Yorkshire Chamber of Commerce
- Sheffield Chamber of Commerce
- Hull & Humber Chamber of Commerce
- Doncaster Chamber
- Business improvement districts (BIDs): Leeds, York, Harrogate, Sheffield, Huddersfield, Halifax
- Federation of Small Businesses (FSB), Yorkshire region

## Email

**Subject:** Free research for your members: how Yorkshire's small business websites are doing

Hello [name],

We have just published *The state of Yorkshire's small business websites 2026*. We checked 3,628 independent business websites across the county, and the average scored 61 out of 100. More than half have no way to enquire on the homepage, and around half have no visitor analytics, so owners cannot see what is working.

Full report: https://minshallgroup.com/insights/state-of-yorkshire-small-business-websites-2026

We would like to do next year's edition with [chamber / BID] as a partner. In practice:

- With your members' agreement, we include their websites in the study. Nobody is ever named in the published results.
- We produce a short briefing for your area, comparing your members with the Yorkshire average.
- Any member can get their own score free, at any time, at minshallgroup.com/digitalsme.
- We are happy to run a 30-minute session for members on the five fixes that make the most difference.

There is no cost and no obligation. Would a short call to talk it through be useful?

Best wishes,
Luke Minshall
Minshall Group · hello@minshallgroup.com

## Notes

- Only include member websites with the organisation's agreement, and tell members how the data is used (aggregates only, nobody named).
- Keep each partner's raw list in `research/raw/` (not in git), as now.
- Re-run with `ALL=1 node scripts/research/collect.mjs`, then `node scripts/research/run.mjs` and `node scripts/research/analyse.mjs`. Extend `collect.mjs` to merge in partner lists.
