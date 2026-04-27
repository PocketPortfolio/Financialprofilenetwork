# Command Team Alignment Report — SSD Worktree & Phase 2 Hardening

**Date:** 2026-04-27  
**Worktree:** `C:\dev\pocket-portfolio-app` (local SSD)  
**Audience:** Engineering + Founder / GTM  
**Purpose:** Single source of truth for what was executed, what was proven in runtime, what shipped to prod-readiness, and what remains **outside** the repo (ops + content).

---

## Executive summary

Moving execution to a **local SSD worktree** removed OneDrive sync as a variable and allowed **repeatable builds**, **targeted incident response**, and **controlled diffs**. The bulk of this cycle addressed **Firestore read exhaustion**, **admin analytics safety**, **premium/tier continuity under degradation**, and **production hygiene** (debug removal, operator banners removed, response caching).  

**Hard truth:** No application change can override Google’s **`RESOURCE_EXHAUSTED`** when a project is over quota. Engineering can **bound reads**, **cache**, **fallback to Stripe**, **clear circuits**, and **preserve UX** — operations must still **reset usage**, **separate dev/prod projects**, or **move billing (Blaze)** for a permanent ceiling lift.

---

## 1. Phase alignment (mapped to actual repo work)

### Phase 1 — Substrate / positioning (context only)

*This report does not re-audit Phase 1 assets.* Per command narrative: `llms.txt`, `/press`, and “Sovereign Era” language are treated as **live** in strategy docs. **No code changes in this cycle** were required to validate Phase 1.

### Phase 2 — Hardening & authority (**primary execution band**)

| Track | Code / artifact | Status | Notes |
|--------|------------------|--------|--------|
| **G-1 Security / dependency gate** | Next **15.5.15**, Drizzle **0.45.2**, `npm audit` / triage workflow, `docs/seed/SECURITY-TRIAGE.md` | **Green in session gate** | Full “acceptance ledger” line items (e.g. SheetJS / `xlsx` rationale) are **documentation sign-off** items for command — triage file exists; **final prose for every line** is founder/legal optional closure. |
| **C-2 `/learn` scaffolding** | Routes + `CANONICAL_ARTICLES` + Article JSON-LD stubs | **Shipped earlier in program** | **Prose injection** (Salford deck citations) is **content**, not engineering — listed under §6. |
| **B-3a Reciprocity** | `docs/seed/phase2-evidence/reciprocity-audit-20260427.md` | **Monitor live** | **FOUND 0 / MISSING 6** (or similar) is a **truth signal**: automation works; backlinks do not yet reciprocate. Closure = **3 consecutive clean runs** (FOUND or MANUAL, no MISSING) per command gate. |
| **F-7 Migration** | Dev on SSD path | **Closed operationally** | Environment stable enough to run `lint`, `tsc`, `build` without sync-induced corruption. |

### Phase 3 — GEO / social polish

**Explicitly gated** until Phase 2 closure criteria are met (command policy). No Phase 3 engineering tasks were started in this cycle.

---

## 2. Strategic incident review (engineering — detailed)

### 2.1 Firestore `RESOURCE_EXHAUSTED` / admin analytics “all zeros”

**Symptom:** `/admin/analytics` showed zeros; logs showed **`8 RESOURCE_EXHAUSTED: Quota exceeded`** on bounded `toolUsage` reads; SEO path could hit the same quota wall; **NPM** (non-Firestore) still populated — proving the UI and non-Firestore integrations were healthy.

**Root cause (evidence-backed):** Uncapped or very large historical scans of **`toolUsage`**, **`pageViews`**, and related collections had driven **daily read counts into the millions** on Spark / tight budgets. Firebase then refused further reads.

**Engineering mitigations delivered:**

