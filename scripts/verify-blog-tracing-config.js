#!/usr/bin/env node
/**
 * GUARDRAIL: Asserts that next.config.js includes the required outputFileTracingIncludes
 * for the zero-touch blog engine. If these are removed, the blog listing and post pages
 * will show empty / break in production (serverless bundle won't contain content/posts).
 *
 * Run in CI (e.g. before deploy or in pre-commit) to prevent regression.
 * See docs/ZERO-TOUCH-BLOG-VERIFICATION.md
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'next.config.js');
const config = fs.readFileSync(configPath, 'utf8');

const required = [
  { name: 'outputFileTracingIncludes', reason: 'Required for blog/serverless bundle' },
  { name: "'/api/blog/posts'", reason: 'Blog listing API must include content/posts' },
  { name: "'./content/posts/**'", reason: 'MDX files must be in serverless bundle' },
  { name: "'/blog'", reason: 'Post pages must include content/posts and calendars' },
  { name: 'blog-calendar.json', reason: 'Blog page needs calendar for slug resolution' },
];

let failed = false;
for (const { name, reason } of required) {
  if (!config.includes(name)) {
    console.error(`❌ GUARDRAIL FAIL: next.config.js is missing: ${name}`);
    console.error(`   Reason: ${reason}`);
    failed = true;
  }
}

if (failed) {
  console.error('\n→ Do not remove or rename these. See docs/ZERO-TOUCH-BLOG-VERIFICATION.md');
  process.exit(1);
}

console.log('✅ Blog tracing guardrail: next.config.js has required outputFileTracingIncludes for blog.');
process.exit(0);
