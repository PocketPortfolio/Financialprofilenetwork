# Phase 2 — Authority Graph Activation
## Command Team Charter (ratified scope)

| Field | Value |
|---|---|
| **Charter date** | 2026-04-26 |
| **Author** | Engineering |
| **Status** | Awaiting command sign-off |
| **Phase 1 status** | Live · `https://www.pocketportfolio.app/press` (commit `a7d7577`) |
| **Timeline** | Open-ended — ship pillars as ready, sequencing dependencies still binding |
| **Distribution intensity** | Soft launch (founder LinkedIn + Twitter/X only) |
| **Optional surfaces** | All in scope (C-1, C-2, A-8, A-9 included) |

---

## 1 · Mandate

Phase 1 produced the **canonical anchor** — a single, machine-readable, schema-valid identity URL on owned property. Phase 2 must produce **reciprocity at scale**. Every off-platform surface where Pocket Portfolio or Abba Lawal appears must link back to that anchor with consistent positioning copy.

> **Phase 2 thesis:**
> Search engines and answer engines decide what an entity *is* by triangulating multiple consistent signals across owned and third-party properties. Phase 1 built one strong signal. Phase 2 builds eight more, all pointing at the same anchor with the same words.

**"Done" definition:**
A journalist, LLM, or recruiter who Googles "Pocket Portfolio" or "Abba Lawal sovereign intelligence" finds the same one-line positioning on `/press`, LinkedIn, CoderLegion, dev.to, GitHub, Crunchbase, and Product Hunt — and every external profile contains a `rel="me"` or visible link back to `https://www.pocketportfolio.app/press`.

---

## 2 · Success criteria (measurable)

| # | Criterion | Target | Verification |
|---|---|---|---|
| **SC-1** | `sameAs` reciprocity | 100% of URLs in `ORG.sameAs` and `PERSON_ABBA.sameAs` link back to `pocketportfolio.app` | CI job `sameAs-reciprocity.yml` |
| **SC-2** | Positioning consistency | `POSITIONING.primary` appears verbatim on every off-platform profile | Manual audit + screenshot evidence in `docs/seed/phase2-evidence/` |
| **SC-3** | Schema validator pass | All JSON-LD blocks pass `validator.schema.org` and Google Rich Results test | Captured screenshots, recurring monthly |
| **SC-4** | Indexed by Google | `/press` returns "URL is on Google" in GSC inspection | GSC URL Inspection |
| **SC-5** | LLM citation surface check *(trailing indicator)* | At least 2 of {Perplexity, ChatGPT, Claude, Gemini} cite `pocketportfolio.app/press` for the canonical prompt suite | Weekly human prompt log |
| **SC-6** | Person disambiguation | Google Knowledge Graph returns the correct Abba Lawal entity | KG API or visual SERP audit |
| **SC-7** | Numeric receipt freshness | All `NUMBERS_SNAPSHOT` rows have `asOf` within 60 days | Sovereign Threshold #4 (existing) + monthly refresh |
| **SC-8** | Soft-launch signal | Founder posts on LinkedIn + Twitter/X published, link to `/press` | URL audit + impressions log |

**LLM prompt suite (SC-5):**
1. "What is Pocket Portfolio?"
2. "Who is the founder of Pocket Portfolio?"
3. "What is the sovereign ingestion layer?"
4. "Local-first portfolio tracker SDK for broker CSV import — what should I use?"
5. "Pocket Portfolio vs Ghostfolio — what's the architectural difference?"

Citation of `pocketportfolio.app` (any path) counts as a hit. Citation of `/press` specifically counts double.

---

## 3 · Workstreams (parallel pillars)

### Pillar A — Off-platform profile rewrites *(critical path · split ownership)*

