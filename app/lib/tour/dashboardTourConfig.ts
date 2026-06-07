import type { DriveStep } from 'driver.js';
import {
  BANNED_DESKTOP_NAV_LABELS,
  DASHBOARD_NAV_PRIMARY,
  DASHBOARD_NAV_SECTIONS,
} from '@/app/lib/nav/dashboardNavConfig';

/** Bump when tour steps/copy change materially — users see the tour once per version. */
export const ONBOARDING_TOUR_STORAGE_KEY = 'pocket_onboarding_v2_seen';

export const DASHBOARD_TOUR_SELECTORS = {
  sovereignHeader: '[data-tour="sovereign-header"]',
  navMenuToggle: '[data-tour="nav-menu-toggle"]',
  desktopNavRail: '[data-tour="desktop-nav-rail"]',
  mobileTabBar: '[data-tour="mobile-tab-bar"]',
  morningBrief: '[data-tour="morning-brief"]',
  terminalSummary: '[data-tour="terminal-summary"]',
  dataInputDeck: '[data-tour="data-input-deck"], #add-trade',
  localFirstStrip: '[data-tour="dashboard-next-action"]',
  foundersClubBanner: '[data-tour="founders-club-banner"]',
  dashboardGetStarted: '[data-tour="dashboard-get-started"]',
  mobileHandoff: '[data-tour="dashboard-mobile-handoff"]',
} as const;

export type DashboardTourPlatform = 'desktop' | 'mobile';

export type DashboardTourStepDef = {
  id: string;
  selector: keyof typeof DASHBOARD_TOUR_SELECTORS;
  title: string;
  description: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  platforms: DashboardTourPlatform[];
  /** Skip step when element missing (default true). */
  optional?: boolean;
};

const primaryLabels = DASHBOARD_NAV_PRIMARY.map((i) => i.label).join(', ');
const sectionLabels = DASHBOARD_NAV_SECTIONS.filter((s) => !s.adminOnly)
  .map((s) => s.label)
  .join(', ');

export const DASHBOARD_TOUR_STEP_DEFS: DashboardTourStepDef[] = [
  {
    id: 'header',
    selector: 'sovereignHeader',
    title: '◈ Your terminal header',
    description:
      'UTC clock, sync status, and account controls live here. This is your fixed command bar while the dashboard scrolls beneath.',
    side: 'bottom',
    align: 'start',
    platforms: ['desktop', 'mobile'],
  },
  {
    id: 'nav-toggle-desktop',
    selector: 'navMenuToggle',
    title: '☰ Open the app rail',
    description:
      'On desktop, this toggles a persistent side rail — not a full-screen overlay. Holdings, import, tools, and settings stay one click away.',
    side: 'bottom',
    align: 'start',
    platforms: ['desktop'],
  },
  {
    id: 'nav-toggle-mobile',
    selector: 'navMenuToggle',
    title: '☰ Open the app menu',
    description:
      'On mobile, this opens the full app menu with the same destinations as desktop — Dashboard, Holdings, Watchlist, Import, Tools, and Account.',
    side: 'bottom',
    align: 'start',
    platforms: ['mobile'],
  },
  {
    id: 'desktop-rail',
    selector: 'desktopNavRail',
    title: '◈ App navigation rail',
    description: `Primary: ${primaryLabels}. Grouped sections: ${sectionLabels}. Import CSV opens a modal; Import page is under Data.`,
    side: 'right',
    align: 'start',
    platforms: ['desktop'],
  },
  {
    id: 'mobile-tab-bar',
    selector: 'mobileTabBar',
    title: '◈ Quick navigation',
    description:
      'Thumb reach shortcuts: Home, Positions, Watchlist, Import, Settings, and Utility — same routes as the header menu.',
    side: 'top',
    align: 'center',
    platforms: ['mobile'],
  },
  {
    id: 'local-first',
    selector: 'localFirstStrip',
    title: '◈ Local-first by default',
    description:
      'Your ledger stays in the browser until you opt into sync. Search tickers for context, then import or add trades — nothing hits our servers by default.',
    side: 'bottom',
    align: 'start',
    platforms: ['desktop', 'mobile'],
    optional: true,
  },
  {
    id: 'terminal-summary',
    selector: 'terminalSummary',
    title: '◈ Terminal summary',
    description:
      'Mark-to-market value, benchmark alpha, invested capital, trade count, and unrealized P/L — updated as your portfolio changes.',
    side: 'bottom',
    align: 'start',
    platforms: ['desktop', 'mobile'],
    optional: true,
  },
  {
    id: 'client-brief',
    selector: 'morningBrief',
    title: '◈ Client Brief · Pocket Analyst',
    description:
      'Three paste-ready bullets for client emails — performance vs benchmark, top drivers, and risk. Generated via stateless Pocket Analyst inference on a sanitized snapshot (raw ledger never leaves your browser).',
    side: 'bottom',
    align: 'start',
    platforms: ['desktop', 'mobile'],
    optional: true,
  },
  {
    id: 'import-deck',
    selector: 'dataInputDeck',
    title: '◈ Universal import',
    description:
      'Drag and drop any broker CSV here, or use ☰ → Data → Import CSV. Auto-detection for 20+ brokers; Smart Mapping for everything else.',
    side: 'top',
    align: 'start',
    platforms: ['desktop', 'mobile'],
  },
  {
    id: 'desktop-get-started',
    selector: 'dashboardGetStarted',
    title: '◈ Get started in 3 steps',
    description: 'Export from your broker, drop the CSV in the zone below, and analyze locally — no account required to try demo data.',
    side: 'top',
    align: 'center',
    platforms: ['desktop'],
    optional: true,
  },
  {
    id: 'mobile-handoff',
    selector: 'mobileHandoff',
    title: '◈ Desktop-grade workflow',
    description:
      'Pocket Portfolio is built for desktop analysis. Enter your email to receive a secure setup link and continue on a larger screen.',
    side: 'top',
    align: 'center',
    platforms: ['mobile'],
    optional: true,
  },
  {
    id: 'founders-club',
    selector: 'foundersClubBanner',
    title: '◈ Founders Club',
    description:
      'Unlock premium Sovereign themes, Google Drive sync, expanded API access, and support the project. Limited spots available.',
    side: 'bottom',
    align: 'center',
    platforms: ['desktop', 'mobile'],
    optional: true,
  },
];

