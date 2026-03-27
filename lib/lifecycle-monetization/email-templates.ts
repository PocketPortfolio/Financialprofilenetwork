/**
 * Cart abandonment (24h) — transactional HTML for Resend.
 */

export const ABANDONED_CART_SUBJECT = 'Your Pocket Portfolio analysis is waiting...';

const CTA_URL =
  'https://www.pocketportfolio.app/sponsor?utm_campaign=abandoned_cart_24h&utm_source=email&utm_medium=lifecycle';

export function buildAbandonedCartHtml(opts: { firstName: string; intentHint: string }) {
  const greeting = opts.firstName ? `Hi ${opts.firstName},` : 'Hi,';
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden;">
    <tr><td style="padding:28px 24px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#e2e8f0;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#cbd5e1;">
        We noticed you tried to unlock ${opts.intentHint}. Complete your Founders Club upgrade to instantly visualize your portfolio.
      </p>
      <p style="margin:24px 0;">
        <a href="${CTA_URL}" style="display:inline-block;background:#f59e0b;color:#0f172a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px;font-size:15px;">
          Complete upgrade
        </a>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#64748b;line-height:1.5;">
        Pocket Portfolio — local-first portfolio analytics.
      </p>
    </td></tr>
  </table>
</body></html>`;
}
