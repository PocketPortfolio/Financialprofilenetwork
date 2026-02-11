'use client';

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { BookMarkdown } from './BookMarkdown';
import { DownloadPdfButton } from './DownloadPdfButton';

const neutralFallback = (
  <div className="book-page min-h-screen" style={{ background: 'var(--bg)' }}>
    <header
      className="book-hero relative overflow-hidden px-6 py-16"
      style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 50%, var(--surface) 100%)',
        color: 'var(--text)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="relative max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Universal LLM Import</h1>
      </div>
    </header>
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div
        className="p-6 rounded-lg border"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface-elevated)',
          color: 'var(--text)',
        }}
      >
        <p className="font-medium mb-2">Content could not be rendered.</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try refreshing the page.</p>
      </div>
    </main>
  </div>
);

export function BookPageShell({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="book-page min-h-screen" style={{ background: 'var(--bg)' }}>
        <header
          className="book-hero relative overflow-hidden px-6 py-16"
          style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 50%, var(--surface) 100%)',
            color: 'var(--text)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="relative max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Universal LLM Import</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div
            className="min-h-[200px] flex items-center justify-center rounded-lg border"
            style={{
              background: 'var(--surface-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Loading book…
          </div>
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary scope="book-page" fallback={neutralFallback}>
      <div className="book-page min-h-screen" style={{ background: 'var(--bg)' }}>
        <header
          className="book-hero relative overflow-hidden px-6 py-16 print:py-12"
          style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 50%, var(--surface) 100%)',
            color: 'var(--text)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
              Pocket Portfolio Technical Press
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Universal LLM Import</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Building Local-First, Sovereign CSV Ingestion</p>
            <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Schema inference, confidence thresholds, and sovereign data in financial CSV import
            </p>
          </div>
        </header>
        <DownloadPdfButton />
        <main className="book-body max-w-3xl mx-auto px-6 py-12 print:py-8">
          <article className="prose prose-slate dark:prose-invert prose-headings:font-sans max-w-none book-article">
            <BookMarkdown content={content} />
          </article>
        </main>
      </div>
    </ErrorBoundary>
  );
}
