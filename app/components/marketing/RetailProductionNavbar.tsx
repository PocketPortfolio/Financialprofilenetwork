'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardLaunchLink from '../nav/DashboardLaunchLink';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import ProductionNavbar from './ProductionNavbar';
import { retailPrimaryNav } from '@/app/lib/nav/retailMarketingNav';
import { isHashOnlyHref } from '@/app/lib/nav/sovereignMarketingNav';
import type { LandingPageVariant } from '@/lib/landing-retail-variant';

type RetailProductionNavbarProps = {
  variant: LandingPageVariant;
};

/**
 * Retail variant uses a slim B2C nav; control falls through to ProductionNavbar.
 */
export default function LandingProductionNavbar({ variant }: RetailProductionNavbarProps) {
  if (variant === 'control') {
    return <ProductionNavbar />;
  }
  return <RetailProductionNavbarInner />;
}

function RetailProductionNavbarInner() {
  const pathname = usePathname() ?? '/';
  const nav = retailPrimaryNav(pathname, 'landing');

  return (
    <header
      className="brand-header brand-spine"
      style={{
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
        borderBottom: '1px solid var(--border-warm)',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Logo size="medium" showWordmark />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {nav.map((item) =>
            isHashOnlyHref(item.href) ? (
              <a
                key={item.label}
                href={item.href}
                className="brand-link"
                style={{ fontSize: '15px', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="brand-link"
                style={{ fontSize: '15px', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}
              >
                {item.label}
              </Link>
            )
          )}
          <DashboardLaunchLink
            style={{
              padding: '10px 18px',
              background: 'var(--accent-warm)',
              color: '#0b0d10',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            Launch App
          </DashboardLaunchLink>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
