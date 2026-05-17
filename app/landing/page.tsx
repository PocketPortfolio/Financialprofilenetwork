'use client';

import Link from 'next/link';
import DashboardLaunchLink from '../components/nav/DashboardLaunchLink';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CommunityContent from '../components/CommunityContent';
import SocialShare from '../components/viral/SocialShare';
import SocialProof from '../components/viral/SocialProof';
import FunnelTracker from '../components/analytics/FunnelTracker';
import { LocalProcessingTerminal } from '../components/LocalProcessingTerminal';
import { useAuth } from '../hooks/useAuth';
import { trackEvent } from '../lib/analytics/events';
import { WebOneBadge } from '../components/hero/WebOneBadge';
import NPMStats from '../components/NPMStats';
import DynamicDownloadCount from '../components/DynamicDownloadCount';
import { useStickyHeader } from '../hooks/useStickyHeader';
import TickerSearch from '../components/TickerSearch';
import { getFoundersClubSpotsRemaining, getFoundersClubScarcityMessage } from '../lib/utils/foundersClub';
import LivingPipeline from '../components/landing/LivingPipeline';
import { AnalystVideo } from '../components/landing/AnalystVideo';
import ScrollReveal from '../components/ui/ScrollReveal';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import {
  sovereignPrimaryNav,
  splitSovereignPrimaryNav,
  sovereignToolsDropdown,
  isHashOnlyHref,
} from '@/app/lib/nav/sovereignMarketingNav';