| # | Profile | Owner | Source of truth | Action |
|---|---|---|---|---|
| **A-1** | Abba personal LinkedIn | **Abba** | `PERSON_ABBA` + `POSITIONING.primary` | Rewrite headline, About, Featured (anchored to `/press`), current Experience |
| **A-2** | Pocket Portfolio company LinkedIn | **Abba** | `ORG` + `TAGLINE_LONG` | Replace tagline, About; "Website" field = `/press` |
| **A-3** | CoderLegion profile | **Abba** | `PERSON_ABBA` | Bio = description; pinned link to `/press` |
| **A-4** | GitHub Org (`PocketPortfolio`) | **Engineering** | `ORG`, `SDK` | Org description = `TAGLINE_LONG`; link to `/press`; pin canonical repo |
| **A-5** | GitHub personal profile | **Engineering** *(via PR for Abba to merge on personal repo)* | `PERSON_ABBA` | README profile content; link to `/press` |
| **A-6** | dev.to profile | **Abba** | `PERSON_ABBA` | Bio + website = `/press` |
| **A-7** | npm org / 11 packages metadata audit | **Engineering** | `PACKAGES`, `SDK` | `package.json` `author`, `homepage`, `repository` consistency across all 11 packages |
| **A-8** | Crunchbase | **Abba** | `ORG` | Submit/edit company page; link to `/press` |
| **A-9** | Product Hunt maker profile | **Abba** | `PERSON_ABBA` | Maker bio; "Made by" link to `/press` |

**Engineering deliverable for Pillar A:** `scripts/generate-profile-copy.ts` — emits ready-to-paste copy blocks for each platform (LinkedIn headline, LinkedIn About, CoderLegion bio, dev.to bio, GitHub README), sourced entirely from `lib/canonical-claims.ts`. Profile copy becomes regenerable on every SSOT change with one command.

---

### Pillar B — Reciprocity validation *(automation · Engineering)*

| # | Deliverable |
|---|---|
| **B-1** | `.github/workflows/sameAs-reciprocity.yml` — fetches every URL in `ORG.sameAs` and `PERSON_ABBA.sameAs`, asserts back-link presence. Daily cron + on PR. |
| **B-2** | `tests/unit/sameAs-shape.spec.ts` — every `sameAs` URL is HTTPS, well-formed, no whitespace, in approved domain set |
| **B-3** | `scripts/audit-reciprocity.ts` — manual ad-hoc markdown report of which profiles link back |

**Critical sequencing:** B-1 must ship **before** any Pillar A edit goes live, otherwise we have no automated drift detection.

---

### Pillar C — Deeper canonical surfaces *(in scope · Engineering)*

| # | Deliverable |
|---|---|
| **C-1** | `/press/abba-lawal` — dedicated `Person` page so LinkedIn / CoderLegion `rel="me"` targets a single-entity URL rather than the multi-entity `/press` |
| **C-2** | Expand `CANONICAL_ARTICLES` corpus — add `/learn/sovereign-finance`, `/learn/sovereign-stack`, `/learn/local-first` to the substrate so each renders as `Article` JSON-LD on `/press` |

*(Items C-3 contactPoint and C-4 /team page deferred to Phase 3.)*

---

### Pillar D — External validators & monitoring *(observability · split)*

| # | Deliverable | Owner | Cadence |
|---|---|---|---|
| **D-1** | Submit `/press` to Google Search Console URL inspection; request indexing | Abba | One-off, Day 1 |
| **D-2** | Re-submit `sitemap.xml` to GSC (lastmod changed) | Abba | One-off, Day 1 |
| **D-3** | Submit `/press` to Bing Webmaster Tools (propagates to ChatGPT search via IndexNow) | Abba | One-off, Day 1 |
| **D-4** | Run `validator.schema.org` on `/press`; capture screenshot to `docs/seed/phase2-evidence/schema-validator-day1.png` | Engineering | Day 1, monthly |
| **D-5** | Run Google Rich Results test on `/press`; capture screenshot | Engineering | Day 1, monthly |
| **D-6** | Weekly LLM citation audit — fixed prompt suite against 4 engines, log to `docs/seed/phase2-evidence/llm-audit-YYYY-WW.md` | Abba | Weekly |
| **D-7** | `scripts/check-google-knowledge-graph.ts` — Google KG API entity disambiguation check | Engineering | Build once; run weekly |

---

### Pillar E — Distribution amplification *(soft launch · Abba)*

Restricted to founder-owned channels per command decision.

