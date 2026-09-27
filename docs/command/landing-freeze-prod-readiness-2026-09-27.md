---
id: OP-CMD-LANDING-FREEZE-PROD-READY-2026-09-27
title: Prod readiness — Pocket retail freeze and Open attribution, before commit
status: IN DEPLOY COMMIT · PRODUCTION PROMOTE FOLLOWS PUSH TO main
date: 2026-09-27
owners: [Head of Product Engineering (R), Head of AI (claim pass on diff), CEO (A)]
mandate: docs/command/landing-freeze-execution-plan-2026-09-27.md
gates: docs/command/deploy-production-gates.md
---

# Prod readiness report — landing freeze

**Verdict: the mandate diff is ready to commit. It is not committed, and it is not on production.**

Do not deploy from this report alone. The local production build (`npm run clean:next && npm run build`) was not run. The dev server on port 3001 is using `.next`. A clean build belongs on the commit’s Vercel run, or locally after that server is stopped.

---

## What production will do after this commit ships

| Visit | Result |
|-------|--------|
| `https://www.pocketportfolio.app/` | Retail face only. Cookie `pp_landing_variant=retail`, including when the browser still sends `control`. |
| `https://www.pocketportfolio.app/?variant=control` | Old control page, for inspection. Not in rotation. |
| Any other Pocket or Open route | Unchanged by the freeze. |
| Open diligence form | Stores `attributionChannel` as `organic`, `ai`, `authority`, `outbound`, or `unknown`. Stage stays `inquiry`. |

The retail hero in local smoke is: “Master your wealth across your brokers, in one secure place.” Privacy band: “Bank-grade privacy. Zero inference warehousing.” Trust badges: “No data sold” and “Secure edge processing.”

---

## Commit set

These files only. The rest of the working tree stays out of the commit.

| Path | Change |
|------|--------|
| `lib/landing-retail-variant.ts` | A/B inactive. Normal `/` cookie is retail. |
| `middleware.ts` | Writes that cookie. Does not change host routing. |
| `app/hooks/useLandingVariant.ts` | Fallback is retail, so control does not flash. |
| `app/lib/analytics/retail-landing-ab.ts` | Test id kept, `isActive: false`. |
| `lib/landing-retail-copy.ts` | Approved privacy line, H1, eyebrow, trust badges. |
| `lib/landing-retail-faq.tsx` | Security answer uses the approved line. |
| `app/components/landing/RetailTrustSection.tsx` | Download-count headline removed. |
| `lib/open-portfolio/attribution-channel.ts` | Channel map. New file. |
| `app/open/_components/OpenContactForm.tsx` | Posts the channel from first-touch. |
| `app/api/open-portfolio/contact/route.ts` | Accepts only the enum. |
| `tests/unit/landing-retail-freeze.spec.ts` | Freeze and channel tests. New file. |
| `docs/command/claims-vs-codebase-calibration.md` | Allow-list for the privacy line. |
| `docs/command/landing-blueprint-sovereign-retail-2026-09-27.md` | Blueprint. |
| `docs/command/landing-freeze-org-roles-verdict-2026-09-27.md` | Org-roles verdict. |
| `docs/command/landing-freeze-execution-plan-2026-09-27.md` | Execution plan. |
| `docs/command/landing-freeze-prod-readiness-2026-09-27.md` | This report. |

---

## Gates run on this machine (27 Sep 2026, before commit)

| Gate | Command | Result |
|------|---------|--------|
| D1 Lint | `npm run lint` | **Pass.** No ESLint warnings or errors. |
| D2 Typecheck | `npm run typecheck` | **Pass.** `tsc --noEmit` exit 0. |
| D3 Claims SSOT | `tests/unit/canonical-claims.spec.ts` | **Pass.** Included in the 41 below. |
| Mandate tests | `tests/unit/landing-retail-freeze.spec.ts` | **Pass.** 4 tests. |
| D3 + mandate together | both specs | **Pass.** 2 files, 41 tests. |
| D4 Full unit suite | `npx vitest run` | **Not green.** 323 passed, 1 failed, 16 skipped. 1 suite failed to parse. See below. |
| D5 Production build | `npm run clean:next && npm run build` | **Not run.** Dev server is on port 3001. |
| Local homepage smoke | `GET http://localhost:3001/` | **Pass.** `Set-Cookie: pp_landing_variant=retail`. Retail H1 and privacy band in the HTML. A request that sent `pp_landing_variant=control` was rewritten to `retail`. `?variant=control` still sets `control`. |

### Full-suite failures are outside this diff

`git status` on these paths is clean. This mandate did not edit them.

| Failure | Why it is not this commit |
|---------|---------------------------|
| `tests/unit/open-learn-hub.spec.ts` | Expects 4 institutional pillars, code has 9. |
| `tests/unit/sponsor-persona-tabs.spec.ts` | Vite cannot parse JSX in `app/components/sponsor/SponsorDeck.tsx`. |

If CI runs `npm run test`, those two failures fail the job whether or not this freeze is in the commit. They are a pre-deploy fact for Command, not a retail-copy defect.

---

## Claim gate on the diff

Head of AI pass, from the file diff rather than a second design review:

| Check | Result |
|-------|--------|
| Approved sentence on the retail privacy band and the security FAQ | Yes |
| SOC 2, ISO, or charter language added | No |
| Analyst body still names Cloud Auto and OP-Hosted Sovereign | Yes |
| `OPEN_LANDING_COPY` edited | No |
| “100% analytical command.” copied onto retail | No. It remains on the control page only. |

---

## Holds that stay true after commit

- Geo ads stay frozen.
- `/s/*` stays noindex. The retail hero has no ticker search.
- £35k stays off both homepages. £12/mo or £100/yr stays on Founders.
- Homepage CSV demo still goes to Founders. A real completed import still goes to Developer Utility. This commit does not merge those doors.
- Open homepage layout is unchanged. The contact route is the only Open code change.
- A form submit is still an inquiry. CCO promotes `qualified_opportunity` only after company, role, perimeter, and a next step inside 14 days.
- Empty or invalid first-touch stores `attributionChannel: unknown`. Paid mediums store `unknown`.

## Rollback

Revert this commit. Visitors already cookied `retail` stay on retail until `pp_landing_variant` expires (30 days) or they open `?variant=control`. Vercel instant rollback is the production lever after deploy. DNS does not change.

## Command decision requested

1. **Commit** the file list above. Nothing else in the working tree.
2. **Do not treat the commit as a production promote.** Let the Vercel build (`npm run build`) be D5. Smoke `https://www.pocketportfolio.app/` in a browser with no variant query, and once with `?variant=control`, after that deploy.
3. **Leave** the Learn-pillar test and the Sponsor deck parse failure out of this commit. Schedule them as their own fix if CI blocks the train.
