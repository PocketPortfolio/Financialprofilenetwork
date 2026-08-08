---
id: OP-OPEN-LANDING-ENTERPRISE-GTM-COMPOSITE-2026-08-08
title: Open landing proof — Open Portfolio O. hygiene + brief GTM product + architecture
status: CREATIVE_OWNS · BRAND_HYGIENE · ENG_WIRED · CCO_CPO_GTM_ASAP
date: 2026-08-08
owner_primary: Head of Creative Studios
owners_signoff: CCO · CPO · Head of GTM · Head of Marketing · Head of Creative
---

# Mandate (locked)

Open Portfolio is the **enterprise gateway**. Channel brand hygiene is non-negotiable.

## Brand hygiene (all Open channels)

| Element | Open Portfolio channel | Pocket / retail LinkedIn |
|---------|------------------------|---------------------------|
| Monogram | **O.** (`public/brand/op-monogram-amber.png`) | **P.** (`pp-monogram-amber.png`) |
| Wordmark | Open Portfolio | Pocket Portfolio |
| Exit URL | **openportfolio.co.uk** only | pocketportfolio.app · openportfolio.co.uk |
| Diagram footer | OPEN PORTFOLIO · SOVEREIGN INFRASTRUCTURE | May say Pocket on corporate LinkedIn cut |
| Full harness v4 | Do **not** use as Open homepage proof | Soft-launch / LinkedIn primary |

**Never** ship Pocket P. bookends on `openportfolio.co.uk`.

## Proof video shape (Open landing)

```text
[0–2s]     INTRO     O. monogram + Open Portfolio + OPEN INTELLIGENCE
[2–8s]     PRODUCT   Brief NEW GTM harness (Sovereign UI) + OP chrome cover / badge
[8–14s]    ARCH      Split-Brain / Data Chasm diagram (OPEN PORTFOLIO footer)
[14–16.5s] EXIT      O. monogram + Open Portfolio + OPEN INTELLIGENCE + openportfolio.co.uk
```

| Keep | Replace | Do not put on Open |
|------|---------|---------------------|
| Architecture diagram | Legacy silver-chat product beat | Full ~45s retail harness as homepage proof |
| Enterprise architecture story | P. logo bookends | Pocket wordmark on Open bookends |

## Org roles (ASAP)

| Role | Ownership |
|------|-----------|
| **Head of Creative Studios** | **Primary.** `npm run encode:open-landing-enterprise-gtm`. O. bookends only. Sign off hygiene. |
| **CPO** | Product beat = current Sovereign harness; brief (~6s). Accept OP badge over consumer chrome. |
| **CCO / Head of GTM** | Open ≠ retail. LinkedIn keeps full v4 (P. bookends OK there). |
| **Head of Marketing** | Poster = Open intro still. Mute-safe ~16.5s. |
| **Eng** | `OPEN_LANDING_VIDEO` → `open-landing-enterprise-gtm-*`, cache bust `20260808op`, deploy, smoke. |

## Assets (Open web)

| Role | Path |
|------|------|
| 4K / 1080 | `public/marketing/open-landing-enterprise-gtm-{4k,1080}.mp4` |
| Poster / intro / exit stills | `public/marketing/open-landing-enterprise-gtm-{poster,intro,exit}.jpg` |
| Encode | `npm run encode:open-landing-enterprise-gtm` |
| SSOT | `lib/canonical-claims.ts` → `OPEN_LANDING_VIDEO` (`?v=20260808op`) |
| Logo SSOT | `public/brand/op-monogram-amber.png` |

## Smoke

1. First frame = **O.** monogram (ring + square), not P.  
2. Product beat ≠ silver commodities chat; OP badge / covered Pocket chrome  
3. Diagram footer = OPEN PORTFOLIO  
4. Exit = openportfolio.co.uk only  
5. Network: `/marketing/open-landing-enterprise-gtm-*.mp4?v=20260808op`
