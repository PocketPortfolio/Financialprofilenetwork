/**
 * Marketing drip: Day 2 (Export Guide) and Day 4 (Privacy) emails for mobile setup-link leads.
 * Styling matches CLAUDE.md: accent #f59e0b, terminal/pro manual aesthetic.
 */

const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';
const BASE_URL = DASHBOARD_URL.replace(/\/$/, '');
const CTA_COLOR = '#f59e0b';

function wrapBody(inner: string): string {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    ${inner}
    <p style="font-size:12px;color:#9ca3af;margin-top:32px;">Pocket Portfolio — local-first portfolio tracking.</p>
  </div>`;
}

function ctaButton(text: string): string {
  return `<p style="margin:24px 0 0;"><a href="${BASE_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:${CTA_COLOR};color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${text}</a></p>`;
}

/** Day 2: Export guide — subject and HTML */
export const DAY2_SUBJECT = 'How to export your CSV in 30 seconds';

export function getDay2Html(): string {
  const inner = `
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">You asked for a link to open Pocket Portfolio on desktop. Here’s the next step: getting your trades into the app in under a minute.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Most brokers let you download a CSV of your history. Once you know where to click, it takes about 30 seconds.</p>
    <ul style="font-size:15px;line-height:1.7;margin:16px 0;padding-left:20px;color:#374151;">
      <li><strong>Trade Republic:</strong> Settings → Account → Export data → select “Transactions” → CSV. Upload the file in Pocket Portfolio’s Import flow.</li>
      <li><strong>Robinhood:</strong> Account → Statements &amp; History → Export history → choose date range → CSV. Same: drag into the app.</li>
      <li><strong>Interactive Brokers:</strong> Reports → Activity → run a report → Export CSV. Import that file into Pocket Portfolio.</li>
    </ul>
    <p style="font-size:15px;line-height:1.6;margin-bottom:16px;">If your broker isn’t listed, we support a universal CSV importer: one file, one format. No cloud upload—everything stays on your machine.</p>
    ${ctaButton('Open Pocket Portfolio on desktop')}
    <p style="font-size:14px;color:#6b7280;margin-top:24px;">Once your CSV is in, you get local P&amp;L, allocation, and the rest of the toolkit. No spreadsheets, no sending data to a server.</p>
    <p style="font-size:14px;color:#6b7280;margin-top:16px;">Next email: why we built it this way (and why your data never has to leave your device).</p>
  `;
  return wrapBody(inner);
}

/** Day 4: Privacy / local-first pitch — subject and HTML */
export const DAY4_SUBJECT = 'Why local-first privacy matters';

export function getDay4Html(): string {
  const inner = `
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Quick question: would you email a spreadsheet of your full trade history to a random company?</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Most portfolio apps work that way. You upload your data to their servers. They store it, analyze it, and—in the fine print—often reserve the right to use it. Your ledger, their cloud.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Pocket Portfolio is different. Your data stays in your browser and, if you turn on sync, in your own Google Drive. We don’t have a database of your holdings. We can’t see your positions, your P&amp;L, or your history. The app runs on your device; we only send you the app and the emails you signed up for.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">That’s not a feature—it’s the product. Local-first means you keep control. No “we had a breach” letter. No selling anonymized trends. Just your numbers, on your machine.</p>
    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">If that’s the kind of tool you want for the long term, the next step is simple: open the app on desktop, import your CSV, and see the difference.</p>
    ${ctaButton('Open Pocket Portfolio')}
    <p style="font-size:14px;color:#6b7280;margin-top:24px;">Thanks for reading. We’ll keep sending short, useful updates—and nothing else.</p>
  `;
  return wrapBody(inner);
}
