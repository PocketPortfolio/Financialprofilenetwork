'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '../hooks/useAuth';
import { getDeviceInfo } from '../lib/utils/device';
import { useStickyHeader } from '../hooks/useStickyHeader';
import SyncStatusIndicator from './SyncStatusIndicator';

interface HeaderProps {
  activeTab?: 'dashboard' | 'live' | 'news' | 'faq';
}

export default function Header({ activeTab = 'dashboard' }: HeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logout, isAuthenticated, signInWithGoogle } = useAuth();

  // Device detection for responsive logo sizing
  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    setIsMobile(deviceInfo.isMobile);
  }, []);

  const getPageTitle = (path: string) => {
    const titles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/positions': 'Positions',
      '/watchlist': 'Watchlist',
      '/import': 'Import',
      '/settings': 'Settings',
      '/news': 'News',
      '/live': 'Live'
    };
    return titles[path] || 'Dashboard';
  };

  const pageTitle = getPageTitle(pathname);

  // Ensure header stays visible when scrolling
  useStickyHeader('header[style*="position: sticky"]');

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
      window.location.href = '/landing';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        background: 'transparent',
        borderBottom: '2px solid var(--signal)',
        paddingTop: 'var(--safe-area-top)',
        paddingBottom: 'var(--space-md)',
        paddingLeft: 'var(--space-lg)',
        paddingRight: 'var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 'var(--touch-target)'
      }}
    >
      {/* Logo and Title */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', // Increased gap for better spacing on mobile
        flex: '1',
        minWidth: 0, // Allow flex item to shrink
        overflow: 'hidden' // Prevent overflow
      }}>
        <Link
          href="/"
          style={{ 
            textDecoration: 'none',
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
        {/* Sync Status Indicator for direct traffic free-tier users */}
        <SyncStatusIndicator />
      </div>

      {/* Hamburger Menu Button */}
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              width: '320px',
              height: '100vh',
              maxHeight: '100vh', // Ensure it respects viewport
              background: 'var(--surface-elevated)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              transform: 'translateX(0)',
              transition: 'transform 0.3s ease',
              overflow: 'hidden' // Prevent outer container from scrolling
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-lg)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--signal)',
              flexShrink: 0 // Prevent header from shrinking
            }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: 'var(--text-lg)' }}>Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: 'var(--text-xl)',
                  cursor: 'pointer',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                ×
              </button>
            </div>

            {/* Menu Items - Scrollable */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              overscrollBehavior: 'contain' // Prevent scroll chaining
            }}>
              <div style={{ padding: 'var(--space-md) 0' }}>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: pathname === '/dashboard' ? 'var(--text-inverse)' : 'var(--text)',
                  textDecoration: 'none',
                  background: pathname === '/dashboard' ? 'var(--signal)' : 'transparent',
                  borderLeft: pathname === '/dashboard' ? '4px solid var(--signal)' : '4px solid transparent'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Dashboard
                </Link>

                <Link href="/positions" onClick={() => setIsMenuOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: pathname === '/positions' ? 'var(--text-inverse)' : 'var(--text)',
                  textDecoration: 'none',
                  background: pathname === '/positions' ? 'var(--signal)' : 'transparent',
                  borderLeft: pathname === '/positions' ? '4px solid var(--signal)' : '4px solid transparent'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Positions
                </Link>

                <Link href="/watchlist" onClick={() => setIsMenuOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: pathname === '/watchlist' ? 'var(--text-inverse)' : 'var(--text)',
                  textDecoration: 'none',
                  background: pathname === '/watchlist' ? 'var(--signal)' : 'transparent',
                  borderLeft: pathname === '/watchlist' ? '4px solid var(--signal)' : '4px solid transparent'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Watchlist
                </Link>

                <Link href="/import" onClick={() => setIsMenuOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: pathname === '/import' ? 'var(--text-inverse)' : 'var(--text)',
                  textDecoration: 'none',
                  background: pathname === '/import' ? 'var(--signal)' : 'transparent',
                  borderLeft: pathname === '/import' ? '4px solid var(--signal)' : '4px solid transparent'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Import CSV
                </Link>

                <Link href="/settings" onClick={() => setIsMenuOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: pathname === '/settings' ? 'var(--text-inverse)' : 'var(--text)',
                  textDecoration: 'none',
                  background: pathname === '/settings' ? 'var(--signal)' : 'transparent',
                  borderLeft: pathname === '/settings' ? '4px solid var(--signal)' : '4px solid transparent'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5146 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79L4.21 19.71C4.02405 19.5243 3.87651 19.3037 3.77588 19.0609C3.67525 18.8181 3.62346 18.5578 3.62346 18.295C3.62346 18.0322 3.67525 17.7719 3.77588 17.5291C3.87651 17.2863 4.02405 17.0657 4.21 16.88L4.27 16.82C4.50046 16.5843 4.65517 16.285 4.71397 15.9606C4.77276 15.6362 4.73308 15.3016 4.6 15C4.47324 14.7042 4.26281 14.452 3.99453 14.2743C3.72625 14.0966 3.41191 14.0013 3.09 14H3C2.46957 14 1.96086 13.7893 1.58579 13.4142C1.21071 13.0391 1 12.5304 1 12C1 11.4696 1.21071 10.9609 1.58579 10.5858C1.96086 10.2107 2.46957 10 3 10H3.09C3.41191 9.9987 3.72625 9.90343 3.99453 9.72572C4.26281 9.54801 4.47324 9.2958 4.6 9C4.73308 8.69838 4.77276 8.36381 4.71397 8.03941C4.65517 7.71502 4.50046 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87651 6.71368 3.77588 6.47088C3.67525 6.22808 3.62346 5.96783 3.62346 5.705C3.62346 5.44217 3.67525 5.18192 3.77588 4.93912C3.87651 4.69632 4.02405 4.47575 4.21 4.29L4.29 4.21C4.47575 4.02405 4.69632 3.87651 4.93912 3.77588C5.18192 3.67525 5.44217 3.62346 5.705 3.62346C5.96783 3.62346 6.22808 3.67525 6.47088 3.77588C6.71368 3.87651 6.93425 4.02405 7.12 4.21L7.18 4.27C7.41568 4.50046 7.71502 4.65517 8.03941 4.71397C8.36381 4.77276 8.69838 4.73308 9 4.6C9.2958 4.47324 9.54801 4.26281 9.72572 3.99453C9.90343 3.72625 9.9987 3.41191 10 3.09V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41191 14.0966 3.72625 14.2743 3.99453C14.452 4.26281 14.7042 4.47324 15 4.6C15.3016 4.73308 15.6362 4.77276 15.9606 4.71397C16.285 4.65517 16.5843 4.50046 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87651 17.5291 3.77588C17.7719 3.67525 18.0322 3.62346 18.295 3.62346C18.5578 3.62346 18.8181 3.67525 19.0609 3.77588C19.3037 3.87651 19.5243 4.02405 19.71 4.21L19.79 4.29C19.976 4.47575 20.1235 4.69632 20.2241 4.93912C20.3248 5.18192 20.3766 5.44217 20.3766 5.705C20.3766 5.96783 20.3248 6.22808 20.2241 6.47088C20.1235 6.71368 19.976 6.93425 19.79 7.12L19.73 7.18C19.4995 7.41568 19.3448 7.71502 19.286 8.03941C19.2272 8.36381 19.2669 8.69838 19.4 9C19.5268 9.2958 19.7372 9.54801 20.0055 9.72572C20.2738 9.90343 20.5881 9.9987 20.91 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5881 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Settings
                </Link>
              </div>

              {/* Theme Switcher */}
              <div style={{ 
                height: '2px', 
                background: 'linear-gradient(90deg, transparent 0%, #ff6b35 50%, transparent 100%)', 
                margin: '8px 16px',
                borderRadius: '1px'
              }} />
              
              <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent'
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
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Theme
                </div>
                <ThemeSwitcher />
              </div>
              
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-md)',
                  fontWeight: '500'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Home
              </Link>

              {isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md) var(--space-lg)',
                    color: '#ef4444',
                    textDecoration: 'none',
                    fontSize: 'var(--text-md)',
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md) var(--space-lg)',
                    color: '#10b981',
                    textDecoration: 'none',
                    fontSize: 'var(--text-md)',
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
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
