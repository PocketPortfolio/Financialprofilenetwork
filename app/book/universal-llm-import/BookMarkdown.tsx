'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

const BOOK_ASSETS = '/book-assets';
const isDev = process.env.NODE_ENV !== 'production';

/** Rehype plugin: ensure every node has a defined children array so nothing in the pipeline reads .children of undefined. Mutates in place, no dependency on unist-util-visit. */
function rehypeEnsureChildren() {
  return (tree: unknown) => {
    try {
      if (tree == null || typeof tree !== 'object' || !('children' in tree)) return;
      const root = tree as { children?: unknown[] };
      if (root.children === undefined) root.children = [];
      if (!Array.isArray(root.children)) return;
      root.children = root.children.filter((c): c is NonNullable<typeof c> => c != null);
      function ensure(node: unknown): void {
        if (node == null || typeof node !== 'object') return;
        const n = node as { children?: unknown[] };
        if (n.children === undefined) n.children = [];
        if (!Array.isArray(n.children)) return;
        n.children = n.children.filter((c): c is NonNullable<typeof c> => c != null);
        for (const c of n.children) ensure(c);
      }
      for (const c of root.children) ensure(c);
    } catch {
      // must not throw
    }
  };
}

/** Browser debug (dev only): inspect from console via window.__bookImgDebug */
declare global {
  interface Window {
    __bookImgDebug?: {
      entries: Array<{ src: string; status: string; natural?: string; computed?: string; placeholder?: boolean; detail?: string }>;
      summary: () => void;
    };
  }
}

function bookAssetUrl(href: string): string {
  if (!href || href.startsWith('http') || href.startsWith('data:')) return href;
  const clean = href.replace(/^\//, '');
  // Cache-bust Figure 5 so alignment fixes load (bump version when figure changes)
  const q = clean.includes('figure-04') ? '?v=10' : clean.includes('figure-05') ? '?v=9' : '';
  return `${BOOK_ASSETS}/${clean}${q}`;
}

function logImgStatus(
  src: string,
  status: 'load' | 'error',
  detail?: string,
  el?: HTMLImageElement | null
) {
  if (!isDev) return;
  try {
    const fullUrl = typeof window !== 'undefined' ? window.location.origin + src : src;
    const data: Record<string, unknown> = { src, fullUrl, status, detail };
    if (el && status === 'load') {
      const cs = typeof getComputedStyle !== 'undefined' ? getComputedStyle(el) : null;
      data.naturalWidth = el.naturalWidth;
      data.naturalHeight = el.naturalHeight;
      data.computedDisplay = cs?.getPropertyValue('display');
      data.computedWidth = cs?.getPropertyValue('width');
      data.computedHeight = cs?.getPropertyValue('height');
      data.computedVisibility = cs?.getPropertyValue('visibility');
    }
    const name = src.replace(/.*\//, '');
    const natural = el && status === 'load' ? `${el.naturalWidth}×${el.naturalHeight}` : '—';
    const computed =
      el && status === 'load' && data.computedWidth != null
        ? `${String(data.computedWidth)}×${String(data.computedHeight)}`
        : '—';
    const placeholder =
      status === 'load' && el && el.naturalWidth === 1 && el.naturalHeight === 1 && /\.png$/i.test(src);
    const rect = el?.getBoundingClientRect?.();
    const rectStr = rect ? ` rect=${Math.round(rect.width)}×${Math.round(rect.height)} @${Math.round(rect.top)},${Math.round(rect.left)}` : '';
    const oneLine = `[Book] ${name} ${status} natural=${natural} computed=${computed}${rectStr}${placeholder ? ' → placeholder' : ''}`;
    console.log(oneLine, data);
    if (placeholder) {
      console.warn('[Book] Placeholder PNG (1×1). Replace: docs/book/assets/chapter-headers/ → npm run book:copy-assets', src);
    }
    if (typeof window !== 'undefined') {
      const rect = el?.getBoundingClientRect?.();
      fetch('/api/book-debug-img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          src: data.src,
          status,
          naturalW: el?.naturalWidth,
          naturalH: el?.naturalHeight,
          rectW: rect?.width,
          rectH: rect?.height,
          display: data.computedDisplay,
          visibility: data.computedVisibility,
          placeholder: !!placeholder,
        }),
      }).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      if (!window.__bookImgDebug) {
        window.__bookImgDebug = {
          entries: [],
          summary: () => {
            console.table(window.__bookImgDebug!.entries);
            console.log('Full entries:', window.__bookImgDebug!.entries);
          },
        };
      }
      window.__bookImgDebug.entries.push({
        src: name,
        status,
        natural: el && status === 'load' ? `${el.naturalWidth}×${el.naturalHeight}` : undefined,
        computed: data.computedWidth != null ? `${data.computedWidth}×${data.computedHeight}` : undefined,
        placeholder: !!placeholder,
        detail,
      });
    }
  } catch (_) {}
}

const CHAPTER_HEADER_PNG = /chapter-headers.*\.png$/i;

