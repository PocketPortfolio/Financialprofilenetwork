/**
 * Register Firebase Messaging Service Worker
 * This must be called before initializing FCM
 */

export async function registerFirebaseMessagingSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Register the Firebase messaging service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Send Firebase config to service worker via postMessage
    // This avoids build-time injection issues
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
    };

    const sendConfig = (target: ServiceWorker | null) => {
      if (target) {
        try {
          target.postMessage({
            type: 'FIREBASE_CONFIG',
            config: firebaseConfig
          });
          console.log('✅ Firebase config sent to service worker');
        } catch (error) {
          console.error('❌ Failed to send config to service worker:', error);
        }
      }
    };

    // Send config with retry mechanism
    const attemptSendConfig = () => {
      // Try to send to active worker first
      if (registration.active) {
        sendConfig(registration.active);
      } else if (registration.installing) {
        sendConfig(registration.installing);
        // Also set up listener for when it becomes active
        registration.installing.addEventListener('statechange', () => {
          if (registration.installing?.state === 'activated') {
            sendConfig(registration.active);
          }
        });
      } else if (registration.waiting) {
        sendConfig(registration.waiting);
      }
    };

    // Send config immediately
    attemptSendConfig();

    // Retry after a short delay to ensure worker is ready
    setTimeout(() => {
      attemptSendConfig();
    }, 500);

    // Also listen for controller change (when new worker activates)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setTimeout(() => {
        attemptSendConfig();
      }, 100);
    });

    console.log('✅ Firebase Messaging Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ Failed to register Firebase Messaging Service Worker:', error);
    return null;
  }
}
