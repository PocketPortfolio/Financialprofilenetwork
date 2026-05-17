## NPM publish runner (no GitHub Actions)

This repo’s npm org policy requires automation credentials for publishing. If you can’t use GitHub Actions, run a small always-on runner and let Vercel Cron call it.

### Runner requirements

- **Installed**: `git`, `node` (>=20), `npm`
- **Repo checkout**: this repository checked out on disk
- **Env vars**:
  - `NPM_TOKEN`: npm **granular** automation token allowed to publish under org 2FA policy
  - `NPM_PUBLISH_RUNNER_SECRET`: shared secret between Vercel and runner
  - `REPO_DIR`: absolute path to the checked out repo
  - `PORT`: runner port (default `8787`)

### Start runner

From the repo checkout:

```bash
node scripts/publish-importer-runner.mjs
```

Expose it via HTTPS (recommended) behind your reverse proxy, e.g. `https://runner.yourdomain.com/publish`.

### Vercel Cron integration

Set these Vercel env vars:

- `NPM_PUBLISH_RUNNER_URL` = `https://runner.yourdomain.com/publish`
- `NPM_PUBLISH_RUNNER_SECRET` = same value as runner’s `NPM_PUBLISH_RUNNER_SECRET`
- `CRON_SECRET` = existing Pocket Portfolio cron secret

Cron route:

- `GET /api/cron/publish-importer` (requires `Authorization: Bearer $CRON_SECRET`)

### Security notes

- Never log `NPM_TOKEN`.
- Keep the runner off the public internet if possible (VPN, IP allowlist).
- Rotate `NPM_PUBLISH_RUNNER_SECRET` periodically.

