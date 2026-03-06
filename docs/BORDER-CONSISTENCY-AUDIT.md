# Border Consistency Audit

**Date:** 2026-03-06  
**Scope:** Platform-wide border styling (gold vs grey)  
**Question:** Why are borders inconsistent—some branded gold, others grey?

---

## Executive Summary

Borders are inconsistent because **no semantic rule** exists for when to use gold vs grey. The codebase mixes three border tokens across different contexts. **Tailwind is not the primary cause**—only a few components use Tailwind border classes; most use inline styles and CSS variables.

---

## Design Tokens (from `app/styles/tokens.css`)

| Token | Dark Mode | Light Mode | Intended Use |
|-------|-----------|------------|--------------|
| `--border` | `#1c232b` | `#e2e8f0` | Neutral grey, structural borders |
| `--border-subtle` | `#151921` | `#f7fafc` | Very subtle grey, grids/lines |
| `--border-warm` | `#f59e0b` | `#f59e0b` | Branded gold (same as `--accent-warm`) |

**CLAUDE.md** specifies: *"clean borders (`var(--border-subtle)`)"* — but the codebase uses all three tokens inconsistently.

---

## Audit Results by Component

### 1. Gold Borders (`var(--border-warm)`)

Used for **featured cards, CTAs, and trust badges**:

| Location | Component | Usage |
|---------|-----------|-------|
| `app/landing/page.tsx` | Client-Side Encryption, No Cloud Latency, Zero Tracking cards | `border: '2px solid var(--border-warm)'` |
| `app/landing/page.tsx` | Trust badges (Open Source, GitHub, NPM, OpenAI, Google) | `border: '2px solid var(--border-warm)'` |
| `app/landing/page.tsx` | CTA buttons, sponsor cards, hero sections | `border: '2px solid var(--border-warm)'` |
| `app/components/marketing/ProductionNavbar.tsx` | Primary CTAs | `border: '2px solid var(--border-warm)'` |
| `app/components/viral/ReferralProgram.tsx` | Copy input | `border: '2px solid var(--border-warm)'` |
| `app/styles/brand.css` | `.hamburger-btn` (mobile) | `border: 2px solid var(--border-warm) !important` |
| `app/settings/page.tsx` | Upgrade CTA | `border: '2px solid var(--border-warm)'` |
| `app/features/google-drive-sync/page.tsx` | Feature card | `border: '2px solid var(--border-warm)'` |
| `app/components/DriveSyncSettings.tsx` | Connect button | `border: '1px solid var(--border-warm)'` |
| `app/components/ThemeSwitcher.tsx` | Theme buttons | `border: '2px solid var(--border-warm)'` |
| `app/components/InfrastructureUpgradeModal.tsx` | Upgrade CTAs | `border: '2px solid var(--border-warm)'` |
| `app/components/PlaidLinkButton.tsx` | Plaid CTA | `border: '2px solid var(--border-warm)'` |
| `app/components/SovereignSyncCTA.tsx` | Sync CTA | `border: '2px solid var(--border-warm)'` |
| `app/import/[broker]/page.tsx` | Import flow | `border: '2px solid var(--border-warm)'` |

### 2. Grey Borders (`var(--border)`)

Used for **container cards and structural elements**:

| Location | Component | Usage |
|---------|-----------|-------|
| `app/styles/brand.css` | `.brand-card` (base class) | `border: 1px solid var(--border)` |
| `app/landing/page.tsx` | Share Pocket Portfolio section | `border: '1px solid var(--border)'` |
| `app/components/viral/SocialProof.tsx` | Join the Community card | `border: '1px solid var(--border)'` |
| `app/components/layout/GlobalFooter.tsx` | Trending Today box | `border: '1px solid var(--border)'` |
| `app/components/viral/SocialShare.tsx` | Share buttons (Twitter, LinkedIn, etc.) | `border: '1px solid var(--border)'` |
| `app/landing/page.tsx` | FAQ `<details>` | `border: '1px solid var(--card-border)'` |
| `app/landing/page.tsx` | Mobile nav dropdown | `border: '1px solid var(--border)'` |

### 3. Subtle Grey Borders (`var(--border-subtle)`)

Used for **dashboard cards, dividers, and data tables**:

