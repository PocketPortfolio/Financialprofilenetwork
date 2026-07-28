# Wave 2 Engineering RFC — Commercial Offensive Infrastructure

**Date:** 2026-07-28  
**Status:** APPROVED · EXECUTION IN PROGRESS  
**Window:** Days 15–30 (post Wave 1 ship)  
**Command refs:** CMD1 Wave 2 Baseline · CMD2 Wave 2 Master Spec

---

## Executive summary

Wave 1 secured measurement hygiene, bot/API monetization, and OP institutional pillars. Wave 2 builds the **commercial offensive engine**: LLM citation infrastructure, Cloudflare edge compute offload, enterprise lead plumbing, and geo-aware compliance UX.

Wave 1 drew the perimeter. Wave 2 rolls out the red carpet for converting AI channels while dropping datacenter scrapers before Vercel invocation.

---

## Architecture

```
                         [ Inbound Request ]
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
     [ Cloudflare Edge WAF ]            [ Next.js Middleware ]
     • ASN Managed Challenge             • cf-ipcountry → x-user-country
     • Drop datacenter API bots          • Bot gate (Wave 1, in-app fallback)
                  │                               │
     ┌────────────┴────────────┐                  ▼
     ▼                         ▼          [ Route / App Layer ]
 (Pass / Human)          (Datacenter)      • /llms.txt & /llms-full.txt (edge)
     │                         │            • robots.ts LLM allowlist
     ▼                         ▼            • TechArticle JSON-LD on pillars
 [ Application ]         [ Blocked/JS Ch. ] • Slack enriched lead hook
                                           • <ComplianceBanner />
```

**Doctrine:** App-layer gates remain as fallback when traffic bypasses Cloudflare or lacks ASN headers. Edge WAF is the cost-optimization layer, not a replacement for paid-key enforcement.

---

## Wave 1 foundations (already shipped)

| Capability | Evidence |
| --- | --- |
| Bot/API hard gate | `lib/bot-gate.ts`, PR #90/#93 |
| Symbol-farm middleware paywall | `lib/bot-gate-middleware.ts` |
| OP four institutional pillars | `/learn/sovereign-ai-architecture` et al. |
| Dual-host llms pipeline (static) | `scripts/build-llms-txt.ts`, CI drift guard |
| Enterprise inbound form | `POST /api/open-portfolio/contact` → Firestore |
| Standard Stripe webhooks | Developer Utility, Founders, Corporate |

---

## Pillar 1 — AI Citation & LLM Indexing Engine

**Owner:** Head of Product Engineering + Head of AI & Community  
**Target:** Week 3 Day 17

### Deliverables

| Item | File(s) | Acceptance |
| --- | --- | --- |
| Dynamic `/llms.txt` | `app/llms.txt/route.ts`, `lib/llms-feed.ts` | Host-aware Pocket vs Open summary; SSOT from `canonical-claims.ts` |
| Dynamic `/llms-full.txt` | `app/llms-full.txt/route.ts` | Extended technical doc for OAI-SearchBot / Perplexity |
| LLM robots allowlist | `app/robots.ts`, `public/open/robots.txt` | Allow `/learn/`, `/llms*.txt`; block `/api/` |
| TechArticle JSON-LD | `app/components/learn/SovereignPillarArticle.tsx` | Four Wave 1 pillars emit schema.org TechArticle |

### Crawler policy

**Allow (read docs, not data firehose):** `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`

**Block:** all LLM bots on `/api/*` (especially `/api/tickers/*`)

### Out of scope (Wave 2.1)

- OpenAPI spec at `/api/docs/openapi.json` (spec placeholder in llms-full only)
- BYOC interactive sandbox (Week 4)

---

## Pillar 2 — Edge WAF & Compute Offload (SHIP GATE)

**Owner:** Head of Product Engineering (Infra)  
**Target:** Week 3 Day 18 · **blocking for cost narrative**  
**Config doc:** `docs/command/cloudflare-waf-wave2-rules.md`

### Reality check (2026-07-28)

Production DNS for Pocket resolves to **Vercel anycast** (no `cf-ray`). Cloudflare Custom Rules cannot drop bots that never reach Cloudflare. Until orange-cloud cutover, **Vercel Firewall** is the only pre-invocation edge.

