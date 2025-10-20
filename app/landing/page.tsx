'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import WaitlistCTA from '../components/waitlist/WaitlistCTA';
import CommunityContent from '../components/CommunityContent';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);

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
    window.open('https://github.com/pocketportfolio', '_blank');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="mobile-container" style={{ 
        minHeight: '100vh', 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
      {/* Header */}
    <header className="brand-surface brand-header brand-spine" style={{
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)'
    }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Logo size="medium" showWordmark={true} />
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
                gap: '24px'
              }}>
                <a href="#mission" className="brand-link" style={{ 
                  fontSize: '15px',
                  padding: '8px 0',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--signal)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
                >Mission</a>
                <a href="#features" className="brand-link" style={{ 
                  fontSize: '15px',
                  padding: '8px 0',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--signal)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
                >Features</a>
                <a href="#fin-pillars" className="brand-link" style={{ 
                  fontSize: '15px',
                  padding: '8px 0',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--signal)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
                >FIN Pillars</a>
                <a href="#community" className="brand-link" style={{ 
                  fontSize: '15px',
                  padding: '8px 0',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--signal)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
                >Community</a>
                <a href="#faq" className="brand-link" style={{ 
                  fontSize: '15px',
                  padding: '8px 0',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--signal)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
                >FAQ</a>
              </nav>

              {/* Action Buttons */}
              <div className="action-buttons mobile-hidden" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <Link href="/dashboard" className="brand-button brand-button-primary" style={{ 
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
                </Link>
                <WaitlistCTA 
                  source="web:header" 
                  variant="outline" 
                  size="sm"
                />
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
              overflowY: 'auto',
              overflowX: 'hidden'
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
              transition: 'background-color 0.2s ease'
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
            <a 
              href="#mission" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: '1px solid var(--card-border)'
              }}
            >
              Mission
            </a>
            <a 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: '1px solid var(--card-border)'
              }}
            >
              Features
            </a>
            <a 
              href="#fin-pillars" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: '1px solid var(--card-border)'
              }}
            >
              FIN Pillars
            </a>
            <a 
              href="#community" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: '1px solid var(--card-border)'
              }}
            >
              Community
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: '1px solid var(--card-border)'
              }}
            >
              FAQ
            </a>
          </nav>

              {/* Mobile Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '20px'
              }}>
                {/* Launch App Button */}
                <Link 
                  href="/dashboard" 
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
                </Link>

                {/* Join Waitlist Button */}
                <Link 
                  href="/join" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ 
                    width: '100%',
                    padding: '16px 24px', 
                    background: 'linear-gradient(135deg, var(--warm-bg) 0%, var(--accent-warm) 100%)', 
                    color: 'var(--text-warm)', 
                    textDecoration: 'none', 
                    borderRadius: '12px', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    textAlign: 'center',
                    border: '2px solid var(--border-warm)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--warm-bg) 0%, var(--accent-warm) 100%)';
                    e.currentTarget.style.color = 'var(--text-warm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📝</span>
                  Join Waitlist
                </Link>
                
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

      {/* Hero Section */}
      <main className="brand-surface brand-grid mobile-container" style={{ 
        width: '100%',
        maxWidth: '100vw',
        padding: 'clamp(24px, 6vw, 60px) clamp(12px, 3vw, 24px)',
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
          maxWidth: 'min(1000px, 95vw)',
          margin: '0 auto clamp(40px, 8vw, 80px) auto',
          padding: 'clamp(20px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
            <h1 className="brand-text" style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 3rem)', 
              fontWeight: 'bold', 
              lineHeight: '1.1', 
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}>
              Invest smarter,{' '}
              <span style={{ color: 'var(--accent-warm)' }}>together.</span>
            </h1>
            <p className="brand-text-secondary" style={{ 
              fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', 
              lineHeight: '1.6', 
              marginBottom: '32px',
              maxWidth: '600px'
            }}>
              Free, open-source portfolio tracker with live P/L, real-time prices, mock trading, and CSV import. No signup required—start tracking your investments in seconds.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(8px, 2vw, 12px)', 
              marginBottom: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <Link href="/dashboard" className="brand-button brand-button-primary" style={{ 
                padding: 'clamp(14px, 3vw, 16px) clamp(24px, 6vw, 32px)', 
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '12px', 
                fontSize: 'clamp(14px, 3vw, 16px)', 
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4)',
                textAlign: 'center',
                display: 'block',
                flex: '1 1 auto',
                minWidth: '200px',
                border: '2px solid var(--border-warm)'
              }}>
                Start Tracking Free
              </Link>
              <WaitlistCTA 
                source="web:footer" 
                variant="outline" 
                size="lg"
                className="flex-1 min-w-[200px]"
              />
              <button 
                onClick={handleStarGitHub}
                style={{ 
                  padding: 'clamp(14px, 3vw, 16px) clamp(24px, 6vw, 32px)', 
                  background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
                  border: '2px solid var(--border-warm)', 
                  color: 'var(--text-warm)', 
                  borderRadius: '12px', 
                  fontSize: 'clamp(14px, 3vw, 16px)', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '1 1 auto',
                  minWidth: '200px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)'
                }}
              >
                Star on GitHub
              </button>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(20px, 5vw, 32px)', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  background: 'var(--accent-warm)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)'
                }}></div>
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: '500',
                  color: 'var(--text-warm)',
                  letterSpacing: '0.02em'
                }}>Open source</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  background: 'var(--accent-warm)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)'
                }}></div>
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: '500',
                  color: 'var(--text-warm)',
                  letterSpacing: '0.02em'
                }}>Community-led</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  background: 'var(--accent-warm)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)'
                }}></div>
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: '500',
                  color: 'var(--text-warm)',
                  letterSpacing: '0.02em'
                }}>Privacy-first</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  background: 'var(--accent-warm)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)'
                }}></div>
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: '500',
                  color: 'var(--text-warm)',
                  letterSpacing: '0.02em'
                }}>Always ad-free</span>
              </div>
            </div>
          
          <div className="brand-card brand-candlestick brand-spine mobile-container" style={{ 
            width: '100%',
            maxWidth: 'min(500px, 95vw)',
            margin: '0 auto',
            padding: 'clamp(20px, 4vw, 32px)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: 'var(--text-warm)' }}>Dashboard Preview</h3>
            <div style={{ 
              background: 'var(--bg)', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              border: '2px solid var(--border-warm)'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)', textAlign: 'center' }}>$24,560</div>
              <div style={{ color: 'var(--pos)', fontSize: '18px', textAlign: 'center', fontWeight: '600' }}>+$1,382 (+5.96%)</div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px', 
              marginBottom: '24px' 
            }}>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '8px' }}>Equities</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-warm)' }}>62%</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '8px' }}>Cash</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--signal)' }}>15%</div>
              </div>
            </div>
            <div style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>AAPL $215.22 <span style={{ color: 'var(--pos)', fontWeight: '600' }}>+1.1%</span></div>
              <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>NVDA $124.80 <span style={{ color: 'var(--pos)', fontWeight: '600' }}>+2.7%</span></div>
              <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>TSLA $239.14 <span style={{ color: 'var(--neg)', fontWeight: '600' }}>-0.6%</span></div>
            </div>
          </div>
        </div>

        {/* What you get today */}
        <section id="features" className="mobile-container" style={{ 
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
            marginBottom: '48px',
            letterSpacing: '-0.02em'
          }}>
            What you get today
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 'clamp(16px, 4vw, 24px)',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}>
            <div className="brand-card brand-candlestick brand-spine" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L7 8L11 12L15 6L21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12V20H21V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="3" cy="12" r="2" fill="white"/>
                  <circle cx="7" cy="8" r="2" fill="white"/>
                  <circle cx="11" cy="12" r="2" fill="white"/>
                  <circle cx="15" cy="6" r="2" fill="white"/>
                  <circle cx="21" cy="12" r="2" fill="white"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>Live Profit / Loss</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Unrealised P/L at a glance, refreshed with live prices every 30s.
              </p>
            </div>
            
            <div className="brand-card brand-sparkline brand-spine" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" stroke="white" strokeWidth="2"/>
                  <path d="M20 8V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M23 11H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>Real-time Prices</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Equities, FX, and crypto with resilient multi-source fallbacks.
              </p>
            </div>
            
            <div className="brand-card brand-candlestick brand-grid" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path d="M10 9H8"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>Smart News</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Ticker-aware news with images, interleaved so every position is represented.
              </p>
            </div>
            
            <div className="brand-card brand-candlestick brand-sparkline" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>Mock Trades</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Paper-invest without committing capital. Test ideas, learn safely, and keep mock positions separate from realised P/L.
              </p>
            </div>
            
            <div className="brand-card brand-grid brand-spine" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path d="M10 9H8"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>CSV Import</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Broker-agnostic parsing. Add historical trades fast.
              </p>
            </div>
            
            <div className="brand-card brand-grid brand-spine" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>Per-asset Breakdown</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Multi-series portfolio timeline and pie allocation (mock trades excluded).
              </p>
            </div>
            
            <div className="brand-card brand-sparkline brand-candlestick" style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
              border: '2px solid var(--border-warm)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-warm)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-warm)' }}>Privacy-first</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                Own your data. Export any time. Open roadmap and open source.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Pocket Portfolio Section */}
        <section style={{ marginBottom: '120px', textAlign: 'center' }}>
          <div style={{ 
            background: 'var(--card)', 
            border: '1px solid var(--card-border)', 
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

        {/* Mission Section */}
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
            Pocket Portfolio exists to help people make better investment decisions, together. We are building a community-led, open-source platform that turns market noise into clear, actionable insight—so anyone can learn, evaluate, and act with confidence.
          </p>
        </section>

        {/* FIN Pillars Section */}
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
            marginBottom: '48px' 
          }}>
            Future • Investment • Now
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            <div style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              padding: '32px', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '16px', 
                color: 'var(--signal)' 
              }}>
                Future
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                We design in the open and evolve with our community. We challenge the status quo in investment education and accessibility, and we focus relentlessly on clarity of insight.
              </p>
              <ul style={{ textAlign: 'left', color: 'var(--muted)', lineHeight: '1.6', paddingLeft: '0', listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>• Open-source core</li>
                <li style={{ marginBottom: '8px' }}>• Capability building with the community</li>
                <li style={{ marginBottom: '8px' }}>• Insight-first design</li>
              </ul>
            </div>
            <div style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              padding: '32px', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '16px', 
                color: 'var(--signal)' 
              }}>
                Investment
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                We promote investment mindsets through thoughtful design, technical excellence, and ambidextrous methods—tools that are simple to use and powerful under the hood.
              </p>
              <ul style={{ textAlign: 'left', color: 'var(--muted)', lineHeight: '1.6', paddingLeft: '0', listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>• Human-centered UX</li>
                <li style={{ marginBottom: '8px' }}>• Robust data engineering</li>
                <li style={{ marginBottom: '8px' }}>• Evidence-based decisions</li>
              </ul>
            </div>
            <div style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              padding: '32px', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '16px', 
                color: 'var(--signal)' 
              }}>
                Now
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                We stay present and adaptable to evolving markets. Community comes first—we learn out loud and ship improvements quickly with honesty and transparency.
              </p>
              <ul style={{ textAlign: 'left', color: 'var(--muted)', lineHeight: '1.6', paddingLeft: '0', listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>• Real-time insights</li>
                <li style={{ marginBottom: '8px' }}>• Fast, iterative delivery</li>
                <li style={{ marginBottom: '8px' }}>• Transparent roadmap</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Early Access Section */}
        <section style={{ marginBottom: '120px', textAlign: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--signal), #8b5cf6)', 
            borderRadius: '12px', 
            padding: '48px 32px',
            marginBottom: '48px',
            color: 'white'
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
              <Link 
                href="/dashboard" 
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
              </Link>
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
              href="https://github.com/pocketportfolio" 
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
                border: '1px solid #d1d5db', 
                color: '#374151', 
                textDecoration: 'none', 
                borderRadius: '6px', 
                fontWeight: '500',
                transition: 'all 0.2s'
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

        {/* FAQ Section */}
        <section id="faq" style={{ marginBottom: '120px' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <details style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <summary style={{ 
                padding: '24px', 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '1px solid var(--card-border)', 
                listStyle: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                Is Pocket Portfolio free?
              </summary>
              <div style={{ padding: '24px', paddingTop: '0' }}>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                  Yes. It's open source. If the community later wants premium data sources, we'll decide together.
                </p>
              </div>
            </details>

            <details style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <summary style={{ 
                padding: '24px', 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '1px solid var(--card-border)', 
                listStyle: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                How do you handle my data?
              </summary>
              <div style={{ padding: '24px', paddingTop: '0' }}>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                  You control your data. We store the minimum needed and make export easy. See our privacy note in the repository.
                </p>
              </div>
            </details>

            <details style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <summary style={{ 
                padding: '24px', 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '1px solid var(--card-border)', 
                listStyle: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                Can I contribute?
              </summary>
              <div style={{ padding: '24px', paddingTop: '0' }}>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                  Please! Check the GitHub repo for issues, roadmap, and contribution guidelines.
                </p>
              </div>
            </details>

            <details style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <summary style={{ 
                padding: '24px', 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '1px solid var(--card-border)', 
                listStyle: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                What data sources do you use for live prices?
              </summary>
              <div style={{ padding: '24px', paddingTop: '0' }}>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                  We use multiple data providers including Yahoo Finance, Alpha Vantage, and others with fallback support to ensure reliability.
                </p>
              </div>
            </details>

            <details style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <summary style={{ 
                padding: '24px', 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '1px solid var(--card-border)', 
                listStyle: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                Is my portfolio data secure?
              </summary>
              <div style={{ padding: '24px', paddingTop: '0' }}>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                  Yes, we use industry-standard encryption and follow privacy-first principles. Your data is stored securely and you can export it anytime.
                </p>
              </div>
            </details>

            <details style={{ 
              background: 'var(--card)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <summary style={{ 
                padding: '24px', 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '1px solid var(--card-border)', 
                listStyle: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                Can I import data from other platforms?
              </summary>
              <div style={{ padding: '24px', paddingTop: '0' }}>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                  Yes, we support CSV import from most major brokers with smart normalization to handle different formats.
                </p>
              </div>
            </details>
          </div>
        </section>
      </main>

      {/* Community Content Section */}
      <CommunityContent />

      {/* Footer */}
      <footer className="mobile-container" style={{ 
        marginTop: 'clamp(40px, 8vw, 80px)', 
        paddingTop: 'clamp(20px, 4vw, 32px)', 
        borderTop: '1px solid var(--card-border)', 
        textAlign: 'center', 
        background: 'var(--chrome)', 
        padding: 'clamp(20px, 4vw, 32px) clamp(12px, 3vw, 24px)',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          maxWidth: '100%', 
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              © 2025 Pocket Portfolio — Built with the community.
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px', 
            marginBottom: '32px', 
            flexWrap: 'wrap' 
          }}>
            <Link href="/openbrokercsv" style={{ 
              padding: '12px 24px', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              OpenBrokerCSV
            </Link>
            <Link href="/app/static/portfolio-tracker" style={{ 
              padding: '12px 24px', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              Portfolio Tracker
            </Link>
            <Link href="/csv/etoro-to-openbrokercsv" style={{ 
              padding: '12px 24px', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              eToro → OpenBrokerCSV
            </Link>
            <WaitlistCTA 
              source="web:footer" 
              variant="secondary" 
              size="md"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <a 
              href="https://github.com/pocketportfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              GitHub
            </a>
            <a 
              href="https://dev.to/pocketportfolioapp" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              Dev.to
            </a>
            <a 
              href="https://coderlegion.com/5738/welcome-to-coderlegion-22s" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              CoderLegion
            </a>
            <a 
              href="https://discord.gg/Ch9PpjRzwe" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              Discord
            </a>
            <Link 
              href="/dashboard" 
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              Launch App
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}