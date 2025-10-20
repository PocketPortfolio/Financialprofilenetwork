'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getDeviceInfo } from '../../lib/utils/device';

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

interface TabBarProps {
  className?: string;
}

// Tab icons - using branded SVG icons with gradients
const DashboardIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#ff6b35" : "#ff6b35"} />
        <stop offset="100%" stopColor={isActive ? "#f59e0b" : "#ff6b35"} />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="url(#dashboardGradient)" strokeWidth="2.5" fill={isActive ? "url(#dashboardGradient)" : "none"}/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="url(#dashboardGradient)" strokeWidth="2.5" fill={isActive ? "url(#dashboardGradient)" : "none"}/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="url(#dashboardGradient)" strokeWidth="2.5" fill={isActive ? "url(#dashboardGradient)" : "none"}/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="url(#dashboardGradient)" strokeWidth="2.5" fill={isActive ? "url(#dashboardGradient)" : "none"}/>
  </svg>
);

const PositionsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="positionsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#ff6b35" : "#ff6b35"} />
        <stop offset="100%" stopColor={isActive ? "#f59e0b" : "#ff6b35"} />
      </linearGradient>
    </defs>
    <path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
      stroke="url(#positionsGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isActive ? "url(#positionsGradient)" : "none"}
    />
  </svg>
);

const WatchlistIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="watchlistGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#ff6b35" : "#ff6b35"} />
        <stop offset="100%" stopColor={isActive ? "#f59e0b" : "#ff6b35"} />
      </linearGradient>
    </defs>
    <path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="url(#watchlistGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isActive ? "url(#watchlistGradient)" : "none"}
    />
    <circle cx="8.5" cy="7" r="4" stroke="url(#watchlistGradient)" strokeWidth="2.5" fill={isActive ? "url(#watchlistGradient)" : "none"}/>
    <path d="M20 8V14" stroke="url(#watchlistGradient)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M23 11H17" stroke="url(#watchlistGradient)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ImportIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="importGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#ff6b35" : "#ff6b35"} />
        <stop offset="100%" stopColor={isActive ? "#f59e0b" : "#ff6b35"} />
      </linearGradient>
    </defs>
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="url(#importGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isActive ? "url(#importGradient)" : "none"}
    />
    <path d="M14 2V8H20" stroke="url(#importGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18L12 12" stroke="url(#importGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15L12 12L15 15" stroke="url(#importGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#ff6b35" : "#ff6b35"} />
        <stop offset="100%" stopColor={isActive ? "#f59e0b" : "#ff6b35"} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="3" stroke="url(#settingsGradient)" strokeWidth="2.5" fill={isActive ? "url(#settingsGradient)" : "none"}/>
    <path
      d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0823 3.742 9.97512 4.01062 9.78251C4.27925 9.5899 4.48167 9.32074 4.59 9.01C4.72312 8.70838 4.76282 8.37381 4.704 8.04941C4.64519 7.72502 4.49054 7.42568 4.26 7.19L4.2 7.13C4.01405 6.94425 3.86653 6.72368 3.76588 6.48088C3.66523 6.23808 3.61343 5.97783 3.61343 5.715C3.61343 5.45217 3.66523 5.19192 3.76588 4.94912C3.86653 4.70632 4.01405 4.48575 4.2 4.3C4.38575 4.11405 4.60632 3.96653 4.84912 3.86588C5.09192 3.76523 5.35217 3.71343 5.615 3.71343C5.87783 3.71343 6.13808 3.76523 6.38088 3.86588C6.62368 3.96653 6.84425 4.11405 7.03 4.3L7.09 4.36C7.32568 4.59054 7.62502 4.74519 7.94941 4.804C8.27381 4.86282 8.60838 4.82312 8.91 4.69H9C9.29577 4.56324 9.54802 4.35276 9.72569 4.08447C9.90337 3.81618 9.99872 3.50179 10 3.18V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
      stroke="url(#settingsGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isActive ? "url(#settingsGradient)" : "none"}
    />
  </svg>
);

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon isActive={false} />,
    ariaLabel: 'Go to Dashboard',
  },
  {
    id: 'positions',
    label: 'Positions',
    href: '/dashboard#positions', // Scroll to positions section
    icon: <PositionsIcon isActive={false} />,
    ariaLabel: 'View Positions',
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    href: '/live',
    icon: <WatchlistIcon isActive={false} />,
    ariaLabel: 'View Watchlist',
  },
  {
    id: 'import',
    label: 'Import',
    href: '/dashboard#import', // Scroll to import section
    icon: <ImportIcon isActive={false} />,
    ariaLabel: 'Import Trades',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard#settings', // Scroll to settings section
    icon: <SettingsIcon isActive={false} />,
    ariaLabel: 'Open Settings',
  },
];

export default function TabBar({ className = '' }: TabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Debug logging
  console.log('TabBar rendering:', { pathname, className });
  
  // Always render - CSS will handle mobile/desktop visibility

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`mobile-tab-bar brand-surface ${className}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.95) 0%, rgba(245, 158, 11, 0.95) 100%)',
        borderTop: '2px solid rgba(255, 107, 53, 0.3)',
        paddingTop: '12px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        minHeight: '72px',
        backdropFilter: 'blur(20px) saturate(1.2)',
        boxShadow: '0 -8px 32px rgba(255, 107, 53, 0.3), 0 -4px 16px rgba(0, 0, 0, 0.1)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || 
                        (tab.id === 'dashboard' && pathname === '/dashboard') ||
                        (tab.id === 'watchlist' && pathname === '/live');
        
        const handleTabClick = (e: React.MouseEvent, href: string) => {
          e.preventDefault();
          
          // Handle hash links for scrolling to sections
          if (href.includes('#')) {
            const [path, hash] = href.split('#');
            if (path === '/dashboard' && hash) {
              // If we're already on the dashboard, scroll to section
              if (pathname === '/dashboard') {
                const element = document.getElementById(hash);
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                  });
                } else {
                  // Silently handle missing elements - this is normal for some pages
                  console.debug(`Element with id "${hash}" not found on current page`);
                }
              } else {
                // Navigate to dashboard first, then scroll
                router.push(href);
              }
            } else {
              // Navigate to different pages
              router.push(href);
            }
          } else {
            // Navigate to different pages
            router.push(href);
          }
        };

        return (
          <button
            key={tab.id}
            onClick={(e) => handleTabClick(e, tab.href)}
            className="mobile-tab-item"
            data-active={isActive}
            aria-label={tab.ariaLabel}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRadius: '12px',
              background: isActive 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'transparent',
              border: isActive 
                ? '2px solid rgba(255, 255, 255, 0.3)' 
                : '2px solid transparent',
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              minHeight: '52px',
              minWidth: '52px',
              cursor: 'pointer',
              flex: '1',
              maxWidth: '80px',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isActive 
                ? '0 4px 16px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <div style={{ marginBottom: 'var(--space-xs)' }}>
              {React.cloneElement(tab.icon as React.ReactElement, { isActive })}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                textAlign: 'center',
                lineHeight: 1.2,
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                letterSpacing: '0.025em',
                marginTop: '2px',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}



























