# Pocket Portfolio - Claude Code Directives

## 1. Architecture & Data Sovereignty

- **Core Philosophy:** Local-First. The user's browser (IndexedDB) and Google Drive are the database.
- **Backend:** Do NOT suggest or implement PostgreSQL, MongoDB, or Prisma. We use Firebase strictly for Auth, Tier tracking, and AI Quotas.
- **AI Architecture:** We use a Hybrid RAG approach. Context is built client-side (`contextBuilder.ts`) and sent statelessly to `/api/ai/chat`.

## 2. Tech Stack

- Framework: Next.js (App Router).
- State: Zustand (Global) / IndexedDB (Persistence).
- UI: TailwindCSS, Framer Motion, Lucide React.

## 3. Brand & Design System (Strict)

- **No Generic Fintech Blue:** Never use standard blue hex codes or Tailwind classes (e.g., `bg-blue-500`).
- **Primary Accent:** Always use the CSS variable `var(--accent-warm)` or the hex `#f59e0b` (Amber) for CTAs, FABs, and active states.
- **Surfaces:** Use `var(--surface)` and `var(--background)` for dark/light mode consistency.
- **Aesthetic:** "Terminal / Pro Reference Manual". High density, clean borders (`var(--border-subtle)`).

## 4. Operational Rules

- Never write destructive migrations.
- Always implement the Vercel AI SDK when streaming LLM responses.
- Before suggesting a git commit, you MUST run `npm run lint` and verify typescript compiles.
