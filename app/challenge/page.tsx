import type { Metadata } from 'next';
import { ArchitectureChallengeMatrix } from './ArchitectureChallengeMatrix';

const baseUrl = 'https://www.pocketportfolio.app';
const canonical = `${baseUrl}/challenge`;

export const metadata: Metadata = {
  title: 'Zero-Trust Architecture Challenge | Pocket Portfolio',
  description:
    'Interactive challenge for CTOs and lead engineers: truncated payloads, fixed-schema aggregates, and stateless inference—sovereign GenAI without centralizing sensitive data.',
  robots: { index: true, follow: true },
  alternates: { canonical },
  openGraph: {
    title: 'Zero-Trust Architecture Challenge',
    description: 'Test your pipeline’s blast radius: edge aggregation, stateless grounding, structural guarantees.',
    type: 'website',
    url: canonical,
    siteName: 'Pocket Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero-Trust Architecture Challenge',
    description: 'Move the AI to the data—not the data to the AI.',
  },
};

export default function ArchitectureChallengePage() {
  return <ArchitectureChallengeMatrix />;
}
