---
id: PP-FEEDBACK-SUBSTRATE-SPEC-2026-06-16
title: Pocket Portfolio — In-App Feedback Substrate (Phase 0 Spec Annex)
status: PHASE_0_LOCKED
last_updated: 2026-06-16
roles: [CEO, Engineering, Product, Growth, Procurement-facing]
governance_ssot: docs/command/claims-vs-codebase-calibration.md
---

# Feedback Substrate — Phase 0 Spec Annex (Locked)

This annex locks the Phase 0 specification for Pocket Portfolio’s in-app feedback substrate: **power-user telemetry → P0 alert router → admin CMS curation → public receipts**.

**Calibration SSOT:** `docs/command/claims-vs-codebase-calibration.md` (dual-surface reality, stateless boundary language).

---

## 0. Non-negotiables (GRC posture)

- **Eligibility tracking is client-side only.** The `>5 /dashboard visits in 7 days` trigger is calculated in `localStorage`/`IndexedDB`. We do **not** send un-triggered navigation telemetry to servers.
- **PII guardrails run before network egress.** Free-text is scrubbed client-side prior to submit. The server repeats a conservative scrub (defence-in-depth) before persistence.
- **Dual-store split is mandatory:**
  - `feedbackSubmissions`: admin vault + CMS queue + alert router input (scrubbed text allowed).
  - `feedbackEvents`: analytics metadata only (no text, no uid, no email, no portfolio context).
- **Identity masking is mandatory:** `anonUserHash = HMAC(uid, serverPepper)` on the server. No raw uid in analytics collections.
- **Alert engine runs on the write path** (`POST /api/feedback/submit`), not in `/admin/analytics`.

---

## 1. Surface routing invariants (locked)

We operate **one monorepo** + **one deployment** with **host-aware routing**.

- **B2C receipts render target:** `pocketportfolio.app` → `/` and `/landing`.
- **B2B receipts render target:** `openportfolio.co.uk` → `/open` (Open surface; host middleware rewrites).

The CMS publish layer must tag receipts with `surface = pocket | open` and only surface the matching set on each landing.

---

## 2. UI spec (Phase 1 build target)

### 2.1 Rating controls (analytical, chartable)

- **Primary:** 1–5 integer scale (stored as `rating` integer).
- **Binary toggle:** `friction = frictionless | broken`.

### 2.2 Comment capture

- Single free-text field (scrubbed) for “what happened / what broke / what you expected”.
- Optional category chip selection (from adversarial templates list below) to avoid relying on NLP.

---

## 3. Data model (collections) — authoritative shapes

### 3.1 `feedbackSubmissions` (admin vault)

**Purpose:** CMS queue + P0 routing + operational triage. Stored in Firestore via Admin SDK.

**Must include:**

- `createdAt` (timestamp)
- `surface` (`pocket` | `open`)
- `rating` (1–5 int)
- `friction` (`frictionless` | `broken`)
- `category` (one of the 12 template IDs, or `other`)
- `commentScrubbed` (string, scrubbed)
- `commentScrubMeta` (object, see §4.3)
- `anonUserHash` (string: HMAC(uid, pepper))
- `tierBand` (`free` | `foundersClub` | `corporateSponsor` | `unknown`)
- `appVersion` (optional; from build metadata if available)
- `dashboardVisitWindow` (optional; count + window days, no timestamps)

**Must not include:**

- raw uid, email, portfolio context, CSV contents, file attachments, account numbers, addresses.

### 3.2 `feedbackEvents` (analytics metadata only)

**Purpose:** bounded aggregation for `/admin/analytics`.

**Allowed fields only (no text):**

- `createdAt`
- `surface`
- `rating`
- `friction`
- `category`
- `severityClass` (`P0` | `P1` | `P2`)
- `tierBand`
- `dedupedAlert` (boolean)

### 3.3 `featuredReceipts` (public index)

**Purpose:** public landing rendering (B2C/B2B). Storage target: Edge KV (preferred) or Firestore doc.

