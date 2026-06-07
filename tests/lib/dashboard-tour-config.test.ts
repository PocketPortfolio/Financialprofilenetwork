import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  BANNED_DESKTOP_NAV_LABELS,
  DASHBOARD_NAV_PRIMARY,
} from '../../app/lib/nav/dashboardNavConfig';
import {
  DASHBOARD_TOUR_SELECTORS,
  DASHBOARD_TOUR_STEP_DEFS,
  ONBOARDING_TOUR_STORAGE_KEY,
  buildDashboardTourSteps,
} from '../../app/lib/tour/dashboardTourConfig';

const APP_ROOT = join(process.cwd(), 'app');

describe('dashboardTourConfig — org SSOT & selector gates', () => {
  it('uses v2 onboarding storage key after nav redesign', () => {
    expect(ONBOARDING_TOUR_STORAGE_KEY).toBe('pocket_onboarding_v2_seen');
  });

  it('does not use banned GSC labels in tour copy', () => {
    const copy = DASHBOARD_TOUR_STEP_DEFS.map((s) => `${s.title} ${s.description}`).join('\n');
    for (const banned of BANNED_DESKTOP_NAV_LABELS) {
      expect(copy).not.toContain(banned);
    }
  });

  it('does not reference deprecated Morning Brief or Pulitzer AI copy', () => {
    const copy = DASHBOARD_TOUR_STEP_DEFS.map((s) => `${s.title} ${s.description}`).join('\n');
    expect(copy).not.toMatch(/Morning Brief/i);
    expect(copy).not.toMatch(/Pulitzer/i);
    expect(copy).toContain('Client Brief · Pocket Analyst');
    expect(copy).toContain('Pocket Analyst');
  });

  it('desktop rail step mentions primary nav labels from dashboardNavConfig', () => {
    const rail = DASHBOARD_TOUR_STEP_DEFS.find((s) => s.id === 'desktop-rail');
    expect(rail).toBeDefined();
    for (const item of DASHBOARD_NAV_PRIMARY) {
      expect(rail!.description).toContain(item.label);
    }
  });

  it('every non-optional step selector is wired in source files', () => {
    const sources = [
      readFileSync(join(APP_ROOT, 'components/dashboard/SovereignHeader.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'components/nav/DesktopNav.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'components/nav/TabBar.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'components/dashboard/DataInputDeck.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'components/dashboard/MorningBrief.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'components/dashboard/TerminalSummary.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'dashboard/page.tsx'), 'utf8'),
      readFileSync(join(APP_ROOT, 'components/FoundersClubBanner.tsx'), 'utf8'),
    ].join('\n');

    for (const def of DASHBOARD_TOUR_STEP_DEFS) {
      if (def.optional) continue;
      const attr = DASHBOARD_TOUR_SELECTORS[def.selector];
      const hook = attr.includes('data-tour=')
        ? attr.match(/data-tour="([^"]+)"/)?.[1]
        : null;
      if (hook) {
        expect(sources, `${def.id} missing data-tour="${hook}"`).toContain(`data-tour="${hook}"`);
      }
    }
  });

  it('OnboardingTour consumes dashboardTourConfig SSOT', () => {
    const source = readFileSync(join(APP_ROOT, 'components/OnboardingTour.tsx'), 'utf8');
    expect(source).toContain('dashboardTourConfig');
    expect(source).toContain('ONBOARDING_TOUR_STORAGE_KEY');
    expect(source).not.toContain('pocket_onboarding_seen');
    expect(source).not.toContain('Pulitzer');
  });

  it('dashboard feature announcement waits on v2 tour key', () => {
    const source = readFileSync(join(APP_ROOT, 'dashboard/page.tsx'), 'utf8');
    expect(source).toContain('pocket_onboarding_v2_seen');
  });

  it('buildDashboardTourSteps produces desktop nav steps when elements present', () => {
    const mockEl = document.createElement('div');
    const elements = {
      sovereignHeader: mockEl,
      navMenuToggle: mockEl,
      desktopNavRail: mockEl,
      terminalSummary: mockEl,
      dataInputDeck: mockEl,
      localFirstStrip: mockEl,
    };
    const steps = buildDashboardTourSteps('desktop', elements);
    expect(steps.length).toBeGreaterThanOrEqual(5);
    const titles = steps.map((s) => s.popover?.title ?? '');
    expect(titles.some((t) => t.includes('app rail'))).toBe(true);
    expect(titles.some((t) => t.includes('Client Brief'))).toBe(false);
  });

  it('buildDashboardTourSteps produces mobile tab bar step', () => {
    const mockEl = document.createElement('div');
    const steps = buildDashboardTourSteps('mobile', {
      sovereignHeader: mockEl,
      navMenuToggle: mockEl,
      mobileTabBar: mockEl,
      dataInputDeck: mockEl,
    });
    const titles = steps.map((s) => s.popover?.title ?? '');
    expect(titles.some((t) => t.includes('Quick navigation'))).toBe(true);
    expect(titles.some((t) => t.includes('app rail'))).toBe(false);
  });

  it('tour config module exists on disk', () => {
    expect(existsSync(join(APP_ROOT, 'lib/tour/dashboardTourConfig.ts'))).toBe(true);
  });
});
