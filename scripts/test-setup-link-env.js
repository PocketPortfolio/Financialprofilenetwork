/**
 * Test setup-link env and Resend: load .env.local and send one setup-link email.
 * Usage: node scripts/test-setup-link-env.js [your@email.com]
 * Default recipient: test@example.com (Resend may only deliver to verified addresses in dev).
 */
const path = require('path');
const fs = require('fs');

// Load .env.local then .env (same order as Next.js)
const root = path.resolve(__dirname, '..');
const envLocal = path.join(root, '.env.local');
const envFile = path.join(root, '.env');
[envLocal, envFile].forEach((file) => {
  if (fs.existsSync(file)) {
    require('dotenv').config({ path: file });
  }
});

const email = process.argv[2] || 'test@example.com';

if (!process.env.RESEND_API_KEY) {
  console.error('FAIL: RESEND_API_KEY is not set. Add it to .env.local');
  process.exit(1);
}

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';
const dashboardUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app').replace(/\/$/, '') + '/dashboard';

const subject = 'Your Pocket Portfolio setup link — open on desktop';
const html = `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1f2937;">
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Pocket Portfolio is a desktop-grade pro tool. Use the link below to open the app on your computer and get started.</p>
    <p style="margin:24px 0;">
      <a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Open Pocket Portfolio on desktop</a>
    </p>
    <p style="font-size:14px;color:#6b7280;margin-top:24px;">If you didn't request this, you can ignore this email.</p>
    <p style="font-size:12px;color:#9ca3af;margin-top:32px;">Pocket Portfolio — local-first portfolio tracking.</p>
  </div>
`;

async function main() {
  console.log('Env check: RESEND_API_KEY set, MAIL_FROM =', from);
  console.log('Sending setup-link email to:', email);
  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject,
    html,
    tags: [{ name: 'campaign', value: 'stack_reveal' }],
  });
  if (error) {
    console.error('FAIL:', error.message);
    process.exit(1);
  }
  console.log('OK: Email sent. Resend id:', data?.id);
}

main();
