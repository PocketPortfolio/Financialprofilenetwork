/**
 * Stack Reveal: premium HTML email templates (best-in-class design)
 * Educational value first, sales second. Portal of trust.
 */

import { BASE_URL, appendUtm } from './constants';
import { createUnsubscribeToken } from './unsubscribe-token';
import type { StackRevealWeek } from './types';

const PORTAL_URL = appendUtm('/stack-reveal');
const SPONSOR_URL = appendUtm('/sponsor');
const IMPORT_URL = appendUtm('/import');
const BOOK_URL = appendUtm('/book/universal-llm-import');

/** Logo URL: must be publicly reachable (deploy so /brand/pp-monogram.png is live). Resend preview and strict clients need a URL; cid: often doesn't render in preview. */
const LOGO_URL = 'https://www.pocketportfolio.app/brand/pp-monogram.png';
/** Pocket Portfolio orange CTA (matches site Launch App / accent-warm). */
const BRAND_CTA = '#D97706';
const BRAND_LINK = '#B45309';

function wrapEmail(inner: string, greeting: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
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
            <td style="vertical-align:middle;">
              <img src="${LOGO_URL}" alt="Pocket Portfolio" width="40" height="40" style="display:block;width:40px;height:40px;" />
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
        <p style="margin:24px 0 0;font-size:14px;color:#666;line-height:1.5;">Best,<br>The Pocket Portfolio team</p>
      </div>
      <div style="padding:20px 28px;background:#fafafa;border-top:1px solid #eee;">
        <p style="margin:0 0 8px;font-size:12px;color:#888;">
          You're receiving this because you signed up for Pocket Portfolio.
        </p>
        <p style="margin:0 0 8px;font-size:12px;color:#888;">
          <a href="${unsubscribeUrl}" style="color:${BRAND_LINK};text-decoration:underline;">Unsubscribe</a> &middot;
          <a href="${PORTAL_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Portal</a> &middot;
          <a href="${BASE_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Home</a>
        </p>
        <p style="margin:0;font-size:11px;color:#9ca3af;">Pocket Portfolio &middot; www.pocketportfolio.app</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(url: string, text: string): string {
  return `<p style="margin:24px 0 0;"><a href="${url}" style="display:inline-block;padding:14px 28px;background:${BRAND_CTA};color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${text}</a></p>`;
}

export function getSubject(week: StackRevealWeek): string {
  switch (week) {
    case 1: return 'Why your financial data is broken (and how we fixed it)';
    case 2: return 'Why we don\'t want your data';
    case 3: return 'Stop paying monthly fees';
    case 4: return 'Your stack, your rules';
    default: return 'Pocket Portfolio: one more thing';
  }
}

export function buildWeek1Html(opts: {
  greeting: string;
  hasUploadedCsv?: boolean;
  unsubscribeUrl: string;
}): string {
  const ctaUrl = opts.hasUploadedCsv ? appendUtm('/sponsor?ref=stack_reveal') : appendUtm('/import');
  const ctaText = opts.hasUploadedCsv ? 'Unlock unlimited history' : 'Get started with Universal Import';
  const inner = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Every broker exports a different CSV. "Deal Date" vs "Trade Date." "Epic" vs "Symbol." Supporting one broker meant maintaining one more parser—and hoping it didn't break.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">We built <strong>Universal Import</strong> so you bring any CSV that has the right semantic content (date, ticker, action, quantity, price). We infer the columns; you get a normalized portfolio. No more walls for "unsupported" brokers.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">It's the first piece of a stack that puts <em>you</em> in control. We explain the full picture in our <a href="${PORTAL_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Stack Reveal portal</a>.</p>
    ${ctaButton(ctaUrl, ctaText)}
  `;
  return wrapEmail(inner, opts.greeting, opts.unsubscribeUrl);
}

export function buildWeek2Html(opts: {
  greeting: string;
  unsubscribeUrl: string;
}): string {
  const inner = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Most tools want to hold your data. We don't. Your trades and portfolios stay <strong>local-first</strong>: we help you import, normalize, and analyze—without taking custody of your history.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">That's the idea behind our <strong>Universal Data Engine</strong>: one place to bring broker CSVs, one normalized view, full control on your side. Privacy isn't a checkbox; it's the architecture.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">See how it fits together in the <a href="${PORTAL_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Stack Reveal portal</a>—and why "we don't want your data" is a feature.</p>
    ${ctaButton(PORTAL_URL, 'Explore the portal')}
  `;
  return wrapEmail(inner, opts.greeting, opts.unsubscribeUrl);
}

export function buildWeek3Html(opts: {
  greeting: string;
  isGoogleUser?: boolean;
  unsubscribeUrl: string;
}): string {
  const googleLine = opts.isGoogleUser
    ? '<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Since you signed up with Google, you already know the value of one account that just works.</p>'
    : '';
  const inner = `
    ${googleLine}
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Subscriptions add up. <strong>Founder's Club</strong> is different: one lifetime unlock. No monthly fees, no recurring decision—just the full stack (Universal Import, themes, API, Sovereign Sync) for good.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">It's the sovereign choice: own your tooling, stop renting. We've capped spots so it stays meaningful.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Details and the full story are in the <a href="${PORTAL_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Stack Reveal portal</a>.</p>
    ${ctaButton(SPONSOR_URL, 'Explore Founder\'s Club')}
  `;
  return wrapEmail(inner, opts.greeting, opts.unsubscribeUrl);
}

export function buildWeek4Html(opts: {
  greeting: string;
  unsubscribeUrl: string;
}): string {
  const inner = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">You've had four weeks of the story: broken data → Universal Import → local-first → Founder's Club. Your stack, your rules.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">If you're ready to lock in lifetime access or just want to keep exploring, everything is in one place: our <a href="${PORTAL_URL}" style="color:${BRAND_LINK};text-decoration:underline;">Stack Reveal portal</a>. We'll keep adding guides and product updates there.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Thanks for being part of Pocket Portfolio.</p>
    ${ctaButton(PORTAL_URL, 'Open the portal')}
  `;
  return wrapEmail(inner, opts.greeting, opts.unsubscribeUrl);
}

export function buildHtmlForWeek(
  week: StackRevealWeek,
  opts: {
    greeting: string;
    uid: string;
    hasUploadedCsv?: boolean;
    isGoogleUser?: boolean;
  }
): string {
  const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${createUnsubscribeToken(opts.uid)}`;
  switch (week) {
    case 1: return buildWeek1Html({ greeting: opts.greeting, hasUploadedCsv: opts.hasUploadedCsv, unsubscribeUrl });
    case 2: return buildWeek2Html({ greeting: opts.greeting, unsubscribeUrl });
    case 3: return buildWeek3Html({ greeting: opts.greeting, isGoogleUser: opts.isGoogleUser, unsubscribeUrl });
    case 4: return buildWeek4Html({ greeting: opts.greeting, unsubscribeUrl });
    default: return buildWeek1Html({ greeting: opts.greeting, unsubscribeUrl });
  }
}

export function getGreeting(displayName: string | null, firstName: string | null, isGoogle: boolean): string {
  if (isGoogle && firstName) return `Hi ${firstName},`;
  if (displayName?.trim()) {
    const first = displayName.trim().split(/\s+/)[0];
    if (first) return `Hi ${first},`;
  }
  return 'Hi there,';
}

/** Unsubscribe URL for a user (for List-Unsubscribe header). */
export function getUnsubscribeUrl(uid: string): string {
  return `${BASE_URL}/api/unsubscribe?token=${createUnsubscribeToken(uid)}`;
}