### Deliverables

| Item | Location | Acceptance |
| --- | --- | --- |
| Vercel Firewall ASN challenge | `scripts/ops-deploy-vercel-firewall-wave2.mjs --publish` | Datacenter ASNs on metered APIs challenged **before** serverless billing |
| Cloudflare WAF (post-proxy) | `scripts/ops-deploy-cloudflare-waf-wave2.mjs` | Same expression after DNS shows `cf-ray` |
| App-layer fallback | Existing `lib/bot-gate.ts` | Unchanged — defense in depth |

### Success metric

Reduce billable Vercel invocations from datacenter scrapers by ≥80% (Firewall Analytics / function invocation charts).

---

## Pillar 3 — Enterprise Lead Engine & Slack Integration

**Owner:** Head of Product Engineering + CCO  
**Target:** Week 3 Day 20

### Deliverables

| Item | File(s) | Acceptance |
| --- | --- | --- |
| Slack alert on new lead | `lib/open-portfolio/enterprise-lead-slack.ts`, `app/api/open-portfolio/contact/route.ts` | Firestore persist + best-effort Slack; env `SLACK_ENTERPRISE_LEADS_WEBHOOK_URL` |
| Domain firmographic hint | Same | Email domain extracted for quick triage |
| Manual PoC key runbook | This RFC §Runbooks | Documented procedure for CCO trials |

### Out of scope (Wave 2.1)

- Clearbit/Apollo enrichment API
- HubSpot/Salesforce CRM sync
- Custom negotiated Stripe enterprise products

---

## Pillar 4 — Geo-Aware Compliance & ICP Personalization

**Owner:** Head of Product Engineering + Head of Marketing  
**Target:** Week 4 Day 23

### Deliverables

| Item | File(s) | Acceptance |
| --- | --- | --- |
| Country header injection | `lib/middleware/geo-country.ts`, `middleware.ts` | `cf-ipcountry` / `x-vercel-ip-country` → `x-user-country` |
| Compliance banner | `app/components/compliance/ComplianceBanner.tsx` | UK / EU / US regulatory badges on Open + Learn surfaces |
| Localized currency | — | **Deferred Wave 2.1** |

---

## Execution matrix

| Task | Effort | Target | Status |
| --- | --- | --- | --- |
| Wave 2 RFC (this doc) | 0.5d | Day 15 | ✅ |
| `/llms.txt` & `/llms-full.txt` routes | 1d | Day 17 | 🔄 |
| robots.ts + Open robots LLM allowlist | 0.5d | Day 17 | 🔄 |
| Pillar JSON-LD | 0.5d | Day 17 | 🔄 |
| Cloudflare WAF rules (infra) | 0.5d | Day 18 | 📋 Doc ready |
| Enterprise Slack hook | 0.5d | Day 20 | 🔄 |
| Geo middleware + ComplianceBanner | 1d | Day 23 | 🔄 |
| BYOC interactive sandbox | 3–4d | Day 27 | ⏳ Deferred |

---

## Runbooks

### Manual Enterprise PoC API key

1. CCO submits lead via Open contact form (Slack `#enterprise-leads` alert fires).
2. Engineering validates firm in Firebase Admin → `apiKeysByEmail` collection.
3. Mint `pp_*` key with elevated rate limit note in doc field.
4. Send key via secure channel (not email plaintext if CISO policy requires).

### Cloudflare WAF deploy

See `docs/command/cloudflare-waf-wave2-rules.md`. Deploy during low-traffic window; monitor Cloudflare Security Events for false positives on legitimate API customers.

---

## Environment variables (Wave 2)

| Variable | Pillar | Required |
| --- | --- | --- |
| `SLACK_ENTERPRISE_LEADS_WEBHOOK_URL` | 3 | Optional (falls back to `FEEDBACK_P0_WEBHOOK_URL`) |
| Cloudflare dashboard access | 2 | Required for edge rules |

---

## Verdict

Wave 2 engineering RFC locks execution order: **citation → edge → enterprise alerts → geo UX**. BYOC sandbox remains Week 4 heavy lift. Day-14 Wave 1 review (2026-08-10) still gates paid geo ad spend; this RFC does not require that gate for technical citation/edge work.
