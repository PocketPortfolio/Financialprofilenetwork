#!/usr/bin/env node
'use strict';
/**
 * Remove stale Git lock files so commits/push work (e.g. after OneDrive or IDE
 * leaves index.lock behind). Run before deploy or when you see "Another git
 * process seems to be running".
 *
 * Usage: node scripts/ensure-git-unlocked.js
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gitDir = path.join(root, '.git');

const locks = ['index.lock', 'HEAD.lock', 'refs/heads/main.lock'];

let removed = 0;
for (const name of locks) {
  const lockPath = path.join(gitDir, name);
  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath);
      console.log('Removed', lockPath);
      removed++;
    } catch (e) {
      console.error('Could not remove', lockPath, e.message);
      process.exit(1);
    }
  }
}

if (removed === 0) {
  console.log('No stale Git lock files found.');
} else {
  console.log('Git unlock complete. You can commit/push now.');
}
