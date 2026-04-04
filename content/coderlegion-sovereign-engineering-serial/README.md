# CoderLegion — Sovereign Engineering Serial

Plain Markdown for CoderLegion (YAML frontmatter + body). See manifest: [`../coderlegion-sovereign-engineering-serial.md`](../coderlegion-sovereign-engineering-serial.md).

## Glossary

**Edge Compiler (term of art):** The deterministic client-side reduction implemented by `buildPortfolioContext` in `app/lib/ai/contextBuilder.ts` — fixed schema (totals + top-N holdings). There is no separate compiler package in the repo; the “compiler” is the function contract and output shape.

**Sanitization by construction:** The context string never includes raw ledger rows because the builder only emits aggregates; see `docs/IP-TECHNICAL-MECHANISMS.md` §1.