**Allowed fields only:**

- `surface`
- `quote` (curated excerpt, manually edited by admin)
- `rating` (optional)
- `tagline` (optional; e.g. “CSV import”, “Sovereign inference boundary”)
- `featuredAt`
- `lastEditedAt`

**Explicitly removed:** internal IDs, anon hashes, timestamps beyond display, admin notes.

---

## 4. PII scrubber — explicit rules (Phase 0 locked)

### 4.1 Approach

Scrubber runs **client-side** before submit and **server-side** before write. It is a conservative redaction layer designed to prevent accidental leakage of:

- account identifiers
- addresses / phone numbers
- emails
- raw ledger rows / export dumps
- unusually specific financial values pasted verbatim

We do not claim perfect PII detection; we claim **bounded egress controls** with defence-in-depth.

### 4.2 Normalization

Before regex passes:

- Convert `\r\n` to `\n`
- Collapse excessive whitespace (`[ \t]{2,}` → single space) but preserve line breaks
- Cap max length (client hard cap; server hard cap)

### 4.3 Redaction outputs (required)

Return:

- `text` (scrubbed)
- `meta`:
  - `redactions`: array of `{ kind, count }`
  - `truncated`: boolean
  - `originalLength`: number
  - `finalLength`: number

### 4.4 Regex rules (apply in order)

> Implementation guidance: use case-insensitive matching where indicated; prefer global matches; avoid catastrophic backtracking.

#### A) Email addresses

- **Pattern:** `(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`
- **Replace:** `[REDACTED:EMAIL]`

#### B) Phone numbers (UK/US-ish, permissive)

- **Pattern:** `(?i)\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}\b`
- **Replace:** `[REDACTED:PHONE]`
- **Note:** Run after email; do not attempt full international coverage in v1.

#### C) IBAN

- **Pattern:** `(?i)\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b`
- **Replace:** `[REDACTED:IBAN]`

#### D) Payment cards (basic Luhn-like shape; no checksum in v1)

- **Pattern:** `\b(?:\d[ -]*?){13,19}\b`
- **Replace:** `[REDACTED:CARD]`
- **Guard:** Only redact if the match contains at least 13 digits after stripping spaces/hyphens.

#### E) Account / sort code / routing identifiers (keyword-gated)

- **Pattern:** `(?i)\b(?:account(?:\s*number)?|acct|sort\s*code|routing|aba|swift|bic)\b[^\n]{0,32}\b([A-Z0-9][A-Z0-9 -]{5,})\b`
- **Replace:** `$0` with the captured identifier replaced by `[REDACTED:ACCOUNT_ID]`

#### F) Address-like lines (conservative, keyword-gated)

- **Pattern:** `(?i)\b(?:address|street|st\.|road|rd\.|avenue|ave\.|postcode|zip)\b[^\n]{0,120}`
- **Replace:** `[REDACTED:ADDRESS_LINE]`

#### G) Raw CSV/ledger row dumps (line heuristic)

If any line matches **either** heuristic, redact the whole line:

- **Comma-heavy row:** line contains `,` at least 6 times (`/(?:.*,){6,}.*/`)
- **Delimiter row:** line contains `;` at least 6 times or `\t` at least 6 times

**Replace line with:** `[REDACTED:LEDGER_ROW]`

#### H) Long digit sequences (unknown identifiers)

- **Pattern:** `\b\d{10,}\b`
- **Replace:** `[REDACTED:LONG_ID]`

#### I) Extreme monetary values (optional, cautious)

- **Pattern:** `(?i)(?:£|\$|€)\s?\d{1,3}(?:,\d{3})+(?:\.\d{2})?`
- **Replace:** `[REDACTED:AMOUNT]`
- **Note:** Only redact the formatted large-number pattern; do not blanket-redact all amounts.

---

## 5. Adversarial template matrix (12 total — locked)

Templates are deterministic buttons/chips that prefill category + optional draft text. They are designed to preserve a mathematically balanced spectrum: **Signal (4) / Friction (4) / Break (4)**.

