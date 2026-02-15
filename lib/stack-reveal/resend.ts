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

/** Support form: always send to ai@pocketportfolio.app; if SUPPORT_EMAIL_TO is set and different, add it so both receive. */
const SUPPORT_INBOX = 'ai@pocketportfolio.app';
const SUPPORT_EMAIL_TO_EXTRA = process.env.SUPPORT_EMAIL_TO?.trim();
/** Use a different "from" than "to" to avoid self-send filtering; set SUPPORT_MAIL_FROM if only ai@ is verified in Resend. */
const SUPPORT_FROM = process.env.SUPPORT_MAIL_FROM?.trim() || 'Pocket Portfolio Support <support@pocketportfolio.app>';

/** Support form: send to ai@pocketportfolio.app (and optionally SUPPORT_EMAIL_TO) with optional attachments. */
export async function sendSupportEmail(
  fromEmail: string,
  fromName: string,
  subject: string,
  message: string,
  attachments?: { filename: string; content: string }[]
): Promise<{ id?: string; error?: string }> {
  const toAddresses = [SUPPORT_INBOX];
  if (SUPPORT_EMAIL_TO_EXTRA && SUPPORT_EMAIL_TO_EXTRA !== SUPPORT_INBOX) {
    toAddresses.push(SUPPORT_EMAIL_TO_EXTRA);
  }
  const html = `
    <p><strong>From:</strong> ${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
    <hr/>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
    <p style="margin-top:16px;color:#6b7280;font-size:12px;">Submitted via Pocket Portfolio support form.</p>
  `;
  const payload: Record<string, unknown> = {
    from: SUPPORT_FROM,
    to: toAddresses,
    replyTo: fromEmail,
    subject: `[Support] ${subject}`,
    html,
    tags: [{ name: 'campaign', value: 'support_form' }],
  };
  if (attachments?.length) {
    (payload as any).attachments = attachments;
  }
  const { data, error } = await getStackRevealResend().emails.send(payload as any);
  if (error) return { error: error.message };
  return { id: data?.id };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
