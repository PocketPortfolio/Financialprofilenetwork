'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDeviceInfo } from '../../lib/utils/device';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import { useAuth } from '../../hooks/useAuth';

interface MobileHeaderProps {
  title?: string;
  className?: string;
  onMenuClick?: () => void;
  fixed?: boolean; // If true, header will be fixed (not scrolling). If false, it will be sticky (scrollable)
}

// Menu icon
const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 12h18M3 6h18M3 18h18"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Navigation icons - All with consistent 2.5px stroke weight
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2.5"/>
  </svg>
);

const PositionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WatchlistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M20 8V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M23 11H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ImportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0823 3.742 9.97512 4.01062 9.78251C4.27925 9.5899 4.48167 9.32074 4.59 9.01C4.72312 8.70838 4.76282 8.37381 4.704 8.04941C4.64519 7.72502 4.49054 7.42568 4.26 7.19L4.2 7.13C4.01405 6.94425 3.86653 6.72368 3.76588 6.48088C3.66523 6.23808 3.61343 5.97783 3.61343 5.715C3.61343 5.45217 3.66523 5.19192 3.76588 4.94912C3.86653 4.70632 4.01405 4.48575 4.2 4.3C4.38575 4.11405 4.60632 3.96653 4.84912 3.86588C5.09192 3.76523 5.35217 3.71343 5.615 3.71343C5.87783 3.71343 6.13808 3.76523 6.38088 3.86588C6.62368 3.96653 6.84425 4.11405 7.03 4.3L7.09 4.36C7.32568 4.59054 7.62502 4.74519 7.94941 4.804C8.27381 4.86282 8.60838 4.82312 8.91 4.69H9C9.29577 4.56324 9.54802 4.35276 9.72569 4.08447C9.90337 3.81618 9.99872 3.50179 10 3.18V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AdminIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Get page title from pathname
function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/live':
      return 'Live Prices';
    case '/join':
      return 'Join Waitlist';
    case '/landing':
      return 'Pocket Portfolio';
    default:
      return 'Pocket Portfolio';
  }
}