/** Renders img or a visible placeholder for 1×1 PNGs. Never shows the red 1×1 pixel: for chapter-header PNGs we show placeholder UI first and load in a hidden img; only show real img when non-1×1. */
function BookImage({ src, alt }: { src?: string | null; alt?: string | null }) {
  const href = typeof src === 'string' ? src : '';
  const final = href ? bookAssetUrl(href) : '';
  const altText = typeof alt === 'string' ? alt : '';
  const isChapterHeaderPng = CHAPTER_HEADER_PNG.test(final);
  const [showPlaceholder, setShowPlaceholder] = useState(() => isChapterHeaderPng);

  if (!final) return null;

  if (showPlaceholder) {
    return (
      <>
        <span
          className="book-img-placeholder block my-4 min-h-[6rem] rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/50 text-center px-4 py-5"
          style={{ display: 'block', color: '#475569', fontSize: '0.875rem', fontFamily: 'inherit' }}
        >
          <span style={{ fontWeight: 600, color: '#334155', fontFamily: 'inherit' }}>{altText || 'Chapter header'}</span>
          <br />
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'inherit' }}>
            Replace with artwork: docs/book/assets/chapter-headers/ → npm run book:copy-assets
          </span>
        </span>
        {isChapterHeaderPng && (
          /* Load in hidden img to detect real dimensions; never show 1×1 red pixel */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={final}
            alt=""
            aria-hidden
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            loading="eager"
            decoding="async"
            onLoad={(e) => {
              const el = e.currentTarget;
              logImgStatus(final, 'load', undefined, el);
              if (el.naturalWidth !== 1 || el.naturalHeight !== 1) {
                setShowPlaceholder(false);
              }
            }}
            onError={() => logImgStatus(final, 'error')}
          />
        )}
      </>
    );
  }

  const isSvg = /\.svg$/i.test(final);
  const wrapperStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'visible',
    ...(isSvg ? { minHeight: 120, background: '#f8fafc', borderRadius: '0.5rem' } : {}),
  };
  const imgStyle: React.CSSProperties = {
    display: 'block',
    visibility: 'visible',
    opacity: 1,
    maxWidth: '100%',
    width: '100%',
    height: 'auto',
    minWidth: 1,
    minHeight: isSvg ? 80 : 1,
    objectFit: 'contain',
  };
  return (
    <span
      className={`book-img-wrapper block my-4 ${isSvg ? 'book-img-figure' : ''}`}
      style={wrapperStyle}
      data-book-img="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={final}
        alt={altText}
        className="book-img mx-auto max-w-full h-auto rounded-lg block w-full"
        style={imgStyle}
        loading="eager"
        decoding="async"
        onLoad={(e) => {
          const el = e.currentTarget;
          logImgStatus(final, 'load', undefined, el);
          if (el.naturalWidth === 1 && el.naturalHeight === 1 && /\.png$/i.test(final)) {
            setShowPlaceholder(true);
          }
        }}
        onError={() => {
          logImgStatus(final, 'error');
          if (isDev && typeof window !== 'undefined') {
            fetch('/api/book-debug-img', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ src: final, status: 'error', ts: new Date().toISOString() }),
            }).catch(() => {});
          }
        }}
      />
    </span>
  );
}

