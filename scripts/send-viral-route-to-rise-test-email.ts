/**
 * Test send: "Route to Rise" — CEO V3 (masthead + milestone + callout + founder sign-off).
 * HTML-only Resend payload (no `text`): clean-room test so clients render the styled body.
 *
 * Usage:
 *   npx ts-node --project scripts/tsconfig.json scripts/send-viral-route-to-rise-test-email.ts [to-email] [firstName]
 *
 * Env: RESEND_API_KEY (required).
 * Optional: VIRAL_ROUTE_TO_RISE_FROM, EMAIL_LOGO_URL
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  buildViralMomentAnnounceHtml,
  getViralMomentAnnounceFrom,
  VIRAL_MOMENT_ANNOUNCE_SUBJECT,
} from '@/lib/marketing/viral-moment-announce-email';

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
  const firstName = process.argv[3]?.trim() || '';

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  const from = getViralMomentAnnounceFrom();

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = buildViralMomentAnnounceHtml(firstName);

  console.log(
    `Sending Route to Rise (HTML-only) to ${to} from ${from} (greeting: ${firstName || 'Sovereign User'})...`
  );

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: VIRAL_MOMENT_ANNOUNCE_SUBJECT,
    html,
    tags: [{ name: 'campaign', value: 'viral_moment_v1_html_only_test' }],
  } as any);

  if (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }
  console.log('Sent. Resend id:', data?.id);
}

main();
