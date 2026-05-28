# LinkedIn personal cover — Abba · Head of AI & Community Operations

Replaces generic fintech-blue “AI brain + bridge” stock aesthetic with **Pocket Portfolio terminal / sovereign ingestion** branding.

**v2 (art-first):** Minimal copy — profile photo and headline carry identity. Cover is abstract composition only: perspective grid, wireframe bounded cubes, host-edge beam, builder constellation. No diagram labels.

## Spec (LinkedIn member profile)

| Item | Value |
|------|--------|
| **Dimensions** | **1584 × 396** px exactly (**4:1**) |
| **Formats** | JPG or PNG · max **8 MB** |
| **Upload this** | `linkedin-abba-head-ai-community-cover-1584x396.jpg` (preferred) or `.png` |

**Do not upload** `linkedin-abba-head-ai-community-cover-sota.png` raw — it is **1536×1024 (3:2)** and LinkedIn will reject it (“Save failed”).

After any new SOTA render: `npm run export:linkedin-abba-cover-spec`

## Production files

| File | Notes |
|------|--------|
| `public/marketing/linkedin-abba-head-ai-community-cover.png` | **2×** — crisp on retina |
| `public/marketing/linkedin-abba-head-ai-community-cover-1584x396.png` | Exact LinkedIn pixel size |
| `public/marketing/linkedin-abba-head-ai-community-cover.svg` | Editable source |

**After deploy:**

`https://www.pocketportfolio.app/marketing/linkedin-abba-head-ai-community-cover.png`

## Brand alignment

- **Background:** `#09090b` (ultra-dark terminal)
- **Accent:** `#f59e0b` (`var(--accent-warm)`) — CTAs, diagrams, kicker
- **Excluded:** fintech blue (`#0070f3`), cyan/purple stock gradients, generic “neural brain” clipart
- **Visual story:** `contextBuilder` → stateless `/api/ai/chat` + **builder graph** (community ops), not “people on a glowing bridge”

## Safe zone

LinkedIn profile photo overlaps **bottom-left**. Hero copy starts at **x ≈ 448**; architecture panel stays upper-left. Do not move title into the left 25% if you iterate.

## Regenerate

```bash
node scripts/generate-linkedin-abba-ai-community-cover.mjs
# or
npm run generate:linkedin-abba-ai-community-cover
```

## Upload

Profile → **Add profile section** / **Edit** background → upload PNG → check mobile crop (text stays right of photo).
