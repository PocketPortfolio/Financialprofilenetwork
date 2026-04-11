/**
 * Portfolio Notes (Decision Journal) launch — Amber Terminal HTML for Resend.
 * Notes live on device + Drive JSON only; not stored server-side for training.
 */

import { EMAIL_LOGO_PLACEHOLDER } from '@/lib/stack-reveal/email-templates';
import { getViralMomentAnnounceFrom } from '@/lib/marketing/viral-moment-announce-email';

export const NOTES_LAUNCH_SUBJECT =
  'Your thesis, your device: Portfolio Notes are live';

const PREHEADER =
  'Start a local Decision Journal in Pocket Portfolio—sovereign moat, zero server-side note storage.';

const BG = '#0a0a0a';
const CARD = '#111111';
const AMBER = '#f59e0b';
const TEXT = '#ffffff';
const MUTED = '#a1a1aa';
const BODY = '#e4e4e7';
const FOOTER_MUTED = '#525252';
const MONO = 'ui-monospace, Menlo, Monaco, Consolas, monospace';

const FF = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const CLOUDINARY_LOGO =
  'https://res.cloudinary.com/dknmhvm7a/image/upload/v1770925627/pocket-portfolio/pp-monogram.png';

function hostedLogoUrl(): string {
  return process.env.EMAIL_LOGO_URL?.trim() || CLOUDINARY_LOGO;
}

export const NOTES_LAUNCH_DASHBOARD_URL =
  'https://www.pocketportfolio.app/dashboard?utm_source=email&utm_medium=email&utm_campaign=notes_launch_v1#positions';

export function getNotesLaunchFrom(): string {
  const from = process.env.NOTES_LAUNCH_FROM?.trim();
  if (from) return from;
  return getViralMomentAnnounceFrom();
}

/**
 * @param greetName - First name or empty for generic greeting
 */
export function buildNotesLaunchHtml(greetName: string): string {
  const displayName = greetName.trim() || 'there';
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
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:550px;background:${CARD};border:1px solid ${AMBER};border-radius:8px;">
          <tr>
            <td style="padding:24px 28px 16px;border-bottom:1px solid ${AMBER};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;width:52px;">
                    <img src="${EMAIL_LOGO_PLACEHOLDER}" alt="Pocket Portfolio" width="48" height="48" style="display:block;border-radius:8px;border:1px solid ${AMBER};" />
                  </td>
                  <td style="vertical-align:middle;padding-left:14px;">
                    <span style="font-family:${FF};font-size:17px;font-weight:700;color:${TEXT};">Pocket Portfolio</span><br />
                    <span style="font-family:${MONO};font-size:10px;color:${AMBER};letter-spacing:0.1em;">DECISION_JOURNAL // LOCAL_FIRST</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 32px;font-family:${FF};">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${MUTED};">
                Hi ${safeName},
              </p>
              <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:${TEXT};line-height:1.3;font-family:${MONO};">
                Portfolio Notes
              </h1>
              <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:${BODY};">
                You can now keep a <strong style="color:${TEXT};">Decision Journal</strong> beside your trades: thesis by ticker, notes per trade, and an archive when you delete a leg. It is an invitation to write down <em>why</em> you own what you own—not just the prices.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:#1a1a1a;border:1px solid ${AMBER};">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-family:${MONO};font-size:11px;color:${AMBER};letter-spacing:0.08em;text-transform:uppercase;">
                      Sovereign moat
                    </p>
                    <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:${MUTED};">
                      Your note text stays on <strong style="color:${TEXT};">your device</strong> and in your <strong style="color:${TEXT};">Drive JSON</strong> bundle with trades. We do not store your journal on our servers for ads or model training.
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius:6px;border:1px solid ${AMBER};background:${AMBER};">
                    <a href="${NOTES_LAUNCH_DASHBOARD_URL}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:14px 32px;font-family:${FF};font-size:15px;font-weight:700;color:#000000;text-decoration:none;line-height:1.2;">
                      Open Dashboard &rarr; Notes
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;line-height:1.6;color:${FOOTER_MUTED};">
                Pocket Portfolio &middot; Local-first portfolio intelligence
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
