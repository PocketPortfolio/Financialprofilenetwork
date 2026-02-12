/**
 * Send all 4 Stack Reveal test emails to a given address (default abbalawal22s@gmail.com).
 * Usage: npx ts-node --project scripts/tsconfig.json scripts/send-stack-reveal-test-emails.ts [email]
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

const targetEmail = process.argv[2] || 'abbalawal22s@gmail.com';

async function main() {
  const { getSubject, buildHtmlForWeek, getUnsubscribeUrl } = await import('../lib/stack-reveal/email-templates');
  const { sendStackRevealEmail } = await import('../lib/stack-reveal/resend');

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  console.log(`Sending 4 Stack Reveal test emails to ${targetEmail}...\n`);

  for (let week = 1; week <= 4; week++) {
    if (week > 1) await new Promise((r) => setTimeout(r, 1100)); // Resend: 2 req/s max
    const subject = getSubject(week as 1 | 2 | 3 | 4);
    const html = buildHtmlForWeek(week as 1 | 2 | 3 | 4, {
      greeting: 'Hi there,',
      uid: 'test-review',
      isGoogleUser: true,
    });
    const result = await sendStackRevealEmail(targetEmail, subject, html, getUnsubscribeUrl('test-review'));
    if (result.error) {
      console.error(`Week ${week} FAILED:`, result.error);
    } else {
      console.log(`Week ${week} OK: "${subject}" -> ${result.id || 'sent'}`);
    }
  }

  console.log('\nDone. Check inbox at', targetEmail);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
