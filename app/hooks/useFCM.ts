'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from '../lib/firebase';
import { registerFirebaseMessagingSW } from '../lib/pwa/registerServiceWorker';

interface UseFCMReturn {
  fcmToken: string | null;
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  error: Error | null;
}

export function useFCM(): UseFCMReturn {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const fcmTokenRef = useRef<string | null>(null);
  const [isSupportedState, setIsSupportedState] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<Error | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    fcmTokenRef.current = fcmToken;
  }, [fcmToken]);

  // Check browser support and register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkSupport = async () => {
      try {
        // Register Firebase messaging service worker first
        await registerFirebaseMessagingSW();
        
        const supported = await isSupported();
        setIsSupportedState(supported);
        
        if (supported && 'Notification' in window) {
          setPermission(Notification.permission);
        }
      } catch (err) {
        console.error('FCM support check failed:', err);
        setIsSupportedState(false);
      }
    };
    
    checkSupport();
  }, []);

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        throw new Error('Notifications are not supported in this browser');
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Check if service worker is registered
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported');
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Get FCM token
      if (!app) {
        throw new Error('Firebase app not initialized');
      }

      const messaging = getMessaging(app);
      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
      
      if (!vapidKey) {
        throw new Error('FCM VAPID key not configured');
      }

      const token = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration
      });

      if (token) {
        setFcmToken(token);
        fcmTokenRef.current = token;
        setError(null);
        
        // Send token to backend to save
        try {
          const response = await fetch('/api/notifications/register', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fcmToken: token })
          });

          if (!response.ok) {
            console.error('Failed to register FCM token:', response.statusText);
          }
        } catch (err) {
          console.error('Error registering FCM token:', err);
          // Don't throw - token is still valid
        }

        return true;
      } else {
        throw new Error('No FCM token available');
      }
    } catch (err: any) {
      console.error('FCM permission error:', err);
      setError(err);
      return false;
    }
  }, []);

  // Initialize FCM and listen for foreground messages
  useEffect(() => {
    if (typeof window === 'undefined' || !app) return;
    if (!isSupportedState) return;

    const initializeFCM = async () => {
      try {
        const messaging = getMessaging(app);
        
        // Handle foreground messages (when app is open)
        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          
          // Show notification even when app is open
          if (Notification.permission === 'granted') {
            const notificationTitle = payload.notification?.title || 'Pocket Portfolio';
            const notificationOptions: NotificationOptions = {
              body: payload.notification?.body,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: payload.data?.tag || 'default',
              data: payload.data || {}
            };

            new Notification(notificationTitle, notificationOptions);
          }
        });

        // If permission already granted, get token automatically
        if (Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
          
          if (vapidKey) {
            try {
              const token = await getToken(messaging, {
                vapidKey: vapidKey,
                serviceWorkerRegistration: registration
              });
              
              if (token) {
                setFcmToken(token);
                fcmTokenRef.current = token;
              }
            } catch (err) {
              console.error('Error getting FCM token:', err);
            }
          }
        }
      } catch (err) {
        console.error('FCM initialization error:', err);
        setError(err as Error);
      }
    };

    initializeFCM();
  }, [isSupportedState]);

  // Disable notifications and clear token
  const disableNotifications = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get current token from ref before clearing
      const tokenToDelete = fcmTokenRef.current;
      
      // Clear the token from state immediately
      setFcmToken(null);
      fcmTokenRef.current = null;
      
      // Delete token from backend if it exists
      if (tokenToDelete) {
        try {
          await fetch('/api/notifications/register', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fcmToken: tokenToDelete })
          });
        } catch (err) {
          console.error('Error unregistering FCM token:', err);
          // Continue even if API call fails
        }
      }
      
      // Note: We don't revoke Notification.permission as that's browser-controlled
      // The user would need to manually change it in browser settings
    } catch (err) {
      console.error('Error disabling notifications:', err);
    }
  }, []);

  return {
    fcmToken,
    isSupported: isSupportedState,
    permission,
    requestPermission,
    disableNotifications,
    error
  };
}

