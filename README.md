# minshallgroup.com

Marketing site for **Minshall Group** (formerly Knexu): strategy, digital, data and brand under one team, measured by the return.

Vite + TypeScript, no framework. Every route is prerendered to static HTML at build time, then the client takes over navigation (with View Transitions where supported). There are no images to host: every visual is generated SVG themed from CSS variables, plus a canvas particle field in the hero.

## Deploy

The code lives at https://github.com/lukeminshall/minshallgroup and the Vercel project `minshallgroup-site` is connected to it:

- Push to `main` and Vercel builds and publishes https://minshallgroup.com automatically.
- Push any other branch (or open a pull request) and Vercel builds a private preview link to check first.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # vite build + prerender every route + sitemap.xml into /dist
npm run preview  # serve /dist
```

## Pages at a glance

- Home, Capabilities (4 practice pages), Industries, Products (DataLense, Straight Talking), Work, Approach, Insights, About, Contact, Privacy.
- **Search landing pages** (`LANDINGS` in content.ts): `/healthcare-consultancy`, `/digital-consultancy`, `/uk-market-entry`, `/healthcare-site-selection`. Each has its own title, keyword H1, FAQ and FAQPage structured data.
- **SME offer** (`SME` in content.ts): `/digitalsme` with an instant site check (`api/audit.js`), packages, a live quote builder and three-stage payments; terms at `/digitalsme/terms`. Link straight to a check with `/digitalsme?url=example.co.uk`.
- **Webmins Score** (`SCORE` in content.ts): our own 0–100 score from five pillars (Experience, Findability, Trust, Conversion, Modern & relevant) read from the page by `api/audit.js`, plus sector fit against each industry's essentials. Change weights, grades, sectors and essentials in content.ts; signals are in `readSignals()` in the API.
- **Analytics:** Microsoft Clarity (project `yz5tnn0my2`) is loaded in `index.html` and described in the privacy notice.

## Client portal (`/portal`)

Clients log in (Clerk), start their project from their quote, answer the onboarding questionnaire (replaces the kick-off call; edit the questions in `src/portal/brief.ts`), upload content, follow the five stages, approve the design, raise change requests and approve quotes, see invoices, and track their site's Webmins Score (re-checked monthly by a Vercel cron). Admins get an Admin tab to manage every project. Data lives in Supabase with row-level security (`supabase/migrations/001_client_portal.sql`); emails go through Resend.

Code: `src/portal/` (loaded only on /portal), `api/portal-notify.js`, `api/portal-rescore.js`, `api/cron-rescore.js`, `api/_lib/portal.js`.

### One-time setup

1. **Supabase**: create a project (region: London). In *SQL Editor*, paste and run `supabase/migrations/001_client_portal.sql`, then `supabase/migrations/002_notifications.sql`. From *Project Settings → API* copy the Project URL, the `anon` key and the `service_role` key.
2. **Clerk**: create an application (email and Google sign-in). Copy the publishable key and secret key. In Clerk, *Integrations → Supabase → Activate* and copy the Clerk domain it shows. In Supabase, *Authentication → Sign In / Providers → Third-party auth → Add provider → Clerk* and paste that domain. For the production Clerk instance, Clerk asks for DNS records on minshallgroup.com: add them in Vercel DNS.
3. **Vercel → Settings → Environment Variables** (Production):
   `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public, built into the page),
   `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (any long random string). Then redeploy.
4. **Make yourself admin**: sign up at /portal, copy your user id (`user_…`) from the Clerk dashboard, and in Supabase SQL run `insert into public.admins (user_id, note) values ('user_…', 'Luke');`.

Until the keys are set, /portal shows a preview of what clients get.

**Notifications.** Every client action emails the team (hello@): a new account (once, with a welcome email to the person), a project started, the brief submitted, a request or message, a design approval and a quote response. Every team action emails the client: stage changes, quotes, status updates, replies, new messages and invoices. Messages include their text. In the portal, unread updates show as a count on the Requests tab (clients) and the Admin tab (team), with “New” or “Unread” markers on each thread; opening a thread marks it read. From Admin you can message a client directly, and see accounts that have not started a project yet.

## Internal prospecting tool

`/tools/prospect` (not in menus, sitemap or search) scores a pasted list of prospect websites with the Webmins Score and drafts a personalised outreach email for each, with copy, open-in-email and CSV export. It is locked by `TOOL_PASSWORD`. Lists are kept in the browser only.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Needed for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Contact form and quote requests | Without it, submissions fail and nothing is delivered |
| `CONTACT_TO` | Where enquiries go | Defaults to hello@minshallgroup.com |
| `CONTACT_FROM` | Sender address | Use a Resend-verified domain sender once set up |
| `VERCEL_TOKEN` | Live domain prices from Vercel (.com, .org, .net, .co, .io) | Vercel access token for the team; optional `VERCEL_TEAM_ID` |
| `GODADDY_KEY`, `GODADDY_SECRET` | Live domain prices from GoDaddy, including .co.uk and .uk | Production key from developer.godaddy.com; GoDaddy restricts API access on smaller accounts |
| `RESEND_SEGMENT_ID` | Newsletter sign-ups go into this Resend segment | Optional; sign-ups always land in Resend Contacts. The Resend key must have full access (not sending-only) to add contacts |
| `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Client portal logins | From Clerk |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Client portal data and files | From Supabase; the service role key is server-only |
| `CRON_SECRET` | Monthly re-check of live client sites | Any long random string |
| `TOOL_PASSWORD` | Unlocks the internal prospecting tool at `/tools/prospect` | Any strong password; without it the tool is switched off |
| `PSI_API_KEY` | Google scores in the SME site check | Free key with the PageSpeed Insights API enabled; without it Google refuses most requests and only our own checks show |

