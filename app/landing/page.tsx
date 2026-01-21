'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CommunityContent from '../components/CommunityContent';
import SocialShare from '../components/viral/SocialShare';
import SocialProof from '../components/viral/SocialProof';
import FunnelTracker from '../components/analytics/FunnelTracker';
import CSVImporter from '../components/CSVImporter';
import { useTrades } from '../hooks/useTrades';
import { WebOneBadge } from '../components/hero/WebOneBadge';
import NPMStats from '../components/NPMStats';
import DynamicDownloadCount from '../components/DynamicDownloadCount';
import { useStickyHeader } from '../hooks/useStickyHeader';
import TickerSearch from '../components/TickerSearch';

export default function LandingPage() {
  const router = useRouter();
  const { importTrades } = useTrades();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);


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

  // Ensure header stays visible when scrolling
  useStickyHeader('header.brand-header');

  return (
    <>
      <FunnelTracker 
        funnelName="user_onboarding" 
        stage="landing"
        autoTrackScroll={true}
        autoTrackTime={true}
      />
      {/* Header - Outside scrolling container for proper sticky positioning */}
      <header 
        className="brand-header brand-spine" 
        style={{
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
          borderBottom: '1px solid var(--border)',
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
                <Link href="#popular-stocks" className="brand-link" style={{ 
                  fontSize: '15px',
                  padding: '8px 0',
                  borderBottom: '2px solid transparent',
                  textDecoration: 'none',
                  color: 'var(--text)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--signal)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--signal)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
                >Stocks</Link>
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
                <a
                  href="/sponsor"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
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
                    e.currentTarget.style.borderColor = 'var(--border)';
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
                  Sponsor
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
                padding: '0 20px 20px 20px',
                marginBottom: `calc(20px + env(safe-area-inset-bottom, 0px))` // Extra bottom margin for iPhone to ensure Sponsor button is visible
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

      {/* Hero Section - INVESTOR FOCUS */}
      <main className="brand-surface brand-grid mobile-container" style={{ 
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
          {/* Headline - ENEMY-FOCUSED VALUE PROP */}
          <h1 className="brand-text" style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: 'bold', 
            lineHeight: '1.1', 
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            maxWidth: '800px'
          }}>
            Stop being the product.<br />
            <span style={{ color: 'var(--accent-warm)' }}>Start managing your wealth.</span>
          </h1>

          {/* Subhead - PRIVACY + ENEMY POSITIONING */}
          <p className="brand-text-secondary" style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
            lineHeight: '1.6', 
            marginBottom: '40px',
            maxWidth: '700px',
            color: 'var(--text-secondary)'
          }}>
            Most "free" trackers sell your data to hedge funds.{' '}
            <strong style={{ color: 'var(--text)' }}>Pocket Portfolio</strong> is the sovereign wealth console that works for <em>you</em>.
            <br />
            <span style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
              Orchestrated by <strong style={{ color: 'var(--accent-warm)' }}>AI</strong>. Owned by <strong style={{ color: 'var(--accent-warm)' }}>You</strong>.
            </span>
          </p>
          
          {/* CTAs - INVESTOR FOCUS */}
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(12px, 3vw, 16px)', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}>
            <Link 
              href="/dashboard" 
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
              Launch Dashboard
            </Link>
            <a 
              href="#sovereign-architecture"
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
                scrollBehavior: 'smooth'
              }}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('sovereign-architecture');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
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
              Why Sovereign?
            </a>
          </div>

          {/* Quick Command Search Bar - Sitemap Bridge */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            marginTop: '32px',
            marginBottom: '0',
            position: 'relative',
            zIndex: 10000
          }}>
            <div style={{
              background: '#1a1a1a',
              border: '2px solid var(--border-warm)',
              borderRadius: '12px',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <TickerSearch
                placeholder="> Search 58,070 assets (e.g. NVDA, BTC)..."
                linkToTickerPage={true}
              />
            </div>
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
              preload="auto"
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
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#00ff00',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}>
              Actual footage of Pocket Portfolio running on localhost
            </div>
          </div>
        </div>
      </main>

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
            TRUSTED BY <span style={{ color: '#10b981' }}><DynamicDownloadCount /></span> ENGINEERS & BUILDERS
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

            {/* Verified Audit Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(66, 133, 244, 0.1)',
              border: '2px solid rgba(66, 133, 244, 0.3)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#4285F4'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Verified Audit</span>
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
        background: '#0a0a0a',
        marginBottom: 'clamp(60px, 10vw, 120px)',
        borderTop: '1px solid var(--border-warm)',
        borderBottom: '1px solid var(--border-warm)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Or... Build Your Own Stack.
          </h2>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#a0a0a0',
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
            background: '#1a1a1a',
            border: '2px solid #333',
            borderRadius: '12px',
            padding: 'clamp(24px, 5vw, 40px)',
            marginBottom: '32px',
            textAlign: 'left',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Terminal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #333'
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
                color: '#666',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>terminal</span>
            </div>

            {/* Code Snippet */}
            <pre style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
              color: '#00ff00',
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
              border: '2px solid #333',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'monospace'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Read the API Docs →
          </a>
        </div>
      </section>

      <main className="brand-surface brand-grid mobile-container">
        {/* SECTION 4: THE FEATURE GRID (SPLIT) */}
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
              {/* Terminal/Chart Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                background: 'var(--accent-warm)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M3 12L7 8L11 12L15 6L21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12V20H21V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
              <Link
                href="/dashboard"
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
              </Link>
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
              {/* Cloud/Lock Icon (Google Drive styled) */}
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(66, 133, 244, 0.1)',
                border: '2px solid rgba(66, 133, 244, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M12 2v20c5.16-1.26 9-6.45 9-12V7l-9-5z" fill="rgba(66, 133, 244, 0.3)"/>
                </svg>
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
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
              border: '2px solid #333',
              borderRadius: '16px',
              padding: 'clamp(32px, 5vw, 40px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.7)';
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
              e.currentTarget.style.borderColor = '#333';
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
              
              {/* Shield/Badge Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '2px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#ffffff',
                position: 'relative',
                zIndex: 1
              }}>
                Founders & Sponsors
              </h3>
              <p style={{
                color: '#a0a0a0',
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
                href="/sponsor"
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
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
            <Link
              href="/dashboard"
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
            </Link>
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
              Your financial data never leaves your device. Zero tracking pixels. Zero cloud latency. 100% Client-Side Encryption.
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
                  Zero Tracking
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '15px'
                }}>
                  No analytics pixels. No data collection. Your portfolio data stays on your device.
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
                  Everything runs locally. Instant load times. Works offline. Your data, your control.
                </p>
              </div>
            </div>
          </div>
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
          border: '1px solid var(--border)',
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
            Help others discover free, open-source portfolio tracking
          </p>
          <SocialShare
            title="Pocket Portfolio - Free, Open-Source Portfolio Tracker"
            description="Track your investments with a free, privacy-first portfolio tracker. No signup required. Open source."
            url="https://www.pocketportfolio.app"
            context="landing_page"
            showLabel={true}
            hashtags={['PocketPortfolio', 'PortfolioTracker', 'OpenSource', 'FreeFinance']}
          />
        </div>
      </section>
    </>
  );
}