export function BookMarkdown({ content }: { content: string }) {
  useEffect(() => {
    if (!isDev || typeof window === 'undefined') return;
    window.__bookImgDebug = {
      entries: [],
      summary: () => {
        console.table(window.__bookImgDebug!.entries);
        console.log('Full entries:', window.__bookImgDebug!.entries);
      },
    };
    const logError = (message: string, stack?: string, componentStack?: string) => {
      fetch('/api/book-debug-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, stack, componentStack }),
      }).catch(() => {});
    };
    const onError = (event: ErrorEvent) => {
      logError(event.message, event.error?.stack);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message ?? String(event.reason);
      logError(`Unhandled rejection: ${msg}`, event.reason?.stack);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  const toClass = (c: unknown): string =>
    Array.isArray(c) ? c.filter(Boolean).join(' ') : typeof c === 'string' ? c : '';

  /** Get plain text from React children for slug generation (matches TOC anchor format in the book). */
  function childrenToText(node: React.ReactNode): string {
    if (node == null) return '';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(childrenToText).join('');
    if (typeof node === 'object' && node !== null && 'props' in node) {
      const child = node as { props?: { children?: React.ReactNode } };
      return childrenToText(child.props?.children);
    }
    return '';
  }

  /**
   * Slugify heading text to match the book's TOC anchor format:
   * TOC uses double-hyphen for " — " and " & ". We inject "--" for those, then single spaces → single hyphen.
   */
  function slugifyHeading(text: string): string {
    if (!text || typeof text !== 'string') return '';
    const s = text
      .toLowerCase()
      .replace(/\s*\u2014\s*/g, '--')  /* em dash — (and optional spaces) → "--" so "Chapter 1 — What" → "chapter-1--what" */
      .replace(/\s*&\s*/g, '--')       /* " & " → "--" so "Architecture & Pipeline" → "architecture--pipeline" */
      .replace(/[:()?]/g, '')          /* remove : ( ) ? */
      .replace(/\s+/g, '-')            /* remaining spaces → single hyphen */
      .replace(/[^a-z0-9-]/g, '')      /* keep only alphanumeric and hyphen */
      .replace(/^-+|-+$/g, '');        /* trim leading/trailing hyphens only */
    return s || 'section';
  }

  const safeContent = typeof content === 'string' ? content : '';
  // Normalize line endings so GFM table parsing works (remark expects \n, not \r\n).
  const normalizedContent = safeContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Strip raw HTML so we can render without rehype-raw (avoids crash). Inner text is preserved so markdown still parses.
  const contentWithoutRawHtml = normalizedContent
    .replace(/<div[^>]*>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<table[^>]*>/gi, '\n\n')
    .replace(/<\/table>/gi, '\n\n')
    .replace(/<thead[^>]*>/gi, '')
    .replace(/<\/thead>/gi, '')
    .replace(/<tbody[^>]*>/gi, '')
    .replace(/<\/tbody>/gi, '')
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<th[^>]*>/gi, '')
    .replace(/<\/th>/gi, ' | ')
    .replace(/<td[^>]*>/gi, '')
    .replace(/<\/td>/gi, ' | ')
    .replace(/\n{3,}/g, '\n\n');

  const neutralFallback = (
    <div className="p-6 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
      <p className="font-medium mb-2">Content could not be rendered with full formatting.</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Try refreshing the page. If the issue continues, the book text is shown below in plain form.</p>
      <pre className="text-sm whitespace-pre-wrap break-words max-h-[60vh] overflow-auto p-4 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
        {safeContent.slice(0, 30000)}
      </pre>
    </div>
  );

  return (
    <ErrorBoundary scope="book-markdown" fallback={neutralFallback}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeEnsureChildren()]}
        components={{
        img: ({ src, alt }) => <BookImage src={src} alt={alt} />,
        div: (props) => <div className={toClass(props?.className)}>{props?.children ?? null}</div>,
        table: (props) => (
          <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className={toClass((props as { className?: unknown })?.className) || 'book-table w-full border-collapse text-left text-sm'}>
              {props?.children ?? null}
            </table>
          </div>
        ),
        thead: (props) => (
          <thead className={toClass((props as { className?: unknown })?.className) || 'bg-slate-100 dark:bg-slate-800 font-semibold'}>
            {props?.children ?? null}
          </thead>
        ),
        tbody: (props) => (
          <tbody className={toClass((props as { className?: unknown })?.className) || 'divide-y divide-slate-200 dark:divide-slate-700'}>
            {props?.children ?? null}
          </tbody>
        ),
        tr: (props) => (
          <tr className={toClass((props as { className?: unknown })?.className) || 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}>
            {props?.children ?? null}
          </tr>
        ),
        th: (props) => (
          <th className={toClass((props as { className?: unknown })?.className) || 'border-b-2 border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold text-slate-800 dark:text-slate-200'}>
            {props?.children ?? null}
          </th>
        ),
        td: (props) => (
          <td className={toClass((props as { className?: unknown })?.className) || 'px-4 py-3 text-slate-700 dark:text-slate-300'}>
            {props?.children ?? null}
          </td>
        ),
        h1: ({ children }) => {
          const rawText = childrenToText(children);
          const id = slugifyHeading(rawText);
          return (
            <h1 id={id} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-10 mb-4 first:mt-0 book-heading" style={{ scrollMarginTop: '6rem' }}>
              {children}
            </h1>
          );
        },
        h2: ({ children }) => {
          const rawText = childrenToText(children);
          const id = slugifyHeading(rawText);
          return (
            <h2 id={id} className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-10 mb-3 break-after-avoid print:break-after-page book-heading" style={{ scrollMarginTop: '6rem' }}>
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const rawText = childrenToText(children);
          const id = slugifyHeading(rawText);
          return (
            <h3 id={id} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2 book-heading" style={{ scrollMarginTop: '6rem' }}>
              {children}
            </h3>
          );
        },
        p: ({ children }) => <p className="my-3 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="my-3 list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>,
        ol: ({ children }) => <ol className="my-3 list-decimal pl-6 space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
        code: (props) => {
          const className = toClass(props?.className);
          const children = props?.children ?? null;
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[0.9em]">
                {children}
              </code>
            );
          }
          return <code className={className || 'block'}>{children}</code>;
        },
        pre: (props) => (
          <pre className={toClass((props as { className?: unknown })?.className) || 'my-4 p-4 rounded-lg bg-slate-900 text-slate-100 overflow-x-auto text-sm font-mono border border-slate-700 whitespace-pre-wrap break-words'}>
            {props?.children ?? null}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 pl-4 border-l-4 border-orange-500 text-slate-600 dark:text-slate-400 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" />,
        a: (props) => (
          <a href={typeof props?.href === 'string' ? props.href : '#'} className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
            {props?.children ?? null}
          </a>
        ),
      }}
      >
        {contentWithoutRawHtml}
      </ReactMarkdown>
    </ErrorBoundary>
  );
}
