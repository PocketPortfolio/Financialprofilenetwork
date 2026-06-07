import {
  LayoutDashboard,
  LineChart,
  Bookmark,
  FileUp,
  Settings2,
  Radio,
  Wrench,
  BookOpen,
  BarChart3,
  ShoppingBag,
  LifeBuoy,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react';

/**
 * Desktop rail navigation labels — user-facing copy only.
 *
 * Governance: Must match SovereignHeader mobile menu + TabBar vocabulary.
 * GSC is a layout reference (persistent rail, collapsible groups), not a label source.
 * Do not ship SEO/webmaster terms (Indexing, Sitemaps, Core Web Vitals, etc.).
 */

export type DashboardNavAction = 'import-modal' | 'support-modal';

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  action?: DashboardNavAction;
  adminOnly?: boolean;
};

export type DashboardNavSection = {
  id: string;
  label: string;
  defaultOpen?: boolean;
  adminOnly?: boolean;
  items: DashboardNavItem[];
};

/** Top-level rail — mirrors primary app destinations. */
export const DASHBOARD_NAV_PRIMARY: DashboardNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'holdings',
    label: 'Holdings',
    href: '/positions',
    icon: LineChart,
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    href: '/watchlist',
    icon: Bookmark,
  },
];

/** Grouped destinations — Pocket Portfolio vocabulary (not GSC label paste). */
export const DASHBOARD_NAV_SECTIONS: DashboardNavSection[] = [
  {
    id: 'data',
    label: 'Data',
    defaultOpen: false,
    items: [
      {
        id: 'import-csv',
        label: 'Import CSV',
        href: '/dashboard',
        icon: FileUp,
        action: 'import-modal',
      },
      {
        id: 'import-center',
        label: 'Import',
        href: '/import',
        icon: FileUp,
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    defaultOpen: false,
    items: [
      {
        id: 'live',
        label: 'Live Market Data',
        href: '/live',
        icon: Radio,
      },
      {
        id: 'tax-tools',
        label: 'Tax Converters',
        href: '/tools',
        icon: Wrench,
      },
      {
        id: 'directory',
        label: 'JSON API Directory',
        href: '/s/directory',
        icon: BookOpen,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    defaultOpen: false,
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings2,
      },
      {
        id: 'support',
        label: 'Support',
        href: '#',
        icon: LifeBuoy,
        action: 'support-modal',
      },
      {
        id: 'utility',
        label: 'Developer Utility',
        href: '/sponsor',
        icon: HeartHandshake,
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    defaultOpen: false,
    adminOnly: true,
    items: [
      {
        id: 'admin-analytics',
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        adminOnly: true,
      },
      {
        id: 'admin-sales',
        label: 'Sales',
        href: '/admin/sales',
        icon: ShoppingBag,
        adminOnly: true,
      },
      {
        id: 'admin-support',
        label: 'View support',
        href: '/admin/support',
        icon: LifeBuoy,
        adminOnly: true,
      },
    ],
  },
];

export function isDashboardNavItemActive(item: DashboardNavItem, pathname: string): boolean {
  if (item.action) {
    return false;
  }
  if (item.id === 'dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  if (item.href === '/dashboard') {
    return false;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** GSC placeholder labels — must never ship as user-facing copy (CPO/HoCS gate). */
export const BANNED_DESKTOP_NAV_LABELS = [
  'Indexing',
  'Pages',
  'Sitemaps',
  'Experience',
  'Core Web Vitals',
  'Enhancements',
  'Audit Logs',
  'Overview',
  'Insights',
  'Performance',
] as const;

/** Flat list of routable hrefs for production route-existence checks. */
export function getDashboardNavRoutableHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const item of DASHBOARD_NAV_PRIMARY) {
    if (!item.action && item.href.startsWith('/')) hrefs.add(item.href);
  }
  for (const section of DASHBOARD_NAV_SECTIONS) {
    for (const item of section.items) {
      if (!item.action && item.href.startsWith('/')) hrefs.add(item.href);
    }
  }
  return [...hrefs].sort();
}

/** SovereignHeader mobile overlay SSOT — href + label pairs that must match config semantics. */
export const MOBILE_NAV_SSOT_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Holdings', href: '/positions' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'Import', href: '/import' },
  { label: 'Settings', href: '/settings' },
  { label: 'Live Market Data', href: '/live' },
  { label: 'Tax Converters', href: '/tools' },
  { label: 'JSON API Directory', href: '/s/directory' },
  { label: 'Developer Utility', href: '/sponsor' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Sales', href: '/admin/sales' },
  { label: 'View support', href: '/admin/support' },
];

/** Modal actions that must exist in both desktop rail and SovereignHeader mobile menu. */
export const MOBILE_NAV_SSOT_ACTIONS: ReadonlyArray<{ label: string; action: DashboardNavAction }> = [
  { label: 'Import CSV', action: 'import-modal' },
  { label: 'Support', action: 'support-modal' },
];