export default function MobileHeader({ 
  title, 
  className = '', 
  onMenuClick,
  fixed = false // Default to false (sticky/scrollable)
}: MobileHeaderProps) {
  
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [width, setWidth] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const { logout, user, isAuthenticated, signInWithGoogle, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Define pageTitle early to avoid initialization issues
  const pageTitle = title || getPageTitle(pathname);

  // Apply fixed positioning for dashboard only using useEffect
  // This avoids conditional hook calls (React rules violation)
  useEffect(() => {
    if (!fixed) return;
    
    const header = document.querySelector('header.mobile-header');
    if (!header) return;
    
    const applyFixedPositioning = () => {
      const rect = header.getBoundingClientRect();
      const headerHeight = rect.height;
      
      // Apply fixed positioning
      (header as HTMLElement).style.position = 'fixed';
      (header as HTMLElement).style.top = '0';
      (header as HTMLElement).style.left = '0';
      (header as HTMLElement).style.right = '0';
      (header as HTMLElement).style.width = '100%';
      
      // Add padding to body to prevent content from jumping under fixed header
      const bodyPadding = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
      if (bodyPadding < headerHeight) {
        document.body.style.paddingTop = `${headerHeight}px`;
      }
    };
    
    // Apply immediately and on resize
    applyFixedPositioning();
    setTimeout(applyFixedPositioning, 100);
    window.addEventListener('resize', applyFixedPositioning, { passive: true });
    
    return () => {
      window.removeEventListener('resize', applyFixedPositioning);
      // Cleanup body padding
      document.body.style.paddingTop = '';
    };
  }, [fixed]);

  // Hydration-safe mobile detection
  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    setIsMobile(deviceInfo.isMobile);
    setIsTablet(deviceInfo.isTablet);
    setWidth(deviceInfo.width);
    setIsHydrated(true);
  }, []);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const token = await user.getIdTokenResult();
        const hasAdminClaim = token.claims.admin === true;
        setIsAdmin(hasAdminClaim);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    if (!loading && user) {
      checkAdmin();
    } else if (!loading && !user) {
      setIsAdmin(false);
    }
  }, [user, loading]);

  // Show loading state during hydration, then show based on device
  if (!isHydrated) {
    // Return a placeholder during hydration to prevent mismatch
    return (
      <header
        className={`mobile-header ${className}`}
        style={{
          position: fixed ? 'fixed' : 'sticky', // Use fixed when prop is true
          top: 0,
          zIndex: 'var(--z-sticky)',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--card-border)',
          paddingTop: 'var(--safe-area-top)',
          paddingBottom: 'var(--space-md)',
          paddingLeft: 'var(--space-lg)',
          paddingRight: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'var(--touch-target-large)',
          visibility: 'hidden' // Hide during hydration
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={isMobile ? "small" : "medium"} showWordmark={false} />
          <h1 style={{ fontSize: 'var(--text-mobile-lg)', fontWeight: '600', color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
            {pageTitle}
          </h1>
        </div>
        <div style={{ width: '24px', height: '24px' }} />
      </header>
    );
  }

  // Show on mobile, tablet, or smaller screens (less than 1024px)
  // Temporarily show on all devices for debugging
  // if (!isMobile && !isTablet && width >= 1024) {
  //   return null;
  // }

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <header
      className={`mobile-header ${className}`}
      style={{
        position: fixed ? 'fixed' : 'sticky', // Use fixed when prop is true
        top: 0,
        zIndex: 'var(--z-sticky)',
        background: fixed ? 'var(--bg)' : 'transparent', // Solid background when fixed
        borderBottom: '2px solid var(--signal)',
        paddingTop: 'var(--safe-area-top)',
        paddingBottom: 'var(--space-md)',
        paddingLeft: 'var(--space-lg)',
        paddingRight: 'var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 'var(--touch-target-large)'
      }}
    >
      {/* Logo/Title */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', // Increased gap for better spacing on mobile
        flex: '1',
        minWidth: 0, // Allow flex item to shrink
        overflow: 'hidden' // Prevent overflow
      }}>
        <Link 
          href="/landing" 
          style={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0 // Prevent logo from shrinking
          }}
          aria-label="Go to Pocket Portfolio homepage"
        >
          <Logo size={isMobile ? "small" : "medium"} showWordmark={false} />
        </Link>
        <h1
          style={{
            fontSize: 'var(--text-mobile-lg)',
            fontWeight: '600',
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.2, // Better line height to prevent overlap
            whiteSpace: 'nowrap', // Prevent text wrapping
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: '1',
            minWidth: 0
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Menu Button */}
      <button
        type="button"
        className="mobile-menu-button touch-target-comfortable"
        onClick={handleMenuClick}
        aria-label="Open menu"
        aria-expanded={isMenuOpen}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          padding: 'var(--space-sm)',
          minWidth: 'var(--touch-target)',
          minHeight: 'var(--touch-target)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--surface)';
          e.currentTarget.style.borderColor = 'var(--signal)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <MenuIcon />
      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              background: 'var(--surface-elevated)',
              borderRadius: '0px 0px 0px 0px',
              border: '1px solid var(--card-border)',
              borderLeft: '3px solid var(--signal)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0px',
              width: '300px',
              height: '100vh',
              maxHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden', // Prevent outer container from scrolling
              zIndex: 10000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - positioned at top right */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              padding: 'var(--space-md)',
              background: 'var(--signal)',
              borderRadius: '0 0 0 var(--radius-md)',
              flexShrink: 0 // Prevent header from shrinking
            }}>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-inverse)',
                  fontSize: 'var(--text-lg)',
                  cursor: 'pointer',
                  padding: 'var(--space-sm)',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Menu items - modern clean design - Scrollable */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              padding: 'var(--space-lg)',
              background: 'var(--surface-elevated)',
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              overscrollBehavior: 'contain' // Prevent scroll chaining
            }}>
              <Link 
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  color: pathname === '/dashboard' ? 'var(--text-inverse)' : 'var(--text)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-md)',
                  fontWeight: pathname === '/dashboard' ? '600' : '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  background: pathname === '/dashboard' 
                    ? 'var(--signal)' 
                    : 'transparent',
                  border: 'none',
                  margin: '0'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/dashboard') {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/dashboard') {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <DashboardIcon />
                Dashboard
              </Link>
              
              <Link 
                href="/positions"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-md)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  background: 'transparent',
                  border: 'none',
                  margin: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <PositionsIcon />
                Positions
              </Link>
              
              <Link 
                href="/watchlist"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-md)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  background: 'transparent',
                  border: 'none',
                  margin: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <WatchlistIcon />
                Watchlist
              </Link>
              
              <Link 
                href="/import"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-md)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  background: 'transparent',
                  border: 'none',
                  margin: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <ImportIcon />
                Import CSV
              </Link>
              
              <Link 
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-md)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  background: 'transparent',
                  border: 'none',
                  margin: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <SettingsIcon />
                Settings
              </Link>
              
              {/* Admin Links - Only show if user is admin */}
              {isAdmin && (
                <>
                  <Link 
                    href="/admin/analytics"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: 'var(--space-md) var(--space-lg)',
                      borderRadius: 'var(--radius-md)',
                      color: pathname === '/admin/analytics' ? 'var(--text-inverse)' : 'var(--text)',
                      textDecoration: 'none',
                      fontSize: 'var(--text-md)',
                      fontWeight: pathname === '/admin/analytics' ? '600' : '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      background: pathname === '/admin/analytics' 
                        ? 'var(--signal)' 
                        : 'transparent',
                      border: 'none',
                      margin: '0'
                    }}
                    onMouseEnter={(e) => {
                      if (pathname !== '/admin/analytics') {
                        e.currentTarget.style.background = 'var(--surface)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== '/admin/analytics') {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <AdminIcon />
                    Analytics
                  </Link>
                  
                  <Link 
                    href="/admin/sales"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: 'var(--space-md) var(--space-lg)',
                      borderRadius: 'var(--radius-md)',
                      color: pathname === '/admin/sales' ? 'var(--text-inverse)' : 'var(--text)',
                      textDecoration: 'none',
                      fontSize: 'var(--text-md)',
                      fontWeight: pathname === '/admin/sales' ? '600' : '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      background: pathname === '/admin/sales' 
                        ? 'var(--signal)' 
                        : 'transparent',
                      border: 'none',
                      margin: '0'
                    }}
                    onMouseEnter={(e) => {
                      if (pathname !== '/admin/sales') {
                        e.currentTarget.style.background = 'var(--surface)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== '/admin/sales') {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="2.5">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8.5" cy="7" r="4" stroke="currentColor"/>
                      <path d="M17 11V9M20 14H14" stroke="currentColor" strokeLinecap="round"/>
                    </svg>
                    Sales Pilot
                  </Link>
                </>
              )}
              
              {/* Divider */}
              <div style={{ 
                height: '2px', 
                background: 'linear-gradient(90deg, transparent 0%, #ff6b35 50%, transparent 100%)', 
                margin: '8px 16px',
                borderRadius: '1px'
              }} />
              
              {/* Theme Switcher - modern and functional */}
              <div style={{ 
                padding: 'var(--space-md) var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                margin: '0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-md)',
                  color: 'var(--text)',
                  fontSize: 'var(--text-md)',
                  fontWeight: '500'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Theme
                </div>
                <ThemeSwitcher />
              </div>
              
              {/* Divider */}
              <div style={{ 
                height: '2px', 
                background: 'linear-gradient(90deg, transparent 0%, #ff6b35 50%, transparent 100%)', 
                margin: '8px 16px',
                borderRadius: '1px'
              }} />
              
              <Link 
                href="/landing"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '0px',
                  color: '#9aa3ae',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'transparent',
                  borderLeft: '4px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)';
                  e.currentTarget.style.borderLeft = '4px solid #ff6b35';
                  e.currentTarget.style.color = '#e7eaf0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderLeft = '4px solid transparent';
                  e.currentTarget.style.color = '#9aa3ae';
                }}
              >
                <HomeIcon />
                Home
              </Link>
              
              {/* Authentication Button */}
              {isAuthenticated ? (
                /* Sign Out Button */
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    try {
                      await logout();
                      // Redirect to landing page after logout
                      window.location.href = '/landing';
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '0px',
                    color: '#ef4444',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    borderLeft: '4px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                    e.currentTarget.style.borderLeft = '4px solid #ef4444';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderLeft = '4px solid transparent';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign out from Google
                </button>
              ) : (
                /* Sign In Button */
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      console.error('Error signing in:', error);
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '0px',
                    color: '#10b981',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    borderLeft: '4px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.borderLeft = '4px solid #10b981';
                    e.currentTarget.style.color = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderLeft = '4px solid transparent';
                    e.currentTarget.style.color = '#10b981';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}



















































