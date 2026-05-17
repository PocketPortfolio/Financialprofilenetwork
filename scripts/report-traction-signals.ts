/**
 * Read-only traction signal reporter for Salford Totality Seed Deck v4.
 *
 * Pulls, from production Firebase:
 *   1. Total Firebase Auth users (all-time)
 *   2. Users created since product launch (Oct 2025)
 *   3. Users created since paywall launch (Feb 2026)
 *   4. Paying subscribers (apiKeys / apiKeysByEmail) by tier
 *   5. Paying subscribers created since Feb 2026 paywall launch
 *
 * READ-ONLY. No writes, no mutations. Prints a single artifact-backed table.
 *
 * Usage:
 *   npx tsx scripts/report-traction-signals.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    try {
      const envPath = resolve(process.cwd(), envFile);
      const envContent = readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      let currentKey: string | null = null;
      let currentValue: string[] = [];
      let inQuotedValue = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!currentKey && (!trimmed || trimmed.startsWith('#'))) continue;

        if (currentKey) {
          if (inQuotedValue && trimmed.endsWith('"')) {
            currentValue.push(line.slice(0, -1));
            const finalValue = currentValue.join('\n');
            const cleanValue = finalValue.startsWith('"') ? finalValue.slice(1) : finalValue;
            process.env[currentKey] = cleanValue.replace(/\\n/g, '\n');
            currentKey = null;
            currentValue = [];
            inQuotedValue = false;
          } else {
            currentValue.push(line);
          }
          continue;
        }

        const equalIndex = trimmed.indexOf('=');
        if (equalIndex <= 0) continue;
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1);

        if (value.trim().startsWith('"') && !value.trim().endsWith('"')) {
          currentKey = key;
          inQuotedValue = true;
          currentValue = [value.trim().slice(1)];
        } else {
          value = value.trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (key === 'FIREBASE_PRIVATE_KEY') value = value.replace(/\\n/g, '\n');
          if (!process.env[key]) process.env[key] = value;
        }
      }
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) break;
    } catch (e: any) {
      if (e.code !== 'ENOENT') {/* swallow */}
    }
  }
}

loadEnvFile();

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('Missing Firebase Admin credentials in .env.local');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const LAUNCH = new Date('2025-10-01T00:00:00Z');
const PAYWALL = new Date('2026-02-01T00:00:00Z');
const NOW = new Date();

