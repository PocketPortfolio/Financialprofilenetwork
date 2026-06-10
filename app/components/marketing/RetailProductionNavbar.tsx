'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardLaunchLink from '../nav/DashboardLaunchLink';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import { useStickyHeader } from '../../hooks/useStickyHeader';
import ProductionNavbar from './ProductionNavbar';
import { retailPrimaryNav, isMarketingLandingPath } from '@/app/lib/nav/retailMarketingNav';
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
  const isMarketingHome = isMarketingLandingPath(pathname);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useStickyHeader('header.brand-header');

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMarketingHome) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMenu = () => setMenuOpen(false);

  const linkStyle: React.CSSProperties = {
    fontSize: '15px',
    color: 'var(--text)',
    textDecoration: 'none',
    fontWeight: 500,
  };

  const mobileLinkStyle: React.CSSProperties = {
    fontSize: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'var(--text)',
    background: 'var(--surface)',
    border: '1px solid var(--border-subtle)',
  };

  const renderNavLink = (item: (typeof nav)[number], style: React.CSSProperties, onNavigate?: () => void) =>
    isHashOnlyHref(item.href) ? (
      <a key={item.label} href={item.href} className="brand-link" style={style} onClick={onNavigate}>
        {item.label}
      </a>
    ) : (
      <Link key={item.label} href={item.href} className="brand-link" style={style} onClick={onNavigate}>
        {item.label}
      </Link>
    );

  const launchCtaStyle: React.CSSProperties = {
    padding: '10px 18px',
    background: 'var(--accent-warm)',
    color: '#0b0d10',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <header
        className="brand-header brand-spine"
        style={{
          padding: isMobile ? '12px 16px' : '12px 24px',
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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/"
              scroll={!isMarketingHome}
              onClick={handleLogoClick}
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}
              aria-label={isMarketingHome ? 'Back to top' : 'Pocket Portfolio home'}
            >
              <Logo size="medium" showWordmark={!isMobile} />
            </Link>

            {/* Match ProductionNavbar: landing-nav wrapper + icon hamburger (not text "Menu") */}
            <div className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <nav
                className="desktop-nav mobile-hidden"
                style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                {nav.map((item) => renderNavLink(item, linkStyle))}
                <DashboardLaunchLink style={launchCtaStyle}>Launch App</DashboardLaunchLink>
                <ThemeSwitcher />
              </nav>

              {isMobile && (
                <button
                  type="button"
                  id="retail-mobile-nav-trigger"
                  className="hamburger-btn mobile-only"
                  aria-expanded={menuOpen}
                  aria-controls="retail-mobile-nav"
                  aria-label="Toggle mobile menu"
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    background: 'var(--accent-warm)',
                    border: '2px solid var(--border-warm)',
                    cursor: 'pointer',
                    padding: '12px',
                    borderRadius: '12px',
                    minWidth: '48px',
                    minHeight: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      width: '24px',
                      height: '18px',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '3px',
                        background: 'var(--text)',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                      }}
                    />
                    <span
                      style={{
                        width: '24px',
                        height: '3px',
                        background: 'var(--text)',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        opacity: menuOpen ? 0 : 1,
                      }}
                    />
                    <span
                      style={{
                        width: '24px',
                        height: '3px',
                        background: 'var(--text)',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                      }}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isMobile && menuOpen && (
        <div
          id="retail-mobile-nav"
          className="mobile-menu-overlay mobile-only brand-surface brand-grid"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          style={{
            display: 'block',
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '80px 24px 24px',
            overflowY: 'auto',
          }}
          onClick={closeMenu}
        >
          <nav
            style={{
              background: 'var(--surface-elevated)',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '400px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {nav.map((item) => renderNavLink(item, mobileLinkStyle, closeMenu))}
            <DashboardLaunchLink
              onClick={closeMenu}
              style={{
                ...launchCtaStyle,
                textAlign: 'center',
                padding: '12px 18px',
                fontSize: '16px',
              }}
            >
              Launch App
            </DashboardLaunchLink>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '15px', color: 'var(--text)' }}>Theme</span>
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
