'use client';

import { useEffect } from 'react';

/**
 * Local-only presence logger. Never logs secret values or key material (CodeQL clear-text).
 */
const ENV_DEBUG_ENABLED =
  process.env.NEXT_PUBLIC_ENV_DEBUG === '1' &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function envPresence(label: string, value: string | undefined): void {
  // Presence boolean only — no lengths, prefixes, or raw values.
  console.info(`[env-debug] ${label}=${value ? 'set' : 'missing'}`);
}

export default function EnvDebug() {
  useEffect(() => {
    if (!ENV_DEBUG_ENABLED) return;

    console.info('[env-debug] public env presence (values redacted)');
    envPresence('NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    envPresence('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    envPresence('NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    envPresence('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    envPresence('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
    envPresence('NEXT_PUBLIC_FIREBASE_APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
    envPresence('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);
    envPresence('NEXT_PUBLIC_GA_MEASUREMENT_ID', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }, []);

  return null;
}
