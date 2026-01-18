'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import { usePremiumTheme } from '../../hooks/usePremiumTheme';
import { useAuth } from '../../hooks/useAuth';
import { UserAvatarDropdown } from './UserAvatarDropdown';

interface SovereignHeaderProps {
  syncState?: 'idle' | 'syncing' | 'error';
  lastSyncTime?: string | null;
  user?: any;
  setShowImportModal?: (show: boolean) => void;
}

export function SovereignHeader({ syncState = 'idle', lastSyncTime = null, user, setShowImportModal }: SovereignHeaderProps) {
  const [time, setTime] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSyncTooltip, setShowSyncTooltip] = useState(false);
  const { tier } = usePremiumTheme();
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // 🟢 LOGIC: Check if user has premium sync access
  const isPremium = tier === 'corporateSponsor' || tier === 'foundersClub';

  useEffect(() => {
    // 🟢 Real-time UTC Clock (The "Terminal" feel)
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check window width on mount and resize
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Check immediately
    checkWidth();
    
    // Listen for resize
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
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

    if (user) {
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <>
      <header style={{
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--background) / 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        overflow: 'visible'
      }}>
        {/* LEFT: Menu + Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'transparent',
              border: `1px solid hsl(var(--border) / 0.3)`,
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--muted-foreground))',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--foreground))';
              e.currentTarget.style.borderColor = 'hsl(var(--border))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.3)';
            }}
            aria-label="Open menu"
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
          
          {/* Logo - Using same component as landing page and other 60K+ pages */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo size={isDesktop ? "medium" : "small"} showWordmark={isDesktop} />
          </Link>
        </div>

        {/* RIGHT: Status + Theme + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Sync Status - Hidden on mobile */}
          <div 
            style={{ 
              display: isDesktop ? 'flex' : 'none',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              position: 'relative',
              cursor: lastSyncTime ? 'pointer' : 'default'
            }}
            onMouseEnter={() => lastSyncTime && setShowSyncTooltip(true)}
            onMouseLeave={() => setShowSyncTooltip(false)}
          >
            {syncState === 'syncing' ? (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'hsl(var(--accent))',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <span style={{ color: 'hsl(var(--accent))', fontWeight: '700' }}>⟳ SYNCING...</span>
              </>
            ) : isPremium ? (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'hsl(var(--primary))',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <span style={{ color: 'hsl(var(--primary))', fontWeight: '700' }}>● SYNC: ACTIVE</span>
              </>
            ) : (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'hsl(var(--primary))',
                  boxShadow: '0 0 8px hsl(var(--primary) / 0.6), 0 0 16px hsl(var(--primary) / 0.4)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <span style={{ color: 'hsl(var(--primary))', fontWeight: '700' }}>● LOCAL STORAGE</span>
              </>
            )}
            
            {/* Custom Premium Tooltip */}
            {showSyncTooltip && lastSyncTime && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  background: 'hsl(var(--card))',
                  border: '2px solid hsl(var(--primary))',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                  color: 'hsl(var(--card-foreground))',
                  minWidth: '200px',
                  maxWidth: '280px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(var(--primary) / 0.2)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  animation: 'fadeIn 0.2s ease-out',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {/* Tooltip Arrow - pointing up */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid hsl(var(--primary))'
                  }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'hsl(var(--primary))',
                    boxShadow: '0 0 6px hsl(var(--primary) / 0.8)'
                  }} />
                  <span style={{
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'hsl(var(--primary))'
                  }}>
                    Last Synced
                  </span>
                </div>
                <div style={{
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '10px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.4'
                }}>
                  {new Date(lastSyncTime).toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          {/* Theme Switcher - Always Visible */}
          <div>
            <ThemeSwitcher />
          </div>
          
          {/* User Avatar with Dropdown OR Sign In Button */}
          {user ? (
            <UserAvatarDropdown user={user} />
          ) : (
            <button
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch (error) {
                  console.error('Error signing in:', error);
                }
              }}
              disabled={authLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                opacity: authLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.background = 'hsl(var(--primary) / 0.9)';
                }
              }}
              onMouseLeave={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.background = 'hsl(var(--primary))';
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {authLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          )}
        </div>
      </header>
      
      {/* 🟢 RESTORED: Mobile Navigation Menu */}
      {isMenuOpen && (
        <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'hsl(var(--foreground) / 0.1)',
              zIndex: 9999,
            }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              position: 'fixed',
              top: '0px',
              left: '0px',
              background: 'hsl(var(--background))',
              borderRight: '1px solid hsl(var(--border))',
              boxShadow: '0 25px 50px -12px hsl(var(--foreground) / 0.1)',
              padding: '0px',
              width: '300px',
              height: '100vh',
              maxHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 10000,
              transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              background: 'hsl(var(--card))',
              borderBottom: '1px solid hsl(var(--border))',
            }}>
              <span style={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: '600' }}>Navigation</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              padding: '16px',
              flex: 1,
              overflowY: 'auto',
            }}>
              {/* 🟢 FULL APP MENU */}
              <Link 
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'hsla(var(--accent), 0.1)',
                  border: '1px solid hsla(var(--accent), 0.2)',
                }}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/positions"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--muted))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Holdings
              </Link>
              
              <Link 
                href="/watchlist"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--muted))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Watchlist
              </Link>
              
              <Link 
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  // Store intent in sessionStorage for reliable cross-page navigation
                  sessionStorage.setItem('openImportModal', 'true');
                  // Navigate to dashboard if not already there (client-side navigation)
                  if (pathname !== '/dashboard') {
                    router.push('/dashboard');
                  } else {
                    // Already on dashboard, dispatch event immediately
                    window.dispatchEvent(new CustomEvent('openImportModal'));
                  }
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--muted))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Import CSV
              </Link>
              
              <Link 
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--muted))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Settings
              </Link>
              
              <Link 
                href="/sponsor"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--muted))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Support
              </Link>
              
              {/* Admin Links - Only show if user is admin */}
              {isAdmin && (
                <>
                  <div style={{
                    height: '1px',
                    background: 'hsl(var(--border))',
                    margin: '16px 0',
                  }} />
                  
                  <Link 
                    href="/admin/analytics"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Analytics
                  </Link>
                  
                  <Link 
                    href="/admin/sales"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Sales
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

