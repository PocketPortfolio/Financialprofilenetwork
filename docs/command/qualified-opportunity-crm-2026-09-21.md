---
id: OP-QUALIFIED-OPPORTUNITY-CRM-2026-09-21
title: CRM stage — qualified_opportunity definition
status: ACTIVE
date: 2026-09-21
owners: [CCO (R/A), Head of AI (C), Marketing (I)]
---

# Qualified opportunity (analytics + CRM)

## Definition (locked)

A **qualified opportunity** exists when **all** are true:

1. **Company identified** (legal or trading name)
2. **Technical or risk owner engaged** (CTO, CISO, DPO, Head of Platform/Data/AI, enterprise architect, or procurement/vendor-risk with tech sponsor)
3. **Perimeter / AI use case stated** (what data, where it lives, what AI should do)
4. **Architecture review or diligence call** completed **or** booked with a **next step inside 14 days**

## Ownership

- **CCO** promotes Firestore lead `pipelineStage` → `qualified_opportunity` via `promoteLeadToQualifiedOpportunity`
- Emit GA4/analytics event `qualified_opportunity` with `attribution_channel`: `organic` | `ai` | `authority` | `outbound` | `unknown`
- SEO/AEO/GEO must be able to source or influence ≥50% of the 50 opps over 18 months (planning case)

## Planning case (CEO-ratified model)

| Input | Value |
|-------|-------|
| Target ARR (18 months) | £1,000,000 |
| Blended first-year ACV | £100,000 |
| Close rate | 20% |
| Wins required | 10 |
| Qualified opps required | 50 |

## Pacing

| Window | Qualified opps |
|--------|----------------|
| Months 1–6 | 10 |
| Months 7–12 | 18 |
| Months 13–18 | 22 |

## Attribution channels

| Channel | Meaning |
|---------|---------|
| `organic` | First or assist touch from non-branded search / learn cluster |
| `ai` | Cited or recommended by answer engine on tracked prompts |
| `authority` | Independent referring domain / earned media influenced |
| `outbound` | Named-account or IFA outbound primary |
| `unknown` | Insufficient evidence — do not count toward SEO ≥50% until classified |

## Exit to win

Contracted ARR logged; link back to opportunity id; Phase 3 evidence gate for any public customer claim.
