# Command Team Alignment — `/designchallenge` Landing Mandate

**Status:** Planning complete; implementation queued. Route, SSOT, sitemap, llms.txt, and OG image landed in-repo. **Not yet deployed** — production push (Vercel) requires explicit founder sign-off.

**Purpose:** One document so CT1 (growth funnel + four pillars) and CT2 (design language + engineering + monetization hooks) read the same brief. Product, engineering, brand, and founder ops converge here before build.

---

## 1. Strategic intent (unified)

| Theme | CT1 | CT2 | Aligned statement |
| :--- | :--- | :--- | :--- |
| Role of the page | Institutional-grade acquisition funnel; “front door” for horizontal expansion | High-conversion bridge between GitHub and CoderLegion; ecosystem substrate | **`/designchallenge` is the canonical public hub** that routes high-agency builders to **GitHub** (substrate + submissions) and **CoderLegion** (community + strategy/UX), without replacing either surface. |
| Audience | Architects, enterprise innovators → long-term design partners | Builders → early design partners | Primary ICP: **regulated-vertical architects** (healthcare, defense, finance, energy) who need **scope reduction** and **sovereign AI** posture, not generic “AI wrapper” shoppers. |
| Launch sequencing | Production push of route; LinkedIn + GitHub point to hub; CoderLegion May 11 08:45 GMT | “Activation-ready” codebase execution | **Operational:** CoderLegion cohort messaging may target **2026-05-11 08:45 GMT** with this URL as primary destination **once** the page is built and released—**not** before planning sign-off. |

---

## 2. Canonical URL & cross-links (target state)

| Asset | Target URL | Notes |
| :--- | :--- | :--- |
| Buyer-canonical hub | `https://www.openportfolio.co.uk/designchallenge` | Institution-facing URL per Open Portfolio programme; Pocket may 301-alias per `OPEN_ALIAS_ROUTES`. |
| Boilerplate / fork | `https://github.com/PocketPortfolio/Financialprofilenetwork` | “Fork the Substrate” primary technical destination. |
| GitHub submissions | `https://github.com/PocketPortfolio/Financialprofilenetwork/discussions` | Index today; **Discussion #49** cited in CT2 must be **verified to exist** before hard-coding in UI (use discussions index or create thread + update SSOT). |
| CoderLegion | `https://coderlegion.com/groups/openfi-builders` | “Join the Open-Fi Builders” secondary path; May 11 launch sync per ops. |
| Challenge copy SSOT | `docs/challenges/v1-regulated-verticals.md` | Generated from `npm run build:challenge -- --platform=multi`; keep landing copy consistent with this where overlapping. |

**Post-release comms (blocked on deploy):** LinkedIn “social wedge,” GitHub discussion bodies, and CoderLegion drafts should all converge on **`/designchallenge`** as the **single** public entry point once the route exists.

---

## 3. Hero & headline (decision required in planning)

Two ratified variants appear in command traffic; **pick one primary** for H1 + OG title, optionally A/B in metadata later.

| Variant | Headline (source) | Sub-head / supporting |
| :--- | :--- | :--- |
| **A — CT1 “Vertical inflection”** | The Sovereign AI Design Challenge: Build for Regulated Verticals. | Extend the Pocket Portfolio substrate into Healthcare, Defense, and Finance. Deploy frontier AI without the “Sovereignty Lockout.” |
| **B — CT2 “Institutional authority”** | The Future of Regulated AI is Sovereign. Build it with us. | Split-brain / hybrid architecture framing; sovereign green B2B tone. |

**Visual (both align):** High-fidelity **Figure 2 (Hybrid Architecture)** from `public/book-assets/figures/si-figure-02-hybrid-architecture.svg`, with UX callouts for the **limited-scope processor** boundary (CT1). CT2 “split-brain” language maps to the same diagram—**one diagram, one narrative**.

---

## 4. Page sections — merged specification

### 4.1 Technical receipts & boilerplate (CT1 + CT2)

- **Verified ingestion:** `@pocket-portfolio/importer` — **19+ adapters** (verify current count in `packages/importer` before publishing a number on-page).
- **Fork directive:** Prominent CTA **Fork the Substrate** → Financialprofilenetwork repo (not a generic org link).
- **Documentation:** Deep links to existing ingestion / local-first / stateless inference docs (exact paths TBD in planning; prefer repo `README` + `docs/` + book assets where already authoritative).

