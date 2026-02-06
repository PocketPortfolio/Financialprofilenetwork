'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';
import { auth } from '../lib/firebase';
import { AccountService } from '../services/accountService';
import { useTrades } from '../hooks/useTrades';
import { clearLocalPortfolio, exportLocalPortfolio } from '../lib/store/localPortfolioStore';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import AlertModal from '../components/modals/AlertModal';
import DriveSyncSettings from '../components/DriveSyncSettings';
import { NotificationSettings } from '../components/NotificationSettings';
import SeatManager, { type SeatAllocation } from '../components/SeatManager';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { usePremiumTheme } from '../hooks/usePremiumTheme';

export default function SettingsPage() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  const { syncState } = useGoogleDrive();
  const { tier, unlockedTheme, hasFounderTheme, hasCorporateTheme } = usePremiumTheme();

  // Map tier to data-tier attribute for CSS targeting
  const getTierForDataAttribute = (tier: string | null): 'free' | 'founder' | 'corporate' => {
    if (tier === 'foundersClub') return 'founder';
    if (tier === 'corporateSponsor') return 'corporate';
    return 'free';
  };
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [corporateLicense, setCorporateLicense] = useState<string | null>(null);
  const [tierFromApi, setTier] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [seatAllocations, setSeatAllocations] = useState<SeatAllocation[]>([]);
  const [seatMaxSeats, setSeatMaxSeats] = useState(0);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinalConfirm, setShowDeleteFinalConfirm] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  // Premium theme preference state
  const [isPremiumThemeEnabled, setIsPremiumThemeEnabled] = useState<boolean>(true);
  
  const { deleteAllTrades } = useTrades();

  useEffect(() => {
    if (isAuthenticated && user && auth) {
      // Check cache first to avoid unnecessary API calls
      const cacheKey = `apiKeys_${user.email}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      // Use cached data if it's less than 5 minutes old
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);
        if (age < 5 * 60 * 1000) { // 5 minutes
          try {
            const data = JSON.parse(cachedData);
            setApiKey(data.apiKey);
            setCorporateLicense(data.corporateLicense);
            setTier(data.tier);
            setLoadingKeys(false);
            return; // Don't fetch if we have fresh cache
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }
      
      fetchApiKeys();
    }
  }, [isAuthenticated, user]);

  // Load premium theme preference on mount
  useEffect(() => {
    if (hasFounderTheme || hasCorporateTheme) {
      const saved = localStorage.getItem('pocket-portfolio-use-premium-theme');
      setIsPremiumThemeEnabled(saved === null || saved === 'true');
    }
  }, [hasFounderTheme, hasCorporateTheme]);

  const fetchSeats = async () => {
    if (!auth || !user) return;
    const tier = tierFromApi ?? null;
    if (tier !== 'corporateSponsor' && tier !== 'foundersClub') return;
    setLoadingSeats(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/seats', { headers: { Authorization: `Bearer ${idToken}` } });
      if (res.ok) {
        const data = await res.json();
        setSeatAllocations(data.allocations ?? []);
        setSeatMaxSeats(data.maxSeats ?? 0);
      }
    } catch (e) {
      console.error('Failed to fetch seats:', e);
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && (tierFromApi === 'corporateSponsor' || tierFromApi === 'foundersClub')) {
      fetchSeats();
    }
  }, [isAuthenticated, user, tierFromApi]);

  const handleSeatInvite = async (email: string) => {
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch('/api/seats/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to invite');
    }
    await fetchSeats();
  };

  const handleSeatRevoke = async (email: string) => {
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch('/api/seats/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to revoke');
    await fetchSeats();
  };

  const fetchApiKeys = async () => {
    if (!auth || !user) return;
    
    setLoadingKeys(true);
    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/api-keys/user', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
        setCorporateLicense(data.corporateLicense);
        setTier(data.tier);
        
        const cacheKey = `apiKeys_${user.email}`;
        if (data.tier) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        } else {
          // Revoked or no tier - clear caches so UI updates seamlessly
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
          localStorage.removeItem('CORPORATE_KEY');
          localStorage.removeItem('pocket-portfolio-tier');
          localStorage.removeItem('pocket-portfolio-premium-theme');
          localStorage.removeItem('pocket-portfolio-tier-timestamp');
        }
      } else if (response.status === 503 || response.status === 500) {
        // If quota exceeded or service unavailable, try to use cached data as fallback
        const cacheKey = `apiKeys_${user.email}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const data = JSON.parse(cachedData);
            setApiKey(data.apiKey);
            setCorporateLicense(data.corporateLicense);
            setTier(data.tier);
            console.warn('Using cached API keys due to service limit');
          } catch (e) {
            // Invalid cache
          }
        }
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      // Try cached data on error
      const cacheKey = `apiKeys_${user.email}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData);
          setApiKey(data.apiKey);
          setCorporateLicense(data.corporateLicense);
          setTier(data.tier);
        } catch (e) {
          // Invalid cache
        }
      }
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      if (isAuthenticated && user) {
        // Export authenticated user data
        const userData = await AccountService.exportUserData(user.uid);
        AccountService.downloadUserData(userData);
        setAlertModal({
          isOpen: true,
          title: 'Export Successful',
          message: 'Portfolio data exported successfully!',
          type: 'success'
        });
      } else {
        // Export local data
        const { data, filename } = exportLocalPortfolio();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show conversion hint if not connected to Drive and not Founder's Club
        const showConversionHint = !syncState.isConnected && tier !== 'foundersClub';
        
        setAlertModal({
          isOpen: true,
          title: 'Export Successful',
          message: showConversionHint 
            ? 'Portfolio data exported successfully! Tired of manual backups? Enable Auto-Sync to Drive in Settings.'
            : 'Portfolio data exported successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setAlertModal({
        isOpen: true,
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetPortfolio = () => {
    setShowResetConfirm(true);
  };

  const confirmResetPortfolio = async () => {
    setShowResetConfirm(false);
    setIsResetting(true);
    try {
      if (isAuthenticated && user) {
        await deleteAllTrades();
        setAlertModal({
          isOpen: true,
          title: 'Portfolio Reset',
          message: 'Portfolio reset successfully!',
          type: 'success'
        });
        // Refresh the page to reflect changes after modal closes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        clearLocalPortfolio();
        setAlertModal({
          isOpen: true,
          title: 'Portfolio Reset',
          message: 'Portfolio reset successfully!',
          type: 'success'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error resetting portfolio:', error);
      setAlertModal({
        isOpen: true,
        title: 'Reset Failed',
        message: 'Failed to reset portfolio. Please try again.',
        type: 'error'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAllData = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAllData = () => {
    setShowDeleteConfirm(false);
    setShowDeleteFinalConfirm(true);
  };

  const finalConfirmDeleteAllData = async () => {
    setShowDeleteFinalConfirm(false);
    setIsDeleting(true);
    try {
      if (isAuthenticated && user) {
        await AccountService.deleteUserData(user.uid);
        setAlertModal({
          isOpen: true,
          title: 'Data Deleted',
          message: 'All data deleted successfully. You will be signed out.',
          type: 'success'
        });
        setTimeout(async () => {
          await logout();
          window.location.href = '/';
        }, 1500);
      } else {
        clearLocalPortfolio();
        setAlertModal({
          isOpen: true,
          title: 'Data Deleted',
          message: 'All local data deleted successfully.',
          type: 'success'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      setAlertModal({
        isOpen: true,
        title: 'Delete Failed',
        message: 'Failed to delete data. Please try again.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePremiumThemeToggle = (enabled: boolean) => {
    setIsPremiumThemeEnabled(enabled);
    localStorage.setItem('pocket-portfolio-use-premium-theme', enabled.toString());
    
    // Dispatch custom event to update PremiumThemeProvider
    window.dispatchEvent(new Event('premium-theme-preference-changed'));
    
    // Force immediate update
    if (unlockedTheme) {
      if (enabled) {
        document.body.classList.remove('theme-founder', 'theme-corporate');
        document.body.classList.add(`theme-${unlockedTheme}`);
      } else {
        document.body.classList.remove('theme-founder', 'theme-corporate');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div 
        data-tier={getTierForDataAttribute(tier)}
        className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <SEOHead 
          title="Settings - Pocket Portfolio"
          description="Manage your account settings and preferences"
        />
        <SovereignHeader 
          syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'} 
          lastSyncTime={syncState.lastSyncTime}
          user={user}
        />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          paddingTop: 'calc(64px + 48px + 4px)' // Header (64px) + Banner (~48px) + gap (4px)
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to access settings</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Manage your account settings and preferences
            </p>
            <button
              onClick={signInWithGoogle}
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-tier={getTierForDataAttribute(tier)}
      className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <SEOHead 
        title="Settings - Pocket Portfolio"
        description="Manage your account settings and preferences"
      />
      <SovereignHeader 
        syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'} 
        lastSyncTime={syncState.lastSyncTime}
        user={user}
      />
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        paddingTop: 'calc(64px + 48px + 4px)', // Header (64px) + Banner (~48px) + gap (4px)
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>⚙️</span>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '0 0 4px 0',
                color: 'var(--text)'
              }}>
                Settings
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                fontSize: '16px',
                margin: 0
              }}>
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Account</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                {user?.email || 'User'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Signed in with Google
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Sign out from Google
          </button>
        </div>

        {/* Drive Sync Section */}
        <DriveSyncSettings />

        {/* Sovereign Team Access - Corporate & Founders Club only */}
        {(tierFromApi === 'corporateSponsor' || tierFromApi === 'foundersClub') && (
          <SeatManager
            tier={tierFromApi}
            usedSeats={seatAllocations.length}
            maxSeats={seatMaxSeats}
            allocations={seatAllocations}
            onInvite={handleSeatInvite}
            onRevoke={handleSeatRevoke}
            loading={loadingSeats}
          />
        )}

        {/* Push Notifications Section */}
        <NotificationSettings />

        {/* Premium Theme Section - Only show for sponsors */}
        {(hasFounderTheme || hasCorporateTheme) && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Theme Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                background: 'var(--bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                    {unlockedTheme === 'founder' ? "Founder's Club Theme" : 'Corporate Ecosystem Theme'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {unlockedTheme === 'founder' 
                      ? "Use your exclusive Founder's Club theme with royal gold accents"
                      : "Use your exclusive Corporate Ecosystem theme with terminal green accents"}
                  </div>
                </div>
                <label style={{ 
                  position: 'relative', 
                  display: 'inline-block', 
                  width: '56px', 
                  height: '32px',
                  marginLeft: '16px'
                }}>
                  <input 
                    type="checkbox" 
                    checked={isPremiumThemeEnabled}
                    onChange={(e) => handlePremiumThemeToggle(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isPremiumThemeEnabled ? 'var(--accent-warm)' : 'var(--muted)',
                    borderRadius: '32px',
                    transition: 'background 0.3s ease'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '24px',
                      width: '24px',
                      left: isPremiumThemeEnabled ? '28px' : '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--muted)', 
                padding: '12px',
                background: 'var(--bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                  💡 Tip:
                </strong>
                When enabled, your exclusive sponsor theme will be applied. When disabled, you can use the original Pocket Portfolio themes (Light, Dark, System, Contrast) via the theme switcher in the navigation.
              </div>
            </div>
          </div>
        )}

        {/* API Keys Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>API Keys</h2>
          {loadingKeys ? (
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading...</div>
          ) : apiKey || corporateLicense ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {apiKey && (
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>
                    Personal API Key {tier && `(${tier})`}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <code style={{
                      flex: 1,
                      padding: '12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      color: 'var(--text)',
                      wordBreak: 'break-all'
                    }}>
                      {apiKey}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setAlertModal({
                          isOpen: true,
                          title: 'Copied!',
                          message: 'API key copied to clipboard!',
                          type: 'success'
                        });
                      }}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--accent-warm)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                    💡 Use this key for unlimited API calls across all endpoints (stock prices, market data, historical data, etc.)
                  </div>
                </div>
              )}
              {corporateLicense && (
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>
                    Corporate License Key
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <code style={{
                      flex: 1,
                      padding: '12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      color: 'var(--text)',
                      wordBreak: 'break-all'
                    }}>
                      {corporateLicense}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(corporateLicense);
                        localStorage.setItem('CORPORATE_KEY', corporateLicense);
                        setAlertModal({
                          isOpen: true,
                          title: 'Saved!',
                          message: 'Corporate license key copied and saved!',
                          type: 'success'
                        });
                      }}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--accent-warm)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Copy & Save
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                    💡 Use this key to unlock PDF downloads in the Advisor tool
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              No API keys found. <a href="/sponsor" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>Become a Patron</a> to get your API key.
              <br />
              <Link href="/retrieve-api-key" style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontSize: '12px' }}>
                Or retrieve your key if you've already purchased →
              </Link>
            </div>
          )}
        </div>

        {/* Power User Card - For developers needing higher rate limits */}
        {(!apiKey || tierFromApi !== 'foundersClub') && (
          <div
            style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
              border: '2px solid var(--border-warm)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '12px',
              }}
            >
              Need higher rate limits?
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
            >
              Free tier is capped. Join the <strong>Founder's Club</strong> for expanded API limits and direct programmatic access via Google Drive.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/sponsor?utm_source=settings_api&utm_medium=power_user_card&utm_campaign=founders_club"
                style={{
                  padding: '12px 24px',
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--primary) / 0.8)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--primary))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Join Founders Club - £100
              </Link>
              <Link
                href="/sponsor"
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  border: '1px solid var(--border-warm)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--warm-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                View All Plans →
              </Link>
            </div>
          </div>
        )}

        {/* Preferences Section - Hidden until implementation is complete */}
        {false && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Preferences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600' }}>Default Currency</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>USD</div>
              </div>
              <select style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600' }}>Auto-refresh Data</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Update prices every 30 seconds</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'var(--accent-warm)',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}></span>
              </label>
            </div>
          </div>
        </div>
        )}

        {/* Data Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Data Management</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleExportData}
              disabled={isExporting}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--text)',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                opacity: isExporting ? 0.6 : 1
              }}
            >
              {isExporting ? '⏳ Exporting...' : '📥 Export Portfolio Data'}
            </button>
            <button 
              onClick={handleResetPortfolio}
              disabled={isResetting}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--text)',
                cursor: isResetting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                opacity: isResetting ? 0.6 : 1
              }}
            >
              {isResetting ? '⏳ Resetting...' : '🔄 Reset Portfolio'}
            </button>
            <button 
              onClick={handleDeleteAllData}
              disabled={isDeleting}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--danger)',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                opacity: isDeleting ? 0.6 : 1
              }}
            >
              {isDeleting ? '⏳ Deleting...' : '🗑️ Delete All Data'}
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset Portfolio"
        message="Are you sure you want to reset your portfolio? This will delete all your trades but keep your account. This action cannot be undone."
        confirmText="Reset Portfolio"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmResetPortfolio}
        onCancel={() => setShowResetConfirm(false)}
        isLoading={isResetting}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="⚠️ WARNING"
        message="This will permanently delete ALL your data including trades, portfolios, and account information. This action CANNOT be undone. Are you absolutely sure?"
        confirmText="Yes, Delete Everything"
        cancelText="Cancel"
        type="delete"
        onConfirm={confirmDeleteAllData}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />

      <ConfirmationModal
        isOpen={showDeleteFinalConfirm}
        title="Final Confirmation"
        message="This is your last chance. Click OK to permanently delete everything."
        confirmText="Delete Everything"
        cancelText="Cancel"
        type="delete"
        onConfirm={finalConfirmDeleteAllData}
        onCancel={() => setShowDeleteFinalConfirm(false)}
        isLoading={isDeleting}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
}