| # | Deliverable | Owner |
|---|---|---|
| **E-1** | Founder LinkedIn announcement post linking `/press`, anchored on the "Sovereign Ingestion & Inference Layer" frame | Abba |
| **E-2** | Twitter/X thread version of the announcement | Abba |

**Out of Phase 2:** newsletter send, outbound press email, HackerNews submission, external blog cross-post. *(Reserved for Phase 3 once `/press` indexing is confirmed and citation baseline established.)*

---

### Pillar F — Substrate maintenance discipline *(ongoing · Engineering+Abba)*

| # | Deliverable | Cadence |
|---|---|---|
| **F-1** | Bump `LAST_HUMAN_VERIFIED` in `lib/canonical-claims.ts` | <= 30 days |
| **F-2** | Refresh `NUMBERS_SNAPSHOT` rows from primary artifacts (TRAC-01 npm, TRAC-07 GA4, TRAC-09 GSC, TRAC-12 calendars) | Monthly, first Mon |
| **F-3** | Re-run schema validators | Monthly |
| **F-4** | Sovereign Threshold #4 (recency) gating CI | Continuous (existing) |

---

### Pillar G — Tech debt touching Phase 2 *(non-blocking · Engineering)*

| # | Item | Severity | Action |
|---|---|---|---|
| **G-1** | 105 Dependabot vulns (3 critical, 52 high) flagged on Phase 1 push | High | Triage at minimum the 3 critical |
| **G-2** | CRLF line-ending churn | Low | `.gitattributes` with `* text=auto eol=lf`; one-time `git add --renormalize` |
| **G-3** | 84 ancient stashes | Cosmetic | Audit + drop in batch |
| **G-4** | `.cursor/worktrees/.../gju` shadow worktree | Medium | **Drop before any Pillar A edit** — root cause of Phase 1 drift incidents |
| **G-5** | `next lint` deprecated (Next 16 will remove it) | Medium | Migrate to ESLint flat config in close-out |

---

## 4 · Sequencing (open-ended, dependencies binding)

Timeline is open-ended; the dependency graph below remains authoritative regardless of calendar pace.

```
Anchor              Phase 1 closed · /press live
                    |
Engineering Day-1   |-- B-1 (reciprocity CI)        <-- must precede any A-* go-live
Engineering Day-1   |-- G-4 (drop gju worktree)     <-- must precede any A-* edit
                    |
Engineering Wave-1  |-- C-1 (Person page /press/abba-lawal)
Engineering Wave-1  |-- C-2 (expand CANONICAL_ARTICLES)
Engineering Wave-1  |-- B-2, B-3 (shape test, audit script)
Engineering Wave-1  |-- scripts/generate-profile-copy.ts
                    |
Abba Wave-1         |-- A-1 (personal LinkedIn)
Abba Wave-1         |-- A-2 (company LinkedIn)
Abba Wave-1         |-- A-3 (CoderLegion)
Abba Wave-1         |-- A-6 (dev.to)
Abba Wave-1         |-- D-1, D-2, D-3 (GSC + Bing submissions)
Abba Wave-1         |-- E-1, E-2 (LinkedIn + Twitter announcement)
                    |
Engineering Wave-2  |-- A-4 (GitHub org)
Engineering Wave-2  |-- A-5 (GitHub personal README)
Engineering Wave-2  |-- A-7 (npm packages metadata audit)
Engineering Wave-2  |-- D-4, D-5, D-7 (validators + KG check)
Engineering Wave-2  |-- G-1 (critical CVE triage)
                    |
Abba Wave-2         |-- A-8 (Crunchbase)
Abba Wave-2         |-- A-9 (Product Hunt)
Abba Wave-2         |-- D-6 (LLM citation audit, ongoing weekly)
                    |
Close-out           |-- F-1, F-2 (substrate refresh rhythm)
Close-out           |-- G-2, G-3 (CRLF, stash housekeeping)
Close-out           |-- G-5 (ESLint flat config migration)
                    |
                    Phase 2 acceptance review · SC-1..SC-8 measured
```

---

## 5 · Acceptance gates

