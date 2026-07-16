import type { FeedbackSurface } from './types';

const VISITS_KEY = 'pp_feedback_dashboard_visits_v1';
const SNOOZE_KEY = 'pp_feedback_prompt_snooze_v1';
const DISMISSED_KEY = 'pp_feedback_prompt_dismissed_v1';

type VisitState = { timestamps: number[] };

function readJson(key: string): any | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors; feedback prompting must not block product UX
  }
}

export function recordDashboardVisit(now = Date.now()) {
  if (typeof window === 'undefined') return;
  const state = (readJson(VISITS_KEY) as VisitState | null) ?? { timestamps: [] };
  const next = {
    timestamps: Array.isArray(state.timestamps) ? state.timestamps.concat([now]) : [now],
  };
  writeJson(VISITS_KEY, next);
}

export function dashboardVisitCountInWindow(opts?: { now?: number; windowDays?: number }): number {
  if (typeof window === 'undefined') return 0;
  const now = opts?.now ?? Date.now();
  const windowDays = Math.max(1, Math.min(opts?.windowDays ?? 7, 30));
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  const state = (readJson(VISITS_KEY) as VisitState | null) ?? { timestamps: [] };
  const ts = Array.isArray(state.timestamps) ? state.timestamps : [];
  const pruned = ts.filter((t) => typeof t === 'number' && Number.isFinite(t) && t >= cutoff && t <= now);
  if (pruned.length !== ts.length) writeJson(VISITS_KEY, { timestamps: pruned });
  return pruned.length;
}

export function snoozeFeedbackPrompt(days = 7, now = Date.now()) {
  if (typeof window === 'undefined') return;
  const ms = Math.max(1, Math.min(days, 30)) * 24 * 60 * 60 * 1000;
  try {
    localStorage.setItem(SNOOZE_KEY, String(now + ms));
  } catch {
    // ignore
  }
}

export function dismissFeedbackPromptPermanently() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    // ignore
  }
}

export function isFeedbackPromptSnoozedOrDismissed(now = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(DISMISSED_KEY) === '1') return true;
    const snoozeUntilRaw = localStorage.getItem(SNOOZE_KEY);
    const snoozeUntil = snoozeUntilRaw ? Number.parseInt(snoozeUntilRaw, 10) : 0;
    return Number.isFinite(snoozeUntil) && snoozeUntil > now;
  } catch {
    return false;
  }
}

export function shouldPromptForFeedback(params: {
  isAuthenticated: boolean;
  surface: FeedbackSurface;
  now?: number;
  minDashboardVisitsInWindow?: number;
  windowDays?: number;
}): { eligible: boolean; visitCount: number } {
  const now = params.now ?? Date.now();
  if (!params.isAuthenticated) return { eligible: false, visitCount: 0 };
  if (params.surface !== 'pocket') {
    // Feedback prompt is a Pocket harness mechanism; Open surface is receipts consumer.
    return { eligible: false, visitCount: 0 };
  }
  if (isFeedbackPromptSnoozedOrDismissed(now)) {
    return { eligible: false, visitCount: dashboardVisitCountInWindow({ now, windowDays: params.windowDays }) };
  }
  const visitCount = dashboardVisitCountInWindow({ now, windowDays: params.windowDays });
  const min = Math.max(1, Math.min(params.minDashboardVisitsInWindow ?? 5, 50));
  return { eligible: visitCount >= min, visitCount };
}

