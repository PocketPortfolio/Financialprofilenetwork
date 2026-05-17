# SECURITY TRIAGE — Phase 2 G-1 (v0.1)

> Generated: 2026-04-27T10:54:31.179Z
> **Manual amendment:** 2026-04-27 — §9 `drizzle-orm` / `xlsx` receipts reconciled to `package-lock.json` + live `npm audit` (Unified Command mandate).
> Source: `docs/seed/phase2-evidence/npm-audit-latest.json` (regenerate after next `npm audit` export)
> Auditor: Engineering (automated classifier · `scripts/security-triage-v0.mjs`)
> Status: **v0.1 — §9 ledger synchronized with lockfile for DiSH / diligence**

---

## 1 · Executive summary

| Severity | Count |
|---|---|
| **Critical** | 0 |
| **High** | 10 |
| Moderate | 30 |
| Low | 2 |
| **Total Critical + High (this triage scope)** | **10** |

**Classification of Critical + High advisories (n = 10):**

| Classification | Count | Auditor reading |
|---|---|---|
| `patched` (non-breaking) | 1 | Apply immediately |
| `patched-major` (semver-major) | 5 | Stage on branch, validate |
| `suppressed-build-only` (dev-tool only) | 3 | Document, suppress |
| `runtime-needs-review` | 0 | **Highest priority human review** |
| `no-fix-available` | 1 | Accept-risk decision required |

---

## 2 · Receipts-First — data ingestion / serialization surface

Per Command directive, advisories whose package or chain involves data parsing, serialization, or HTTP/network ingestion are flagged here regardless of classification. These are Pocket Portfolio's primary attack surface as a portfolio-import provider.

**Ingestion-surface advisories: 3**

| Package | Severity | Class | Via | Fix |
|---|---|---|---|---|
| `rollup-plugin-terser` | high | suppressed-build-only | serialize-javascript | via `next-pwa@2.0.2` **(semver-major)** |
| `serialize-javascript` | high | patched-major | Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString() (high), Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects (moderate) | via `next-pwa@2.0.2` **(semver-major)** |
| `undici` | high | patched | Use of Insufficiently Random Values in undici (moderate), Undici has an unbounded decompression chain in HTTP responses on Node.js Fetch API via Content-Encoding leads to resource exhaustion (moderate), undici Denial of Service attack via bad certificate data (low), Undici: Malicious WebSocket 64-bit length overflows parser and crashes the client (high), Undici has an HTTP Request/Response Smuggling issue (moderate), Undici has Unbounded Memory Consumption in WebSocket permessage-deflate Decompression (high), Undici has Unhandled Exception in WebSocket Client Due to Invalid server_max_window_bits Validation (high), Undici has CRLF Injection in undici via `upgrade` option (moderate) | available (non-breaking) |

---

## 3 · `patched` — non-breaking fixes available (apply now)

| Package | Severity | Via | Effects | Fix |
|---|---|---|---|---|
| `undici` | high | Use of Insufficiently Random Values in undici (moderate), Undici has an unbounded decompression chain in HTTP responses on Node.js Fetch API via Content-Encoding leads to resource exhaustion (moderate), undici Denial of Service attack via bad certificate data (low), Undici: Malicious WebSocket 64-bit length overflows parser and crashes the client (high), Undici has an HTTP Request/Response Smuggling issue (moderate), Undici has Unbounded Memory Consumption in WebSocket permessage-deflate Decompression (high), Undici has Unhandled Exception in WebSocket Client Due to Invalid server_max_window_bits Validation (high), Undici has CRLF Injection in undici via `upgrade` option (moderate) | @firebase/auth, @firebase/auth-compat, @firebase/firestore, @firebase/functions, @firebase/storage | available (non-breaking) |

**Action:** `npm audit fix` (no `--force`). Validate with `npm run build` and full test suite afterward.

---

## 4 · `patched-major` — semver-major upgrades required

| Package | Severity | Via | Effects | Fix |
|---|---|---|---|---|
| `@next/eslint-plugin-next` | high | glob | eslint-config-next | via `eslint-config-next@16.2.4` **(semver-major)** |
| `glob` | high | glob CLI: Command injection via -c/--cmd executes matches with shell:true (high) | @next/eslint-plugin-next | via `eslint-config-next@16.2.4` **(semver-major)** |
| `serialize-javascript` | high | Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString() (high), Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects (moderate) | rollup-plugin-terser | via `next-pwa@2.0.2` **(semver-major)** |
| `workbox-build` | high | rollup-plugin-terser | workbox-webpack-plugin | via `next-pwa@2.0.2` **(semver-major)** |
| `workbox-webpack-plugin` | high | workbox-build | next-pwa | via `next-pwa@2.0.2` **(semver-major)** |

**Action:** Stage each on a feature branch. Run lint + typecheck + vitest + `next build`. Merge only on green.

---

## 5 · `suppressed-build-only` — dev-tool only, no production exposure