const LANDING_FAQ_ENTRIES: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'Is Pocket Portfolio free?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Yes. It&apos;s open source. If the community later wants premium data sources, we&apos;ll decide together.
      </p>
    ),
  },
  {
    question: 'How do you handle my data?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        You control your data. We store the minimum needed and make export easy. Read the{' '}
        <Link href="/privacy" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
          Privacy Policy
        </Link>{' '}
        and technical overview on{' '}
        <Link href="/architecture" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
          Architecture
        </Link>
        .
      </p>
    ),
  },
  {
    question: 'Can I contribute?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Please! Check the GitHub repo for issues, roadmap, and contribution guidelines.
      </p>
    ),
  },
  {
    question: 'What data sources do you use for live prices?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        We use multiple data providers including Yahoo Finance, Alpha Vantage, and others with fallback support to
        ensure reliability.
      </p>
    ),
  },
  {
    question: 'Is my portfolio data secure?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Yes, we use industry-standard encryption and follow privacy-first principles. Your data is stored securely and
        you can export it anytime.
      </p>
    ),
  },
  {
    question: 'Can I import data from other platforms?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Yes, we support CSV import from most major brokers with smart normalization to handle different formats.
      </p>
    ),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const safePathname = pathname ?? '/';
  const primaryNav = sovereignPrimaryNav(safePathname, 'landing');
  const { coreNav: beforeFaqNav, faqItem: faqNavItem, architectureItem: architectureNavItem } =
    splitSovereignPrimaryNav(primaryNav);
  const toolsNavLinks = sovereignToolsDropdown(safePathname);
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to dashboard only when user just landed on / after sign-in (not when they clicked logo to visit /)
  const POST_AUTH_REDIRECT_KEY = 'pp-post-auth-redirect-done';
  useEffect(() => {
    if (!user || pathname !== '/') return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)) return;
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, '1');
    router.replace('/dashboard');
  }, [user, pathname, router]);
  const [isMobile, setIsMobile] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [showFoundersSnare, setShowFoundersSnare] = useState(false);
  const [terminalMountKey, setTerminalMountKey] = useState(0);
  const csvDemoInputRef = useRef<HTMLInputElement>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsPanelRect, setToolsPanelRect] = useState<{ top: number; left: number } | null>(null);
  const toolsTriggerRef = useRef<HTMLDivElement>(null);
  const toolsCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowHamburger(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStarGitHub = () => {
    window.open('https://github.com/PocketPortfolio/Financialprofilenetwork', '_blank');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Header positioning is now handled globally by useStickyHeader hook
  useStickyHeader('header.brand-header');

  const updateToolsPanelRect = () => {
    const el = toolsTriggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setToolsPanelRect({ top: r.bottom + 4, left: r.left });
  };

  useLayoutEffect(() => {
    if (!toolsOpen) {
      setToolsPanelRect(null);
      return;
    }
    updateToolsPanelRect();
    window.addEventListener('scroll', updateToolsPanelRect, true);
    window.addEventListener('resize', updateToolsPanelRect);
    return () => {
      window.removeEventListener('scroll', updateToolsPanelRect, true);
      window.removeEventListener('resize', updateToolsPanelRect);
    };
  }, [toolsOpen]);

  useEffect(() => {
    return () => {
      if (toolsCloseTimeoutRef.current) clearTimeout(toolsCloseTimeoutRef.current);
    };
  }, []);

  const isCsvLikeFile = (file: File) => {
    const name = file.name.toLowerCase();
    return (
      name.endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'text/plain'
    );
  };

  const handleHeroDemoFile = React.useCallback((file: File | undefined) => {
    if (!file || !isCsvLikeFile(file)) return;
    setShowFoundersSnare(false);
    setTerminalActive(false);
    setTerminalMountKey((k) => k + 1);
    setTimeout(() => {
      setTerminalActive(true);
      trackEvent('landing_hero_demo_csv_drop', { location: 'hero_dropzone' });
    }, 0);
  }, []);

  const handleHeroDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleHeroDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    handleHeroDemoFile(f);
  };

  const handleHeroDemoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleHeroDemoFile(f);
    e.target.value = '';
  };

  const handleSanitizationSequenceComplete = React.useCallback(() => {
    setShowFoundersSnare(true);
    trackEvent('landing_hero_sanitization_complete', { location: 'hero_dropzone' });
  }, []);

  return (
    <>
      <FunnelTracker 
        funnelName="user_onboarding" 
        stage="landing"
        autoTrackScroll={true}
        autoTrackTime={true}
      />
      <ProductionNavbar />
      
      {/* Header - Positioned below banner (handled globally by useStickyHeader) */}
      {false && (
      <header 
        className="brand-header brand-spine" 
        style={{
          padding: '12px 24px',
          position: 'sticky', // Will be overridden by useStickyHeader
          top: '0', // Will be overridden by useStickyHeader
          left: 0,
          right: 0,
          zIndex: 1000, // Below banner
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
          borderBottom: '1px solid var(--border-warm)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          width: '100%',
          margin: 0
        } as React.CSSProperties}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            {/* Logo */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={handleLogoClick}
            >
              <Logo size="medium" showWordmark={!isMobile} />
            </div>

            {/* Navigation */}
            <div className="landing-nav" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px'
            }}>
              {/* Desktop Navigation Links */}
              <nav className="desktop-nav mobile-hidden" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}>
                {beforeFaqNav.map((link) => {
                  const linkStyle = {
                    fontSize: '15px',
                    padding: '8px 0',
                    borderBottom: '2px solid transparent',
                    textDecoration: 'none',
                    color: 'var(--text)' as const,
                  };
                  const linkEl = isHashOnlyHref(link.href) ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="brand-link"
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--signal)';
                        (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--text)';
                        (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="brand-link"
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--signal)';
                        (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--text)';
                        (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                  if (link.label === 'FIN Pillars') {
                    return (
                      <React.Fragment key={link.label}>
                        {linkEl}
                        <div
                          ref={toolsTriggerRef}
                          style={{ position: 'relative', display: 'inline-block' }}
                          onMouseEnter={() => {
                            if (toolsCloseTimeoutRef.current) {
                              clearTimeout(toolsCloseTimeoutRef.current);
                              toolsCloseTimeoutRef.current = null;
                            }
                            setToolsOpen(true);
                          }}
                          onMouseLeave={() => {
                            toolsCloseTimeoutRef.current = setTimeout(() => setToolsOpen(false), 200);
                          }}
                        >
                          <span
                            className="brand-link"
                            style={{
                              fontSize: '15px',
                              padding: '8px 0',
                              borderBottom: '2px solid transparent',
                              cursor: 'pointer',
                              color: toolsOpen ? 'var(--signal)' : 'var(--text)',
                              borderBottomColor: toolsOpen ? 'var(--signal)' : 'transparent',
                            }}
                            onClick={() => setToolsOpen(!toolsOpen)}
                          >
                            Tools ▾
                          </span>
                          {toolsOpen && toolsPanelRect && typeof document !== 'undefined' && createPortal(
                            <div
                              role="menu"
                              onMouseEnter={() => {
                                if (toolsCloseTimeoutRef.current) {
                                  clearTimeout(toolsCloseTimeoutRef.current);
                                  toolsCloseTimeoutRef.current = null;
                                }
                                setToolsOpen(true);
                              }}
                              onMouseLeave={() => {
                                toolsCloseTimeoutRef.current = setTimeout(() => setToolsOpen(false), 200);
                              }}
                              style={{
                                position: 'fixed',
                                top: toolsPanelRect.top,
                                left: toolsPanelRect.left,
                                minWidth: '180px',
                                background: 'var(--surface-elevated)',
                                border: '2px solid var(--border-warm)',
                                borderRadius: '8px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                padding: '8px 0',
                                zIndex: 10050,
                              }}
                            >
                              {toolsNavLinks.map((t) => (
                                <Link
                                  key={t.label}
                                  href={t.href}
                                  style={{
                                    display: 'block',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    color: 'var(--text)',
                                    textDecoration: 'none',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--muted)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  {t.label}
                                </Link>
                              ))}
                            </div>,
                            document.body
                          )}
                        </div>
                      </React.Fragment>
                    );
                  }
                  return linkEl;
                })}
                {[faqNavItem, architectureNavItem].map((item) =>
                  isHashOnlyHref(item.href) ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="brand-link"
                      style={{
                        fontSize: '15px',
                        padding: '8px 0',
                        borderBottom: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--signal)';
                        (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--text)';
                        (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="brand-link"
                      style={{
                        fontSize: '15px',
                        padding: '8px 0',
                        borderBottom: '2px solid transparent',
                        textDecoration: 'none',
                        color: 'var(--text)',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--signal)';
                        (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--text)';
                        (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>

              {/* Action Buttons */}
              <div className="action-buttons mobile-hidden" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <DashboardLaunchLink className="brand-button brand-button-primary" style={{ 
                  padding: '10px 20px', 
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
                  border: '2px solid var(--border-warm)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
                  (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
                }}
                >
                  Launch App
                </DashboardLaunchLink>
                <a
                  href="/sponsor?utm_source=landing&utm_medium=hero_secondary&utm_campaign=founders_club"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '2px solid var(--border-warm)',
                    borderRadius: '12px',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E1306C';
                    e.currentTarget.style.color = '#E1306C';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-warm)';
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="sponsor-heart"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E1306C"/>
                  </svg>
                  Utility
                </a>
                <ThemeSwitcher />
              </div>

              {/* Mobile Hamburger Menu Button */}
              {showHamburger && (
                <button
                  className="hamburger-btn mobile-only"
                  onClick={toggleMobileMenu}
                  style={{
                    background: 'var(--accent-warm)',
                    border: '2px solid var(--border-warm)',
                    cursor: 'pointer',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--text-warm)',
                    fontSize: '16px',
                    fontWeight: '600',
                    minWidth: '48px',
                    minHeight: '48px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
                  (e.target as HTMLElement).style.borderColor = 'var(--border-warm)';
                  (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                  (e.target as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'var(--accent-warm)';
                  (e.target as HTMLElement).style.borderColor = 'var(--border-warm)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  width: '24px',
                  height: '18px'
                }}>
                  <span style={{
                    width: '36px',
                    height: '8px',
                    background: 'var(--accent-warm)',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                    transform: isMobileMenuOpen ? 'rotate(45deg) translate(9px, 9px)' : 'none',
                    boxShadow: '0 2px 8px color-mix(in srgb, var(--accent-warm) 45%, transparent)',
                    border: '1px solid var(--border-warm)'
                  }}></span>
                  <span style={{
                    width: '36px',
                    height: '8px',
                    background: 'var(--accent-warm)',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                    opacity: isMobileMenuOpen ? 0 : 1,
                    boxShadow: '0 2px 8px color-mix(in srgb, var(--accent-warm) 45%, transparent)',
                    border: '1px solid var(--border-warm)'
                  }}></span>
                  <span style={{
                    width: '36px',
                    height: '8px',
                    background: 'var(--accent-warm)',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                    transform: isMobileMenuOpen ? 'rotate(-45deg) translate(9px, -9px)' : 'none',
                    boxShadow: '0 2px 8px color-mix(in srgb, var(--accent-warm) 45%, transparent)',
                    border: '1px solid var(--border-warm)'
                  }}></span>
                </div>
              </button>
              )}
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Mobile Menu Overlay */}
      {false && showHamburger && isMobileMenuOpen && (
        <div className="mobile-menu-overlay mobile-only brand-surface brand-grid" style={{
              display: isMobileMenuOpen ? 'block' : 'none',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              overscrollBehavior: 'contain', // Prevent scroll chaining
              paddingTop: '20px', // Top padding for close button
              paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))` // Account for iPhone safe area + extra padding
            }}>
          {/* Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '24px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease',
              zIndex: 1001 // Ensure close button is above content
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'var(--chrome)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
            }}
            aria-label="Close mobile menu"
          >
            ×
          </button>
          
          {/* Mobile Navigation Links */}
          <nav className="brand-card brand-candlestick brand-spine" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '32px',
            padding: '24px',
            background: 'var(--surface)',
            borderRadius: '12px',
            margin: '80px 20px 32px 20px'
          }}>
            {beforeFaqNav.map((link) => {
              const row = {
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: '1px solid var(--border-warm)',
              } as const;
              const close = () => setIsMobileMenuOpen(false);
              const linkEl = isHashOnlyHref(link.href) ? (
                <a key={link.label} href={link.href} onClick={close} style={row}>
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={close}
                  style={{ ...row, display: 'block' }}
                >
                  {link.label}
                </Link>
              );
              if (link.label === 'FIN Pillars') {
                return (
                  <React.Fragment key={link.label}>
                    {linkEl}
                    <details style={{ margin: 0 }}>
                      <summary
                        style={{
                          color: 'var(--text)',
                          fontSize: '18px',
                          fontWeight: '500',
                          padding: '12px 0',
                          borderBottom: '1px solid var(--border-warm)',
                          cursor: 'pointer',
                          listStyle: 'none',
                        }}
                      >
                        Tools
                      </summary>
                      <div
                        style={{
                          paddingLeft: '16px',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        {toolsNavLinks.map((t) =>
                          isHashOnlyHref(t.href) ? (
                            <a
                              key={t.label}
                              href={t.href}
                              onClick={close}
                              style={{
                                color: 'var(--text)',
                                textDecoration: 'none',
                                fontSize: '16px',
                                padding: '10px 0',
                              }}
                            >
                              {t.label}
                            </a>
                          ) : (
                            <Link
                              key={t.label}
                              href={t.href}
                              onClick={close}
                              style={{
                                color: 'var(--text)',
                                textDecoration: 'none',
                                fontSize: '16px',
                                padding: '10px 0',
                              }}
                            >
                              {t.label}
                            </Link>
                          )
                        )}
                      </div>
                    </details>
                  </React.Fragment>
                );
              }
              return linkEl;
            })}
            {[faqNavItem, architectureNavItem].map((item) =>
              isHashOnlyHref(item.href) ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-warm)',
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-warm)',
                    display: 'block',
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

              {/* Mobile Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '0 20px 20px 20px',
                marginBottom: `calc(20px + env(safe-area-inset-bottom, 0px))` // Extra bottom margin for iPhone to ensure Sponsor button is visible
              }}>
                {/* Launch App Button */}
                <DashboardLaunchLink 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ 
                    width: '100%',
                    padding: '16px 24px', 
                    background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '12px', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    textAlign: 'center',
                    border: '2px solid var(--border-warm)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, var(--accent-warm) 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🚀</span>
                  Launch App
                </DashboardLaunchLink>

                {/* Theme Switcher */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, var(--warm-bg) 0%, var(--accent-warm) 100%)',
                  border: '2px solid var(--border-warm)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                }}>
                  <div style={{ transform: 'scale(1.2)' }}>
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
        </div>
      )}

      {/* Hero Section - PREMIUM POSITIONING (High-Tech Low-Drag: Living Pipeline + Typewriter + grid pulse) */}
      <main className="brand-surface brand-grid brand-grid-pulse mobile-container terminal-content-scope" style={{ 
        width: '100%',
        maxWidth: '100vw',
        padding: 'clamp(24px, 6vw, 60px) clamp(12px, 3vw, 24px)',
        paddingTop: isMobile 
          ? 'calc(clamp(24px, 6vw, 60px) + 80px)' // Mobile: add header height to prevent nav from blocking hero
          : undefined, // Desktop: use default padding (no override)
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div className="brand-card mobile-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: 'min(1200px, 95vw)',
          margin: '0 auto clamp(40px, 8vw, 80px) auto',
          padding: 'clamp(20px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
          {/* Living Pipeline: CSV -> Processor -> JSON (motion as meaning) */}
          <LivingPipeline />
          {/* Static protocol strip — factual labels; flex-centered for optical alignment */}
          <div
            id="landing-hero-protocol"
            aria-hidden
            style={{
              width: '100%',
              maxWidth: '720px',
              minHeight: '44px',
              marginBottom: '18px',
              padding: '0 clamp(12px, 3vw, 20px)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-warm)',
              background: 'var(--surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              columnGap: '10px',
              rowGap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-tight)',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ color: 'var(--accent-warm)', fontWeight: 700 }}>PROTOCOL</span>
            <span aria-hidden style={{ color: 'var(--muted)' }}>
              ·
            </span>
            <span>
              LEDGER_LOCAL_FIRST · SYNC_OPTIONAL_USER_OWNED · AI_CONTEXT_BOUNDED_STATELESS
            </span>
          </div>
          {/* Headline - system-led category */}
          <h1 className="brand-text" style={{ 
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', 
            fontWeight: 'bold', 
            lineHeight: '1.1', 
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            maxWidth: '800px',
            minHeight: '1.2em'
          }}>
            The Local-First Portfolio Terminal.
            <noscript>The Local-First Portfolio Terminal.</noscript>
          </h1>

          {/* Subhead - Pocket Analyst + sovereignty + drop-zone pointer */}
          <p className="brand-text-secondary" style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
            lineHeight: '1.6', 
            marginBottom: '24px',
            maxWidth: '720px',
            color: 'var(--text-secondary)'
          }}>
            Analyze broker CSVs with <strong style={{ color: 'var(--text)' }}>Pocket Analyst</strong> and a
            local-first pipeline built for serious portfolios. Your raw financial ledger is processed in your
            browser and is not warehoused on our servers —{' '}
            <strong style={{ color: 'var(--text)' }}>for the hero demo below, your file never leaves your device.</strong>
            <br />
            <span style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', display: 'block', marginTop: '12px' }}>
              <strong style={{ color: 'var(--accent-warm)' }}>Founders Club: £12/mo or £100/yr.</strong> Cancel anytime.
              {' '}Prosumer-grade terminal for serious portfolios.
            </span>
          </p>

          {/* Directive B — 3s affordance: explicit next actions before scroll */}
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
              }}
            >
              Start here — pick one
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('landing-hero-ticker');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  window.setTimeout(() => {
                    (el?.querySelector('input') as HTMLInputElement | null)?.focus();
                  }, 320);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-warm)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                1 · Search a ticker
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('landing-hero-dropzone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-warm)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                2 · Parse CSV locally
              </button>
              <Link
                href="/dashboard?utm_source=landing&utm_medium=hero_affordance&utm_campaign=direct_entry"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-warm)',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, var(--surface) 100%)',
                  color: 'var(--accent-warm)',
                  fontSize: '13px',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                3 · Open terminal
              </Link>
            </div>
          </div>

          <div
            id="landing-hero-ticker"
            style={{
              width: '100%',
              maxWidth: '600px',
              marginBottom: '22px',
              position: 'relative',
              zIndex: 10000,
            }}
          >
            <div
              id="landing-hero-search-wrap"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <TickerSearch
                placeholder="> Search tickers (e.g. NVDA, BTC) — opens market page"
                linkToTickerPage={true}
                marketingChrome
              />
            </div>
          </div>

          {/* Hero: local sanitization theater (drop zone + terminal) */}
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              marginBottom: '28px',
            }}
          >
            <input
              ref={csvDemoInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              style={{ display: 'none' }}
              aria-hidden
              onChange={handleHeroDemoInputChange}
            />
            <div
              id="landing-hero-dropzone"
              role="button"
              tabIndex={0}
              aria-label="Upload or drop a broker CSV to run the local sanitization demo in your browser"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  csvDemoInputRef.current?.click();
                }
              }}
              onDragOver={handleHeroDropZoneDragOver}
              onDrop={handleHeroDropZoneDrop}
              onClick={() => csvDemoInputRef.current?.click()}
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                fontSize: '13px',
                lineHeight: 1.5,
                padding: 'clamp(16px, 3vw, 22px)',
                borderRadius: '12px',
                border: '2px dashed var(--border-warm)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>&gt; </span>
              Drop your broker CSV here (or click to upload) — local parser runs in your browser. No upload to our
              servers for this demo.
            </div>
            {terminalActive && (
              <div style={{ marginTop: '14px', width: '100%' }}>
                <LocalProcessingTerminal
                  key={terminalMountKey}
                  active={terminalActive}
                  onSequenceComplete={handleSanitizationSequenceComplete}
                  style={{ maxHeight: 'none', minHeight: '140px' }}
                />
              </div>
            )}
            {showFoundersSnare && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: '2px solid var(--border-warm)',
                  background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
                  textAlign: 'center',
                }}
              >
                <p
                  className="brand-text"
                  style={{
                    margin: '0 0 14px 0',
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    fontWeight: 600,
                    lineHeight: 1.45,
                  }}
                >
                  Payload Sanitized. Join the Founders Club to unlock the Pocket Analyst.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                  <Link
                    href="/sponsor?utm_source=landing&utm_medium=hero_dropzone&utm_campaign=founders_club"
                    className="brand-button brand-button-primary"
                    style={{
                      padding: '12px 22px',
                      background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: '2px solid var(--border-warm)',
                    }}
                  >
                    Join Founders Club
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFoundersSnare(false);
                      setTerminalActive(false);
                    }}
                    style={{
                      padding: '12px 18px',
                      background: 'transparent',
                      border: '1px solid rgba(245, 158, 11, 0.38)',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Try another file
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* CTAs - PREMIUM POSITIONING */}
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(12px, 3vw, 16px)', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}>
            <Link 
              href="/sponsor?utm_source=landing&utm_medium=hero_cta&utm_campaign=founders_club" 
              className="brand-button brand-button-primary" 
              style={{ 
                padding: 'clamp(16px, 3vw, 20px) clamp(32px, 6vw, 48px)', 
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '12px', 
                fontSize: 'clamp(16px, 3vw, 18px)', 
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4)',
                textAlign: 'center',
                display: 'block',
                border: '2px solid var(--border-warm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.4)';
              }}
            >
              Join Founder's Club (£12/mo or £100/yr)
            </Link>
            <Link 
              href="/tools/risk-calculator?utm_source=landing&utm_medium=hero_cta&utm_campaign=risk_calculator"
              className="brand-button" 
              style={{ 
                padding: 'clamp(16px, 3vw, 20px) clamp(32px, 6vw, 48px)', 
                background: 'transparent',
                border: '2px solid var(--border-warm)', 
                color: 'var(--text-warm)', 
                borderRadius: '12px', 
                fontSize: 'clamp(16px, 3vw, 18px)', 
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--warm-bg)';
                e.currentTarget.style.borderColor = 'var(--accent-warm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-warm)';
              }}
            >
              Check My Portfolio Risk
            </Link>
          </div>

          <div style={{ width: '100%', maxWidth: '720px', marginBottom: '24px', textAlign: 'center' }}>
            <Link
              href="/architecture?utm_source=landing&utm_medium=hero_bridge&utm_campaign=architecture"
              className="brand-link"
              style={{
                fontSize: 'clamp(15px, 2vw, 17px)',
                fontWeight: 600,
                color: 'var(--accent-warm)',
                textDecoration: 'none',
                borderBottom: '2px solid var(--accent-warm)',
                paddingBottom: '2px',
              }}
            >
              Read how our hybrid-sync architecture works →
            </Link>
          </div>

          {/* Dashboard Screenshot - High Fidelity Visual */}
          <div style={{
            width: '100%',
            maxWidth: '900px',
            marginTop: '72px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 30px rgba(245, 158, 11, 0.2), 0 0 60px rgba(0, 255, 0, 0.15)',
            border: '2px solid var(--border-warm)',
            background: 'var(--surface)',
            position: 'relative'
          }}>
            <video 
              src={process.env.NEXT_PUBLIC_DASHBOARD_DEMO_VIDEO_URL || "/dashboard-demo-4k.mp4"}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'auto' as const
              }}
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                const error = video.error;
                console.error('Video load error:', e, error);
                // Fallback to local MP4 if CDN fails
                if (!video.src.includes('/dashboard-demo-4k.mp4')) {
                  video.src = '/dashboard-demo-4k.mp4';
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'color-mix(in srgb, var(--surface-elevated) 92%, transparent)',
              color: 'var(--accent-warm)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-warm)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              Actual footage of Pocket Portfolio running on localhost
            </div>
          </div>
        </div>
      </main>

      {/* Pocket Analyst: Your Personal Quantitative Analyst (video + CTAs) */}
      <div className="terminal-content-scope">
        <AnalystVideo />
      </div>

      {/* SECTION 2: THE BRIDGE - TRUST ANCHOR */}
      <section style={{
        width: '100%',
        padding: 'clamp(40px, 8vw, 80px) clamp(12px, 3vw, 24px)',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
        borderTop: '1px solid var(--border-warm)',
        borderBottom: '1px solid var(--border-warm)',
        marginBottom: 'clamp(60px, 10vw, 120px)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: '32px',
            color: 'var(--text-warm)',
            letterSpacing: '-0.02em'
          }}>
            TRUSTED BY{' '}
            <span style={{ color: 'var(--accent-warm)' }}>
              <DynamicDownloadCount />
            </span>{' '}
            ENGINEERS & BUILDERS
          </h2>
          
          {/* Trust Logos Row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(24px, 5vw, 48px)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            {/* Open Source Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-warm)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-warm)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Open Source</span>
            </div>

            {/* GitHub Badge */}
            <a 
              href="https://github.com/PocketPortfolio/Financialprofilenetwork"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: 'var(--surface)',
                border: '2px solid var(--border-warm)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-warm)',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-warm)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-warm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--text)">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>

            {/* NPM Badge */}
            <a 
              href="https://www.npmjs.com/package/@pocket-portfolio/importer"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: 'var(--surface)',
                border: '2px solid var(--border-warm)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-warm)',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-warm)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-warm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#CB3837">
                <path d="M0 0h24v24H0V0zm13.3 2v20l8.7-5.1V7.1L13.3 2z"/>
              </svg>
              <span>NPM</span>
            </a>

            {/* Verified Audit Badge — brand chrome (no third-party blue as our accent) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: 'var(--surface)',
                border: '2px solid var(--border-warm)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-warm)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-warm)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Verified Audit</span>
            </div>

            {/* OpenAI Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-warm)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z" fill="var(--text-warm)"/>
              </svg>
              <span>OpenAI</span>
            </div>

            {/* Google Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-warm)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </div>
          </div>

          {/* Social Proof Text */}
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--text-secondary)',
            marginTop: '24px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Audited by <DynamicDownloadCount /> Engineers. MIT Licensed. Fork it.
          </p>
        </div>
      </section>

      {/* SECTION 3: THE BIFURCATION - DEVELOPER FOCUS */}
      <section id="developer" style={{
        width: '100%',
        padding: 'clamp(60px, 10vw, 120px) clamp(12px, 3vw, 24px)',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-elevated) 100%)',
        marginBottom: 'clamp(60px, 10vw, 120px)',
        borderTop: '1px solid var(--border-warm)',
        borderBottom: '1px solid var(--border-warm)',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          paddingBottom: 'clamp(8px, 2vw, 16px)',
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginTop: 0,
            marginBottom: '24px',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans)',
          }}>
            Or... Build Your Own Stack.
          </h2>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            marginBottom: '48px',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            The logic is Open Source. The database is yours.
          </p>

          {/* Terminal Block */}
          <div style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-md)',
            padding: 'clamp(24px, 5vw, 40px)',
            marginBottom: '32px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Terminal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-warm)',
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ff5f56'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ffbd2e'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#27c93f'
              }}></div>
              <span style={{
                marginLeft: '16px',
                color: 'var(--muted)',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
              }}>terminal</span>
            </div>

            {/* Code Snippet */}
            <pre style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-warm)',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowX: 'auto'
            }}>
{`$ npm install @pocket-portfolio/importer

$ npx pocket-init --sovereign

✓ Database initialized
✓ Local-first mode enabled
✓ Ready to import trades`}
            </pre>
          </div>

          {/* CTA */}
          <a
            href="https://github.com/PocketPortfolio/Financialprofilenetwork#readme"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: 'transparent',
              border: '1px solid var(--border-warm)',
              color: 'var(--text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-warm) 12%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-warm)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Read the API Docs →
          </a>
        </div>
      </section>

      <main className="brand-surface brand-grid mobile-container">
        {/* SECTION 4: THE FEATURE GRID (SPLIT) - Scroll Reveal */}
        <ScrollReveal>
        <section id="features" className="mobile-container" style={{ 
          marginBottom: 'clamp(60px, 10vw, 120px)',
          width: '100%',
          maxWidth: '100vw',
          padding: '0 clamp(12px, 3vw, 24px)',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            The Product Portal
          </h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.125rem)', 
            textAlign: 'center', 
            marginBottom: '48px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Three pillars of the Sovereign Financial Stack.
          </p>

          {/* 3-Column Product Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(24px, 5vw, 32px)',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* CARD 1: THE TERMINAL */}
            <div style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
              border: '2px solid var(--border-warm)',
              borderRadius: '16px',
              padding: 'clamp(32px, 5vw, 40px)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
            }}
            >
              {/* Terminal Icon - Real Dashboard Preview */}
              <div style={{
                width: '56px',
                height: '56px',
                background: 'var(--accent-warm)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                overflow: 'hidden',
                padding: '4px'
              }}>
                <img 
                  src="/brand/icon-terminal.svg" 
                  alt="Terminal Dashboard"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: 'var(--text-warm)'
              }}>
                The Terminal
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                fontSize: '15px',
                marginBottom: '24px',
                flex: '1'
              }}>
                Track net worth across 50+ brokers. Autonomous research by Pulitzer AI. 800+ weekly briefs. Human-verified.
              </p>
              <DashboardLaunchLink
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  border: '2px solid var(--border-warm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Launch App
              </DashboardLaunchLink>
            </div>

            {/* CARD 2: SOVEREIGN SYNC */}
            <div style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
              border: '2px solid var(--border-warm)',
              borderRadius: '16px',
              padding: 'clamp(32px, 5vw, 40px)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
            }}
            >
              {/* Google Drive Icon - Real Brand Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                background: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                padding: '8px',
                boxShadow: '0 2px 8px rgba(66, 133, 244, 0.2)'
              }}>
                <img 
                  src="/brand/icon-google-drive.svg" 
                  alt="Google Drive"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: 'var(--text-warm)'
              }}>
                Sovereign Storage
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                fontSize: '15px',
                marginBottom: '24px',
                flex: '1'
              }}>
                Encrypted sync to your Google Drive. Standard JSON/CSV formats. No vendor lock-in. Total data portability.
              </p>
              <Link
                href="/features/google-drive-sync"
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '2px solid var(--border-warm)',
                  color: 'var(--text-warm)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--warm-bg)';
                  e.currentTarget.style.borderColor = 'var(--accent-warm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-warm)';
                }}
              >
                Connect Storage
              </Link>
            </div>

            {/* CARD 3: THE VANGUARD */}
            <div style={{
              background: 'linear-gradient(135deg, var(--surface-elevated) 0%, var(--surface) 100%)',
              border: '2px solid var(--border-warm)',
              borderRadius: '16px',
              padding: 'clamp(32px, 5vw, 40px)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--border-warm)';
            }}
            >
              {/* Premium Badge Effect */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
                borderRadius: '0 16px 0 100%'
              }}></div>
              
              {/* Premium Crown Icon - Real Founders Badge */}
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
                border: '2px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <img 
                  src="/brand/icon-founders-crown.svg" 
                  alt="Founders Crown"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: 'var(--text)',
                position: 'relative',
                zIndex: 1
              }}>
                Founders & Sponsors
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                fontSize: '15px',
                marginBottom: '24px',
                flex: '1',
                position: 'relative',
                zIndex: 1
              }}>
                Back the protocol. Direct access to the Command Team. Shape the roadmap.
              </p>
              <Link
                href="/sponsor?utm_source=landing&utm_medium=founders_section&utm_campaign=founders_club"
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--accent-warm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                }}
              >
                Request Access
              </Link>
            </div>
          </div>
        </section>
        </ScrollReveal>

        {/* Popular Stocks Section - Developer Data Utility */}
        <section id="popular-stocks" className="mobile-container" style={{ 
          marginBottom: 'clamp(60px, 10vw, 120px)',
          width: '100%',
          maxWidth: '100vw',
          padding: '0 clamp(12px, 3vw, 24px)',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.25rem)', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            Open Financial Data (JSON endpoints)
          </h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.125rem)', 
            textAlign: 'center', 
            marginBottom: '48px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Programmatic access to real-time price data and normalized historical CSVs. Free for developers.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: 'clamp(12px, 3vw, 16px)',
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'JNJ', 'V', 'WMT', 'PG'].map((ticker) => {
              // Get company name for title attribute
              const companyNames: Record<string, string> = {
                'AAPL': 'Apple',
                'MSFT': 'Microsoft',
                'GOOGL': 'Alphabet',
                'AMZN': 'Amazon',
                'NVDA': 'NVIDIA',
                'META': 'Meta',
                'TSLA': 'Tesla',
                'JPM': 'JPMorgan Chase',
                'JNJ': 'Johnson & Johnson',
                'V': 'Visa',
                'WMT': 'Walmart',
                'PG': 'Procter & Gamble'
              };
              const companyName = companyNames[ticker] || ticker;
              
              return (
                <Link
                  key={ticker}
                  href={`/s/${ticker.toLowerCase()}`}
                  title={`Get free JSON market data for ${companyName} (${ticker})`}
                  className="brand-card"
                  style={{
                    background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
                    border: '2px solid var(--border-warm)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'var(--text)',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.3)';
                    e.currentTarget.style.borderColor = 'var(--accent-warm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--border-warm)';
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: 'var(--accent-warm)'
                    }}>
                      {ticker}
                    </div>
                    <span style={{
                      fontSize: '18px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace',
                      fontWeight: '600'
                    }}>
                      {'{ }'}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>
                    GET /JSON →
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '32px' 
          }}>
            <DashboardLaunchLink
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: '2px solid var(--border-warm)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Track Your Portfolio →
            </DashboardLaunchLink>
          </div>
        </section>

        {/* Why Choose Pocket Portfolio Section */}
        <section style={{ marginBottom: '120px', textAlign: 'center' }}>
          <div style={{ 
            background: 'hsl(var(--card))', 
            border: '1px solid var(--border-warm)', 
            borderRadius: '12px', 
            padding: '48px 32px',
            marginBottom: '48px'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
              fontWeight: 'bold', 
              marginBottom: '32px',
              letterSpacing: '-0.02em'
            }}>
              Why Choose Pocket Portfolio?
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '32px',
              marginBottom: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--signal)', marginBottom: '8px' }}>100%</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free & Open Source</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--signal)', marginBottom: '8px' }}>0</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sign-up Required</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--signal)', marginBottom: '8px' }}>Privacy</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Design</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--signal)', marginBottom: '8px' }}>Community</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Led Development</div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '24px', 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Built with transparency:</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>Open Source</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>Public Roadmap</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>Community Feedback</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>No Vendor Lock-in</div>
            </div>
            
            {/* Ad-Free Promise */}
            <div style={{ 
              marginTop: '32px',
              padding: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: 'var(--pos)', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>🚫</span>
                Ad-Free Promise
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text)', 
                margin: 0,
                lineHeight: '1.5'
              }}>
                We will <strong>always be ad-free</strong> and will never sell ads on the platform. 
                The only exception is educational tools and resources that help users learn about investing.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section (Scroll Reveal) */}
        <ScrollReveal>
        <section id="mission" style={{ marginBottom: '120px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.25rem)', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Our Mission
          </h2>
          <p style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', 
            color: 'var(--muted)', 
            lineHeight: '1.6', 
            maxWidth: '800px', 
            margin: '0 auto 48px' 
          }}>
            Pocket Portfolio exists to give individual investors <strong>sovereignty over their financial data</strong>. We bring the compute to the data: your full trade history, positions, and balances stay on your device—only a sanitized snapshot ever crosses the wire. No raw ledger upload. No central warehouse. No model training on your portfolio. Just evidence-first analysis, optional Google Drive sync you control, and a terminal that respects the boundary between you and the cloud.
          </p>
        </section>
        </ScrollReveal>

        {/* FIN Pillars Section */}
        <ScrollReveal>
        <section id="fin-pillars" style={{ marginBottom: '120px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.25rem)', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            The FIN Pillars
          </h2>
          <p style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
            color: 'var(--muted)', 
            marginBottom: '32px' 
          }}>
            Future • Investment • Now — one engine: open core, human-centered execution, shipped insight.
          </p>

          {/* FIN engine: conceptual flow (not live telemetry) */}
          <div
            style={{
              maxWidth: '1000px',
              margin: '0 auto 40px',
              padding: 'clamp(20px, 4vw, 28px)',
              borderRadius: '16px',
              border: '2px solid var(--border-warm)',
              background: 'linear-gradient(165deg, var(--surface) 0%, var(--warm-bg) 100%)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'stretch',
                justifyContent: 'center',
                gap: 'clamp(8px, 2vw, 16px)',
              }}
            >
              {[
                {
                  title: 'Future',
                  subtitle: 'Open-source core',
                  body: 'Community-owned primitives and transparent evolution — capability you can fork, audit, and extend.',
                  bullets: ['Open-source core', 'Insight-first design', 'Public roadmap'],
                },
                {
                  title: 'Investment',
                  subtitle: 'Human-centered UX + data engineering',
                  body: 'Design and pipelines that respect attention: evidence in, noise out, serious portfolios in focus.',
                  bullets: ['Human-centered UX', 'Robust data engineering', 'Evidence-based decisions'],
                },
                {
                  title: 'Now',
                  subtitle: 'Real-time insight + delivery',
                  body: 'Shipped learning loops: fast iteration, honest telemetry on the product (not your ledger), transparent delivery.',
                  bullets: ['Real-time insights', 'Fast iterative delivery', 'Transparent roadmap'],
                },
              ].map((node, i) => (
                <React.Fragment key={node.title}>
                  {i > 0 && (
                    <div
                      aria-hidden
                      style={{
                        alignSelf: 'center',
                        fontFamily: 'ui-monospace, Menlo, monospace',
                        fontSize: 'clamp(18px, 3vw, 24px)',
                        color: 'var(--accent-warm)',
                        fontWeight: 700,
                        padding: '4px 0',
                      }}
                    >
                      →
                    </div>
                  )}
                  <div
                    style={{
                      flex: '1 1 240px',
                      maxWidth: '320px',
                      textAlign: 'left',
                      padding: '20px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-warm)',
                      background: 'var(--surface-elevated)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'ui-monospace, Menlo, monospace',
                        letterSpacing: '0.08em',
                        color: 'var(--accent-warm)',
                        fontWeight: 700,
                        marginBottom: '6px',
                      }}
                    >
                      {node.title.toUpperCase()}
                    </div>
                    <h3
                      style={{
                        fontSize: 'clamp(18px, 2.5vw, 22px)',
                        fontWeight: 800,
                        margin: '0 0 10px',
                        color: 'var(--text-warm)',
                        lineHeight: 1.2,
                      }}
                    >
                      {node.subtitle}
                    </h3>
                    <p style={{ color: 'var(--muted)', lineHeight: 1.55, fontSize: '14px', margin: '0 0 12px' }}>
                      {node.body}
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '0',
                        listStyle: 'none',
                        color: 'var(--muted)',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      {node.bullets.map((b) => (
                        <li key={b} style={{ marginBottom: '6px' }}>
                          <span style={{ color: 'var(--accent-warm)' }}>›</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p
              style={{
                margin: '20px 0 0',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              FLOW: OPEN_CORE → UX_AND_PIPELINES → SHIPPED_INSIGHT
            </p>
          </div>
        </section>
        </ScrollReveal>

        {/* Early Access Section */}
        <section style={{ marginBottom: '120px', textAlign: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--signal) 0%, var(--accent-warm) 100%)',
            borderRadius: '12px', 
            padding: '48px 32px',
            marginBottom: '48px',
            color: '#ffffff',
          }}>
            <h2 style={{ 
              fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              🚀 Early Access - Help Shape the Future
            </h2>
            <p style={{ 
              fontSize: 'clamp(1rem, 2vw, 1.125rem)', 
              lineHeight: '1.6', 
              maxWidth: '600px', 
              margin: '0 auto 32px',
              opacity: 0.9
            }}>
              We're in active development and looking for early adopters to help us build the best portfolio tracker. Your feedback shapes our roadmap and features.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px', 
              flexWrap: 'wrap'
            }}>
              <DashboardLaunchLink 
                style={{ 
                  padding: '12px 24px', 
                  background: 'white', 
                  color: 'var(--signal)', 
                  textDecoration: 'none', 
                  borderRadius: '6px', 
                  fontWeight: '600',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Try Beta Version
              </DashboardLaunchLink>
              <button 
                onClick={handleStarGitHub}
                style={{ 
                  padding: '12px 24px', 
                  background: 'transparent', 
                  border: '2px solid white', 
                  color: 'white', 
                  borderRadius: '6px', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'white';
                }}
              >
                Star on GitHub
              </button>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" style={{ marginBottom: '120px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.25rem)', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Built with community
          </h2>
          <p style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', 
            color: 'var(--muted)', 
            lineHeight: '1.6', 
            maxWidth: '800px', 
            margin: '0 auto 32px' 
          }}>
            Pocket Portfolio is open source. Contribute features, fix bugs, propose ideas, or help with docs. We keep the roadmap transparent and welcome first-time contributors.
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '48px',
            flexWrap: 'wrap'
          }}>
            <a 
              href="https://github.com/PocketPortfolio/Financialprofilenetwork" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                padding: '12px 24px', 
                background: 'var(--accent-warm)', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '6px', 
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              GitHub
            </a>
            <a 
              href="https://discord.gg/Ch9PpjRzwe" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                padding: '12px 24px', 
                background: 'transparent', 
                border: '2px solid var(--border-warm)', 
                color: 'var(--text)', 
                textDecoration: 'none', 
                borderRadius: '6px', 
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-warm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-warm)';
              }}
            >
              Join Discord
            </a>
          </div>
          <ul style={{ 
            textAlign: 'left', 
            color: 'var(--muted)', 
            lineHeight: '1.6', 
            display: 'inline-block',
            paddingLeft: '0',
            listStyle: 'none'
          }}>
            <li style={{ marginBottom: '8px' }}>• Public roadmap & issues</li>
            <li style={{ marginBottom: '8px' }}>• Good-first-issue labels</li>
            <li style={{ marginBottom: '8px' }}>• Code of Conduct & governance</li>
          </ul>
        </section>

        {/* SECTION: SOVEREIGN ARCHITECTURE */}
        <section id="sovereign-architecture" style={{
          width: '100%',
          padding: 'clamp(60px, 10vw, 120px) clamp(12px, 3vw, 24px)',
          background: 'var(--surface)',
          marginBottom: 'clamp(60px, 10vw, 120px)',
          scrollMarginTop: '80px'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text-warm)',
              letterSpacing: '-0.02em'
            }}>
              Why Sovereign?
              <span style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                fontWeight: 'normal',
                color: 'var(--text-secondary)',
                display: 'block',
                marginTop: '8px'
              }}>
                (Powered by Local-First Architecture)
              </span>
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              We use standard web analytics to measure traffic and improve the product. Your portfolio ledgers, broker
              CSVs, and import pipeline run in your browser and are not warehoused on our servers. Optional sync and
              AI flows are bounded and described on{' '}
              <Link href="/architecture?utm_source=landing&utm_medium=sovereign_section&utm_campaign=architecture" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
                Architecture
              </Link>
              . Encryption for Sovereign Sync is handled client-side before data reaches your personal cloud.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginTop: '48px',
              textAlign: 'left'
            }}>
              <div style={{
                padding: '24px',
                background: 'var(--warm-bg)',
                borderRadius: '12px',
                border: '2px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text-warm)'
                }}>
                  Analytics and privacy
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '15px'
                }}>
                  We use standard web analytics to measure site traffic and improve the application. Your financial
                  data, portfolio ledgers, and broker CSVs are processed locally in your browser and are not
                  warehoused on our servers.{' '}
                  <Link href="/privacy" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
                    View Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <div style={{
                padding: '24px',
                background: 'var(--warm-bg)',
                borderRadius: '12px',
                border: '2px solid var(--border-warm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '140px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text-warm)',
                  alignSelf: 'flex-start'
                }}>
                  Client-Side Encryption
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '15px',
                  margin: 0,
                  alignSelf: 'flex-start'
                }}>
                  All encryption happens in your browser. We never see your data, even if you sync to Google Drive.
                </p>
              </div>
              <div style={{
                padding: '24px',
                background: 'var(--warm-bg)',
                borderRadius: '12px',
                border: '2px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text-warm)'
                }}>
                  No Cloud Latency
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '15px'
                }}>
                  Core portfolio views and imports run locally for fast feedback. Many workflows work offline; live
                  prices and optional cloud-backed features use the network on your terms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ — single shell: log-backed fix (pre-fix widthSpread/rightSpread were 0; stagger was visual vs brand-grid) */}
        <section
          id="faq"
          style={{ marginBottom: '120px', padding: '0 clamp(12px, 3vw, 24px)', boxSizing: 'border-box' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.25rem)', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}>
              FAQ
            </h2>
            <p style={{ 
              fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', 
              color: 'var(--muted)', 
              lineHeight: '1.6' 
            }}>
              Frequently asked questions about Pocket Portfolio
            </p>
          </div>

          <div
            id="faq-shell"
            className="pp-landing-faq-shell"
            style={{
              border: '1px solid var(--border-warm)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'hsl(var(--card))',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div id="faq-accordion-column" style={{ display: 'flex', flexDirection: 'column' }}>
              {LANDING_FAQ_ENTRIES.map((item, index) => (
                <details
                  key={item.question}
                  style={{
                    margin: 0,
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    background: 'hsl(var(--card))',
                    border: 'none',
                    borderRadius: 0,
                    boxShadow: 'none',
                    overflow: 'hidden',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <summary
                    style={{
                      padding: '24px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 600,
                      listStyle: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                    {item.question}
                  </summary>
                  <div style={{ padding: '0 24px 24px', boxSizing: 'border-box' }}>{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* US broker SEO hubs — homepage equity to high-intent import pages */}
      <section
        aria-label="Supported US brokers"
        style={{
          marginTop: 'clamp(32px, 6vw, 64px)',
          marginBottom: 'clamp(24px, 4vw, 48px)',
          width: '100%',
          maxWidth: '100vw',
          padding: '0 clamp(12px, 3vw, 24px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          id="broker-csv-guides"
          className="pp-landing-card-900"
          style={{
            width: '100%',
            padding: 'clamp(20px, 4vw, 28px)',
            borderRadius: '16px',
            border: '1px solid var(--border-warm)',
            background: 'var(--surface)',
            boxSizing: 'border-box',
          }}
        >
          <h2
            className="brand-text"
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.35rem)',
              fontWeight: 700,
              marginBottom: '6px',
              textAlign: 'center',
            }}
          >
            Supported brokers (CSV import guides)
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            US desktop workflows — export help and local-first import for major brokers.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              gap: '12px',
            }}
          >
            {(
              [
                { href: '/import/robinhood', label: 'Robinhood' },
                { href: '/import/schwab', label: 'Charles Schwab' },
                { href: '/import/fidelity', label: 'Fidelity' },
                { href: '/import/vanguard', label: 'Vanguard' },
              ] as const
            ).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  flex: '1 1 200px',
                  maxWidth: '260px',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 16px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-warm)',
                  background: 'var(--warm-bg)',
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-warm)';
                  e.currentTarget.style.borderColor = 'var(--accent-warm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.borderColor = 'var(--border-warm)';
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Content Section */}
      <CommunityContent />

      {/* Social Proof Section */}
      <section style={{ 
        marginTop: 'clamp(40px, 6vw, 80px)',
        marginBottom: 'clamp(40px, 6vw, 80px)', 
        width: '100%',
        maxWidth: '100vw',
        padding: '0 clamp(12px, 3vw, 24px)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: 'min(1200px, 95vw)',
          margin: '0 auto'
        }}>
          <SocialProof variant="full" />
        </div>
      </section>

      {/* Share Section */}
      <section style={{ 
        marginTop: 'clamp(40px, 6vw, 80px)',
        marginBottom: 'clamp(40px, 6vw, 80px)', 
        width: '100%',
        maxWidth: '100vw',
        padding: '0 clamp(12px, 3vw, 24px)',
        boxSizing: 'border-box'
      }}>
        <div className="brand-card brand-spine" style={{ 
          textAlign: 'center',
          maxWidth: 'min(1200px, 95vw)',
          margin: '0 auto',
          background: 'var(--surface)',
          border: '2px solid var(--border-warm)',
          borderRadius: '12px',
          padding: '32px 28px'
        }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Share Pocket Portfolio
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-base)', 
            color: 'var(--text-secondary)', 
            marginBottom: '24px',
            lineHeight: 'var(--line-snug)'
          }}>
            Spread local-first AI portfolio analysis — Founders Club for pros who want Pocket Analyst without shipping
            raw ledgers to the cloud.
          </p>
          <SocialShare
            title="Pocket Portfolio — Local-First AI Analyst & Founders Club"
            description="AI portfolio analysis with zero cloud uploads of your raw CSV. £12/mo Founders Club. Open-source core, prosumer terminal."
            url="https://www.pocketportfolio.app"
            context="landing_page"
            showLabel={true}
            hashtags={['PocketPortfolio', 'LocalFirst', 'FoundersClub', 'PortfolioAI']}
          />
        </div>
      </section>
    </>
  );
}