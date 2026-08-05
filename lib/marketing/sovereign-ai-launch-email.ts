/**
 * Sovereign AI Ask AI launch blast — Amber Terminal HTML (Resend).
 * Copy: Legal-cleared storytelling (docs/command/sovereign-ai-gtm-final-posts-2026-08-10.md rev 2).
 */

import { EMAIL_LOGO_PLACEHOLDER } from '@/lib/stack-reveal/email-templates';
import { getViralMomentAnnounceFrom } from '@/lib/marketing/viral-moment-announce-email';

export const SOVEREIGN_AI_LAUNCH_SUBJECT =
  'New in Ask AI: you control the intelligence route';

export const SOVEREIGN_AI_LAUNCH_PREHEADER =
  'Cloud Auto or OP-Hosted Sovereign — bounded summary only, not raw trades.';

export const SOVEREIGN_AI_LAUNCH_CAMPAIGN = 'sovereign_ai_launch_v1';

export const SOVEREIGN_AI_LAUNCH_CTA_URL =
  'https://www.pocketportfolio.app/dashboard?utm_source=email&utm_medium=email&utm_campaign=sovereign_ai_launch_v1';

const BG = '#0a0a0a';
const CARD = '#111111';
const AMBER = '#f59e0b';
const TEXT = '#ffffff';
const MUTED = '#a1a1aa';
const BODY = '#e4e4e7';
const FOOTER_MUTED = '#71717a';
const CALLOUT_BG = '#18181b';
const FF = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, Menlo, Monaco, Consolas, monospace';

const CLOUDINARY_LOGO =
  'https://res.cloudinary.com/dknmhvm7a/image/upload/v1770925627/pocket-portfolio/pp-monogram.png';

function hostedLogoUrl(): string {
  return process.env.EMAIL_LOGO_URL?.trim() || CLOUDINARY_LOGO;
}

export function getSovereignAiLaunchFrom(): string {
  return (
    process.env.SOVEREIGN_AI_LAUNCH_FROM?.trim() ||
    getViralMomentAnnounceFrom()
  );
}

/**
 * @param greetName - First name or empty → "there"
 */
export function buildSovereignAiLaunchHtml(greetName: string, unsubscribeUrl?: string): string {
  const displayName = greetName.trim() || 'there';
  const safeName = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const unsub =
    unsubscribeUrl && unsubscribeUrl.trim()
      ? `<br /><a href="${unsubscribeUrl.replace(/"/g, '')}" style="color:${FOOTER_MUTED};text-decoration:underline;">Unsubscribe from product updates</a>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pocket Portfolio</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BG};opacity:0;">
    ${SOVEREIGN_AI_LAUNCH_PREHEADER}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:${CARD};border:1px solid ${AMBER};border-radius:8px;">
          <tr>
            <td style="padding:24px 28px 16px;border-bottom:1px solid ${AMBER};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;width:52px;">
                    <img src="${EMAIL_LOGO_PLACEHOLDER}" alt="Pocket Portfolio" width="48" height="48" style="display:block;border-radius:8px;border:1px solid ${AMBER};" />
                  </td>
                  <td style="vertical-align:middle;padding-left:14px;">
                    <span style="font-family:${FF};font-size:17px;font-weight:700;color:${TEXT};">Pocket Portfolio</span><br />
                    <span style="font-family:${MONO};font-size:10px;color:${AMBER};letter-spacing:0.08em;">ASK_AI // SOVEREIGN_ROUTING</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:${FF};">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:${BODY};">Hi ${safeName},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:${BODY};">
                The AI landscape is shifting fast. You should decide how your portfolio questions are answered.
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:${BODY};">
                Ask AI now offers two routes:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px;font-family:${FF};">
              <div style="background:${CALLOUT_BG};border-left:3px solid ${AMBER};padding:16px 18px;border-radius:4px;">
                <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:${BODY};">
                  <strong style="color:${TEXT};">Cloud Auto</strong> — Gemini / OpenAI (high-speed frontier default)
                </p>
                <p style="margin:0;font-size:14px;line-height:1.5;color:${BODY};">
                  <strong style="color:${TEXT};">OP-Hosted Sovereign</strong> — DeepSeek-R1 Distill on our PAYG GPU node
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 8px;font-family:${FF};">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:${BODY};">
                <strong style="color:${TEXT};">How it works:</strong> Ask AI still sends a bounded portfolio summary for reasoning — not raw trade rows. Sovereign GPU scales to zero when idle (≈ $0). Selecting Sovereign wakes the node; if that wake takes too long, Cloud Auto steps in so you still get an answer.
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:${BODY};"><strong style="color:${TEXT};">Try it today:</strong></p>
              <ol style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7;color:${MUTED};">
                <li>Open <a href="${SOVEREIGN_AI_LAUNCH_CTA_URL}" style="color:${AMBER};">pocketportfolio.app</a></li>
                <li>Open Ask AI</li>
                <li>Top-right menu → Cloud Auto or Sovereign</li>
                <li>Ask a question</li>
              </ol>
              <div style="text-align:center;margin:28px 0 8px;">
                <a href="${SOVEREIGN_AI_LAUNCH_CTA_URL}" style="display:inline-block;background:${AMBER};color:${BG};font-family:${FF};font-weight:700;font-size:14px;padding:14px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.02em;">
                  OPEN ASK AI
                </a>
              </div>
              <p style="margin:24px 0 0;font-size:15px;line-height:1.55;color:${BODY};">
                Thanks for building the future of edge finance with us.
              </p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:${BODY};">
                — The Pocket Portfolio Team<br />
                <span style="color:${MUTED};font-size:13px;">pocketportfolio.app</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;font-family:${FF};border-top:1px solid #27272a;">
              <p style="margin:0;font-size:11px;line-height:1.5;color:${FOOTER_MUTED};">
                Sent because you registered on Pocket Portfolio, joined the priority queue, or left your email at an identity gate.<br />
                Soft launch — OP-Hosted Sovereign is not a laptop-local or air-gap claim.
                ${unsub}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.replace(
    new RegExp(EMAIL_LOGO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    hostedLogoUrl(),
  );
}