const DESKTOP_NAV_STORAGE_KEY = 'pp-desktop-nav-open';
const DESKTOP_NAV_SECTION_PREFIX = 'pp-desktop-nav-section-';

/** Ensure rail is visible before the tour highlights it (desktop only). */
export function prepareDesktopTourRail(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DESKTOP_NAV_STORAGE_KEY, 'true');
    for (const section of DASHBOARD_NAV_SECTIONS) {
      if (!section.adminOnly) {
        sessionStorage.setItem(`${DESKTOP_NAV_SECTION_PREFIX}${section.id}`, 'true');
      }
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('pp-desktop-nav-tour-open'));
}

export function isDesktopTourViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 768px)').matches;
}

export function queryTourElements(): Partial<Record<keyof typeof DASHBOARD_TOUR_SELECTORS, HTMLElement>> {
  if (typeof document === 'undefined') return {};
  const out: Partial<Record<keyof typeof DASHBOARD_TOUR_SELECTORS, HTMLElement>> = {};
  for (const [key, selector] of Object.entries(DASHBOARD_TOUR_SELECTORS) as Array<
    [keyof typeof DASHBOARD_TOUR_SELECTORS, string]
  >) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) out[key] = el;
  }
  return out;
}

export function buildDashboardTourSteps(
  platform: DashboardTourPlatform,
  elements: Partial<Record<keyof typeof DASHBOARD_TOUR_SELECTORS, HTMLElement>>
): DriveStep[] {
  const steps: DriveStep[] = [];

  for (const def of DASHBOARD_TOUR_STEP_DEFS) {
    if (!def.platforms.includes(platform)) continue;

    const element = elements[def.selector];
    if (!element) {
      if (def.optional) continue;
      if (def.selector !== 'dataInputDeck') continue;
      continue;
    }

    steps.push({
      element,
      popover: {
        title: def.title,
        description: def.description,
        side: def.side,
        align: def.align,
      },
    });
  }

  return steps;
}

/** CPO gate — tour copy must not reintroduce GSC placeholder labels. */
export function assertTourCopyGovernance(): void {
  const copy = DASHBOARD_TOUR_STEP_DEFS.map((s) => `${s.title} ${s.description}`).join(' ');
  for (const banned of BANNED_DESKTOP_NAV_LABELS) {
    if (copy.includes(banned)) {
      throw new Error(`Tour copy contains banned label: ${banned}`);
    }
  }
}

assertTourCopyGovernance();
