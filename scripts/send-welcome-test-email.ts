/**
 * Send one Welcome (Week 0) test email.
 * Usage: npx tsx scripts/send-welcome-test-email.ts [email]
 * Default: abbalawal22s@gmail.com
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
  const { buildWelcomeEmailHtml, getUnsubscribeUrl, WELCOME_SUBJECT } = await import('../lib/stack-reveal/email-templates');
  const { sendStackRevealEmail } = await import('../lib/stack-reveal/resend');

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  console.log(`Sending Welcome (Week 0) test email to ${targetEmail}...`);

  const html = buildWelcomeEmailHtml({
    greeting: 'Hi there,',
    unsubscribeUrl: getUnsubscribeUrl('test'),
  });
  const result = await sendStackRevealEmail(targetEmail, WELCOME_SUBJECT, html, getUnsubscribeUrl('test'));

  if (result.error) {
    console.error('FAILED:', result.error);
    process.exit(1);
  }
  console.log('Sent. Id:', result.id);
}

main();
