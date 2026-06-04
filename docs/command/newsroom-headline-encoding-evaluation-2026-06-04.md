# Command evaluation — Newsroom headline HTML entities (2026-06-04)

**Surface:** Pocket Portfolio · Community / News section · `NewsRoomBriefingCard`  
**Defect:** Raw entities in headlines (e.g. `Greece&#8217;s` instead of `Greece's`)  
**Root cause:** RSS ingest decoded URLs but **not titles** (`lib/newsroom/parse-rss.ts`)

---

## Unified Command Team

| Role | File | Gate |
|------|------|------|
| **Head of Creative Studios** | `docs/command/roles/head-of-creative-studios.md` | **Typography QA:** no visible `&#[0-9]+;` in card headlines on Pocket home / `/newsroom` |
| **Head of Marketing** | `docs/command/roles/head-of-marketing.md` | Publisher-facing copy must read clean in amber headline treatment |
| **Head of AI & Community Ops** | `docs/command/roles/head-of-ai-and-community-ops.md` | Community news lane credibility — broken encoding erodes trust |
| **Head of Product Engineering** | `docs/command/roles/head-of-product-engineering.md` | Fix at ingest SSOT + unit test; cron refresh repopulates KV |

---

## Remediation

| Layer | Change |
|-------|--------|
| Decode | `lib/newsroom/decode-html.ts` — numeric + named entities |
| Ingest | `parseRssFeed` applies `decodeHtmlEntities()` to every title |
| Test | `tests/unit/newsroom.spec.ts` — `&#8217;` → `'` |

**Production refresh:** Existing KV briefings clear on next `newsroom-ingest` cron (~4h) or manual cron trigger.

---

## Sign-off

- [ ] Creative Studios — spot-check 3 cards after ingest refresh
- [ ] HoPE — `npm run test -- tests/unit/newsroom.spec.ts` green