### 4.2 Multi-channel conversion (CT1)

| Path | Label (intent) | Destination |
| :--- | :--- | :--- |
| Architect | GitHub — code, strategy PDFs/MD, prototypes | Discussions (specific thread once confirmed) |
| Community | CoderLegion — strategy, UX, founder-level discourse | `openfi-builders` group |

CoderLegion **“Launching May 11th”** (CT1) vs full CT2 calendar: treat **May 11, 08:45 GMT** as the **coordinated** community push unless ops revises.

### 4.3 Four pillars (CT1 table) + CT2 overlays

| Pillar | Content focus | Growth metric (CT1) | CT2 add-ons (planning backlog) |
| :--- | :--- | :--- | :--- |
| **Why** | ROI / **scope reduction** for GDPR, DORA-class posture | Enterprise lead gen | “Regulatory data traps” copy; optional **vertical cards** with “regulatory unlock” blurbs (copy must be **legally reviewed** before any Annex/high-risk claims). |
| **How** | MIT-licensed SDK, step-by-step | Developer adoption | **SSR** for SEO (“Sovereign AI”, “regulated fintech” intent); **ingestion hook** stats strip. |
| **Rewards** | Flagship visibility + leadership track | Partner retention | **Founders Club** + **enterprise SLA contact** paths (monetization alignment). |
| **Authority** | Founder + receipts | Trust / conversion | **Receipts ribbon** (National Grid Ventures, IBM, NHS Digital — align with `lib/canonical-claims.ts` and press page only). |

---

## 5. SSOT numbers & claims (do not ship contradictions)

**Authoritative source:** `lib/canonical-claims.ts` and `docs/seed/phase3/SOCIAL-POST-PACK.md` (where mirrored).

| Claim | SSOT guidance | CT2 prompt note |
| :--- | :--- | :--- |
| Whale Watch / award | **4.7B data points**; 775M km vessel activity; **2024 DataIQ ESG Award** | Use **4.7B** for “data points processed,” not a rounded-down variant unless intentionally simplified in UI with footnote. |
| Energy assets platform | **£7B** in energy assets (decision-support context) | CT2 draft mentioned **£4B+** — **do not use £4B+ on the landing page** unless canonical-claims is formally updated; default **£7B** per SSOT. |
| “Legacy cloud vs stateless” cost comparison | **Not in canonical-claims** | Any **£48 vs £0.004** style graphic requires **finance + legal** sign-off and methodology footnote before public display. |

---

## 6. Engineering intent (planning only — not implemented)

| Item | Intent | Gate |
| :--- | :--- | :--- |
| **Rendering** | SSR for crawlability and share cards | Next.js App Router `page.tsx` + `metadata` / OG when build starts. |
| **Stats strip** | e.g. 4.7B data points, 19+ adapters | Numbers pulled from SSOT or build-time constants; adapters count from package reality. |
| **Submission** | Stateless form = **metadata only**; payload on GitHub | Privacy + transparency; no PII warehouse; product + legal sign-off on fields. |
| **Open Graph** | LinkedIn-optimized share | CT2 references “Shaping the Future Together” imagery—**either** reuse `dist/campaigns/.../cover-*.png` pipeline **or** `docs/challenges/v1-assets/` hero; **one** canonical OG image chosen in planning. |
| **Design system** | Sovereign green B2B variant; **no** generic fintech blue (`CLAUDE.md`) | Design review against existing tokens (`--accent-warm`, surfaces). |

---

## 7. Explicit exclusions (this mandate pass)

- **No** `app/designchallenge/page.tsx` (or equivalent) created or merged **by this alignment doc alone**.
- **No** Vercel/production deploy, **no** sitemap or `llms.txt` updates, **no** discussion URL changes until planning ticket accepts scope.
- **No** unsubstantiated regulatory “unlock” copy (e.g. Annex III) without counsel review.

---

## 8. Planning checklist (next session)

1. **Hero:** Select variant **A vs B**; lock H1, subcopy, and OG title/description.
2. **GitHub:** Confirm whether **Discussion #49** is the canonical submission thread; if not, create + document URL in this file and in `design-partnership-v1.ts` if needed.
3. **Importer:** Script or CI step to print **adapter count** for on-page stat.
4. **Authority ribbon:** Final logo list + permissions; link to `/press` and Abba profile.
5. **Monetization CTAs:** Founders Club URL + enterprise contact (form vs mailto) — owner and funnel analytics.
6. **Legal:** Vertical cards and any cost comparison claims.
7. **Release train:** Order: ship route → update `v1-regulated-verticals.md` / challenge manifest links → LinkedIn/GitHub/CoderLegion point to hub.

