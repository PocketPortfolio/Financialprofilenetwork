/**
 * Wave 2 Pillar 3 — Slack alert for Open Portfolio enterprise / BIP leads.
 * Best-effort; never blocks Firestore persistence.
 */
import type { OpenPortfolioLeadPayload } from '@/lib/open-portfolio/contact-leads-firestore';

export function enterpriseLeadWebhookUrl(): string | null {
  const dedicated = process.env.SLACK_ENTERPRISE_LEADS_WEBHOOK_URL?.trim();
  if (dedicated) return dedicated;
  const fallback = process.env.FEEDBACK_P0_WEBHOOK_URL?.trim();
  return fallback || null;
}

export function buildEnterpriseLeadSlackPayload(payload: OpenPortfolioLeadPayload) {
  const domain = payload.email.includes('@') ? payload.email.split('@')[1] : 'unknown';
  const company = payload.company?.trim() || domain;

  return {
    text: `New enterprise lead: ${company}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Institutional lead submitted' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Email:*\n${payload.email}` },
          { type: 'mrkdwn', text: `*Company:*\n${company}` },
          { type: 'mrkdwn', text: `*Role:*\n${payload.role || 'N/A'}` },
          { type: 'mrkdwn', text: `*Context:*\n${payload.context || 'general'}` },
          { type: 'mrkdwn', text: `*Domain:*\n${domain}` },
          { type: 'mrkdwn', text: `*Source:*\n${payload.source || 'open_portfolio_landing'}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:*\n${(payload.message || 'No message.').slice(0, 1500)}`,
        },
      },
    ],
  };
}

export async function notifyEnterpriseLeadSlack(
  payload: OpenPortfolioLeadPayload,
): Promise<{ ok: boolean; error?: string }> {
  const webhookUrl = enterpriseLeadWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, error: 'webhook_not_configured' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEnterpriseLeadSlackPayload(payload)),
    });
    if (!res.ok) {
      return { ok: false, error: `slack_http_${res.status}` };
    }
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
