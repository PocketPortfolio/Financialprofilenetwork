import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BookPageShell } from './BookPageShell';
import type { Metadata } from 'next';
import './book.css';

const BOOK_PATH = path.join(process.cwd(), 'docs', 'book', 'UNIVERSAL-LLM-IMPORT-BOOK.md');

const baseUrl = 'https://www.pocketportfolio.app';
const bookUrl = `${baseUrl}/book/universal-llm-import`;
const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent('Universal LLM Import')}&description=${encodeURIComponent('Building Local-First, Sovereign CSV Ingestion')}&v=5`;

export const metadata: Metadata = {
  title: 'Universal LLM Import: Building Local-First, Sovereign CSV Ingestion | Pocket Portfolio',
  description:
    'The definitive technical guide to schema inference, confidence thresholds, and sovereign data in financial CSV import.',
  robots: 'index,follow,max-image-preview:large',
  alternates: { canonical: bookUrl },
  openGraph: {
    title: 'Universal LLM Import — Pocket Portfolio Technical Press',
    description: 'Local-first, sovereign CSV ingestion with heuristic and optional LLM mapping.',
    type: 'article',
    url: bookUrl,
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Universal LLM Import: Building Local-First, Sovereign CSV Ingestion',
        type: 'image/png',
      },
    ],
    siteName: 'Pocket Portfolio',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universal LLM Import — Pocket Portfolio Technical Press',
    description: 'Local-first, sovereign CSV ingestion with heuristic and optional LLM mapping.',
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

const universalLLMImportArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article' as const,
  headline: 'Universal LLM Import: Building Local-First, Sovereign CSV Ingestion',
  description: 'The definitive technical guide to schema inference, confidence thresholds, and sovereign data in financial CSV import.',
  url: bookUrl,
  image: ogImageUrl,
  datePublished: '2025-01-01',
  dateModified: '2025-01-01',
  author: { '@type': 'Organization' as const, name: 'Pocket Portfolio' },
  publisher: {
    '@type': 'Organization' as const,
    name: 'Pocket Portfolio',
    logo: { '@type': 'ImageObject' as const, url: `${baseUrl}/brand/pp-wordmark.svg` },
  },
  mainEntityOfPage: { '@type': 'WebPage' as const, '@id': bookUrl },
};

export default function UniversalLLMImportBookPage() {
  const content = getBookContent();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(universalLLMImportArticleSchema) }}
      />
      <BookPageShell content={content} />
    </>
  );
}
