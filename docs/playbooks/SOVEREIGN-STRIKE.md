# Sovereign Strike — Enterprise Objection Matrix

**Route:** [`/playbooks/sovereign-strike`](/playbooks/sovereign-strike)

**Discovery:** Linked from the Technical Press catalog at [`/book`](/book) under **Sales enablement**.

Internal sales-enablement module: four levels of C-suite objections with correct strategic reframes, XP, and badges. Copy is aligned with engineering reality (structural guarantees, fixed-schema aggregates, stateless API, truncated payloads).

## Navigation (TabBar)

The app shell renders **TabBar + GlobalFooter below page content** in `app/layout.tsx`. Pages that used `min-height: 100vh` alone pushed that chrome off-screen. The playbook uses `app/playbooks/layout.tsx` plus a flex wrapper in the root layout so the matrix **fills the space above the TabBar** and scrolls internally.

## Access control

- **SEO:** Page metadata sets `robots: noindex, nofollow`.
- **Optional gate:** Set `PLAYBOOK_GATE_SECRET` in the deployment environment. When set, visitors must submit the secret once; success sets httpOnly cookie `pp_playbook_gate` (30 days) via `POST /api/playbooks/unlock`.
- **Open by default:** If `PLAYBOOK_GATE_SECRET` is unset, the matrix loads without a gate (typical for local dev).

**Generate a secret (do not commit output):** run `npm run gen:playbook-secret` locally, copy the printed value into Vercel → Environment Variables → `PLAYBOOK_GATE_SECRET`, then redeploy.

## Source files

| File | Role |
|------|------|
| `app/playbooks/sovereign-strike/page.tsx` | Metadata, cookie gate, renders matrix |
| `app/playbooks/sovereign-strike/SovereignStrikeMatrix.tsx` | Interactive levels, localStorage progress |
| `app/playbooks/sovereign-strike/SovereignStrikeMatrix.module.css` | Scoped styles (Tailwind is off globally) |
| `app/playbooks/sovereign-strike/PlaybookGate.tsx` | Access code form |
| `app/playbooks/layout.tsx` | Fills flex main region so TabBar stays visible |
| `app/api/playbooks/unlock/route.ts` | Validates secret, sets cookie |

## Progress storage

Client-only: `localStorage` key `pp-sovereign-strike-v1` (XP, badges, level index, completion, optional `awaitingAdvance` after a correct answer before **Next target**). Use **Reset progress** on the page to clear.

## UI & styling (important)

**Tailwind utility classes are not applied app-wide:** `app/globals.css` intentionally has `@import "tailwindcss";` commented out (see comment there—rollback to avoid dashboard conflicts). Therefore the Sovereign Strike UI uses **`SovereignStrikeMatrix.module.css`** (scoped CSS Module with explicit colors and layout). Do not rely on Tailwind classes inside this playbook without re-enabling Tailwind globally or adding a scoped Tailwind entry.

Card-based “cyber-tactical” layout: one boss per screen, rose-tinted **objection** panel, emerald-tinted **intel** panel, large A/B execution buttons, success/error feedback with **Next target** / **Retry**. Primary CTA on the victory screen uses **`var(--accent-warm)`** (Pocket brand amber).
