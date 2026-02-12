import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getStackRevealResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const FROM = process.env.MAIL_FROM || 'Pocket Portfolio <noreply@pocketportfolio.app>';

export async function sendStackRevealEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeUrl?: string
): Promise<{ id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    from: FROM,
    to,
    subject,
    html,
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