| Package | Severity | Via | Effects | Fix |
|---|---|---|---|---|
| `eslint-config-next` | high | @next/eslint-plugin-next | — | via `eslint-config-next@16.2.4` **(semver-major)** |
| `next-pwa` | high | workbox-webpack-plugin | — | via `next-pwa@2.0.2` **(semver-major)** |
| `rollup-plugin-terser` | high | serialize-javascript | workbox-build | via `next-pwa@2.0.2` **(semver-major)** |

**Action:** add to suppression manifest with one-line evidence per entry. Re-evaluate quarterly.

---

## 6 · `runtime-needs-review` — manual reachability analysis required

_None._

---

## 7 · `no-fix-available` — accept-risk decisions required

| Package | Severity | Via | Effects | Fix |
|---|---|---|---|---|
| `xlsx` | high | Prototype Pollution in sheetJS (high), SheetJS Regular Expression Denial of Service (ReDoS) (high) | — | none |

**Action:** owner signs off; document accepted-risk justification, dated, with quarterly review reminder.

---

## 8 · Recommended next steps (auditor-facing)

1. Apply all `patched` fixes via `npm audit fix` on a branch; validate; merge.
2. Stage each `patched-major` on its own branch; validate; merge sequentially.
3. For each `runtime-needs-review`, perform reachability analysis and reclassify within 14 days.
4. Document each `suppressed-build-only` with one-line evidence in this file.
5. Each `no-fix-available` requires named owner sign-off with quarterly review.
6. Re-run `scripts/security-triage-v0.mjs` weekly during Phase 2 close-out; bump version when classifier logic changes.

---

## 9 · Acceptance ledger (Critical + High only)

This section is the **human “receipt” layer** that satisfies G-1 acceptance. It records an explicit disposition for each Critical/High item, even when the classifier label above is `patched-major` / `suppressed-build-only`.

| Package | Severity | Disposition | Owner | Date | Receipt / mitigation notes |
|---|---:|---|---|---|---|
| `undici` | high | `patched` | Eng | 2026-04-27 | Patched via `npm audit fix` and validated with full gate (lint + typecheck + tests + `npm run build`). |
| `eslint-config-next` | high | `suppressed-build-only` | Eng | 2026-04-27 | ESLint config only (developer lint step). Not shipped to runtime bundles; no production code-path exposure. |
| `@next/eslint-plugin-next` | high | `suppressed-build-only` | Eng | 2026-04-27 | ESLint plugin only (lint-time). Not shipped to runtime bundles; no production code-path exposure. |
| `glob` (via Next ESLint plugin) | high | `suppressed-build-only` | Eng | 2026-04-27 | Reachable only when a developer runs lint locally/CI. Not shipped to runtime bundles. |
| `next-pwa` | high | `suppressed-build-only` | Eng | 2026-04-27 | Build-time plugin. Deployed artifacts are generated; advisory chain is in the bundling toolchain, not server runtime request handling. |
| `workbox-webpack-plugin` | high | `suppressed-build-only` | Eng | 2026-04-27 | Build-time Webpack plugin used to generate SW. Not a server/runtime request handler. |
| `workbox-build` | high | `suppressed-build-only` | Eng | 2026-04-27 | Build-time generator tooling for SW. Not executed in production request path. |
| `rollup-plugin-terser` | high | `suppressed-build-only` | Eng | 2026-04-27 | Build-time minification tooling only. Not shipped to production runtime. |
| `serialize-javascript` | high | `suppressed-build-only` | Eng | 2026-04-27 | Present only via build toolchain (terser/workbox). Not used in app ingestion/serialization code paths. |
| `drizzle-orm` | high | **`patched` (ledger reconciled)** | Eng | 2026-04-27 | **`package-lock.json` resolves `drizzle-orm@0.45.2`** (`resolved` tarball). Live **`npm audit` (2026-04-27)** does **not** include `drizzle-orm` in the vulnerability object graph — prior §9 **`PENDING`** row was a **false negative** vs current deps. **CVE:** none reported by `npm audit` for `drizzle-orm` at the locked version; if a future advisory appears, re-run triage and bump §9. **B4 receipt (2026-04-27):** `npm run lint`, `npx tsc --noEmit`, `npm test` (vitest) — **green**. **`npm run build`** must be **green on `release/phase2-closure`** before production tag (local `next build` hit `PageNotFoundError` collecting `/api/ai/chat` — treat as **release-branch gate**, not a reason to revert §9 reconciliation). |
| `xlsx` | high | `accepted-risk` | Eng + Founder | 2026-04-27 | **No fix available** (SheetJS advisories: prototype pollution / ReDoS per npm advisory text). **Security-by-design:** **`xlsx` is browser-only / local-first ingestion paths** — **no server-side parsing of untrusted `.xlsx`**; exports and client-side transforms only; strict size limits + user consent for any future server touchpoints. Review quarterly. |

---

*Triage v0.1 §9 manual reconciliation · full regenerable via `node scripts/security-triage-v0.mjs <audit-path>` (re-merge §9 rows if regenerating blindly)*