1. **Bounded queries** — `orderBy('timestamp', 'desc').limit(adminAnalyticsFirestoreScanLimit())` with env **`ADMIN_ANALYTICS_MAX_FIRESTORE_DOCS`** (default **3500**, clamped 200–50k).  
2. **Global circuit interaction** — Admin bounded reads use **`ignoreGlobalCircuit: true`** so a user-route–opened circuit does not blindly skip admin reads; **`openGlobalCircuitOnQuota: false`** on this route avoids marking the whole process degraded from admin alone where configured.  
3. **`firestoreDegraded` gate (AND not OR)** — Heavy sections (Google signups `listUsers`, referrals, viral blast, conversion funnel, monetization funnel board, architecture challenge) skip only when **both** bounded slices fail — partial dashboard when one slice succeeds.  
4. **In-process response cache** — `ADMIN_ANALYTICS_RESPONSE_CACHE_TTL_MS` (default **120s**, max **15m**, **`0` disables**) on `GET /api/admin/analytics` to cut read storms from polling/remounts (serverless: per instance).  
5. **Circuit recovery on tier read** — After a successful `apiKeysByEmail` document read in **`GET /api/api-keys/user`**, **`clearFirestoreReadsDegraded()`** runs so a later successful read can clear a stale global “circuit open” state.  
6. **Architecture challenge stub** — When the gate skips (no query), **`error: 'skipped_firestore_degraded'`** instead of misleading **`firestore_quota_exceeded`**.  
7. **Operator banners removed from admin UI** — Large “Analytics degraded (Firestore quota)” / “Partial Firestore load” blocks **removed** for prod-facing admin UX (metrics and per-section behavior unchanged).

**Still ops-owned after reset:** Blaze, budget alerts, Firebase Usage tab, avoiding **local dev against prod Firestore** unless intentional (`NEXT_PUBLIC_DEV_USE_FIRESTORE_TIERS`).

### 2.2 Premium tier / CEO Sovereign Sync lockout

**Symptom:** CEO email signed in; **Sovereign Sync** showed locked / upgrade path; tier context could show **`firestore_circuit_open`** or null tier.

**Contributing factors:**

- Tier sometimes existed **only in Firestore** or **not** in Stripe under the same email.  
- **429** on `/api/api-keys/user` could clear UI tier when cache was empty.  
- **Settings** used a **5-minute `apiKeys_*` cache** that treated **`tier: null`** as “fresh” and **skipped refetch**.  
- **SeatManager** gated on **`tierFromApi` only**, ignoring **`usePremiumTheme()`** until API caught up.

**Mitigations delivered:**

