import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BookPageShell } from './BookPageShell';
import type { Metadata } from 'next';
import './book.css';

const BOOK_PATH = path.join(process.cwd(), 'docs', 'book', 'UNIVERSAL-LLM-IMPORT-BOOK.md');

const baseUrl = 'https://www.pocketportfolio.app';

export const metadata: Metadata = {
  title: 'Universal LLM Import: Building Local-First, Sovereign CSV Ingestion | Pocket Portfolio',
  description:
    'The definitive technical guide to schema inference, confidence thresholds, and sovereign data in financial CSV import.',
  alternates: { canonical: `${baseUrl}/book/universal-llm-import` },
  openGraph: {
    title: 'Universal LLM Import — Pocket Portfolio Technical Press',
    description: 'Local-first, sovereign CSV ingestion with heuristic and optional LLM mapping.',
    type: 'article',
    url: `${baseUrl}/book/universal-llm-import`,
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

export default function UniversalLLMImportBookPage() {
  const content = getBookContent();
  return <BookPageShell content={content} />;
}
