import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  BANNED_DESKTOP_NAV_LABELS,
  DASHBOARD_NAV_PRIMARY,
  DASHBOARD_NAV_SECTIONS,
  MOBILE_NAV_SSOT_ACTIONS,
  MOBILE_NAV_SSOT_LINKS,
  getDashboardNavRoutableHrefs,
  isDashboardNavItemActive,
} from '../../app/lib/nav/dashboardNavConfig';

const APP_ROOT = join(process.cwd(), 'app');

function routeExists(href: string): boolean {
  if (href.startsWith('/admin/')) {
    const segment = href.replace('/admin/', '');
    return existsSync(join(APP_ROOT, 'admin', segment, 'page.tsx'));
  }
  if (href === '/s/directory') {
    return existsSync(join(APP_ROOT, 's', 'directory', 'page.tsx'));
  }
  const segment = href.replace(/^\//, '');
  return existsSync(join(APP_ROOT, segment, 'page.tsx'));
}

describe('dashboardNavConfig — org SSOT & production routing', () => {
  it('uses Pocket vocabulary only (no GSC placeholder labels)', () => {
    const labels = [
      ...DASHBOARD_NAV_PRIMARY.map((i) => i.label),
      ...DASHBOARD_NAV_SECTIONS.flatMap((s) => [s.label, ...s.items.map((i) => i.label)]),
    ];
    for (const banned of BANNED_DESKTOP_NAV_LABELS) {
      expect(labels).not.toContain(banned);
    }
  });

  it('maps primary rail to correct routes (CPO IA)', () => {
    expect(DASHBOARD_NAV_PRIMARY.find((i) => i.id === 'dashboard')?.href).toBe('/dashboard');
    expect(DASHBOARD_NAV_PRIMARY.find((i) => i.id === 'holdings')?.href).toBe('/positions');
    expect(DASHBOARD_NAV_PRIMARY.find((i) => i.id === 'watchlist')?.href).toBe('/watchlist');
  });

  it('every routable href resolves to an app route file', () => {
    for (const href of getDashboardNavRoutableHrefs()) {
      expect(routeExists(href), `missing route file for ${href}`).toBe(true);
    }
  });

  it('Import CSV uses modal action, Import page uses /import', () => {
    const data = DASHBOARD_NAV_SECTIONS.find((s) => s.id === 'data');
    expect(data?.items.find((i) => i.id === 'import-csv')?.action).toBe('import-modal');
    expect(data?.items.find((i) => i.id === 'import-center')?.href).toBe('/import');
  });

  it('Support opens modal, not navigation', () => {
    const support = DASHBOARD_NAV_SECTIONS.find((s) => s.id === 'account')?.items.find(
      (i) => i.id === 'support'
    );
    expect(support?.action).toBe('support-modal');
    expect(support?.href).toBe('#');
  });

  it('admin section is gated', () => {
    const admin = DASHBOARD_NAV_SECTIONS.find((s) => s.id === 'admin');
    expect(admin?.adminOnly).toBe(true);
    expect(admin?.items.every((i) => i.adminOnly)).toBe(true);
  });

  it('active state highlights dashboard root only for Dashboard item', () => {
    expect(isDashboardNavItemActive(DASHBOARD_NAV_PRIMARY[0], '/dashboard')).toBe(true);
    expect(isDashboardNavItemActive(DASHBOARD_NAV_PRIMARY[0], '/')).toBe(true);
    const holdings = DASHBOARD_NAV_PRIMARY.find((i) => i.id === 'holdings')!;
    expect(isDashboardNavItemActive(holdings, '/dashboard')).toBe(false);
    expect(isDashboardNavItemActive(holdings, '/positions')).toBe(true);
  });

  it('mobile SovereignHeader link targets are covered by desktop config routes', () => {
    const desktopHrefs = new Set(getDashboardNavRoutableHrefs());
    for (const mobile of MOBILE_NAV_SSOT_LINKS) {
      expect(desktopHrefs.has(mobile.href), `${mobile.label} -> ${mobile.href}`).toBe(true);
    }
  });

  it('SovereignHeader mobile menu implements SSOT hrefs (CPO/HoCS org gate)', () => {
    const source = readFileSync(join(APP_ROOT, 'components', 'dashboard', 'SovereignHeader.tsx'), 'utf8');
    for (const { label, href } of MOBILE_NAV_SSOT_LINKS) {
      expect(source, `${label} missing href ${href}`).toContain(`href="${href}"`);
    }
    for (const { label } of MOBILE_NAV_SSOT_ACTIONS) {
      expect(source, `${label} action missing`).toContain(label);
    }
    for (const banned of BANNED_DESKTOP_NAV_LABELS) {
      expect(source).not.toContain(`>${banned}<`);
    }
  });

  it('DesktopNav consumes dashboardNavConfig SSOT', () => {
    const source = readFileSync(join(APP_ROOT, 'components', 'nav', 'DesktopNav.tsx'), 'utf8');
    expect(source).toContain('dashboardNavConfig');
    expect(source).toContain('DASHBOARD_NAV_PRIMARY');
    expect(source).toContain('DASHBOARD_NAV_SECTIONS');
    expect(source).toContain('data-tour="desktop-nav-rail"');
  });

  it('OnboardingTour uses dashboardTourConfig SSOT', () => {
    const source = readFileSync(join(APP_ROOT, 'components', 'OnboardingTour.tsx'), 'utf8');
    expect(source).toContain('dashboardTourConfig');
    expect(source).toContain('ONBOARDING_TOUR_STORAGE_KEY');
  });

  it('live route uses dashboard shell layout (SovereignHeader + DesktopNav)', () => {
    const source = readFileSync(join(APP_ROOT, 'live', 'layout.tsx'), 'utf8');
    expect(source).toContain('DashboardClientLayout');
  });
});
