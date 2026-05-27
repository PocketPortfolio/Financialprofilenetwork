import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { SovereignIntelligenceBookShell } from './SovereignIntelligenceBookShell';
import type { Metadata } from 'next';
import '../universal-llm-import/book.css';

const BOOK_PATH = path.join(process.cwd(), 'docs', 'book', 'SOVEREIGN-INTELLIGENCE-BOOK.md');

const baseUrl = 'https://www.pocketportfolio.app';
const bookUrl = `${baseUrl}/book/sovereign-intelligence`;
const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent('Sovereign Intelligence')}&description=${encodeURIComponent('Building Local-First RAG for Finance')}&v=7`;

export const metadata: Metadata = {
  title: 'Sovereign Intelligence: Building Local-First RAG for Finance | Pocket Portfolio',
  description:
    'Architecture of a local-first financial AI: Pocket Analyst, sanitized context, hybrid RAG, and data sovereignty.',
  robots: 'index,follow,max-image-preview:large',
  alternates: { canonical: bookUrl },
  openGraph: {
    title: 'Sovereign Intelligence — Pocket Portfolio Technical Press',
    description: 'Building local-first RAG for finance: privacy-first AI, context engine, and grounding.',
    type: 'article',
    url: bookUrl,
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Sovereign Intelligence: Building Local-First RAG for Finance',
        type: 'image/png',
      },
    ],
    siteName: 'Pocket Portfolio',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sovereign Intelligence — Pocket Portfolio Technical Press',
    description: 'Building local-first RAG for finance: privacy-first AI, context engine, and grounding.',
    images: [ogImageUrl],
  },
};

function getBookContent(): string {
  try {
    const raw = fs.readFileSync(BOOK_PATH, 'utf-8');
    const { content } = matter(raw);
    return content.trim();
  } catch {
    return '';
  }
}

const sovereignIntelligenceArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article' as const,
  headline: 'Sovereign Intelligence: Building Local-First RAG for Finance',
  description: 'Architecture of a local-first financial AI: Pocket Analyst, sanitized context, hybrid RAG, and data sovereignty.',
  url: bookUrl,
  image: ogImageUrl,
  datePublished: '2025-01-01',
  dateModified: '2025-01-01',
  author: { '@type': 'Organization' as const, name: 'Pocket Portfolio' },
  publisher: {
    '@type': 'Organization' as const,
    name: 'Pocket Portfolio',
    logo: { '@type': 'ImageObject' as const, url: `${baseUrl}/brand/pp-monogram-amber.png` },
  },
  mainEntityOfPage: { '@type': 'WebPage' as const, '@id': bookUrl },
};

export default function SovereignIntelligenceBookPage() {
  const content = getBookContent();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sovereignIntelligenceArticleSchema) }}
      />
      <SovereignIntelligenceBookShell content={content} />
    </>
  );
}
