/**
 * Branded transactional HTML for /challenge lead capture (Resend).
 * Logo placeholder is replaced at send time (same pattern as lib/stack-reveal/resend.ts).
 */

import { EMAIL_LOGO_PLACEHOLDER } from '@/lib/stack-reveal/email-templates';

const CLOUDINARY_LOGO =
  'https://res.cloudinary.com/dknmhvm7a/image/upload/v1770925627/pocket-portfolio/pp-monogram.png';

/** Pocket accent-warm; dark enough for white button label contrast in clients */
const BRAND_AMBER = '#D97706';
const BRAND_AMBER_LIGHT = '#F59E0B';
const HEADER_BG = '#0f172a';
const BODY_TEXT = '#1e293b';
const MUTED = '#64748b';

export function hostedLogoUrl(): string {
  return process.env.EMAIL_LOGO_URL?.trim() || CLOUDINARY_LOGO;
}

export function injectChallengeEmailLogo(html: string): string {
  const escaped = EMAIL_LOGO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(escaped, 'g'), hostedLogoUrl());
}

function ctaButton(url: string, label: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
  <tr>
    <td style="border-radius:8px;background:${BRAND_AMBER};">
      <a href="${url}" target="_blank" rel="noopener noreferrer"
        style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:700;color:#ffffff !important;text-decoration:none;border-radius:8px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/**
 * Auto-reply after completing the Zero-Trust Architecture Challenge.
 */
export function buildChallengeUserReplyHtml(opts: {
  blueprintUrl: string;
  joinUrl: string;
  challengeUrl: string;
}): string {
  const { blueprintUrl, joinUrl, challengeUrl } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Pocket Portfolio</title>
</head>
<body style="margin:0;padding:0;background:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Your sovereign architecture resources are inside.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#e2e8f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(15,23,42,0.12);border:1px solid #cbd5e1;">
          <tr>
            <td style="background:${HEADER_BG};padding:24px 28px;border-bottom:4px solid ${BRAND_AMBER_LIGHT};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48" valign="middle">
                    <img src="${EMAIL_LOGO_PLACEHOLDER}" alt="Pocket Portfolio" width="48" height="48" style="display:block;border-radius:10px;" />
                  </td>
                  <td valign="middle" style="padding-left:14px;">
                    <div style="font-size:20px;font-weight:800;color:#f8fafc;letter-spacing:-0.02em;">Pocket Portfolio</div>
                    <div style="font-size:12px;font-weight:600;color:${BRAND_AMBER_LIGHT};text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Zero-trust architecture</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 28px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${HEADER_BG};font-weight:800;">Sovereign architecture verified</h1>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${BODY_TEXT};">
                Thanks for completing the <strong style="color:${HEADER_BG};">Zero-Trust Architecture Challenge</strong>.
                Here are the resources we promised—technical deep read first, then product access.
              </p>
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;">Technical reading</p>
              ${ctaButton(blueprintUrl, 'Sovereign Intelligence — Technical Press')}
              <p style="margin:28px 0 8px;font-size:13px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;">Product &amp; access</p>
              ${ctaButton(joinUrl, 'Join Pocket Portfolio')}
              <p style="margin:28px 0 0;font-size:14px;line-height:1.5;color:${MUTED};">
                Building for FinTech, defense, or industrial telemetry? You’re exactly who we built the split-brain boundary for:
                <strong style="color:${BODY_TEXT};">edge aggregation</strong>, <strong style="color:${BODY_TEXT};">truncated payloads</strong>, and a
                <strong style="color:${BODY_TEXT};">stateless inference path</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:${MUTED};">
                You received this because you submitted your email after finishing the challenge at
                <a href="${challengeUrl}" style="color:${BRAND_AMBER};font-weight:600;">pocketportfolio.app/challenge</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © Pocket Portfolio · <a href="https://www.pocketportfolio.app" style="color:${BRAND_AMBER};text-decoration:none;font-weight:600;">www.pocketportfolio.app</a>
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

/**
 * Internal notification to sales / team inbox.
 */
export function buildChallengeTeamNotifyHtml(opts: { leadEmail: string; challengeUrl: string }): string {
  const { leadEmail, challengeUrl } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e2e8f0;padding:24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#fff;border-radius:12px;border:1px solid #cbd5e1;overflow:hidden;">
          <tr>
            <td style="background:${HEADER_BG};padding:16px 20px;border-bottom:3px solid ${BRAND_AMBER_LIGHT};">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td><img src="${EMAIL_LOGO_PLACEHOLDER}" alt="" width="36" height="36" style="display:block;border-radius:8px;" /></td>
                <td style="padding-left:10px;font-size:16px;font-weight:800;color:#f8fafc;">New challenge lead</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <p style="margin:0 0 12px;font-size:14px;color:${BODY_TEXT};"><strong>Source:</strong> Zero-Trust Architecture Challenge</p>
              <p style="margin:0 0 12px;font-size:14px;color:${BODY_TEXT};"><strong>Email:</strong> <a href="mailto:${leadEmail}" style="color:${BRAND_AMBER};">${leadEmail}</a></p>
              <p style="margin:0;font-size:13px;color:${MUTED};"><a href="${challengeUrl}" style="color:${BRAND_AMBER};">Open /challenge</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
