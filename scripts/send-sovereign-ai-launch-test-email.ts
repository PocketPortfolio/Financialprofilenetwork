/**
 * Test send: Sovereign AI Ask AI launch email (Legal-cleared copy).
 *
 * Usage:
 *   npm run sovereign-ai-launch:send-test
 *   npx ts-node --project scripts/tsconfig.json scripts/send-sovereign-ai-launch-test-email.ts [to-email] [firstName]
 *
 * Env: RESEND_API_KEY (required). Optional: SOVEREIGN_AI_LAUNCH_FROM, EMAIL_LOGO_URL
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  buildSovereignAiLaunchHtml,
  getSovereignAiLaunchFrom,
  SOVEREIGN_AI_LAUNCH_CAMPAIGN,
  SOVEREIGN_AI_LAUNCH_SUBJECT,
} from '@/lib/marketing/sovereign-ai-launch-email';

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
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        if (key === 'FIREBASE_PRIVATE_KEY') val = val.replace(/\\n/g, '\n');
        if (!process.env[key]) process.env[key] = val;
      }
    } catch {
      /* ignore */
    }
  }
}
loadEnv();

async function main() {
  const to = process.argv[2]?.trim() || 'abbalawal22s@gmail.com';
  const firstName = process.argv[3]?.trim() || 'Abba';

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  const from = getSovereignAiLaunchFrom();
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = buildSovereignAiLaunchHtml(firstName);

  console.log(
    `Sending Sovereign AI launch test to ${to} from ${from} (greeting: ${firstName || 'there'})...`,
  );

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: SOVEREIGN_AI_LAUNCH_SUBJECT,
    html,
    tags: [{ name: 'campaign', value: `${SOVEREIGN_AI_LAUNCH_CAMPAIGN}_test` }],
  } as any);

  if (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }
  console.log('Sent. Resend id:', data?.id);
}

main();
