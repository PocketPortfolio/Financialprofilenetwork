/**
 * HTML-only V3 "Route to Rise" / viral_moment_v1 announcement (Amber + dark).
 * Shared by Resend test script and /api/cron/viral-moment-blast.
 */

import { EMAIL_LOGO_PLACEHOLDER } from '@/lib/stack-reveal/email-templates';

export const VIRAL_MOMENT_ANNOUNCE_SUBJECT =
  '🔓 [Exclusive] Unlock 7 Days of Founder’s Club';

const PREHEADER =
  '4,712 joined this month. Refer one friend — unlock 7 days of Founder’s Club (Sovereign AI).';

const BG = '#0a0a0a';
const CARD = '#111111';
const BORDER = '#333333';
const CALLOUT_BG = '#1a1a1a';
const AMBER = '#FFBF00';
const TEXT = '#ffffff';
const MUTED = '#a1a1aa';
const BODY = '#e4e4e7';
const FOOTER_MUTED = '#525252';

const FF = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const CLOUDINARY_LOGO =
  'https://res.cloudinary.com/dknmhvm7a/image/upload/v1770925627/pocket-portfolio/pp-monogram.png';

function hostedLogoUrl(): string {
  return process.env.EMAIL_LOGO_URL?.trim() || CLOUDINARY_LOGO;
}

export const VIRAL_MOMENT_DASHBOARD_URL =
  'https://www.pocketportfolio.app/dashboard?utm_source=email&utm_medium=email&utm_campaign=viral_moment_v1';

export function getViralMomentAnnounceFrom(): string {
  return (
    process.env.VIRAL_ROUTE_TO_RISE_FROM?.trim() ||
    'Abba Lawal | Pocket Portfolio <abba@pocketportfolio.app>'
  );
}

/**
 * @param greetName - First name or empty for "Sovereign User"
 */
export function buildViralMomentAnnounceHtml(greetName: string): string {
  const displayName = greetName.trim() || 'Sovereign User';
  const safeName = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inner = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pocket Portfolio</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BG};opacity:0;">
    ${PREHEADER}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:550px;background:${CARD};border:1px solid ${BORDER};border-radius:12px;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid ${BORDER};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;width:52px;">
                    <img src="${EMAIL_LOGO_PLACEHOLDER}" alt="Pocket Portfolio" width="48" height="48" style="display:block;border-radius:10px;" />
                  </td>
                  <td style="vertical-align:middle;padding-left:14px;">
                    <span style="font-family:${FF};font-size:17px;font-weight:700;color:${TEXT};">Pocket Portfolio</span><br />
                    <span style="font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;font-size:10px;color:${MUTED};letter-spacing:0.12em;">LOCAL-FIRST &middot; SOVEREIGN AI</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 8px;font-family:${FF};">
              <h2 style="margin:0;color:${AMBER};letter-spacing:3px;text-transform:uppercase;font-size:16px;font-weight:800;">
                Pocket Portfolio
              </h2>
              <div style="height:1px;background:${BORDER};margin:14px auto 0;max-width:280px;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-family:${FF};">
              <h1 style="font-size:24px;font-weight:700;margin:20px 0 16px;color:${TEXT};line-height:1.25;">
                We&rsquo;ve Hit a Milestone.
              </h1>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:${MUTED};">
                Hello ${safeName},
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:${MUTED};">
                This month, <strong style="color:${TEXT};">4,712 new users</strong> joined the <strong style="color:${TEXT};">Sovereign AI</strong> movement&mdash;private, <strong style="color:${TEXT};">local-first</strong> financial intelligence that never asks you to ship raw ledgers to the cloud.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:${MUTED};">
                To celebrate, I&rsquo;m opening the gates to our premium stack for <strong style="color:${TEXT};">one week</strong> for everyone already in the community.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;background:${CALLOUT_BG};border-left:4px solid ${AMBER};">
                <tr>
                  <td style="padding:20px 20px 20px 18px;">
                    <p style="margin:0;font-size:13px;color:${AMBER};text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                      Referral reward
                    </p>
                    <p style="margin:10px 0 0;font-size:18px;color:${TEXT};font-weight:700;line-height:1.4;">
                      Refer 1 friend = 7 days Founder&rsquo;s Club access &mdash; <span style="color:${BODY};font-weight:600;font-size:15px;">for you, not them.</span>
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:6px;background:${AMBER};">
                    <a href="${VIRAL_MOMENT_DASHBOARD_URL}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:18px 40px;font-family:${FF};font-size:16px;font-weight:800;color:#000000;text-decoration:none;line-height:1.2;">
                      GET YOUR INVITE LINK
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 32px;font-size:13px;line-height:1.5;color:${MUTED};font-style:italic;text-align:center;">
                No credit card required. One referral = 7 days of full Sovereign AI access. Offer expires Sunday at midnight.
              </p>
              <div style="height:1px;background:${BORDER};margin:0 0 20px;"></div>
              <p style="margin:0;font-size:12px;line-height:1.6;color:${FOOTER_MUTED};">
                <strong style="color:${MUTED};">Abba Lawal</strong>, Founder @ Pocket Portfolio<br />
                Building the security layer for sovereign financial intelligence.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const logoUrl = hostedLogoUrl();
  return inner.replace(
    new RegExp(EMAIL_LOGO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    logoUrl
  );
}
