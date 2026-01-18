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

    console.log('✅ Firebase Messaging Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ Failed to register Firebase Messaging Service Worker:', error);
    return null;
  }
}