| Location | Component | Usage |
|---------|-----------|-------|
| `app/dashboard/page.tsx` | Settings cards, onboarding steps | `border: '1px solid var(--border-subtle)'` |
| `app/components/ai/AskAIModal.tsx` | Modal content | `border: '1px solid var(--border-subtle)'` |
| `app/components/HistoricalDividends.tsx` | Dividends table | `border: '1px solid var(--border-subtle)'` |
| `app/components/JsonApiLivePreview.tsx` | Preview panel | `border: '1px solid var(--border-subtle)'` |
| `app/components/WeeklySnapshotToast.tsx` | Toast | `border: '1px solid var(--border-subtle)'` |
| `app/settings/page.tsx` | Settings sections | `border: '1px solid var(--border-subtle)'` |
| `app/components/DividendHistory.tsx` | Dividend table | `border: '1px solid var(--border-subtle)'` |
| `app/s/[symbol]/insider-trading/page.tsx` | Insider table | `border: '1px solid var(--border-subtle)'` |
| `app/share/[user_id]/page.tsx` | Share page | `border: '1px solid var(--border-subtle)'` |

### 4. Tailwind Border Classes (Minor)

Only a few components use Tailwind border utilities:

| Location | Classes | Notes |
|----------|---------|-------|
| `app/components/dashboard/SovereignDashboard.tsx` | `border-slate-700`, `border-slate-800` | Admin/demo dashboard |
| `app/book/universal-llm-import/BookMarkdown.tsx` | `border-slate-300`, `border-slate-600`, etc. | Book/docs layout |
| `app/components/SeatManager.tsx` | `border-orange-500/20` | Seat management modal |

These are isolated and do not drive the main inconsistency.

---

## Root Cause Analysis

1. **No semantic rule** — The design system does not define when to use `--border-warm` vs `--border` vs `--border-subtle`.

2. **`brand-card` defaults to grey** — The base `.brand-card` class uses `var(--border)`. Components that want gold must override with inline styles.

3. **Ad-hoc overrides** — Featured cards (Client-Side Encryption, etc.) explicitly set `var(--border-warm)`, while Share/Community/Trending rely on `brand-card` or inline `var(--border)`.

4. **Share section mismatch** — User images show Share buttons with amber/gold; code uses `var(--border)` (grey). If the design intent is gold for Share buttons, the implementation is wrong.

5. **Join the Community** — Uses `brand-card` + `border: '1px solid var(--border)'` → grey. Design may intend gold for this hero-style card.

---

## Recommendations

### Option A: Semantic Tokens (Preferred)

Define clear roles:

- **`--border-warm`** — Featured cards, CTAs, trust badges, hero sections
- **`--border`** — Standard container cards, dividers
- **`--border-subtle`** — Data tables, grids, subtle dividers

Then align Share, Join Community, and Trending to the intended role.

### Option B: Unify Featured Sections

If Share Pocket Portfolio and Join the Community are meant to match the Client-Side Encryption / No Cloud Latency cards (gold borders), update:

- `app/landing/page.tsx` Share section: `border: '2px solid var(--border-warm)'`
- `app/components/viral/SocialProof.tsx`: `border: '2px solid var(--border-warm)'`
- `app/components/viral/SocialShare.tsx` buttons: `border: '2px solid var(--border-warm)'` (or keep grey for secondary buttons)
- `app/components/layout/GlobalFooter.tsx` Trending Today: `border: '1px solid var(--border-warm)'` (or keep grey for subtle footer)

### Option C: Document and Enforce

Add to `CLAUDE.md` or a design doc:

```
Borders:
- Featured/hero cards, CTAs, trust badges → var(--border-warm)
- Standard cards, containers → var(--border)
- Tables, grids, dividers → var(--border-subtle)
```

---

## Files to Update (if aligning to gold for featured sections)

| File | Change |
|------|--------|
| `app/landing/page.tsx` | Share section container: `var(--border)` → `var(--border-warm)` |
| `app/components/viral/SocialProof.tsx` | Join Community card: `var(--border)` → `var(--border-warm)` |
| `app/components/viral/SocialShare.tsx` | Share buttons: `var(--border)` → `var(--border-warm)` (or `var(--accent-warm)` for filled style) |
| `app/components/layout/GlobalFooter.tsx` | Trending Today: optional `var(--border)` → `var(--border-warm)` |

---

## Summary

| Cause | Contribution |
|-------|--------------|
| Mixed use of `--border`, `--border-subtle`, `--border-warm` | **Primary** |
| `brand-card` defaults to grey | **Primary** |
| No documented semantic rule | **Primary** |
| Tailwind `border-slate-*` in a few components | **Minor** |

**Conclusion:** The inconsistency is driven by design-token usage and lack of a semantic rule, not by Tailwind. Aligning Share, Join Community, and Trending to `--border-warm` (if that matches design intent) would resolve the visible mismatch.
