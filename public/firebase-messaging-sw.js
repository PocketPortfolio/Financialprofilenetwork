/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles push notifications in the background
 * Config is injected at runtime via postMessage from the main app
 */

// Import Firebase scripts (using CDN for service worker compatibility)
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Firebase configuration - will be injected at runtime via postMessage
let firebaseApp = null;
let messaging = null;
let isInitialized = false;

// Listen for Firebase config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const firebaseConfig = event.data.config;
    
    // Validate config has required fields
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('[firebase-messaging-sw.js] Invalid Firebase config received');
      return;
    }
    
    // Initialize Firebase with the received config
    try {
      if (!isInitialized) {
        // Check if Firebase is already initialized (might happen on reload)
        try {
          firebaseApp = firebase.app();
          // If we get here, Firebase is already initialized, just get messaging
          messaging = firebase.messaging();
        } catch (e) {
          // Firebase not initialized yet, initialize it
          firebaseApp = firebase.initializeApp(firebaseConfig);
          messaging = firebase.messaging();
        }
        
        isInitialized = true;
        console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
        
        // Set up message handlers after initialization
        setupMessageHandlers();
      } else {
        console.log('[firebase-messaging-sw.js] Firebase already initialized, skipping');
      }
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Firebase initialization error:', error);
    }
  }
});

// Also listen on install to catch early config messages
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating');
  event.waitUntil(self.clients.claim()); // Take control of all pages immediately
});

function setupMessageHandlers() {
  if (!messaging) return;

  // Handle background messages (when app is closed or in background)
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Pocket Portfolio';
    const notificationOptions = {
      body: payload.notification?.body || 'New update',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.data?.tag || 'default',
      requireInteraction: false,
      data: payload.data || {},
      color: '#020617',
      silent: false
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  const fullUrl = self.location.origin + urlToOpen;
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification);
});
