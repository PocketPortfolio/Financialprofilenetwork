# Claude Code Bootstrap — Execution Report

**Date:** 2025-02-24  
**Status:** Complete

## Summary

Claude Code CLI guardrails were added to the repository per the Principal DevSecOps / Systems Architect prompt. Two configuration files were created and `.gitignore` was updated for clarity.

---

## 1. `.claudesignore` (created)

**Location:** Repository root  
**Purpose:** Ensures Claude Code never reads, ingests, or uploads sensitive or irrelevant paths to Anthropic.

| Category | Patterns |
|----------|----------|
| **Environment & secrets** | `.env`, `.env.local`, `.env.*`; `!.env.example` |
| **Firebase / credentials** | `*service*account*.json`, `*firebase*admin*.json`, `*-credentials*.json`, `credentials/*.json`, etc. |
| **Test financial data** | `**/test/**`, `**/tests/**`, `**/__tests__/**`, `**/fixtures/**`, `**/test-data/**` for `.csv`, `.xlsx`, `.xls`, `.json` where applicable |
| **Build / runtime** | `node_modules/`, `.next/`, `build/`, `dist/`, `.vite/`, `.vercel/`, `coverage/` |
| **VCS / OS** | `.git/`, `.DS_Store`, `Thumbs.db`, `*.log` |
| **Explicit secrets** | `temp_api_key.txt`, `*.key` |

Firebase credential rules are scoped to credential-like filenames only; config JSON (e.g. `package.json`, `tsconfig.json`) is not ignored.

---

## 2. `CLAUDE.md` (created)

**Location:** Repository root  
**Purpose:** System prompt / directives for Claude Code when running in the terminal.

- **§1 Architecture & Data Sovereignty:** Local-first; IndexedDB + Google Drive as DB; no Postgres/Mongo/Prisma; Firebase for Auth, Tier, AI Quotas; Hybrid RAG with client-side `contextBuilder.ts` and stateless `/api/ai/chat`.
- **§2 Tech Stack:** Next.js (App Router), Zustand, IndexedDB, TailwindCSS, Framer Motion, Lucide React.
- **§3 Brand & Design System:** No generic fintech blue; primary accent `var(--accent-warm)` / `#f59e0b`; surfaces `var(--surface)` / `var(--background)`; “Terminal / Pro Reference Manual” aesthetic; borders `var(--border-subtle)`.
- **§4 Operational Rules:** No destructive migrations; use Vercel AI SDK for streaming LLM responses; before suggesting a git commit, run `npm run lint` and ensure TypeScript compiles.

---

## 3. `.gitignore` (updated)

- **Change:** Added comment at top: `# Claude Code CLI: .claudesignore is intentionally tracked (repo guardrails)`.
- **Tracking:** `.claudesignore` is not listed in `.gitignore`, so it is tracked by git.
- **Sensitive files:** `.env` and `.env.*` remain ignored; `!.env.example` remains the only env file allowed. No sensitive paths were added to the repo.

---

## 4. Next Steps for Engineers

1. Open the repo root in Cursor.
2. In the integrated terminal, run `claude` when ready to use Claude Code.
3. Claude Code will read `CLAUDE.md` and respect `.claudesignore` for all operations in this repo.

**Status: Ready for team deployment.**
