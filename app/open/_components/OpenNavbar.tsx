'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';
import SurfaceSwitcher from '../../components/SurfaceSwitcher';
import { useStickyHeader } from '../../hooks/useStickyHeader';
import { OPEN_NAV, OPEN_PRIMARY_CTA } from '../../../lib/canonical-claims';

export default function OpenNavbar() {
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fixed header like Pocket — do NOT put transform on this element (breaks sticky).
  useStickyHeader('header.open-brand-header');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isLanding = pathname === '/';

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLanding) return;
    e.preventDefault();
    const top = document.getElementById('open-landing-top');
    if (top) {
      top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLink = (item: (typeof OPEN_NAV)[number]) => (
    <Link
      key={item.href}
      href={item.href}
      style={{
        color: isActive(item.href) ? 'var(--text)' : 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: isMobile ? '15px' : '13px',
        fontWeight: isActive(item.href) ? 600 : 500,
        letterSpacing: '0.01em',
        padding: isMobile ? '12px 8px' : '8px 12px',
        borderRadius: '6px',
        borderBottom: isMobile ? '1px solid var(--border-subtle)' : undefined,
        display: 'block',
        boxShadow: !isMobile && isActive(item.href) ? 'inset 0 -2px 0 var(--accent-warm)' : undefined,
      }}
    >
      {item.label}
    </Link>
  );

  return (
    <header
      className="open-brand-header"
      style={{
        padding: isMobile ? '10px 16px' : '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        background: 'linear-gradient(135deg, rgba(11, 13, 16, 0.94) 0%, rgba(17, 20, 24, 0.94) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
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
          gap: '12px',
        }}
      >
        <Link
          href="/"
          onClick={handleLogoClick}
          aria-label={isLanding ? 'Open Portfolio home — scroll to top' : 'Open Portfolio home'}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
        >
          <Logo size="large" variant="open" />
        </Link>

        {isMobile ? (
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="open-nav-drawer"
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              padding: '8px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        ) : (
          <nav
            aria-label="Open Portfolio primary navigation"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}
          >
            {OPEN_NAV.map(navLink)}
            <SurfaceSwitcher target="pocket" label="Consumer" />
            <motion.a
              href={OPEN_PRIMARY_CTA.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 16px',
                background: 'var(--accent-warm)',
                color: '#0b0d10',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '6px',
                marginLeft: '8px',
              }}
            >
              {OPEN_PRIMARY_CTA.label}
            </motion.a>
          </nav>
        )}
      </div>

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.nav
            id="open-nav-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            aria-label="Open Portfolio mobile navigation"
            style={{
              overflow: 'hidden',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(11, 13, 16, 0.98)',
            }}
          >
            <div style={{ padding: '8px 16px 16px' }}>
              {OPEN_NAV.map(navLink)}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  paddingTop: '12px',
                  alignItems: 'center',
                }}
              >
                <SurfaceSwitcher target="pocket" label="Consumer" />
                <a
                  href={OPEN_PRIMARY_CTA.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 16px',
                    background: 'var(--accent-warm)',
                    color: '#0b0d10',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                >
                  {OPEN_PRIMARY_CTA.label}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