1. **`applyAdminClaimFoundersOverride`** — Firebase Auth custom claim **`admin: true`** (from `npm run set-admin <email>`) boosts to **`foundersClub` / founder` theme** when user is not already corporate/founder — all **`/api/api-keys/user`** paths including **quota catch** and **dev no-Firestore** path. **`idTokenAdminClaim`** declared outside `try` so **quota `catch`** can read it.  
2. **`PremiumTierContext`** — On **429/503**, do not null tier; ladder: **`lastKnownPaidRef`** → **`readCachedPaidTier`** → raw cache → leave state. On **degraded + null tier**, try **admin claim** client-side.  
3. **`app/settings/page.tsx`** — Cache short-circuit only if **`data.tier` is truthy**; **429** uses cached tier like 503/500; **`seatTierForUi = tierFromApi ?? tier`** for seats and founder-only blocks.

**Command action:** Run **`npm run set-admin ceo@pocketportfolio.app`** (canonical email), then **full sign-out / sign-in** so JWT includes **`admin: true`**. Keep **`ADMIN_EMAIL_OVERRIDE`** in Vercel as belt-and-suspenders if desired.

### 2.3 Paid customers vs quota (policy answer)

**Stripe-backed subscriptions:** On Firestore **`RESOURCE_EXHAUSTED`**, **`GET /api/api-keys/user`** still runs **`resolvePaidTierFromStripeEmail`** and returns **`tier` on HTTP 200** with **`degradedReason: firestore_quota_exceeded`** where applicable — paid access should **not** mirror the CEO “null tier” failure mode **if Stripe matches the account**.

**Firestore-only entitlements** (manual doc, comp, email mismatch): may still show null until reads succeed or admin/override paths apply.

### 2.4 Debug / prod hygiene

- **Removed** all **`debugAdminAnalytics`** / **`debugPremiumTier`** calls and dead stubs from **`app/api/admin/analytics/route.ts`**, **`app/admin/analytics/page.tsx`**, **`app/contexts/PremiumTierContext.tsx`** (no `127.0.0.1:43110` traffic).  
- **Repaired** `getDb()` catch block after automated strip (valid `try/catch`).  
- **Verification:** `npm run lint`, `npx tsc --noEmit`, **`npm run build`** — **green**.

**Note:** `GET` handler in `route.ts` may show uneven indentation post-strip; **cosmetic** — safe to run formatter when convenient.

---

## 3. Corrections to command narrative (precision)

| Narrative fragment | Correction |
|--------------------|------------|
| “`/api/api-keys` 503” as headline | Primary incident work was **`RESOURCE_EXHAUSTED`** on **Firestore reads**, **`GET /api/api-keys/user`** tier continuity, and **admin analytics**. Treat any **503** as a **separate** route/status investigation if it still reproduces. |
| “822 entries autonomous pipeline” | Not validated in this report; treat as **hypothesis** until traced to a specific cron/job and log line. |
| Pocket Analyst **4K / `pocketanalyst.mp4`** | **Not part of this engineering cycle** in repo diff narrative; if resolved elsewhere, cite that PR/commit separately. |

---

## 4. Hardening checklist — status vs command directives

### I. Artifact policy (`packages/importer/dist/**`)

**Current state:** Root `.gitignore` includes **`dist/`** (line 3), which typically ignores **any** top-level or nested `dist/` depending on git pattern rules — **verify** whether `packages/importer/dist` is still tracked (`git check-ignore -v` / `git ls-files`).  

**Directive:** If `dist/` is committed anywhere under `packages/`, add an **explicit** ignore or remove from index — **P0 hygiene** for “tampered tree” perception. **Owner:** engineering + one `git status` audit before next release tag.

### II. Security acceptance ledger (`docs/seed/SECURITY-TRIAGE.md`)

**Status:** File present; **final** “Accepted risk” narrative for **`xlsx`** (local-first only, no server DB persistence) is a **one-paragraph sign-off** task.  

**Owner:** Founder + engineering (date + initials in doc).

### III. Founder backlinks (B-3a **3/3 gate**)

**Status:** Evidence file shows **gaps**; automation is doing its job.  

**Owner:** Founder — LinkedIn (personal/company), CoderLegion, dev.to, GitHub → **`https://www.pocketportfolio.app/press`** (and any other agreed targets). **Exit:** 3 consecutive reciprocity reports with **no MISSING** (or explicit MANUAL with receipt).

### IV. C-2 prose injection (`/learn/*`)

**Status:** Stubs + schema wired; **empty reader experience** until prose lands.  

**Owner:** Founder — inject from **Salford Seed Deck v4.1**; **mandate:** numeric claims carry **slide/citation** links.

---

## 5. Firebase quota reset (ops reference)

**Spark / daily caps:** Resets are tied to **Google’s daily billing cycle** (commonly described around **midnight US Pacific** for daily-style limits — confirm in **Firebase Console → Usage** for the project).  

**Blaze:** Metered; no single “reset” in the Spark sense — **budget alerts** and **usage dashboards** are the control plane.

---

## 6. Roadmap — close Phase 2 → unlock Phase 3

| Priority | Task | Owner | Exit criterion |
|----------|------|-------|----------------|
| P0 | Confirm Firestore quota healthy + Blaze decision | Ops / Founder | No `RESOURCE_EXHAUSTED` on admin bounded reads for 24h |
| P0 | `git` artifact audit (`dist/`, `.next` never committed) | Engineering | Clean `git status` on release branch |
| P1 | `SECURITY-TRIAGE.md` final `xlsx` acceptance line | Founder + Eng | Dated sign-off in doc |
| P1 | CEO **`set-admin`** + token refresh | Founder | Sovereign Sync unlocked smoke test |
| P2 | Reciprocity **3/3** clean reports | Founder | Evidence files in `docs/seed/phase2-evidence/` |
| P2 | `/learn` prose + citations | Founder | Pages non-empty; internal link check |

**Phase 3 (GEO polish):** Start only after Phase 2 row “P0/P1” above is green per command.

---

## 7. Final verdict (command voice)

**Engineering:** SSD worktree **recovered determinism**. Firestore analytics and tier paths are **bounded, cached, fallback-hardened, and stripped of dev noise**. Remaining **P0** is **git artifact hygiene** + **ops quota / billing** — not more feature code until metrics prove reads are under budget.

**Founder:** **Admin claim** + **backlinks** + **prose** are the **human gates** automation cannot close.

**Build for purpose. Verify on artifact. Reciprocate the signal. Close Phase 2, then Manchester.**

---

*End of report.*
