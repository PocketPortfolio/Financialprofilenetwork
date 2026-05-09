'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  LayoutDashboard,
  LineChart,
  Bookmark,
  FileUp,
  Settings2,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  href: string;
  ariaLabel: string;
  icon: LucideIcon;
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    href: '/dashboard',
    ariaLabel: 'Open portfolio dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'positions',
    label: 'Positions',
    href: '/positions',
    ariaLabel: 'View positions and holdings',
    icon: LineChart,
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    href: '/watchlist',
    ariaLabel: 'Open watchlist',
    icon: Bookmark,
  },
  {
    id: 'import',
    label: 'Import',
    href: '/import',
    ariaLabel: 'Import trades and statements',
    icon: FileUp,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    ariaLabel: 'Account and settings',
    icon: Settings2,
  },
  {
    id: 'sponsor',
    label: 'Support',
    href: '/sponsor',
    ariaLabel: 'Support Pocket Portfolio',
    icon: HeartHandshake,
  },
];

function isTabActive(tabId: string, pathname: string | null): boolean {
  const p = pathname ?? '';
  switch (tabId) {
    case 'dashboard':
      return p === '/dashboard' || p === '/';
    case 'positions':
      return p.startsWith('/positions');
    case 'watchlist':
      return p.startsWith('/watchlist');
    case 'import':
      return p.startsWith('/import');
    case 'settings':
      return p.startsWith('/settings');
    case 'sponsor':
      return p.startsWith('/sponsor');
    default:
      return false;
  }
}

export default function TabBar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (isMobile === null) {
    return null;
  }

  // Mobile (≤768px): always show. Desktop: only when signed in (after auth resolves).
  if (!isMobile) {
    if (loading) return null;
    if (!isAuthenticated) return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="App quick navigation"
      className={`mobile-tab-bar pp-tab-bar ${className}`}
    >
      {tabs.map((tab) => {
        const active = isTabActive(tab.id, pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            prefetch
            aria-label={tab.ariaLabel}
            aria-current={active ? 'page' : undefined}
            {...(active ? { 'data-active': 'true' as const } : {})}
            className="mobile-tab-item pp-tab-item"
          >
            <span className="pp-tab-icon" aria-hidden>
              <Icon strokeWidth={active ? 2.25 : 2} size={22} className="pp-tab-icon-svg" />
            </span>
            <span className="mobile-tab-label pp-tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