---

## 9. Verdict line (shared)

**Build for purpose. Verify on artifact. Reciprocate the signal.**

**Salford:** Ecosystem is **open by mandate**; **landing is not live** until the planning checklist completes and engineering ships the route.

---

*Document owner: Command Team alignment (CT1 + CT2 merge). Last updated from mandate ratification — planning phase.*

---

## 10. Decision log (locked during implementation)

| Decision | Outcome | Reference |
| :--- | :--- | :--- |
| **Hero copy** | **Merge:** H1 from CT1 (vertical inflection); eyebrow from CT2 (institutional authority). | [`lib/canonical-claims.ts`](../../lib/canonical-claims.ts) `DESIGN_CHALLENGE.eyebrow` / `.headline` / `.subheadline` |
| **Primary GitHub CTA** | **`/discussions/49`** (CT2 mandate). Founder must create the thread before public launch — landing assumes the URL will resolve. | `DESIGN_CHALLENGE.github.submissionThread` |
| **OG image** | **Static** `public/og/designchallenge.png` — 1200×627, generated by `npm run build:challenge` (mirrors the v1 hero card). | [`scripts/lib/design-challenge-assets.ts`](../../scripts/lib/design-challenge-assets.ts) |
| **Founders Club path** | `/sponsor?tier=founder` (existing route per `app/agent/outreach.ts`). | Page footer pillar 3. |
| **Enterprise path** | `/sponsor` (no dedicated `/contact` or `/enterprise` route created in v1). | Page footer pillar 3. |
| **Authority ribbon (logos)** | **Deferred.** No SSOT logo data; founder credentials surfaced via copy + `/press/abba-lawal` link only. | Pillar 4. |
| **Cost-comparison graphic / Annex III copy** | **Excluded** from v1 per legal gate. | Section 5 / Section 7. |
| **Adapter-count source** | `SDK.brokerAdapterCount` from `lib/canonical-claims.ts` (currently **19**, registry test-pinned). | [`lib/canonical-claims.ts`](../../lib/canonical-claims.ts) |
| **Stats strip numbers** | All sourced from SSOT (`SDK`, `NUMBERS_SNAPSHOT`, founder credentials); **no `£4B+`, no `£48 vs £0.004`**. | Page hero section. |

## 11. Implementation receipts

- **Route:** [`app/designchallenge/page.tsx`](../../app/designchallenge/page.tsx) — server component; uses `genMeta`, `ProductionNavbar`, two JSON-LD blocks (`WebPage` + `CreativeWork`).
- **SSOT:** `DESIGN_CHALLENGE` constant + `URLS.designChallenge` in `lib/canonical-claims.ts`.
- **Sitemap:** [`app/sitemap-static.ts`](../../app/sitemap-static.ts) — `/designchallenge` entry next to `/challenge` and `/press`.
- **llms.txt:** [`scripts/build-llms-txt.ts`](../../scripts/build-llms-txt.ts) emits a "Design Partnership Challenge" section. Regenerate via `npm run build:llms`.
- **Challenge SSOT realignment:** [`scripts/lib/challenges/design-partnership-v1.ts`](../../scripts/lib/challenges/design-partnership-v1.ts) — CoderLegion + GitHub bodies cite `/designchallenge` and `/discussions/49`. [`docs/challenges/v1-regulated-verticals.md`](v1-regulated-verticals.md) regenerated.
- **Static OG:** [`public/og/designchallenge.png`](../../public/og/designchallenge.png) emitted by `npm run build:challenge -- --platform=multi`.

## 12. Pre-launch checklist (before founder approves Vercel push)

1. [ ] **GitHub Discussion #49** exists and is open in `PocketPortfolio/Financialprofilenetwork`.
2. [ ] `/sponsor?tier=founder` deep-link verified in production.
3. [ ] LinkedIn + CoderLegion launch copy updated to point at `https://www.openportfolio.co.uk/designchallenge` (buyer-canonical).
4. [ ] OG share preview verified on LinkedIn & X using the static `/og/designchallenge.png`.
5. [ ] `LAST_HUMAN_VERIFIED` in `lib/canonical-claims.ts` refreshed to within 30 days (Sovereign Threshold #4).

