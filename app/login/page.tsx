import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Pocket Portfolio Login | Private Local-First Dashboard',
  description:
    'Sign in to Pocket Portfolio (Pocket Folio / PocketFolio). Open your private local-first dashboard — Google sign-in, on-device ledger, optional Drive sync.',
  keywords: [
    'pocket portfolio login',
    'pocket folio login',
    'pocketfolio login',
    'pocket portfolio sign in',
    'local-first portfolio login',
  ],
  alternates: {
    canonical: 'https://www.pocketportfolio.app/login',
  },
  openGraph: {
    title: 'Pocket Portfolio Login | Private Local-First Dashboard',
    description:
      'Sign in to Pocket Portfolio. Private local-first dashboard — your ledger stays on your device.',
    url: 'https://www.pocketportfolio.app/login',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
