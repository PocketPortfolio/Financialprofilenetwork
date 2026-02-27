/**
 * Send Day 2 and Day 4 drip emails to a given address (for testing).
 * Usage: node scripts/send-marketing-drip-test.js [email]
 * Default: abbalawal22s@gmail.com
 * Requires: .env.local with RESEND_API_KEY (and optionally NEXT_PUBLIC_APP_URL).
 */
const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..');
[path.join(root, '.env.local'), path.join(root, '.env')].forEach((file) => {
  if (fs.existsSync(file)) require('dotenv').config({ path: file });
});

const to = process.argv[2] || 'abbalawal22s@gmail.com';
const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app').replace(/\/$/, '');
const cta = (text) => `<p style="margin:24px 0 0;"><a href="${baseUrl}/dashboard" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${text}</a></p>`;

const day2Html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">You asked for a link to open Pocket Portfolio on desktop. Here's the next step: getting your trades into the app in under a minute.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Most brokers let you download a CSV of your history. Once you know where to click, it takes about 30 seconds.</p>
    <ul style="font-size:15px;line-height:1.7;margin:16px 0;padding-left:20px;color:#374151;">
      <li><strong>Trade Republic:</strong> Settings → Account → Export data → select "Transactions" → CSV. Upload the file in Pocket Portfolio's Import flow.</li>
      <li><strong>Robinhood:</strong> Account → Statements &amp; History → Export history → choose date range → CSV. Same: drag into the app.</li>
      <li><strong>Interactive Brokers:</strong> Reports → Activity → run a report → Export CSV. Import that file into Pocket Portfolio.</li>
    </ul>
    <p style="font-size:15px;line-height:1.6;margin-bottom:16px;">If your broker isn't listed, we support a universal CSV importer: one file, one format. No cloud upload—everything stays on your machine.</p>
    ${cta('Open Pocket Portfolio on desktop')}
    <p style="font-size:14px;color:#6b7280;margin-top:24px;">Once your CSV is in, you get local P&amp;L, allocation, and the rest of the toolkit. No spreadsheets, no sending data to a server.</p>
    <p style="font-size:14px;color:#6b7280;margin-top:16px;">Next email: why we built it this way (and why your data never has to leave your device).</p>
    <p style="font-size:12px;color:#9ca3af;margin-top:32px;">Pocket Portfolio — local-first portfolio tracking.</p>
  </div>`;

const day4Html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Quick question: would you email a spreadsheet of your full trade history to a random company?</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Most portfolio apps work that way. You upload your data to their servers. They store it, analyze it, and—in the fine print—often reserve the right to use it. Your ledger, their cloud.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Pocket Portfolio is different. Your data stays in your browser and, if you turn on sync, in your own Google Drive. We don't have a database of your holdings. We can't see your positions, your P&amp;L, or your history. The app runs on your device; we only send you the app and the emails you signed up for.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">That's not a feature—it's the product. Local-first means you keep control. No "we had a breach" letter. No selling anonymized trends. Just your numbers, on your machine.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">If that's the kind of tool you want for the long term, the next step is simple: open the app on desktop, import your CSV, and see the difference.</p>
    ${cta('Open Pocket Portfolio')}
    <p style="font-size:14px;color:#6b7280;margin-top:24px;">Thanks for reading. We'll keep sending short, useful updates—and nothing else.</p>
    <p style="font-size:12px;color:#9ca3af;margin-top:32px;">Pocket Portfolio — local-first portfolio tracking.</p>
  </div>`;

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error('FAIL: RESEND_API_KEY not set. Add to .env.local');
    process.exit(1);
  }
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';

  console.log('Sending test drip emails to:', to);
  const r2 = await resend.emails.send({
    from,
    to,
    subject: 'How to export your CSV in 30 seconds',
    html: day2Html,
    tags: [{ name: 'campaign', value: 'marketing_drip_day2' }],
  });
  if (r2.error) {
    console.error('Day 2 FAIL:', r2.error.message);
    process.exit(1);
  }
  console.log('Day 2 sent:', r2.data?.id);

  await new Promise((r) => setTimeout(r, 600));
  const r4 = await resend.emails.send({
    from,
    to,
    subject: 'Why local-first privacy matters',
    html: day4Html,
    tags: [{ name: 'campaign', value: 'marketing_drip_day4' }],
  });
  if (r4.error) {
    console.error('Day 4 FAIL:', r4.error.message);
    process.exit(1);
  }
  console.log('Day 4 sent:', r4.data?.id);
  console.log('Done. Check inbox for', to);
}

main();
