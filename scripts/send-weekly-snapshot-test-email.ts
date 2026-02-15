/**
 * Send one Weekly Snapshot test email (mock data: +2.5%, top gainer AAPL).
 * Usage: npx ts-node --project scripts/tsconfig.json scripts/send-weekly-snapshot-test-email.ts [email]
 * Or: npm run weekly-snapshot:send-test -- <email>
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    try {
      const path = resolve(process.cwd(), f);
      const content = readFileSync(path, 'utf-8');
      for (const line of content.split('\n')) {
        const i = line.indexOf('=');
        if (i <= 0 || line.trim().startsWith('#')) continue;
        const key = line.slice(0, i).trim();
        let val = line.slice(i + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (key === 'FIREBASE_PRIVATE_KEY') val = val.replace(/\\n/g, '\n');
        if (!process.env[key]) process.env[key] = val;
      }
    } catch {}
  }
}
loadEnv();

const targetEmail = process.argv[2] || process.env.STACK_REVEAL_TEST_EMAIL;
if (!targetEmail) {
  console.error('Usage: npm run weekly-snapshot:send-test -- <email>');
  process.exit(1);
}

async function main() {
  const { getGreeting } = await import('../lib/stack-reveal/email-templates');
  const {
    buildWeeklySnapshotHtml,
    getWeeklySnapshotSubject,
    getWeeklySnapshotUnsubscribeUrl,
  } = await import('../lib/weekly-snapshot/email-templates');
  const { sendWeeklySnapshotEmail } = await import('../lib/stack-reveal/resend');

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  console.log(`Sending Weekly Snapshot test email to ${targetEmail}...`);

  const greeting = getGreeting('Test User', 'Test', true);
  const baseUrl = process.env.EMAIL_ASSET_ORIGIN || 'https://www.pocketportfolio.app';
  const referralCode = 'REF-' + 'test-uid'.slice(0, 8).toUpperCase();
  const referralLink = `${baseUrl}/?ref=${encodeURIComponent(referralCode)}&source=weekly_snapshot&utm_source=weekly_snapshot&utm_medium=email&utm_campaign=referral`;
  const data = {
    hasData: true,
    percentChange: 2.5,
    topGainer: { ticker: 'AAPL', pct: 5.2 },
    isGreen: true,
  };
  const subject = getWeeklySnapshotSubject(data);
  const html = buildWeeklySnapshotHtml({
    greeting,
    uid: 'test-uid',
    referralLink,
    data,
  });
  const unsubUrl = getWeeklySnapshotUnsubscribeUrl('test-uid');

  const result = await sendWeeklySnapshotEmail(targetEmail!, subject, html, unsubUrl);

  if (result.error) {
    console.error('FAILED:', result.error);
    process.exit(1);
  }
  console.log('Sent. Id:', result.id);
}

main();