Redeploy after adding or changing a variable.

## Day-to-day maintenance — edit `src/content.ts`

Almost every word on the site lives in `src/content.ts`. Pages, navigation, filters, the footer, the sitemap and the prerendered HTML all regenerate from it.

| To…                         | Edit in `content.ts`                                               |
|-----------------------------|--------------------------------------------------------------------|
| Add a case study            | Append to `CASES` (set `caps` and `ind` so the Work filters pick it up) |
| Publish an insight          | Append to `INSIGHTS` (newest first); it gets its own page at `/insights/<slug>` |
| Change a capability/service | `CAPS`                                                             |
| Change an industry          | `INDUSTRIES`                                                       |
| Add or update a product     | `PRODUCTS` (+ a page in `pages.ts` if it needs a dedicated one)    |
| Change the client marquee   | `CLIENTS`                                                          |

Commit, push, and Vercel rebuilds. No CMS, no database.

## Structure

```
index.html            shell: header, mobile menu, <main id="app">, footer
src/content.ts        all content (see above)
src/pages.ts          the route map P — page layouts
src/components.ts     shared markup builders (headers, cards, cases…)
src/shell.ts          nav, mega menus, mobile menu, footer markup
src/brand.ts          the "m." tile (drawn as a path) and lockup
src/graphics.ts       16 generated SVG graphics (GFX map)
src/motion.ts         all motion + interaction: hero full-stop zoom, cursor-reactive variable type, velocity marquee,
                      pinned horizontal capabilities, work hover-preview, brand cursor, scrub, finder, filters, tabs, sticky steps
src/nav.ts            header behaviour (solid/hide on scroll, mega menus, mobile menu, progress bar)
src/router.ts         History API router + per-page meta
src/routes.ts         canonical routes + SEO titles/descriptions
src/styles.css        design system (tokens at :root; .dark flips them for navy sections)
api/contact.js        Vercel function: contact form → email via Resend
scripts/prerender.mjs build-time prerender + sitemap + 404.html
vercel.json           redirects from old knexu.co.uk URLs + www → apex
```

## Brand

Navy `#0A1A3F` (primary) · Pink `#FF2E63` (accent, on navy) · Deep pink `#D6164B` (small text on white) · Ink `#14171A` · White.
Fraunces for headlines; Manrope for wordmark, body and interface. Both are self-hosted (`@fontsource-variable`) and preloaded at build time. Headlines close with the square pink full stop.

## Signature moves

- **The full stop.** The pink square that ends every headline is the brand device. In the home hero it grows with scroll until the screen is pink; it is also the cursor, and the tile draws itself in the first-visit intro.
- **Variable type.** Fraunces' weight and softness axes respond to the cursor in the hero.
- **Page curtain.** Navigation drops a navy curtain carrying the destination's name, then lifts.
- **Pinned horizontal capabilities**, a scroll-velocity marquee, and a work index with a preview that follows the cursor.

## Motion and accessibility

Content is visible by default; animation is an opt-in layer that fails toward showing content. `prefers-reduced-motion` disables all movement, the intro, the curtain, the pinned sections and the custom cursor. Touch devices get the native cursor and stacked panels. Keyboard: mega menus open on focus, Escape closes; skip link; visible focus rings.

## Launch checklist

1. Vercel project → add domains `minshallgroup.com`, `www.minshallgroup.com`, `knexu.co.uk`, `www.knexu.co.uk`. Redirects in `vercel.json` send every old Knexu URL to its new home with a 301.
2. Environment variables: `RESEND_API_KEY`; `CONTACT_FROM` with a sender on a Resend-verified `minshallgroup.com` domain; optionally `CONTACT_TO`.
3. The public address is hello@minshallgroup.com (`CONTACT` in content.ts). The contact and quote forms email `CONTACT_TO` (default hello@minshallgroup.com) from `CONTACT_FROM` (default website@minshallgroup.com, Resend-verified domain). If Resend refuses that sender, they fall back to Resend's test sender, delivering to `CONTACT_FALLBACK_TO` (default luke.minshall@knexu.co.uk).
4. Confirm the copy flagged below.

## Content to confirm before launch

- Return figures in case studies are qualitative until each client signs off numbers.
- Housden Group / NHS Trust PPU wording: keep at model level until Trusts are cleared to name.
- Insight articles are drafts written from the Knexu positions; review before publishing.
- Straight Talking status line ("First cohort · October 2026").
- Footer legal line: add the registered company name and number once confirmed.
- Privacy notice: the contact form collects personal data, so add a privacy page before launch.
