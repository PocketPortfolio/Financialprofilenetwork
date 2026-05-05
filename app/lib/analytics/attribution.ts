export type FirstTouchAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_path: string | null;
  captured_at: string; // ISO
  expires_at: string; // ISO
  v: 1;
};

const KEY = 'pp_first_touch_attribution_v1';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function safeRead(): FirstTouchAttribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FirstTouchAttribution>;
    if (parsed.v !== 1) return null;
    if (typeof parsed.expires_at !== 'string') return null;
    if (Date.now() > Date.parse(parsed.expires_at)) return null;
    return parsed as FirstTouchAttribution;
  } catch {
    return null;
  }
}

function safeWrite(value: FirstTouchAttribution) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // localStorage may be blocked; attribution is best-effort
  }
}

function clamp(value: string | null, maxLen: number) {
  if (!value) return null;
  const v = String(value);
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

function readUtmFromUrl(): Pick<
  FirstTouchAttribution,
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content'
> {
  if (typeof window === 'undefined') {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };
  }
  const qs = new URLSearchParams(window.location.search);
  return {
    utm_source: clamp(qs.get('utm_source'), 120),
    utm_medium: clamp(qs.get('utm_medium'), 120),
    utm_campaign: clamp(qs.get('utm_campaign'), 160),
    utm_content: clamp(qs.get('utm_content'), 160),
  };
}

/**
 * Capture first-touch UTM + referrer and persist locally for 30 days.
 * Sovereign: never sent server-side by default; analytics events may stitch it.
 */
export function captureFirstTouchAttribution() {
  if (typeof window === 'undefined') return;
  const existing = safeRead();
  if (existing) return;

  const utm = readUtmFromUrl();
  const now = new Date();
  const value: FirstTouchAttribution = {
    v: 1,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    referrer: clamp(document.referrer || null, 500),
    landing_path: clamp(window.location.pathname || null, 300),
    captured_at: now.toISOString(),
    expires_at: new Date(now.getTime() + TTL_MS).toISOString(),
  };

  safeWrite(value);
}

export function getFirstTouchAttribution(): FirstTouchAttribution | null {
  return safeRead();
}

