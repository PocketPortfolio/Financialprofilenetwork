/**
 * Send one test email for the Sovereign Challenge / Founders Club marketing campaign (runbook v2).
 * Uses Resend; same env as other email scripts (RESEND_API_KEY, optional MAIL_FROM).
 *
 * Usage: npx ts-node --project scripts/tsconfig.json scripts/send-sovereign-challenge-campaign-test.ts [email]
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

  const { Resend } = await import('resend');
  const { buildSovereignCampaignHtml, SOVEREIGN_CAMPAIGN_SUBJECT } = await import(
    '../lib/sovereign-campaign/email-templates'
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';

  console.log(`Sending Sovereign Challenge campaign test to ${to}...`);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: SOVEREIGN_CAMPAIGN_SUBJECT,
    html: buildSovereignCampaignHtml(firstName),
    tags: [{ name: 'campaign', value: 'zero_trust_founders_test' }],
  } as any);

  if (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }
  console.log('Sent. Resend id:', data?.id);
}

main();
