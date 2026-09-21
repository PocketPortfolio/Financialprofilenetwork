---
id: OP-CLAIM-LEDGER-V1-2026-09-21
title: Claim-to-evidence ledger v1 (public architecture / regulatory)
status: ACTIVE
date: 2026-09-21
owners: [Head of AI (A), CEO (sign-off), Marketing (I)]
related:
  - docs/command/claims-vs-codebase-calibration.md
  - lib/canonical-claims.ts
---

# Claim-to-evidence ledger v1

Every public technical or regulatory claim on Open Portfolio surfaces maps to an owner, evidence, and last-reviewed date. **No new public claim ships without a row.**

Sign-off: Head of AI · 2026-09-21 (v1). CEO ratifies ARR planning case separately.

## Ledger

| Claim (public wording) | Owner | Evidence / receipt | Last reviewed | Status |
|------------------------|-------|--------------------|---------------|--------|
| Open Portfolio is BYOC boundary infrastructure; buyer keeps IdP and approved storage | Head of AI | `/architecture`, homepage BYOC section, `OPEN_LANDING_COPY` | 2026-09-21 | Live |
| Inference over bounded aggregate context; not raw ledger warehouse on inference path | Head of AI | `contextBuilder` path, architecture TechArticle, AEO FAQs | 2026-09-21 | Live |
| Pocket Portfolio is the live harness / reference terminal — not Open’s default enterprise store | Head of AI | Homepage Pocket honesty, architecture page, `llms.txt` | 2026-09-21 | Live |
| `@pocket-portfolio/importer` MIT; 19+ dedicated broker adapters | Head of Product Eng | SDK package, `SDK.brokerAdapterCount`, openbrokercsv | 2026-09-21 | Live |
| Architecture mapped to DORA / GDPR / EU AI Act diligence (not certification) | Head of AI | `/learn/dora-eu-ai-act-wealth`, ComplianceBanner EU copy, §6b | 2026-09-21 | Live |
| DPIA / firm obligations remain with the buyer; we do not eliminate DPIA | Head of AI | DORA pillar AEO limitation, procurement FAQs | 2026-09-21 | Live |
| No SOC 2 / ISO certification claim on live public chrome | Head of AI | ComplianceBanner US badge purge; wave2 compliance test | 2026-09-21 | Live |
| No zero-leakage / mathematical privacy guarantee | Head of AI | §6b calibration; FAQ guardrails | 2026-09-21 | Live |
| Not a Plaid replacement | Head of AI | `/learn/open-portfolio-vs-plaid` | 2026-09-21 | Live |
| Not a universal portfolio-data API replacement | Head of AI | `/learn/open-portfolio-vs-portfolio-data-api` | 2026-09-21 | Live |
| IFA page: bounded advisor AI only — not full advisor SaaS suite | CPO | `/learn/ai-for-financial-advisors` CPO scope lock | 2026-09-21 | Live |
| Design-partner diligence CTA (not Tier-1 theatre on public CTAs) | CCO | Homepage diligence lock, `OPEN_LANDING_COPY.heroCta` | 2026-09-21 | Live |
| Wealth-tech vertical only on commercial surfaces (no insurance/defense/healthcare lanes) | CEO / Marketing | GTM lane lock; tier1 wealth-only | 2026-09-21 | Live |
| Sovereign AI = wealth-tech narrow definition (not gov/McKinsey SERP war) | Head of AI | Architecture H1 + pillar; GEO serial briefs | 2026-09-21 | Live |

## Process

1. Marketing drafts public copy → Head of AI maps claim → row added **before** publish.
2. Quarterly review (Command): re-verify each Live row against codebase.
3. Breach = pull/patch within 24h; CEO notified if external citation already live.

## Explicit non-claims (do not add as positive rows)

- SOC 2 Type II / ISO 27001 held
- Guaranteed DORA / GDPR / AI Act compliance for buyers
- Named customer logos without Phase 3 evidence gate
- Savings / timeline promises without attributable proof
- Invented verticals (insurance, defense, healthcare) as marketed lanes
