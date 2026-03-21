/**
 * Published Technical Press books — single source of truth for /book and SEO.
 * Add a new entry when you ship another book under app/book/<slug>/.
 */
export type PublishedBook = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
};

export const PUBLISHED_BOOKS: PublishedBook[] = [
  {
    slug: 'sovereign-intelligence',
    title: 'Sovereign Intelligence',
    subtitle: 'Building Local-First RAG for Finance',
    description:
      'Architecture of a local-first financial AI: Pocket Analyst, sanitized context, hybrid RAG, and data sovereignty.',
  },
  {
    slug: 'universal-llm-import',
    title: 'Universal LLM Import',
    subtitle: 'Building Local-First, Sovereign CSV Ingestion',
    description:
      'The definitive technical guide to schema inference, confidence thresholds, and sovereign data in financial CSV import.',
  },
];