function fmt(n: number): string {
  return n.toLocaleString('en-GB');
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function reportAuthSignups() {
  const auth = getAuth();
  let total = 0;
  let sinceLaunch = 0;
  let sincePaywall = 0;
  const byMonth: Record<string, number> = {};

  let nextPageToken: string | undefined;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const u of result.users) {
      total++;
      const created = u.metadata.creationTime ? new Date(u.metadata.creationTime) : null;
      if (created) {
        const k = monthKey(created);
        byMonth[k] = (byMonth[k] || 0) + 1;
        if (created >= LAUNCH) sinceLaunch++;
        if (created >= PAYWALL) sincePaywall++;
      }
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return { total, sinceLaunch, sincePaywall, byMonth };
}

async function reportSubscriptions() {
  const db = getFirestore();

  // apiKeysByEmail = canonical per-email tier record
  const byEmailSnap = await db.collection('apiKeysByEmail').get();
  const tierCounts: Record<string, number> = {};
  const paidSinceLaunch: Record<string, number> = {};
  const paidSincePaywall: Record<string, number> = {};
  let totalCanonical = 0;
  let manuallyGranted = 0;

  byEmailSnap.forEach((doc) => {
    totalCanonical++;
    const d = doc.data() as any;
    const tier = d.tier || 'none';
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    if (d.manuallyGranted === true) manuallyGranted++;

    // Created timestamp may be Firestore Timestamp or Date
    let created: Date | null = null;
    if (d.createdAt) {
      if (typeof d.createdAt.toDate === 'function') created = d.createdAt.toDate();
      else if (d.createdAt instanceof Date) created = d.createdAt;
      else if (typeof d.createdAt === 'string') created = new Date(d.createdAt);
      else if (d.createdAt._seconds) created = new Date(d.createdAt._seconds * 1000);
    }

    // Count as "paying" if tier is anything other than 'none' or null
    const isPaying = tier && tier !== 'none';
    if (isPaying && created) {
      if (created >= LAUNCH) paidSinceLaunch[tier] = (paidSinceLaunch[tier] || 0) + 1;
      if (created >= PAYWALL) paidSincePaywall[tier] = (paidSincePaywall[tier] || 0) + 1;
    }
  });

  // apiKeys = per-session records, useful for GROSS checkout-count including repeats
  const apiKeysSnap = await db.collection('apiKeys').get();
  let totalSessions = 0;
  let sessionsSincePaywall = 0;
  const sessionTierCounts: Record<string, number> = {};
  apiKeysSnap.forEach((doc) => {
    totalSessions++;
    const d = doc.data() as any;
    const tier = d.tier || 'unknown';
    sessionTierCounts[tier] = (sessionTierCounts[tier] || 0) + 1;
    let created: Date | null = null;
    if (d.createdAt) {
      if (typeof d.createdAt.toDate === 'function') created = d.createdAt.toDate();
      else if (d.createdAt instanceof Date) created = d.createdAt;
      else if (typeof d.createdAt === 'string') created = new Date(d.createdAt);
      else if (d.createdAt._seconds) created = new Date(d.createdAt._seconds * 1000);
    }
    if (created && created >= PAYWALL) sessionsSincePaywall++;
  });

  return {
    totalCanonical,
    manuallyGranted,
    tierCounts,
    paidSinceLaunch,
    paidSincePaywall,
    totalSessions,
    sessionsSincePaywall,
    sessionTierCounts,
  };
}

(async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  POCKET PORTFOLIO — TRACTION SIGNALS (live Firebase read)');
  console.log(`  Report generated: ${NOW.toISOString()}`);
  console.log(`  Launch anchor: ${LAUNCH.toISOString().slice(0, 10)}`);
  console.log(`  Paywall anchor: ${PAYWALL.toISOString().slice(0, 10)}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('[1/2] Firebase Auth signups…');
  const auth = await reportAuthSignups();
  console.log(`  Total authenticated signups (all-time): ${fmt(auth.total)}`);
  console.log(`  Signups since launch (Oct 2025):       ${fmt(auth.sinceLaunch)}`);
  console.log(`  Signups since paywall (Feb 2026):      ${fmt(auth.sincePaywall)}`);
  console.log('\n  Monthly signup breakdown:');
  const months = Object.keys(auth.byMonth).sort();
  for (const m of months) {
    const bar = '█'.repeat(Math.min(40, auth.byMonth[m]));
    console.log(`    ${m}  ${String(auth.byMonth[m]).padStart(5)}  ${bar}`);
  }

  console.log('\n[2/2] Firestore subscriptions (apiKeysByEmail + apiKeys)…');
  const subs = await reportSubscriptions();
  console.log(`  Canonical email records (apiKeysByEmail): ${fmt(subs.totalCanonical)}`);
  console.log(`  Of which manually granted (founders):     ${fmt(subs.manuallyGranted)}`);
  console.log('\n  Tier distribution (canonical):');
  for (const [tier, count] of Object.entries(subs.tierCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(tier).padEnd(25)} ${String(count).padStart(5)}`);
  }
  console.log('\n  Paying-tier acquisitions since launch (Oct 2025):');
  for (const [tier, count] of Object.entries(subs.paidSinceLaunch).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(tier).padEnd(25)} ${String(count).padStart(5)}`);
  }
  console.log('\n  Paying-tier acquisitions since paywall (Feb 2026):');
  for (const [tier, count] of Object.entries(subs.paidSincePaywall).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(tier).padEnd(25)} ${String(count).padStart(5)}`);
  }
  console.log('\n  Gross checkout sessions (apiKeys, includes repeats):');
  console.log(`    Total sessions:                 ${fmt(subs.totalSessions)}`);
  console.log(`    Sessions since paywall Feb 2026: ${fmt(subs.sessionsSincePaywall)}`);
  console.log('\n  Session tier distribution:');
  for (const [tier, count] of Object.entries(subs.sessionTierCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(tier).padEnd(25)} ${String(count).padStart(5)}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DECK-READY LINES (artifact-backed):');
  console.log('═══════════════════════════════════════════════════════════════');
  const totalPaying = Object.entries(subs.tierCounts)
    .filter(([t]) => t !== 'none' && t !== 'unknown')
    .reduce((a, [, c]) => a + c, 0);
  const payingSincePaywall = Object.values(subs.paidSincePaywall).reduce((a, b) => a + b, 0);
  console.log(`  Slide 9 (B2C pipeline): ${fmt(auth.total)} authenticated signups to date`);
  console.log(`  Slide 9 (since launch): ${fmt(auth.sinceLaunch)} signups since Oct 2025`);
  console.log(`  Slide 9 (paywall):      ${fmt(totalPaying)} paying users across all tiers`);
  console.log(`  Slide 9 (paywall new):  ${fmt(payingSincePaywall)} paying acquisitions since Feb 2026 paywall launch`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(0);
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
