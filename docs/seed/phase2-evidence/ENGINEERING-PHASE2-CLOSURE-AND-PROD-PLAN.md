# Engineering Plan — Phase 2 Closure & Production Deploy

**Date:** 2026-04-27  
**Revision:** **v2 — Unified Command ratification** (Drizzle ledger reconciliation; no “upgrade to 0.45.2” fiction)  
**Audience:** Engineering (SSD worktree)

---

## A. Unified Command mandate (accepted)

| Correction | Status |
|--------------|--------|
| **B2 is not “upgrade Drizzle to 0.45.2”** | **Locked:** `package.json` / `package-lock.json` already resolve **`drizzle-orm@0.45.2`**. Work is **ledger + audit reconciliation**, not semver bump. |
| **§9 `PENDING` = false negative for auditors** | **Fixed** in `docs/seed/SECURITY-TRIAGE.md` **v0.1** — `drizzle-orm` row → **`patched`** with lockfile + live `npm audit` receipt. |
| **`xlsx` §9 language** | **Injected** — browser-only / no server-side untrusted parse; triage header bumped to **v0.1**. |

---

## B. Amended execution order (24-hour sprint)

| Priority | Task ID | Engineering-precise mandate |
| :--- | :--- | :--- |
| **P0** | **B1** | **Git purge:** `packages/importer/dist/` in `.gitignore`; `git rm -r --cached packages/importer/dist`; CI/build must still emit `dist` (e.g. `npm run build --prefix packages/importer`). |
| **P0** | **B2** | **Drizzle reconciliation:** §9 row **`patched`**; cite **lockfile `0.45.2`**, **live `npm audit` has no `drizzle-orm` vuln node**, **no CVE from npm** at locked version; **B4** lint+tsc+test+**build** on release branch. |
| **P1** | **B2** | **Triage hygiene:** After next material `npm` change, regenerate triage **or** preserve §9 manual rows (do not overwrite blindly). |
| **P1** | **B3** | **Prod config + smoke:** Vercel env for `ADMIN_ANALYTICS_MAX_FIRESTORE_DOCS` / `ADMIN_ANALYTICS_RESPONSE_CACHE_TTL_MS`; smoke **`/api/api-keys/user`** (Stripe fallback + admin claim) and **`PremiumTierContext`** under quota **without** locking paid users; admin analytics may still zero (expected). |
| **Gate** | **B4** | **`npm run lint`**, **`npx tsc --noEmit`**, **`npm test`**, **`npm run build`** on `release/phase2-closure`. |

**B4 receipt (2026-04-27, SSD worktree):** **`npm run lint`**, **`npx tsc --noEmit`**, **`npm test`**, and **`npm run build`** all **green**. (An earlier local build had failed at “collect page data” for `/api/ai/chat`; current tree **passes** full gate — re-run on `release/phase2-closure` before deploy if branch differs.) **Ledger reconciliation** remains valid (lockfile + `npm audit` for `drizzle-orm`).

---

## C. B1 — Git artifact purge (procedure)

1. Append to `.gitignore`: `packages/importer/dist/`
2. `git rm -r --cached packages/importer/dist`
3. Commit: `chore: stop tracking packages/importer dist (build-time artifact)`
4. Verify: `git ls-files packages/importer/dist` → empty

---

## D. B3 — Smoke test matrix (evidence for command)

| Check | Pass criterion |
|-------|----------------|
| Paid user, Firestore quota / circuit | **`GET /api/api-keys/user`** returns **200** with **`tier`** from Stripe when applicable; **degraded** allowed but **not** silent `500` |
| CEO / admin claim | JWT **`admin: true`** → **Founders** entitlement path (already coded) |
| Admin analytics | May return zeros + degraded flags in JSON; **no** top-level **5xx** for valid admin session |
| Settings / Sovereign | **`seatTierForUi`** / tier context do not show permanent lock for entitled users after recovery |

---

## E. Production deploy sequence (unchanged)

1. Branch `release/phase2-closure`  
2. Merge B1 + any follow-up  
3. B4 full gate including **`npm run build`**  
4. Deploy; B3 smoke same day  
5. Tag after smoke  

---

## F. Engineering does **not** own

Human gates: B-3a backlinks, C-2 `/learn` prose, Blaze business decision.

---

*End of plan v2.*
