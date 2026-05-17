---
id: OP-GROWTH-B2B-STAGE0-ADMIN-ANALYTICS-2026-05-16
title: Stage 0 annex — admin analytics data inventory (`/api/admin/analytics`)
status: OPS_ANNEX
programme_ref: growth-b2b-open-market-acceleration-programme.md
last_updated: 2026-05-16
---

# Stage 0 — Admin analytics evidence annex

This annex backs **§1 Admin analytics realism** in [`growth-b2b-open-market-acceleration-programme.md`](growth-b2b-open-market-acceleration-programme.md). It is derived from code paths wired in [`app/api/admin/analytics/route.ts`](../../app/api/admin/analytics/route.ts) and associated libraries **as of the annex date**. It does **not** assert absence of personal or operational data in cloud systems.

---

## Three governed tiers (inventory mapping)

### Tier A — Billing metadata

| Source | What is read | Purpose (engineering) |
|--------|----------------|----------------------|
| **Stripe API** (`stripe` SDK) | Subscriptions (`stripe.subscriptions.list`), checkout sessions (`checkout.sessions.list`), invoices (`invoices.list`), subscription retrieval with expanded price | MRR / plan mix / monetization dashboard panels |

Environment-driven price IDs map human tier labels (Founders Club, corporate tiers, donations). **PCI/hosting** responsibilities follow Stripe’s domain; this route processes metadata returned by Stripe, not raw card data.

### Tier B — Lead procurement

Data surfaced to admins that can identify individuals or organisations **where those fields exist in stored documents**.

| Source | Store / API | Collections / tables / paths | Typical fields (non-exhaustive) |
|--------|-------------|------------------------------|--------------------------------|
| Firestore | Firebase Admin | `identityGateLeads` | `email`, `timestamp`, `action`, … |
| Firestore | Firebase Admin | `waitlistLeads` | `email`, `timestamp`, `source`, optional name/company fields |
| Firestore | Firebase Admin | `architecture_challenge_leads` | `email`, `createdAt`, `source`, `path` (see [`lib/challenge/challenge-leads-firestore.ts`](../../lib/challenge/challenge-leads-firestore.ts)) |
| Firestore | Firebase Admin | `open_portfolio_contact_leads` | `email`, `company`, `role`, `message`, `context`, `source`, `createdAt`, `path` (see [`lib/open-portfolio/contact-leads-firestore.ts`](../../lib/open-portfolio/contact-leads-firestore.ts)) |
| Sales DB (when configured) | Drizzle / Postgres | `leads` table — rows with `dataSource` matching `waitlist_%` | Mirrors waitlist-style procurement rows for admin “recent leads” merge |

**Governance:** Retention periods, lawful basis (e.g. consent vs legitimate interests), DPA roles, and subprocessors are **Product / Legal / Ops** decisions. Engineering maintains **purpose limitation** in code (what is written and what is queried); **policy language** must match this inventory — **do not** claim the admin route is PII-free.

### Tier C — Operational tracking

| Source | Store | Collection / doc pattern | Notes |
|--------|-------|---------------------------|-------|
| Firestore | Firebase Admin | `toolUsage` | Time-ranged query with **read cap** (`ADMIN_ANALYTICS_MAX_FIRESTORE_DOCS` / `adminAnalyticsFirestoreScanLimit`) |
| Firestore | Firebase Admin | `pageViews` | Same bounded-scan pattern; SEO / top paths |
| Firestore | Firebase Admin | `referralEvents` | Referral clicks / conversions |
| Firestore | Firebase Admin | `monetizationFunnelEvents` | Funnel-stage events |
| Firestore | Firebase Admin | `conversionEvents` | e.g. `lead_magnet_clicked`, mobile setup, quota upgrade |
| Firestore | Firebase Admin | `apiKeysByEmail` | **Count** query: `tier == foundersClub` (aggregate only in-route) |
| Firestore | Firebase Admin | `adminStats` / doc `viralMomentBlast` + subcollection `daily` | Email blast cron summaries (see [`lib/marketing/viral-moment-blast-stats.ts`](../../lib/marketing/viral-moment-blast-stats.ts)) |
| Firebase Auth | Admin SDK | `auth.listUsers` (paginated, capped per implementation) | “App signups” cohort-style metrics |
| **npm registry** | HTTPS `registry.npmjs.org` | Per-package download metadata | Package velocity panels (`NPM_PACKAGES` list in-route) |
| **Blog / editorial** | Repo filesystem + generators | `getBlogPostsData` path | Editorial calendar / status — not end-user PII |

**Circuit behaviour:** `shouldDegradeFirestoreReads`, `markFirestoreReadsDegraded`, and per-query flags (`ignoreGlobalCircuit`, `openGlobalCircuitOnQuota`) prevent read storms; degraded responses may return partial zeros — operational, not a privacy claim.

---

## Retention + lawful basis (Lead procurement — sign-off template)

**Owners:** Product + Legal (+ DPO if appointed). **Delivery** fills technical retention hooks (TTL jobs, export/delete procedures) only when specified by policy.

| Question | Record answer here |
|----------|-------------------|
| **Categories** | Open Portfolio contact (`open_portfolio_contact_leads`), Architecture Challenge (`architecture_challenge_leads`), identity gate, waitlist, merged sales `leads` rows |
| **Lawful basis** | e.g. legitimate interests / consent — **per channel** |
| **Retention default** | e.g. N months post-last-contact + deletion workflow |
| **International transfers** | Firebase / Stripe / Postgres regions + SCCs |
| **Admin access** | Who may call `/api/admin/analytics`; MFA / allowlist |
| **Subprocessors** | Stripe, Google (Auth), npmjs CDN, hosting |

---

## `ppi-meter/1` — roadmap only

No **`ppi-meter`** ingestion implementation has been located in this repository as part of this programme. Treat **`ppi-meter/1`** as **roadmap vocabulary only** in outbound and procurement materials until an implementation is merged and reviewed. Do **not** cite it as shipped compliance tooling.

---

## Change control

When [`app/api/admin/analytics/route.ts`](../../app/api/admin/analytics/route.ts) gains new external reads or Firestore collections, **update this annex** and the programme doc cross-reference in the same Delivery PR where feasible.
