'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import { usePremiumTheme } from '../../hooks/usePremiumTheme';
import { useAuth } from '../../hooks/useAuth';
import { isBrewinPilotEmail } from '../../lib/demo/brewin-manchester-pilot';
import { UserAvatarDropdown } from './UserAvatarDropdown';
import { SupportFormModal } from './SupportFormModal';
import { useStickyHeader } from '../../hooks/useStickyHeader';
import { useDesktopNavOptional } from '../../hooks/useDesktopNav';
import SignInOptions from '../auth/SignInOptions';

interface SovereignHeaderProps {
  syncState?: 'idle' | 'syncing' | 'error';
  lastSyncTime?: string | null;
  user?: any;
  setShowImportModal?: (show: boolean) => void;
}

export function SovereignHeader({ syncState = 'idle', lastSyncTime = null, user, setShowImportModal }: SovereignHeaderProps) {
  const [time, setTime] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSyncTooltip, setShowSyncTooltip] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const { tier } = usePremiumTheme();
  const { signInWithGoogle, signInWithMicrosoft, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const desktopNav = useDesktopNavOptional();
  const usePersistentDesktopNav = isDesktop && desktopNav !== null;
  
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

  // Make header fixed like landing page
  useStickyHeader('header.sovereign-header');

  return (
    <>
      <header 
        className="sovereign-header"
        data-tour="sovereign-header"
        style={{
          borderBottom: '1px solid var(--dashboard-chrome-border)',
          background: 'hsl(var(--background))',
          backdropFilter: 'blur(12px)',
          position: 'sticky', // Will be converted to 'fixed' by useStickyHeader hook
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1002, // Above GlobalFoundersClubBanner (1001) so nav is never hidden behind it
          padding: '0', // Padding moved to inner container to reduce white space
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          overflow: 'visible',
          width: '100%' // Ensure full width for fixed positioning
        }}>
        {/* Max-width container to match production alignment */}
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          width: '100%',
          padding: '12px 24px', // Padding moved here to reduce white space
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* LEFT: Menu + Logo + Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Menu Button */}
          <button
            type="button"
            data-tour="nav-menu-toggle"
            onClick={() => {
              if (usePersistentDesktopNav && desktopNav) {
                desktopNav.toggle();
                return;
              }
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{
              background: 'transparent',
              border: `1px solid color-mix(in srgb, var(--dashboard-chrome-border) 30%, transparent)`,
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--dashboard-muted-foreground)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--foreground))';
              e.currentTarget.style.borderColor = 'var(--dashboard-chrome-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--dashboard-muted-foreground)';
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--dashboard-chrome-border) 30%, transparent)';
            }}
            aria-label={
              usePersistentDesktopNav && desktopNav?.isOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={usePersistentDesktopNav ? desktopNav?.isOpen : isMenuOpen}
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
                  color: 'var(--dashboard-muted-foreground)',
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
          
          {/* User Avatar with Dropdown OR Sign In options */}
          {user ? (
            <UserAvatarDropdown user={user} />
          ) : (
            <SignInOptions
              busy={authLoading || authBusy}
              layout="row"
              emphasizeGoogle
              onGoogle={async () => {
                setAuthBusy(true);
                try {
                  await signInWithGoogle();
                } catch (error) {
                  console.error('Error signing in:', error);
                } finally {
                  setAuthBusy(false);
                }
              }}
              onMicrosoft={async () => {
                setAuthBusy(true);
                try {
                  await signInWithMicrosoft();
                } catch (error) {
                  console.error('Error signing in with Microsoft:', error);
                  const msg = error instanceof Error ? error.message : String(error);
                  alert(msg || 'Microsoft sign-in failed');
                } finally {
                  setAuthBusy(false);
                }
              }}
            />
          )}
        </div>
        </div>
        {/* Close max-width container */}
      </header>
      
      {/* Mobile overlay drawer — desktop uses persistent push rail via DesktopNav */}
      {isMenuOpen && !usePersistentDesktopNav && (
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
              borderRight: '1px solid var(--dashboard-chrome-border)',
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
              borderBottom: '1px solid var(--dashboard-chrome-border)',
            }}>
              <span style={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: '600' }}>Navigation</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--dashboard-muted-foreground)',
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
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
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
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
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
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Import CSV
              </Link>

              <Link
                href="/import"
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
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Import
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
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Settings
              </Link>
              
              {/* Tools (collapsible, default closed) */}
              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Tools
                  <span style={{ fontSize: '12px', color: 'var(--dashboard-muted-foreground)' }}>{toolsMenuOpen ? '▾' : '▸'}</span>
                </button>
                {toolsMenuOpen && (
                  <div style={{ paddingLeft: '12px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Link href="/live" onClick={() => setIsMenuOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', color: 'hsl(var(--foreground))', textDecoration: 'none', fontSize: '13px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dashboard-surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>Live Market Data</Link>
                    <Link href="/tools" onClick={() => setIsMenuOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', color: 'hsl(var(--foreground))', textDecoration: 'none', fontSize: '13px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dashboard-surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>Tax Converters</Link>
                    <Link href="/s/directory" onClick={() => setIsMenuOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', color: 'hsl(var(--foreground))', textDecoration: 'none', fontSize: '13px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dashboard-surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>JSON API Directory</Link>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowSupportModal(true);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Support
              </button>

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
                  e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Pricing
              </Link>
              
              {/* Admin Links - Only show if user is admin */}
              {isAdmin && (
                <>
                  <div style={{
                    height: '1px',
                    background: 'var(--dashboard-chrome-border)',
                    margin: '16px 0',
                  }} />
                  
                  {isBrewinPilotEmail(user?.email) && (
                  <Link 
                    href="/demo/brewin"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Brewin replica
                  </Link>
                  )}

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
                      e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Analytics
                  </Link>

                  <Link
                    href="/admin/telemetry"
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
                      e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Growth HUD
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
                      e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Sales
                  </Link>
                  
                  <Link 
                    href="/admin/support"
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
                      e.currentTarget.style.background = 'var(--dashboard-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    View support
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <SupportFormModal
        open={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        user={user ? { email: user.email, displayName: user.displayName } : null}
      />
    </>
  );
}

