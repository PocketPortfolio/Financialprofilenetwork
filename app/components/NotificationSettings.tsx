'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useFCM } from '../hooks/useFCM';
import { useAuth } from '../hooks/useAuth';

export function NotificationSettings() {
  const { fcmToken, isSupported, permission, requestPermission, error } = useFCM();
  const { isAuthenticated } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
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
    if (!fcmToken) return;

    try {
      const response = await fetch('/api/notifications/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notifications disabled successfully' });
        // Reload to clear token
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: 'Failed to disable notifications' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error disabling notifications' });
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
      <div className="dashboard-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <BellOff className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">Push Notifications</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser. Please use Chrome, Firefox, or Safari (iOS 16.4+).
        </p>
      </div>
    );
  }

  const isEnabled = permission === 'granted' && fcmToken !== null;

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <h3 className="text-lg font-bold text-foreground">Push Notifications</h3>
        </div>
        {isEnabled && (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20 rounded">
            Active
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Receive real-time alerts for price movements, portfolio updates, and breaking financial news.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : message.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-primary/10 border border-primary/20 text-primary'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : message.type === 'error' ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{error.message}</span>
        </div>
      )}

      <div className="space-y-4">
        {!isEnabled ? (
          <button
            onClick={handleEnableNotifications}
            disabled={isRequesting || !isAuthenticated}
            className="w-full px-4 py-3 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRequesting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Enable Push Notifications</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-muted/30 rounded border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">Notifications Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You will receive alerts for price movements, portfolio updates, and breaking news.
              </p>
            </div>
            <button
              onClick={handleDisableNotifications}
              className="w-full px-4 py-3 bg-muted text-foreground font-medium rounded hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
            >
              <BellOff className="w-4 h-4" />
              <span>Disable Notifications</span>
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground text-center">
            Sign in to enable push notifications
          </p>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
              <strong>Permission Denied:</strong> Notifications were blocked. To enable:
            </p>
            <ul className="text-xs text-amber-600 dark:text-amber-400 list-disc list-inside space-y-1">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Select "Allow" for notifications</li>
              <li>Refresh this page</li>
            </ul>
          </div>
        )}
      </div>

      {isEnabled && fcmToken && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono break-all">
            Token: {fcmToken.substring(0, 20)}...
          </p>
        </div>
      )}
    </div>
  );
}

