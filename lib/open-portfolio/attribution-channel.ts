/**
 * Maps browser first-touch (UTM + referrer) to the Open lead enum.
 * Paid mediums stay `unknown` while geo ads are frozen. Invalid values stay `unknown`.
 */

export const ATTRIBUTION_CHANNELS = ['organic', 'ai', 'authority', 'outbound', 'unknown'] as const;

export type AttributionChannel = (typeof ATTRIBUTION_CHANNELS)[number];

const AI_HOSTS = [
  'chatgpt.com',
  'chat.openai.com',
  'perplexity.ai',
  'claude.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'you.com',
] as const;

const SEARCH_HOST_PREFIXES = ['google.', 'yahoo.'] as const;
const SEARCH_HOSTS = ['bing.com', 'duckduckgo.com', 'ecosia.org'] as const;

export function parseAttributionChannel(value: unknown): AttributionChannel {
  if (typeof value === 'string' && (ATTRIBUTION_CHANNELS as readonly string[]).includes(value)) {
    return value as AttributionChannel;
  }
  return 'unknown';
}

function norm(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function referrerHost(referrer: string | null | undefined): string {
  const raw = norm(referrer);
  if (!raw) return '';
  try {
    return new URL(raw).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isSearchHost(host: string): boolean {
  if (!host) return false;
  if (SEARCH_HOST_PREFIXES.some((prefix) => host.startsWith(prefix))) return true;
  return SEARCH_HOSTS.some((name) => host === name || host.endsWith(`.${name}`));
}

function isAiHost(host: string): boolean {
  return AI_HOSTS.some((name) => host === name || host.endsWith(`.${name}`));
}

const AUTHORITY_SOURCES = [
  'linkedin',
  'youtube',
  'open_intelligence',
  'open-intelligence',
  'oi',
] as const;

const AUTHORITY_HOSTS = ['linkedin.com', 'lnkd.in', 'youtube.com', 'youtu.be'] as const;

function isAuthorityHost(host: string): boolean {
  return AUTHORITY_HOSTS.some((name) => host === name || host.endsWith(`.${name}`));
}

function isOiCampaign(campaign: string): boolean {
  return campaign.startsWith('oi_') || campaign.includes('open_intelligence') || campaign.includes('open-intelligence');
}

export function mapFirstTouchToAttributionChannel(input: {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
}): AttributionChannel {
  const source = norm(input.utm_source);
  const medium = norm(input.utm_medium);
  const campaign = norm(input.utm_campaign);
  const host = referrerHost(input.referrer);

  if (medium === 'outbound' || medium === 'sales' || medium === 'room' || source === 'outbound' || source === 'sales' || source === 'room') {
    return 'outbound';
  }

  const aiSource = ['chatgpt', 'perplexity', 'claude', 'gemini'].some((token) => source.includes(token));
  if (medium === 'ai' || medium === 'aeo' || medium === 'geo' || aiSource || isAiHost(host)) {
    return 'ai';
  }

  if (medium === 'organic' || medium === 'seo') return 'organic';

  const paid = medium === 'cpc' || medium === 'ppc' || medium === 'paid';
  if (isSearchHost(host) && !paid) return 'organic';

  // Open Intelligence / founder social → authority (GEO digital sources)
  const authoritySource = AUTHORITY_SOURCES.some(
    (token) => source === token || source.includes(token),
  );
  if (
    medium === 'referral' ||
    medium === 'social' ||
    medium === 'video' ||
    authoritySource ||
    isOiCampaign(campaign) ||
    isAuthorityHost(host)
  ) {
    return 'authority';
  }

  return 'unknown';
}
