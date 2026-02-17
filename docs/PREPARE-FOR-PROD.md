# Prepare for production

Quick checklist before deploying.

## 1. Build

```bash
npm run build
```

Resolves to: `build:importer` → `build:sitemaps` → `build:inject-firebase` → `next build`. Fix any TypeScript or lint errors.

## 2. Environment (Vercel / host)

- **Do not set** `NEXT_PUBLIC_ENABLE_DEBUG_ANALYTICS` in production (or set to `false`).  
  Debug ingest is gated behind this; leaving it unset keeps it off.
- Use `.env.example` as reference; see `VERCEL-ENV-SUPPORT-ADMIN.md` for required Vercel vars (Firebase, Resend, admin override).

## 3. Debug instrumentation

- App code that talks to the debug ingest endpoint is guarded by `NEXT_PUBLIC_ENABLE_DEBUG_ANALYTICS === 'true'` (e.g. `CSVImporter`, `UnknownBrokerInterstitial`, `debugAnalytics.ts`).
- Scripts under `scripts/` (e.g. predator-probe, queue monitors) may reference the ingest URL; they are for local/debug use only and are not part of the Next.js app bundle.

## 4. Optional pre-deploy checks

- `npm run typecheck`
- `npm run lint`
- `npm run test` (if you run tests before deploy)
