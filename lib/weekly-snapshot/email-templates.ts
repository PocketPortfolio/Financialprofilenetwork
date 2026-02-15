/**
 * Weekly Snapshot email: value-first (one number) + referral CTA (Trojan Horse).
 * Reuses Stack Reveal layout and logo placeholder so Resend can replace logo at send time.
 */

import { EMAIL_ASSET_ORIGIN } from '@/lib/stack-reveal/constants';
import { createUnsubscribeToken } from '@/lib/stack-reveal/unsubscribe-token';
import { EMAIL_LOGO_PLACEHOLDER } from '@/lib/stack-reveal/email-templates';

const BRAND_CTA = '#D97706';
const BRAND_LINK = '#B45309';
const PORTAL_URL = `${EMAIL_ASSET_ORIGIN}/stack-reveal`;

export interface WeeklySnapshotData {
  hasData: boolean;
  percentChange?: number;
  topGainer?: { ticker: string; pct: number };
  isGreen: boolean;
}

export interface BuildWeeklySnapshotHtmlOpts {
  greeting: string;
  uid: string;
  referralLink: string;
  data: WeeklySnapshotData;
}

function wrapEmail(
  inner: string,
  greeting: string,
  unsubscribeUrl: string,
  referralLink: string,
  signOff?: string
): string {
  const closing = signOff ?? 'Best,<br>The Pocket Portfolio team';
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pocket Portfolio</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;background:#f5f5f5;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #eee;">
      <div style="padding:24px 28px 20px;background:#0d2818;border-bottom:3px solid ${BRAND_CTA};">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="vertical-align:middle;width:40px;height:40px;">
              <img src="${EMAIL_LOGO_PLACEHOLDER}" alt="Pocket Portfolio" width="40" height="40" style="display:block;" />
            </td>
            <td style="vertical-align:middle;padding-left:12px;">
              <span style="font-size:18px;font-weight:700;color:#ffffff;">Pocket Portfolio</span>
            </td>
          </tr>
        </table>
      </div>
      <div style="padding:32px 28px;">
        <p style="margin:0 0 20px;font-size:17px;line-height:1.5;color:#1a1a1a;">${greeting}</p>
        ${inner}
        <p style="margin:24px 0 0;font-size:14px;color:#666;line-height:1.5;">${closing}</p>
      </div>
      <div style="padding:20px 28px;background:#fafafa;border-top:1px solid #eee;">
        <p style="margin:0 0 8px;font-size:12px;color:#888;">
          You're receiving this because you signed up for Pocket Portfolio.
        </p>
        <p style="margin:0 0 8px;font-size:12px;color:#888;">
          <a href="${unsubscribeUrl}" style="color:${BRAND_LINK};text-decoration:underline;">Unsubscribe</a> &middot;
          <a href="${PORTAL_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Portal</a> &middot;
          <a href="${EMAIL_ASSET_ORIGIN}" style="color:${BRAND_LINK};text-decoration:underline;">Home</a>
        </p>
        <p style="margin:0;font-size:11px;color:#9ca3af;">Pocket Portfolio &middot; www.pocketportfolio.app</p>
        <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;word-break:break-all;">${referralLink}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  return html;
}

function ctaButton(url: string, text: string): string {
  return `<p style="margin:24px 0 0;"><a href="${url}" style="display:inline-block;padding:14px 28px;background:${BRAND_CTA};color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${text}</a></p>`;
}

/**
 * Subject line for the weekly snapshot email.
 */
export function getWeeklySnapshotSubject(data: WeeklySnapshotData): string {
  if (data.hasData && typeof data.percentChange === 'number') {
    const abs = Math.abs(data.percentChange);
    const oneDec = Math.round(abs * 10) / 10;
    if (data.percentChange >= 0) return `Your portfolio is up ${oneDec}% this week`;
    return `Your portfolio is down ${oneDec}% this week`;
  }
  return 'Markets this week – Pocket Portfolio';
}

/**
 * Build HTML for the weekly snapshot email. Includes hero number (or generic line), Share CTA, and dynamic footer.
 */
export function buildWeeklySnapshotHtml(opts: BuildWeeklySnapshotHtmlOpts): string {
  const { greeting, uid, referralLink, data } = opts;
  const unsubscribeUrl = `${EMAIL_ASSET_ORIGIN}/api/unsubscribe?token=${createUnsubscribeToken(uid)}`;

  let body = '';
  if (data.hasData && typeof data.percentChange === 'number') {
    const abs = Math.abs(data.percentChange);
    const oneDec = Math.round(abs * 10) / 10;
    const direction = data.percentChange >= 0 ? 'up' : 'down';
    body += `<p style="margin:0 0 16px;font-size:20px;font-weight:700;line-height:1.4;color:#1a1a1a;">Your portfolio is <strong>${direction} ${oneDec}%</strong> this week.</p>`;
    if (data.topGainer) {
      body += `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Top gainer: <strong>${data.topGainer.ticker}</strong> +${data.topGainer.pct.toFixed(1)}%</p>`;
    }
    body += `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#374151;">Beating the market? Share your portfolio snapshot with a friend.</p>`;
  } else {
    body += `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Here's your weekly Pocket Portfolio check-in.</p>`;
    body += `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#374151;">Invite a friend to track their portfolio.</p>`;
  }
  body += ctaButton(referralLink, 'Share Snapshot');

  let footerLine = '';
  if (data.hasData) {
    if (data.isGreen) {
      footerLine = `<p style="margin:0 0 12px;font-size:13px;color:#374151;">Show off your gains. <a href="${referralLink}" style="color:${BRAND_LINK};text-decoration:underline;">Share your public link</a>.</p>`;
    } else {
      footerLine = `<p style="margin:0 0 12px;font-size:13px;color:#374151;">Misery loves company? <a href="${referralLink}" style="color:${BRAND_LINK};text-decoration:underline;">Invite a friend to track the dip with you</a>.</p>`;
    }
  } else {
    footerLine = `<p style="margin:0 0 12px;font-size:13px;color:#374151;"><a href="${referralLink}" style="color:${BRAND_LINK};text-decoration:underline;">Invite a friend</a> to try Pocket Portfolio.</p>`;
  }

  const inner = body + footerLine;
  return wrapEmail(inner, greeting, unsubscribeUrl, referralLink);
}

export function getWeeklySnapshotUnsubscribeUrl(uid: string): string {
  return `${EMAIL_ASSET_ORIGIN}/api/unsubscribe?token=${createUnsubscribeToken(uid)}&type=weekly_snapshot`;
}
