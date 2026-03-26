/**
 * Sovereign Challenge / Founders Club marketing email templates.
 *
 * Built to match scripts/send-sovereign-challenge-campaign-test.ts HTML and CTAs.
 */

const UTM =
  'utm_source=email_campaign&utm_medium=email&utm_campaign=zero_trust_founders';

export const SOVEREIGN_CAMPAIGN_SUBJECT = "Why we don't want your data (and how you can help).";

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app').replace(/\/$/, '');
}

export function buildSovereignCampaignHtml(firstName: string): string {
  const base = getBaseUrl();
  const challengeUrl = `${base}/challenge?${UTM}`;
  const sponsorUrl = `${base}/sponsor?${UTM}`;

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
              ${cta(challengeUrl, 'Take the Architecture Challenge')}
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
              ${cta(sponsorUrl, 'Join the Founders Club')}
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
                <a href="${base}/stack-reveal" style="color:#d97706;font-weight:600;">Email preferences</a>
                · <a href="${base}" style="color:#64748b;">pocketportfolio.app</a>
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

