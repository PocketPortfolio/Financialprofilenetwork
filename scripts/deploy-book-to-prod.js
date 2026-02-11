#!/usr/bin/env node
'use strict';
/**
 * Deploy the Universal LLM Import book and Sovereign Serial to production.
 * - Removes stale .git/index.lock so Git works (e.g. after OneDrive or IDE lock).
 * - Stages book-related paths, commits, and pushes to main (triggers Vercel prod deploy).
 *
 * Usage: node scripts/deploy-book-to-prod.js [--dry-run]
 * --dry-run: only remove lock and stage; no commit or push.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const BOOK_PATHS = [
  'app/book/',
  'app/api/book-assets/',
  'app/api/ai/',
  'app/components/layout/ConditionalAppChrome.tsx',
  'docs/book/',
  'docs/SOVEREIGN-SERIAL-SCHEDULE.md',
  'docs/UNIVERSAL-LLM-IMPORT-TECHNICAL-SERIES.md',
  'scripts/copy-book-assets.js',
  'scripts/verify-book-assets.js',
  'scripts/copy-chapter-headers-from-uuids.js',
  'scripts/generate-chapter-header-svgs.js',
  'scripts/verify-book-images.js',
  'content/coderlegion-sovereign-serial/',
  'content/coderlegion-sovereign-serial.md',
  'content/posts/sovereign-serial-1-fragmentation-problem.mdx',
  'content/posts/sovereign-serial-2-csv-over-apis.mdx',
  'content/posts/sovereign-serial-3-local-first-browser.mdx',
  'content/posts/sovereign-serial-4-bifurcated-pipeline.mdx',
  'content/posts/sovereign-serial-5-three-row-snapshot.mdx',
  'content/posts/sovereign-serial-6-data-normalization.mdx',
  'content/posts/sovereign-serial-7-drive-dumb-storage.mdx',
  'content/posts/sovereign-serial-8-interface-uncertainty.mdx',
  'content/posts/sovereign-serial-9-universal-vs-plaid.mdx',
  'content/posts/sovereign-serial-10-security-threat-modeling.mdx',
  'content/posts/sovereign-serial-11-use-cases-client-etl.mdx',
  'content/posts/sovereign-serial-12-future-client-side-ai.mdx',
  'public/book-assets/',
  'tests/e2e/book-page.spec.ts',
  'scripts/deploy-book-to-prod.js',
  'docs/DEPLOY-BOOK.md',
];

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
}

function removeStaleLock() {
  const lockPath = path.join(root, '.git', 'index.lock');
  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath);
      console.log('Removed stale .git/index.lock');
    } catch (e) {
      console.error('Could not remove .git/index.lock:', e.message);
      process.exit(1);
    }
  }
}

function main() {
  removeStaleLock();

  const toAdd = BOOK_PATHS.filter((p) => {
    const full = path.join(root, p);
    return fs.existsSync(full);
  });

  if (!toAdd.length) {
    console.log('No book paths found to add.');
    return;
  }
  console.log('Staging book paths...');
  run(`git add ${toAdd.join(' ')}`);

  const status = execSync('git status --short', { cwd: root, encoding: 'utf8' });
  if (!status.trim()) {
    console.log('Nothing to commit (all book files already committed or unchanged).');
    if (!dryRun) console.log('Push with: git push origin main');
    return;
  }

  if (dryRun) {
    console.log('--dry-run: skipping commit and push.');
    console.log('Staged. Commit with: git commit -m "Deploy: Universal LLM Import book and Sovereign Serial to prod"');
    console.log('Then: git push origin main');
    return;
  }

  run('git commit -m "Deploy: Universal LLM Import book and Sovereign Serial to prod"');
  run('git push origin main');
  console.log('Pushed to main. Vercel production deploy will run from GitHub Actions.');
}

main();
