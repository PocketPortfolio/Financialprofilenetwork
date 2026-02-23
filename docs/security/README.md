# Security documentation

## Required GitHub Actions secrets

Configure these in **Settings → Secrets and variables → Actions**. Do not commit values.

| Secret | Used by |
|--------|---------|
| VERCEL_TOKEN | deploy.yml, ci.yml (deploy-production), test-deploy.yml, generate-blog.yml, import-syndication.yml, diagnostic.yml |
| VERCEL_ORG_ID | deploy.yml, ci.yml, test-deploy.yml, generate-blog.yml, import-syndication.yml, diagnostic.yml |
| VERCEL_PROJECT_ID | deploy.yml, ci.yml, test-deploy.yml, generate-blog.yml, import-syndication.yml, diagnostic.yml |
| NEXT_PUBLIC_FIREBASE_API_KEY | ci.yml (build, deploy-preview) |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | ci.yml |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | ci.yml |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | ci.yml |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | ci.yml |
| NEXT_PUBLIC_FIREBASE_APP_ID | ci.yml |
| NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID | ci.yml |
| ENCRYPTION_SECRET | ci.yml (build, deploy-preview) |
| SUPABASE_SALES_DATABASE_URL | autonomous-revenue-engine.yml, autonomous-revenue-engine-health-check.yml |
| OPENAI_API_KEY | autonomous-revenue-engine.yml, generate-blog.yml, import-syndication.yml |
| RESEND_API_KEY | autonomous-revenue-engine.yml |
| GITHUB_TOKEN | (provided by Actions) deploy.yml (PR comment), autonomous-revenue-engine.yml, generate-blog.yml, import-syndication.yml |
| PRODUCTHUNT_API_TOKEN | autonomous-revenue-engine.yml |
| CRUNCHBASE_API_KEY | autonomous-revenue-engine.yml |
| TWITTER_BEARER_TOKEN | autonomous-revenue-engine.yml |
| SALES_PROXY_URL | autonomous-revenue-engine.yml |
| EMERGENCY_STOP | autonomous-revenue-engine.yml (optional) |
| SALES_RATE_LIMIT_PER_DAY | autonomous-revenue-engine.yml (optional) |
| KV_REST_API_URL | autonomous-revenue-engine.yml |
| KV_REST_API_TOKEN | autonomous-revenue-engine.yml |
| YOUTUBE_API_KEY | generate-blog.yml |
| NEXT_PUBLIC_GA_MEASUREMENT_ID | lighthouse-ci.yml |
| LHCI_GITHUB_APP_TOKEN | lighthouse-ci.yml |
| ZAP_TARGET_URL | zap-baseline.yml (optional; default: https://pocketportfolio.app) |

## Production deploy

Production deploy runs from **deploy.yml** on push to `main`. The **ci.yml** workflow also has a `deploy-production` job on push to main; both use Vercel. deploy.yml is the primary automated deployment path; ci.yml’s deploy-production job provides a second path. Do not remove or change triggers without an explicit product decision.

## ZAP baseline

OWASP ZAP baseline runs weekly (Monday 07:00 UTC) and on `workflow_dispatch`. It targets `secrets.ZAP_TARGET_URL` if set, otherwise https://pocketportfolio.app.

## .env verification checklist

To confirm `.env` files are not tracked by git, run:

```bash
git ls-files --cached -- .env .env.local .env.*
```

Expected: no output (or only `.env.example` if you explicitly track it). If any `.env` or `.env.production.local` is listed, remove it from the index, ensure `.gitignore` covers it, and rotate any exposed secrets.

## Code scanning (CodeQL)

**Fixed in this repo (no business logic change):**
- **Server-side request forgery (SSRF):** Ticker/symbol from request is allowlisted via `app/lib/utils/sanitizeTicker.ts` before use in any `fetch()` URL in `app/api/dividend/route.ts`, `app/api/dividend/test-sources/route.ts`, `app/lib/services/sectorApiService.ts`.
- **Polynomial regular expression (ReDoS):** Email length capped at 254 in `lib/sales/email-validation.ts` before regex; angle-bracket email extraction in `app/api/agent/webhooks/resend/route.ts` changed from `/<(.+)>/` to `/<([^>]+)>/`.

**Triage remaining findings:** Open [Security → Code scanning](https://github.com/PocketPortfolio/Financialprofilenetwork/security/code-scanning), filter by Open / Severity / Rule. Fix by: adding validation or allowlists for user input that reaches dangerous sinks (fetch, regex, DOM), or close as "Won't fix" / "False positive" with a short note. Export the list (e.g. CSV) to fix by rule in batch.

## Branch protection (GitHub UI)

In **Settings → Branches**, configure branch protection for `main` (and optionally `develop`): require a pull request before merge, and require status checks (e.g. CI, dependency-review, gitleaks, codeql) to pass. This is repository policy only; no workflow or code changes required.
