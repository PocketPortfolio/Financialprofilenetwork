# Style Sheet — Universal LLM Import Book

Recurring terms, abbreviations, and house style choices.

## Terms

- Use **Universal LLM Import (CSV)** on first use; thereafter "Universal Import" or "the Universal path" is fine.
- **LLM** not "large language model" after first use.
- **Schema inference**, **column mapping**, **confidence threshold**, **REQUIRES_MAPPING**, **Smart Import**, **Sovereign Sync**, **dumb storage**, **evidence-first**, **local-first**, **data sovereignty** — use as in the glossary (Appendix B).

## Code / API

- `parseUniversal`, `inferMapping`, `genericParse`, `genericRowToTrade`, `inferColumnMapping`
- `UniversalMapping`, `RequiresMappingResult`, `StandardField`, `REQUIRED_FIELDS`
- `ENABLE_LLM_IMPORT`, `NEXT_PUBLIC_ENABLE_LLM_IMPORT`
- `/api/ai/map-csv`
- `HEURISTIC_CONFIDENCE_THRESHOLD` / `UNIVERSAL_CONFIDENCE_THRESHOLD` (0.9)

## Voice

- First person plural ("we") for Pocket Portfolio's choices; otherwise neutral.
- No marketing fluff; no "revolutionary" or filler.

## Numbers

- Threshold **0.9**
- **First 3 rows** for LLM payload
- **Headers + sample rows** as the minimal mapping input

## Abbreviations

CSV, API, LLM, UI, GDPR, OAuth, JSON, ISO. No need to expand after first use in a section.
