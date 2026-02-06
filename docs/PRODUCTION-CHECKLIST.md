# Production deployment checklist

Use this before deploying to production.

## Pre-deploy

- [ ] **Build** – `npm run build` (sitemaps + inject-firebase + next build)
- [ ] **Lint** – `npm run lint` (must pass)
- [ ] **Env** – Ensure production env vars are set (see below)

## Environment variables (production)

### Required for core app
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` – Sponsor/checkout
- `STRIPE_SECRET_KEY` – Checkout session creation
- `STRIPE_WEBHOOK_SECRET` – Stripe webhooks
- Firebase: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` – Auth, API keys, scarcity count

### Optional (features still work without them)
- **Search miss log & ticker votes** – `SUPABASE_SALES_DATABASE_URL`  
  If unset: zero-result searches are not logged; “Vote for this ticker” will 500. Run migration for tables `search_miss_log` and `ticker_votes`:  
  `npx drizzle-kit push` (or your migrate command) using the same DB.
- **Scarcity API** – Uses Firebase `apiKeys` count. If Firebase is missing, `/api/scarcity` returns a safe fallback (482/500 Batch 1).

## Database migrations

If using the sales DB (search miss log, ticker votes):

```bash
npx drizzle-kit push
# or
npx drizzle-kit migrate
```

Migration files live in `drizzle/sales/`. Schema: `db/sales/schema.ts`.

## Post-deploy

- [ ] Sponsor page loads and Stripe shows “Stripe Ready”
- [ ] CSV download opens upsell modal, then “Continue to CSV Download” works
- [ ] Search with no results shows “We don’t have X yet” and vote form (if DB configured)
- [ ] `/api/scarcity` returns JSON (sponsor page FOMO counter)

## Notes

- **Typecheck** – `npm run typecheck` may fail in test files (ThemeSwitcher.test, import specs); app source compiles.
- **Console logs** – Client-side debug logs in TickerSearch and sponsor page are gated to `NODE_ENV === 'development'`.
- **Next.js workspace warning** – If you see “multiple lockfiles”, you can set `outputFileTracingRoot` in `next.config.js` to the app root to silence it.
