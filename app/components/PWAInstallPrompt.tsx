'use client';

import { useState, useEffect } from 'react';
import { X, Share2, Download, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt if not dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if iOS and not installed
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        // Delay showing iOS prompt slightly
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - just close, user needs to use Share menu
      setShowPrompt(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'hsl(var(--card))',
      borderTop: '2px solid hsl(var(--primary))',
      padding: '20px',
      zIndex: 9999,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      maxWidth: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <div style={{ 
          flex: 1,
          minWidth: 0 // Prevent flex item overflow
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Bell style={{ width: '18px', height: '18px', color: 'hsl(var(--primary))' }} />
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: 'hsl(var(--foreground))',
              margin: 0
            }}>
              Enable Real-Time Alerts
            </h3>
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '12px',
            lineHeight: '1.5',
            margin: 0
          }}>
            {isIOS ? (
              <>
                Install Pocket Portfolio to receive push notifications for price alerts and portfolio updates. 
                Tap <Share2 style={{ display: 'inline', width: '14px', height: '14px', verticalAlign: 'middle' }} /> then 
                "Add to Home Screen".
              </>
            ) : (
              'Install Pocket Portfolio to receive push notifications for price alerts and portfolio updates.'
            )}
          </p>
          {isIOS && (
            <div style={{
              background: 'hsl(var(--muted))',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              color: 'hsl(var(--muted-foreground))',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              marginTop: '8px'
            }}>
              <strong>Steps:</strong> Tap Share <Share2 style={{ display: 'inline', width: '12px', height: '12px', verticalAlign: 'middle' }} /> → Add to Home Screen
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              style={{
                padding: '8px 16px',
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--foreground))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

