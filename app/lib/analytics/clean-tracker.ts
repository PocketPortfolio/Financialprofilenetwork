/**
 * Analytics purification — exclude self-referred UI UTM loops from acquisition.
 * Board north stars: human sessions (≥30s), import conversions, paid API keys.
 * Vanity "Active Users" is retired from product reporting.
 */

export const SELF_ACQUISITION_UTM_SOURCES = new Set([
  'json_api',
  'symbol_layout',
  'symbol_hub',
  'dividend_page',
  'landing', // only when paired with self mediums below — checked via medium primarily
]);

/** Internal UI mediums that inflated GA acquisition (~json_api cluster). */
export const SELF_ACQUISITION_UTM_MEDIUMS = new Set([
  'semantic_footer',
  'sticky_prompt',
  'live_preview_lead',
  'bridge_cta',
  'json_export_cta',
  'sovereign_cta',
  'footer',
]);

export const SELF_ACQUISITION_UTM_SOURCES_STRICT = new Set([
  'json_api',
  'symbol_layout',
  'symbol_hub',
  'dividend_page',
]);

export type CleanAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  isInternalLoop: boolean;
};

export function isInternalAcquisitionUtm(
  source: string | null | undefined,
  medium: string | null | undefined
): boolean {
  const s = (source || '').toLowerCase().trim();
  const m = (medium || '').toLowerCase().trim();
  if (SELF_ACQUISITION_UTM_MEDIUMS.has(m)) return true;
  if (SELF_ACQUISITION_UTM_SOURCES_STRICT.has(s)) return true;
  return false;
}

export function sanitizeAcquisitionUtm(input: {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
}): CleanAttribution {
  const utm_source = input.utm_source ?? null;
  const utm_medium = input.utm_medium ?? null;
  const utm_campaign = input.utm_campaign ?? null;
  const utm_content = input.utm_content ?? null;
  const isInternalLoop = isInternalAcquisitionUtm(utm_source, utm_medium);

  if (!isInternalLoop) {
    return { utm_source, utm_medium, utm_campaign, utm_content, isInternalLoop: false };
  }

  // Preserve for debugging but mark as internal so GA does not count as acquisition
  return {
    utm_source: 'internal',
    utm_medium: 'self_nav',
    utm_campaign: utm_campaign,
    utm_content: utm_content,
    isInternalLoop: true,
  };
}

/** Board KPI definitions (reporting contract — not vanity MAU). */
export const BOARD_NORTH_STAR_KPIS = [
  {
    id: 'human_quality_sessions',
    label: 'Human Quality Sessions',
    definition: 'Engagement time ≥ 30 seconds on HTML / import surfaces',
  },
  {
    id: 'broker_import_conversions',
    label: 'Broker Import Conversions',
    definition: 'csv_import_success (and related) from /import/*',
  },
  {
    id: 'paid_api_keys',
    label: 'Paid API Keys',
    definition:
      'Active Developer Utility / Founders Club / Corporate keys (exclude Code Supporter as firehose SKU)',
  },
] as const;

const EXCLUDE_FLAG_KEY = 'pp_exclude_acquisition_v1';

export function markInternalAcquisitionSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(EXCLUDE_FLAG_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isInternalAcquisitionSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(EXCLUDE_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Call on every client navigation. If URL carries self-UTM cluster, retag GA traffic
 * as internal and skip first-touch acquisition pollution.
 */
export function purifyClientAcquisitionFromUrl(): CleanAttribution | null {
  if (typeof window === 'undefined') return null;
  const qs = new URLSearchParams(window.location.search);
  const raw = {
    utm_source: qs.get('utm_source'),
    utm_medium: qs.get('utm_medium'),
    utm_campaign: qs.get('utm_campaign'),
    utm_content: qs.get('utm_content'),
  };
  const cleaned = sanitizeAcquisitionUtm(raw);
  if (cleaned.isInternalLoop) {
    markInternalAcquisitionSession();
    try {
      sessionStorage.setItem('utm_source', 'internal');
      sessionStorage.setItem('utm_medium', 'self_nav');
    } catch {
      /* ignore */
    }
    if (typeof (window as Window & { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag!('set', {
        traffic_type: 'internal',
        campaign_source: 'internal',
        campaign_medium: 'self_nav',
      });
    }
  }
  return cleaned;
}
