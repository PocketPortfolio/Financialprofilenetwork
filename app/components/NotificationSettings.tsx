'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useFCM } from '../hooks/useFCM';
import { useAuth } from '../hooks/useAuth';

export function NotificationSettings() {
  const { fcmToken, isSupported, permission, requestPermission, disableNotifications, error } = useFCM();
  const { isAuthenticated } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleEnableNotifications = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please sign in to enable notifications' });
      return;
    }

    setIsRequesting(true);
    setMessage(null);

    try {
      const granted = await requestPermission();
      
      if (granted) {
        setMessage({ type: 'success', text: 'Notifications enabled successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Notification permission was denied. Please enable it in your browser settings.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to enable notifications' });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsDisabling(true);
    setMessage(null);

    try {
      await disableNotifications();
      setMessage({ type: 'success', text: 'Notifications disabled successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disable notifications' });
    } finally {
      setIsDisabling(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isSupported) {
    return (
      <section
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--text)',
          }}
        >
          Push Notifications
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Push notifications are not supported in this browser. Please use Chrome, Firefox, or Safari (iOS 16.4+).
        </p>
      </section>
    );
  }

  const isEnabled = permission === 'granted' && fcmToken !== null;

  return (
    <section
      style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isEnabled ? (
            <Bell style={{ width: '20px', height: '20px', color: 'var(--signal)' }} />
          ) : (
            <BellOff style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
          )}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--text)',
            }}
          >
            Push Notifications
          </h2>
        </div>
        {isEnabled && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '4px 12px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              fontWeight: '500',
            }}
          >
            Active
          </span>
        )}
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Receive real-time alerts for price movements, portfolio updates, and breaking financial news.
      </p>

      {message && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            ...(message.type === 'success'
              ? {
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                }
              : message.type === 'error'
              ? {
                  background: 'var(--danger-muted)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                }
              : {
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }),
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle style={{ width: '16px', height: '16px' }} />
          ) : message.type === 'error' ? (
            <XCircle style={{ width: '16px', height: '16px' }} />
          ) : (
            <AlertCircle style={{ width: '16px', height: '16px' }} />
          )}
          <span style={{ fontWeight: '500' }}>{message.text}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '12px',
            background: 'var(--danger-muted)',
            borderRadius: '8px',
            border: '1px solid var(--danger)',
            fontSize: '0.875rem',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <XCircle style={{ width: '16px', height: '16px' }} />
          <span style={{ fontWeight: '500' }}>{error.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isEnabled ? (
          <button
            onClick={handleEnableNotifications}
            disabled={isRequesting || !isAuthenticated}
            className="brand-button brand-button-primary"
            style={{
              padding: 'var(--space-3) var(--space-5)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-semibold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isRequesting || !isAuthenticated ? 0.6 : 1,
              cursor: isRequesting || !isAuthenticated ? 'not-allowed' : 'pointer',
            }}
          >
            {isRequesting ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <Bell style={{ width: '18px', height: '18px' }} />
                <span>Enable Push Notifications</span>
              </>
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '12px',
                background: 'var(--surface-elevated)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--signal)',
                  }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text)' }}>
                  Notifications Active
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                You will receive alerts for price movements, portfolio updates, and breaking news.
              </p>
            </div>
            <button
              onClick={handleDisableNotifications}
              disabled={isDisabling}
              className="brand-button brand-button-secondary"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isDisabling ? 0.6 : 1,
                cursor: isDisabling ? 'not-allowed' : 'pointer',
              }}
            >
              {isDisabling ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <span>Disabling...</span>
                </>
              ) : (
                <>
                  <BellOff style={{ width: '18px', height: '18px' }} />
                  <span>Disable Notifications</span>
                </>
              )}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
            Sign in to enable push notifications
          </p>
        )}

        {permission === 'denied' && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          >
            <p style={{ fontWeight: '600', color: 'var(--text-warm)', marginBottom: '8px', margin: 0 }}>
              Permission Denied
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Notifications were blocked. To enable: click the lock icon in your browser's address bar, select "Allow" for notifications, then refresh this page.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
