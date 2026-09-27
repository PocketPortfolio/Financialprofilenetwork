---
id: OP-CMD-LANDING-FREEZE-PROD-SHIP-2026-09-27
title: Org-roles report — Pocket retail freeze is on production
status: SHIPPED · PRODUCTION
date: 2026-09-27
commit: 6558b34a
deployment: dpl_Go2wyVmPdU3xwbAGb151VjSJ17tV
url: https://www.pocketportfolio.app/
vercel: https://vercel.com/abba-lawals-projects/pocket-portfolio-app/Go2wyVmPdU3xwbAGb151VjSJ17tV
owners: [CEO, CCO, CPO, Head of Marketing, Head of Creative Studios, Head of AI, Head of Product Engineering, Head of Platform]
---

# Production ship report — landing freeze

**Production is the retail homepage.** A normal visit to https://www.pocketportfolio.app/ returns HTTP 200, sets `pp_landing_variant=retail`, and serves “Master your wealth across your brokers, in one secure place.” with “Bank-grade privacy. Zero inference warehousing.”

Commit `6558b34a` on `main`. Vercel deployment `dpl_Go2wyVmPdU3xwbAGb151VjSJ17tV` completed successfully.

The control page is not in rotation. It opens only at https://www.pocketportfolio.app/?variant=control.

---

## What shipped

| Change | Production result |
|--------|-------------------|
| A/B `landing_retail_ia_2026` frozen | No 50/50. Middleware writes `retail` on `/` unless the query is `variant=control`. |
| Retail copy | Approved privacy line on the hero and the security FAQ. “Bank-level encryption,” “Trusted by investors…,” the download-count headline, and “New: Sovereign routing” are off the retail face. |
| Open contact | The form posts `attributionChannel`. The route stores only `organic`, `ai`, `authority`, `outbound`, or `unknown`. Stage stays `inquiry`. |
| Everything else | Dashboard, import, Founders, advisor, architecture, and the Open homepage layout were not redesigned. |

Smoke on the live host confirmed the retail H1, the privacy band, the two trust badges (“No data sold,” “Secure edge processing”), and the security FAQ. The deployment id in the page assets matches the Vercel deploy above.

---

## Role record

| Role | What this ship does for that seat |
|------|-------------------------------------|
| **CEO** | One consumer door. The control page’s IFA chip and ticker search are off normal traffic. Q4 park stands: no new campaign shipped with this. The specificity shortage (which broker, which login, which model) is recorded and was not part of this deploy. |
| **CCO** | Open form submits remain inquiries. A Pocket demo or a Founders click is not a qualified opportunity and is not a Stripe key. £35k stays off both homepages. £12/mo or £100/yr stays on Founders. |
| **CPO** | Two commercial doors remain: homepage demo → Founders, real import → Developer Utility. This deploy did not merge them. |
| **Head of Marketing** | Stop describing the control page as the live homepage. Geo ads stay frozen. No new retail test id. Import landers are still the named-broker surfaces. |
| **Head of Creative Studios** | The approved privacy sentence is on the existing band. No new art direction. The control page’s “100% analytical command.” was not copied onto retail. |
| **Head of AI** | Allow-list line is live. Retail does not add SOC 2, ISO, or a charter claim. Analyst body still names Cloud Auto and OP-Hosted Sovereign. Open copy was not edited. |
| **Head of Product Engineering** | Commit is on `main`. Hook fallback is retail, so the server document is the retail page. `?variant=control` remains the inspection hatch. |
| **Head of Platform** | Vercel production deploy succeeded. No DNS change. Rollback is the previous Vercel deployment. Visitors cookied `retail` stay there for up to 30 days after a revert unless they open `?variant=control`. |

---

## Checks

| Check | Result |
|-------|--------|
| `npm run lint` | Pass, before commit |
| `npm run typecheck` | Pass, before commit |
| Freeze + claims unit tests | Pass, 41 tests |
| Full unit suite | 323 passed. Two failures are outside this commit: Open Learn expects 4 pillars and has 9; sponsor deck JSX does not parse in Vitest. |
| Vercel production | **Success.** |
| GitHub Actions `test (20.x)`, `Analyze`, `Deploy to Production` | Failed or skipped on the commit. They did not block the Vercel production deploy, which is the host now serving the site. |
| Live `GET /` | 200, cookie `retail`, retail copy present |

Plate-manifest timestamps and `public/open/llms.txt` line endings were left out of the commit.

## Still open, not in this ship

The standing page still does not name the broker list, Google or Microsoft sign-in, or the model providers on the first screen. The features card still says “50+ brokers.” That is the specificity note in `docs/command/landing-specificity-org-read-2026-09-27.md`. It is the next decision, not a defect in this deploy.

**Live page:** https://www.pocketportfolio.app/