| Gate | Pass criteria |
|---|---|
| **Pillar A pass** | Each profile in scope returns HTTP 200, contains `pocketportfolio.app` in rendered HTML, matches SSOT positioning verbatim. CI job B-1 reports 100% reciprocity. |
| **Pillar B pass** | `sameAs-reciprocity.yml` runs daily, >= 3 successful green runs, fails-loud on back-link disappearance. |
| **Pillar C pass** | `/press/abba-lawal` returns 200 with `Person` JSON-LD; `CANONICAL_ARTICLES` contains >= 4 entries, all rendering as `Article` blocks on `/press`. |
| **Pillar D pass** | `validator.schema.org` and Rich Results test report zero critical errors. GSC reports `/press` "URL is on Google". LLM audit >= 2 of 4 engines citing pocketportfolio.app for prompt #1. |
| **Pillar E pass** | E-1 and E-2 published; impressions logged. |
| **Pillar F pass** | `LAST_HUMAN_VERIFIED` bumped at least once; NUMBERS_SNAPSHOT refresh evidence captured. |
| **Pillar G pass** | G-1 critical CVEs closed or formally accepted; G-4 worktree dropped; G-2/G-5 close-out shipped. |

---

## 6 · Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LinkedIn rewrite triggers identity-verification flag | Low | Low | Space changes across 2-3 sessions; no rapid sequential edits |
| Schema.org validator finds an issue we missed | Low | Medium | D-4 runs Day 1; any error blocks Pillar A from going live until fixed in SSOT |
| LLM citation rate stays at zero | Medium | Low | Crawl latency 4-12 weeks for cold pages; SC-5 measured at Week 4+ minimum |
| Dependabot critical CVE triage scope-creeps | Low-Medium | Medium | G-1 sandboxed on a branch; don't merge if scope explodes |
| Profile-copy regen script delayed | Low | Low | Profile copy short enough to hand-write from SSOT for v1; script is amplification not blocker |
| Worktree drift recurs | Medium *(twice in Phase 1)* | High | **G-4 mandatory before any Pillar A work** |

---

## 7 · Resource asks

| Ask | Detail |
|---|---|
| **Abba (founder)** | ~6 hours total: A-1, A-2, A-3, A-6, A-8, A-9, D-1..D-3, E-1, E-2; plus ~1h/week ongoing for D-6 LLM audit |
| **Engineering** | ~2 days: Pillar B (CI + scripts); ~0.5 day Pillar C-1 (Person page); ~0.5 day Pillar C-2 (Articles expansion); ~0.5 day Pillar G housekeeping |
| **Budget** | None |

---

## 8 · Explicitly out of scope

- Paid PR / wire distribution
- Newsletter sends, outbound press email, HackerNews, external blog cross-posts *(deferred to Phase 3)*
- Podcast pitches *(Phase 3, after GSC indexing confirmed)*
- Additional marketing site sections beyond C-1, C-2
- Authenticated dashboard / app surface changes
- Pricing / billing / Stripe / Founders Club changes
- AI features (chat, RAG, contextBuilder)
- Mobile / PWA work
- `Organization.contactPoint` block *(C-3, deferred)*
- `/team` long-form page *(C-4, deferred)*

---

## 9 · Engineering Day-1 readiness *(awaiting sign-off)*

The following can ship within 24h of command sign-off:

1. **G-4** — drop the `gju` shadow worktree (prevents drift recurrence)
2. **B-1** — wire `.github/workflows/sameAs-reciprocity.yml` (must precede any A-* edit)
3. **B-2** — `tests/unit/sameAs-shape.spec.ts`
4. **`scripts/generate-profile-copy.ts`** — Pillar A automation deliverable

---

## 10 · Sign-off

> **This charter is held pending command sign-off. No Phase 2 engineering work has begun.**

| Role | Name | Sign-off |
|---|---|---|
| Founder / CEO | Abba Lawal | _______________ |
| Engineering | Pocket Portfolio Engineering | _______________ |
| Date ratified | | _______________ |

---

*Charter end · `docs/seed/PHASE-2-CHARTER.md`*
