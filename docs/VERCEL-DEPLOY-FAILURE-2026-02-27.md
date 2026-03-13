# Vercel deployment failure â€” 2026-02-27

**Status:** Caused by **active Vercel platform incident** (elevated deployment/function failures). Our project uses Middleware, which is deployed globally, so we are affected in all regions (including iad1) even though the incident is primarily in Dubai (dxb1). Build succeeds; deployment fails during **Deploying outputs…** with "We encountered an internal error."

---

## What happens

1. **Build:** Runs in `iad1` (Washington, D.C.). All steps complete:
   - `npm ci` â†’ importer â†’ sitemaps (77,157 URLs, 37 files) â†’ inject-firebase â†’ book-assets â†’ `next build`
   - Next.js: 2,806 static pages, serverless functions, static files collected
   - **Build Completed in /vercel/output [~5m]**
2. **Deploy phase:** "Deploying outputs..." starts; ~25â€“30 seconds later:
   - **Error: We encountered an internal error. Please try again.**

Failure is **after** the build, during Vercel's upload/registration of the output. Repo and build are unchanged from previously successful deploys.

---

## What we've tried

- Multiple redeploys (same error).
- Enabling Next.js `output: 'standalone'` and redeploying (same error; reverted).

---

## Root cause (from Vercel support, 2026-02-27)

- **Incident:** Elevated deployment and function invocation failures; primary region Dubai (dxb1).
- **Why we're affected:** This project uses **Middleware**. Middleware is deployed **globally** for production, so deployments with Middleware are impacted in **all regions** (including iad1).
- **Action:** Monitor [vercel.com/status](https://vercel.com/status); retry deploy (some are succeeding after mitigations). If urgent, promote a recent successful **preview** deployment to production.

---

## Recommended next steps

1. **Accept support case** (if offered) so Vercel can track this project and ensure it's unblocked when the incident is fully resolved.
2. **Retry deploy** â€” mitigations are in place; redeploy (CLI or Dashboard, with or without "Clear build cache").
3. **If still failing and urgent:** Promote a recent successful **preview** deployment to production (Dashboard â†’ Deployments â†’ … on a green preview â†’ Promote to Production).
4. **Monitor:** [status.vercel.com](https://www.vercel.com/status) until the incident is resolved.

---

*Doc updated with incident root cause from Vercel support. Archive when deployments succeed consistently.*
