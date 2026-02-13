# Deploying the Book to Production

## Quick deploy

From the repo root:

```bash
node scripts/deploy-book-to-prod.js
```

This script:

1. **Removes stale `.git/index.lock`** so Git can run (fixes "Another git process seems to be running" when no other process is).
2. Stages all book-related paths (app/book, app/api/book-assets, docs/book, content, etc.).
3. Commits with message: `Deploy: Universal LLM Import book and Sovereign Serial to prod`.
4. Pushes to `main`, which triggers the **Deploy to Vercel** workflow and deploys to production.

Dry run (stage only, no commit/push):

```bash
node scripts/deploy-book-to-prod.js --dry-run
```

## If Git still fails: lock or permission errors

- **"index.lock exists"**  
  Run `npm run ensure-git-unlocked` (or `node scripts/ensure-git-unlocked.js`), then retry.  
  Or delete manually: `rm .git/index.lock` (or `del .git\index.lock` on Windows).  
  The deploy script removes the lock automatically; if it persists, another process (IDE, OneDrive) may be holding the lock.

- **Repo under OneDrive**  
  OneDrive can lock `.git` and cause "Permission denied" or "Invalid argument" when Git writes objects.  
  - Close other apps using the repo (Cursor/VS Code, other terminals).  
  - Optionally pause OneDrive sync for this folder, or exclude the `.git` folder from sync, then run the deploy again.

- **Manual deploy**  
  After fixing the lock, stage and push manually:

  ```bash
  git add app/book/ app/api/book-assets/ app/api/ai/ docs/book/ content/coderlegion-sovereign-serial/ content/posts/sovereign-serial-*.mdx public/book-assets/ scripts/copy-book-assets.js scripts/verify-book-assets.js
  git commit -m "Deploy: Universal LLM Import book and Sovereign Serial to prod"
  git push origin main
  ```

## After push

- GitHub Actions runs **Deploy to Vercel** (see the Actions tab).
- Book URL when deploy is live: **https://www.pocketportfolio.app/book/universal-llm-import**
