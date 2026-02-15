import { Resend } from 'resend';
import { EMAIL_ASSET_ORIGIN } from './constants';
import { EMAIL_LOGO_PLACEHOLDER } from './email-templates';

let resendInstance: Resend | null = null;

export function getStackRevealResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/** Send from ai@ (not noreply) for better deliverability; override with MAIL_FROM env. */
const FROM = process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';

/** Direct CDN URL so Gmail's image proxy gets the image without going through our server. Data URIs are stripped by Gmail; our proxy can timeout for Gmail's fetches. */
const CLOUDINARY_LOGO =
  'https://res.cloudinary.com/dknmhvm7a/image/upload/v1770925627/pocket-portfolio/pp-monogram.png';
const HOSTED_LOGO_URL =
  process.env.EMAIL_LOGO_URL || CLOUDINARY_LOGO;

export async function sendStackRevealEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeUrl?: string
): Promise<{ id?: string; error?: string }> {
  const finalHtml = html.replace(
    new RegExp(EMAIL_LOGO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    HOSTED_LOGO_URL
  );

  const payload: Record<string, unknown> = {
    from: FROM,
    to,
    subject,
    html: finalHtml,
    tags: [{ name: 'campaign', value: 'stack_reveal' }],
  };
  if (unsubscribeUrl) {
    payload.headers = {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }
  const { data, error } = await getStackRevealResend().emails.send(payload as any);
  if (error) return { error: error.message };
  return { id: data?.id };
}

/** Send Weekly Snapshot email (same Resend instance, tag campaign: weekly_snapshot). */
export async function sendWeeklySnapshotEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeUrl?: string
): Promise<{ id?: string; error?: string }> {
  const finalHtml = html.replace(
    new RegExp(EMAIL_LOGO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    HOSTED_LOGO_URL
  );

  const payload: Record<string, unknown> = {
    from: FROM,
    to,
    subject,
    html: finalHtml,
    tags: [{ name: 'campaign', value: 'weekly_snapshot' }],
  };
  if (unsubscribeUrl) {
    payload.headers = {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }
  const { data, error } = await getStackRevealResend().emails.send(payload as any);
  if (error) return { error: error.message };
  return { id: data?.id };
}
