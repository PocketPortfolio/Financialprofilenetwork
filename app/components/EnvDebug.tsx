'use client';

import { useEffect } from 'react';

const ENV_DEBUG_ENABLED =
  process.env.NEXT_PUBLIC_ENV_DEBUG === '1' &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function envPresence(label: string, value: string | undefined): void {
  console.log(`${label}:`, value ? '[set]' : '[missing]');
}

export default function EnvDebug() {
  useEffect(() => {
    if (!ENV_DEBUG_ENABLED) return;

    console.log('Environment variables (presence only — values redacted):');
    envPresence('NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    envPresence('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    envPresence('NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    envPresence('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    envPresence('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
    envPresence('NEXT_PUBLIC_FIREBASE_APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
    envPresence('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);
    envPresence('NEXT_PUBLIC_GA_MEASUREMENT_ID', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      console.log('API Key length:', apiKey.length);
      console.log('API Key includes newlines:', apiKey.includes('\n') || apiKey.includes('\r'));
    }
  }, []);

  return null;
}
