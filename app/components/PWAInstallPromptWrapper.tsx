'use client';

import dynamic from 'next/dynamic';

// Dynamically import PWAInstallPrompt to ensure it's only loaded client-side
// This prevents the useState error on the server
const PWAInstallPrompt = dynamic(
  () => import('./PWAInstallPrompt').then(mod => ({ default: mod.PWAInstallPrompt })),
  { ssr: false }
);

export default function PWAInstallPromptWrapper() {
  return <PWAInstallPrompt />;
}

