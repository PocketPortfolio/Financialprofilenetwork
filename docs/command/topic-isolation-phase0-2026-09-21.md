---
id: OP-TOPIC-ISOLATION-PHASE0-2026-09-21
title: Phase 0 — Topic isolation from wealth-tech graph
status: ACTIVE
date: 2026-09-21
owners: [Marketing (A), Eng (R)]
---

# Isolate diluting topics

## Rule

Unrelated developer how-to content (e.g. PostgreSQL) must not compete with the wealth-tech AI custody entity graph.

## Implementation

- `isTopicDilutionBlogSlug()` in `lib/canonical-claims.ts` — slug contains `postgres` / `postgresql`
- `shouldNoindexOpenBlogPost()` includes dilution slugs
- `isOpenBlogListingCategory()` excludes dilution from Open hub/sitemap
- Existing farm doctrine already noindexes `how-to-in-tech` / `research` categories

## Homepage / architecture titles (locked)

| Surface | Title |
|---------|-------|
| Homepage | `BYOC AI Infrastructure for Wealth-Tech \| Open Portfolio` |
| Architecture | `Sovereign AI Architecture for Wealth-Tech \| Open Portfolio` |
| Architecture H1 | Sovereign AI architecture for wealth-tech |

## Exit

Indexing clean relative to dilution; Open listing shows institutional briefs only.