### 5.1 Signal (4)

1. **signal_local_first_speed**
   - Label: “Local-first feels instant”
   - Draft: “Dashboard is responsive and the local-first flow feels instant. Import → insights was smooth.”
2. **signal_clean_import_first_pass**
   - Label: “CSV import worked first pass”
   - Draft: “My broker export imported cleanly on the first pass. Column mapping didn’t need manual edits.”
3. **signal_trust_boundary_clear**
   - Label: “Boundary is clear”
   - Draft: “The sovereignty boundary is clear: I understand what stays local vs what crosses the wire.”
4. **signal_admin_ready_export**
   - Label: “Export is audit-friendly”
   - Draft: “The export and reporting surfaces feel audit-friendly and easy to validate.”

### 5.2 Friction (4)

5. **friction_mapping_confusing**
   - Label: “Mapping needed work”
   - Draft: “I had to adjust column mapping manually. The UI could better explain what it inferred and why.”
6. **friction_dashboard_navigation**
   - Label: “Dashboard navigation friction”
   - Draft: “Finding key actions in the dashboard took too long. I had to click around to locate imports/insights.”
7. **friction_context_explanation**
   - Label: “Context explanation unclear”
   - Draft: “I’m not fully sure what the context engine included/excluded. I want a clearer preview of the aggregate.”
8. **friction_performance_jank**
   - Label: “Performance jank”
   - Draft: “Scrolling or switching tabs felt janky on my machine. I saw noticeable UI lag.”

### 5.3 Break (4)

9. **break_parser_failure**
   - Label: “Parser failed on export”
   - Draft: “The parser failed on my broker export. Import didn’t complete and I couldn’t recover without retrying.”
10. **break_context_missed_data**
   - Label: “Context missed data”
   - Draft: “The context engine missed positions/trades I expected to see reflected in the summary.”
11. **break_quotes_or_market_data**
   - Label: “Market data broke”
   - Draft: “Quotes/market data failed to load or showed stale values. It blocked verification.”
12. **break_auth_or_sync**
   - Label: “Auth/sync broke”
   - Draft: “Sign-in or sync behavior broke (loop, stale state, or unexpected logout). It prevented normal use.”

---

## 6. P0 severity routing (write-path only)

**Location:** `POST /api/feedback/submit`

**P0 triggers (any):**

- `friction === broken`
- `rating <= 2` AND `category` in `{ break_parser_failure, break_context_missed_data, break_quotes_or_market_data, break_auth_or_sync }`
- Lexical “break” triggers match (see §7) AND category is break-class OR user selected “break” chip

**Dispatch:**

- Email via Resend to `engineering@openportfolio.co.uk`
- Optional webhook to Slack/Discord
- Mandatory KV 24h dedup to prevent rage-click storms

---

## 7. `parser_failure` lexical triggers — disclosure guidance

We maintain a **sanitized, non-exhaustive** lexicon for classifying likely parser failures without heavy observability tooling.

**Internal implementation:** maintain a private list of patterns used to assign `break_parser_failure` when the user did not select a category chip.

**External disclosure (procurement / partner):**

- Share only a **sanitized excerpt** of trigger categories and intent (e.g. “parser failed”, “invalid header”, “unknown column”, “mapping error”), not the full regex list.
- Do not share exact patterns that increase adversarial prompt/abuse surface.

---

## 8. Admin CMS freshness controls (required)

Admin must be able to:

- **Add** a receipt (promote a submission to featured)
- **Edit** the public quote (manual rewrite for clarity; must preserve intent; no fabrication)
- **Remove** a receipt (unfeature)
- **Reorder** receipts (optional v1; required v1.1)
- **Expire** receipts automatically (recommended): optional `expiresAt` to enforce freshness (e.g. 30–90 days)

**Invariant:** Public receipts are **curated excerpts**, not raw submissions. All internal identifiers are stripped before publish.

