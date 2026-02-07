# Universal Import – NPM Packaging Plan (executed)

**Status:** Phase 1 & 2 done. Phase 3 (publish) – run the commands below when ready.

---

## Completed

### Phase 1: Core export
- `packages/importer/src/index.ts` re-exports `parseUniversal`, `genericParse`, `genericRowToTrade`, `inferMapping` and universal types.
- `packages/importer` version set to **1.1.0**.
- `dist/index.d.ts` exposes these after `npm run build` in `packages/importer`.

### Phase 2: Alias package
- **`packages/aliases/universal-csv-importer/`** created with:
  - `package.json` – name `@pocket-portfolio/universal-csv-importer`, version 1.0.0, depends on `@pocket-portfolio/importer@^1.0.9`
  - `index.js` – re-exports only `parseUniversal`, `genericParse`, `genericRowToTrade`, `inferMapping`
  - `README.md` – “Importing any CSV” and “Smart Mapping” focus
  - `scripts/postinstall.js` – sponsor message
- **Analytics:** `@pocket-portfolio/universal-csv-importer` added to `NPM_PACKAGES` in:
  - `app/api/admin/analytics/route.ts`
  - `app/api/metrics/export/route.ts`
  - `app/api/npm-stats/route.ts`  
  So it is tracked on **/admin/analytics** with the other NPM packages once published.

---

## Phase 3: Finalise – run in your terminal

Run these in **your** terminal (where npm is already logged in), from the **repo root**.

### Option A – PowerShell (Windows)

```powershell
cd packages/importer; npm run build; npm publish --access public; cd ../..
cd packages/aliases/universal-csv-importer; npm publish --access public; cd ../../..
```

### Option B – Bash / Git Bash

```bash
cd packages/importer && npm run build && npm publish --access public && cd ../..
cd packages/aliases/universal-csv-importer && npm publish --access public && cd ../../..
```

### Option C – Step by step

1. **Core:** `cd packages/importer` → `npm run build` → `npm publish --access public` → `cd ../..`
2. **Alias:** `cd packages/aliases/universal-csv-importer` → `npm publish --access public` → `cd ../../..`

### After publish – verify

- https://www.npmjs.com/package/@pocket-portfolio/importer (v1.1.0)
- https://www.npmjs.com/package/@pocket-portfolio/universal-csv-importer (v1.0.0)
- **/admin/analytics** – NPM section shows 11 packages including `@pocket-portfolio/universal-csv-importer`.

---

## References

- Implementation report: `docs/UNIVERSAL-IMPORT-IMPLEMENTATION-REPORT.md`
- Core importer: `packages/importer/`
- Alias: `packages/aliases/universal-csv-importer/`
