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

const UTM =
  'utm_source=email_campaign&utm_medium=email&utm_campaign=zero_trust_founders';
const BASE = 'https://www.pocketportfolio.app';
const CHALLENGE_URL = `${BASE}/challenge?${UTM}`;
const SPONSOR_URL = `${BASE}/sponsor?${UTM}`;

const SUBJECT = "Why we don't want your data (and how you can help).";

function buildHtml(firstName: string): string {
  const greeting = firstName.trim() ? `Hi ${firstName},` : 'Hi there,';
  const amber = '#f59e0b';
  const cta = (href: string, label: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
  <tr>
    <td style="border-radius:8px;background:${amber};">
      <a href="${href}" target="_blank" rel="noopener noreferrer"
        style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:700;color:#000000;text-decoration:none;border-radius:8px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Take the Zero-Trust Architecture Challenge...</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e2e8f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cbd5e1;">
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                You trust Pocket Portfolio to track and analyze your financial life. We take that seriously.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                In an era where most FinTech wrappers are secretly uploading your entire transaction history to centralized cloud servers, we built Pocket Portfolio on a different principle: <strong>Sanitization by Construction</strong>. Instead of moving your data to the AI, we move the reasoning to your data. Only a Sanitized Snapshot (like your top holdings) ever crosses the wire to our API; your raw ledger rows stay completely local.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                We believe this is the future of secure finance, but we want you to verify it for yourself. Today, we are launching the <strong>Zero-Trust Architecture Challenge</strong>—an interactive matrix designed to show you exactly how our privacy boundary works.
              </p>
              ${cta(CHALLENGE_URL, 'Take the Architecture Challenge')}
              <h2 style="margin:28px 0 12px;font-size:17px;color:#0f172a;">The Founders Club Pivot</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                Building sovereign, local-first infrastructure is hard. The reason most companies steal and sell your data is because it’s a cheap way to fund their business.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                We refuse to do that. Our business model is simple: we build secure, world-class tools, and we are funded directly by the users who value their privacy.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                If you believe in what we are building, we are inviting you to upgrade to the Pocket Portfolio Founders Club.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e293b;">
                For £12/mo (or £100/yr), you get full access to our LLM-powered Universal Importer, advanced Portfolio Risk (Beta) metrics, and you directly fund the open-source Sovereign Intelligence movement.
              </p>
              ${cta(SPONSOR_URL, 'Join the Founders Club')}
              <p style="margin:24px 0 0;font-size:16px;line-height:1.6;color:#1e293b;">
                Thanks for backing a private financial future.
              </p>
              <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#1e293b;">
                Best,<br/>Abba &amp; The Pocket Portfolio Team
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
                <a href="${BASE}/stack-reveal" style="color:#d97706;font-weight:600;">Email preferences</a>
                · <a href="${BASE}" style="color:#64748b;">pocketportfolio.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function main() {
  const to = process.argv[2]?.trim() || 'abbalawal22s@gmail.com';
  const firstName = process.argv[3]?.trim() || '';

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';

  console.log(`Sending Sovereign Challenge campaign test to ${to}...`);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: SUBJECT,
    html: buildHtml(firstName),
    tags: [{ name: 'campaign', value: 'zero_trust_founders_test' }],
  } as any);

  if (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }
  console.log('Sent. Resend id:', data?.id);
}

main();
