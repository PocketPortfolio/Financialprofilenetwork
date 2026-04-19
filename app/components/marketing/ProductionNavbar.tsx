'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import DashboardLaunchLink from '../nav/DashboardLaunchLink';
import { usePathname } from 'next/navigation';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import { useStickyHeader } from '../../hooks/useStickyHeader';
import {
  sovereignPrimaryNav,
  sovereignToolsDropdown,
  isHashOnlyHref,
} from '@/app/lib/nav/sovereignMarketingNav';

export default function ProductionNavbar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Ensure header stays visible when scrolling
  useStickyHeader('header.brand-header');

  const primaryNav = sovereignPrimaryNav(pathname, 'site');
  const faqItem = primaryNav[primaryNav.length - 1]!;
  const beforeFaq = primaryNav.slice(0, -1);
  const toolsLinks = sovereignToolsDropdown(pathname);

  const renderNavLink = (link: { label: string; href: string }) => {
    const linkStyle = {
      fontSize: '15px',
      padding: '8px 0',
      borderBottom: '2px solid transparent',
      textDecoration: 'none',
      color: 'var(--text)' as const,
    };
    if (isHashOnlyHref(link.href)) {
      return (
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
      );
    }
    return (
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
  };

  return (
    <>
      <header className="brand-header brand-spine" style={{
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        width: '100%'
      } as React.CSSProperties}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Logo size="medium" showWordmark={!isMobile} />
              </Link>
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
                {beforeFaq.map((link) => {
                  const linkEl = renderNavLink(link);
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
                              borderBottomColor: toolsOpen ? 'var(--signal)' : 'transparent',
                              color: toolsOpen ? 'var(--signal)' : 'var(--text)'
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
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                padding: '8px 0',
                                zIndex: 10050
                              }}
                            >
                              {toolsLinks.map((t) => (
                                <Link
                                  key={t.label}
                                  href={t.href}
                                  onClick={() => setToolsOpen(false)}
                                  style={{
                                    display: 'block',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    color: 'var(--text)',
                                    textDecoration: 'none'
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
                {renderNavLink(faqItem)}
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
                <Link
                  href="/sponsor"
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
                </Link>
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
                      background: '#ff6b35',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                      transform: isMobileMenuOpen ? 'rotate(45deg) translate(9px, 9px)' : 'none',
                      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.6), 0 0 0 1px rgba(255, 107, 53, 0.3)',
                      border: '1px solid #ff6b35'
                    }}></span>
                    <span style={{
                      width: '36px',
                      height: '8px',
                      background: '#ff6b35',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                      opacity: isMobileMenuOpen ? 0 : 1,
                      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.6), 0 0 0 1px rgba(255, 107, 53, 0.3)',
                      border: '1px solid #ff6b35'
                    }}></span>
                    <span style={{
                      width: '36px',
                      height: '8px',
                      background: '#ff6b35',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                      transform: isMobileMenuOpen ? 'rotate(-45deg) translate(9px, -9px)' : 'none',
                      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.6), 0 0 0 1px rgba(255, 107, 53, 0.3)',
                      border: '1px solid #ff6b35'
                    }}></span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showHamburger && isMobileMenuOpen && (
        <div className="mobile-menu-overlay mobile-only brand-surface brand-grid" style={{
          display: isMobileMenuOpen ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          padding: '80px 24px 24px',
          overflowY: 'auto'
        }}
        onClick={() => setIsMobileMenuOpen(false)}
        >
          <div style={{
            background: 'var(--surface-elevated)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {beforeFaq.map((link) => {
                const handleClick = () => setIsMobileMenuOpen(false);
                const linkStyle = {
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none' as const,
                  color: 'var(--text)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                };
                const linkEl = isHashOnlyHref(link.href) ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={handleClick}
                    className="brand-link"
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--signal)';
                      (e.target as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--surface)';
                      (e.target as HTMLElement).style.color = 'var(--text)';
                    }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={handleClick}
                    className="brand-link"
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--signal)';
                      (e.target as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--surface)';
                      (e.target as HTMLElement).style.color = 'var(--text)';
                    }}
                  >
                    {link.label}
                  </Link>
                );
                if (link.label === 'FIN Pillars') {
                  return (
                    <React.Fragment key={link.label}>
                      {linkEl}
                      <details style={{ margin: 0 }}>
                        <summary style={{ ...linkStyle, cursor: 'pointer', listStyle: 'none' }}>Tools</summary>
                        <div
                          style={{
                            paddingLeft: '16px',
                            marginTop: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          {toolsLinks.map((t) => (
                            <Link
                              key={t.label}
                              href={t.href}
                              onClick={handleClick}
                              style={{ ...linkStyle, padding: '10px 16px' }}
                            >
                              {t.label}
                            </Link>
                          ))}
                        </div>
                      </details>
                    </React.Fragment>
                  );
                }
                return linkEl;
              })}
              {(() => {
                const handleClick = () => setIsMobileMenuOpen(false);
                const linkStyle = {
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none' as const,
                  color: 'var(--text)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                };
                return isHashOnlyHref(faqItem.href) ? (
                  <a
                    key={faqItem.label}
                    href={faqItem.href}
                    onClick={handleClick}
                    className="brand-link"
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--signal)';
                      (e.target as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--surface)';
                      (e.target as HTMLElement).style.color = 'var(--text)';
                    }}
                  >
                    {faqItem.label}
                  </a>
                ) : (
                  <Link
                    key={faqItem.label}
                    href={faqItem.href}
                    onClick={handleClick}
                    className="brand-link"
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--signal)';
                      (e.target as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'var(--surface)';
                      (e.target as HTMLElement).style.color = 'var(--text)';
                    }}
                  >
                    {faqItem.label}
                  </Link>
                );
              })()}
              
              <div style={{ 
                height: '1px', 
                background: 'var(--border)', 
                margin: '8px 0' 
              }} />
              
              <DashboardLaunchLink
                onClick={() => setIsMobileMenuOpen(false)}
                className="brand-button brand-button-primary"
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                Launch App
              </DashboardLaunchLink>
              
              <Link
                href="/sponsor"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500'
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
              </Link>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '16px', color: 'var(--text)' }}>Theme</span>
                <ThemeSwitcher />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

