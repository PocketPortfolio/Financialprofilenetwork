'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trackBlogPostClick, trackBlogPlatformView } from '../lib/analytics/events';
import { featuredArticles, type Article } from '../lib/blog/articles';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import SEOPageTracker from '../components/SEOPageTracker';
import { isOpenPortfolioHost } from '@/lib/surface-host';
import {
  OPEN_BLOG_FILTER_CHIPS,
  POCKET_BLOG_FILTER_CHIPS,
  type OpenBlogFilterId,
  type PocketBlogFilterId,
} from '@/lib/canonical-claims';

const POSTS_PER_PAGE = 20;

/** Amber-tinted stroke (not slate); rgba reads warm on peach backgrounds where color-mix can look grey */
const BLOG_CARD_BORDER = '1px solid rgba(245, 158, 11, 0.42)';
const BLOG_CARD_BORDER_COLOR = 'rgba(245, 158, 11, 0.42)';

const OPEN_BLOG_CARD_BORDER = '1px solid var(--border-subtle)';
const OPEN_BLOG_CARD_BORDER_COLOR = 'var(--border-subtle)';
const OPEN_BLOG_CARD_HOVER_BORDER = 'rgba(245, 158, 11, 0.4)';
const OPEN_BLOG_CARD_HOVER_SHADOW = '0 8px 24px rgba(245, 158, 11, 0.15)';
const OPEN_BLOG_CARD_REST_SHADOW = '0 4px 18px rgba(245, 158, 11, 0.06)';

type BlogCardKind = 'regular' | 'research' | 'how-to' | 'external';

function blogCardHover(
  el: HTMLElement,
  surface: 'open' | 'pocket',
  kind: BlogCardKind,
  platform?: string,
) {
  el.style.transform = 'translateY(-4px)';
  if (surface === 'open') {
    el.style.boxShadow = OPEN_BLOG_CARD_HOVER_SHADOW;
    el.style.borderColor = OPEN_BLOG_CARD_HOVER_BORDER;
    return;
  }
  if (kind === 'research') {
    el.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
    el.style.borderColor = 'rgba(59, 130, 246, 0.4)';
    return;
  }
  if (kind === 'how-to') {
    el.style.boxShadow = '0 8px 24px rgba(0, 255, 65, 0.15)';
    el.style.borderColor = 'rgba(0, 255, 65, 0.4)';
    return;
  }
  if (kind === 'external') {
    el.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)';
    el.style.borderColor =
      platform === 'dev.to' ? 'rgba(59, 73, 223, 0.4)' : 'rgba(139, 92, 246, 0.4)';
    return;
  }
  el.style.boxShadow = OPEN_BLOG_CARD_HOVER_SHADOW;
  el.style.borderColor = OPEN_BLOG_CARD_HOVER_BORDER;
}

function blogCardRest(
  el: HTMLElement,
  surface: 'open' | 'pocket',
  borderColor: string,
  restShadow: string,
) {
  el.style.transform = 'translateY(0)';
  el.style.boxShadow = restShadow;
  el.style.borderColor = borderColor;
}

interface GeneratedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  pillar?: string;
  category?: string;
  excludeFromLanding?: boolean;
}

type GridItem =
  | { kind: 'regular'; post: GeneratedPost }
  | { kind: 'research'; post: GeneratedPost }
  | { kind: 'how-to'; post: GeneratedPost }
  | { kind: 'external'; article: Article };

function postKind(post: GeneratedPost): GridItem['kind'] {
  if (post.category === 'research') return 'research';
  if (post.category === 'how-to-in-tech') return 'how-to';
  return 'regular';
}

function buildOpenVisibleItems(filter: OpenBlogFilterId, posts: GeneratedPost[]): GridItem[] {
  const filtered =
    filter === 'all' ? posts : posts.filter((p) => p.category === filter);
  return filtered.map((post) => {
    const kind = postKind(post);
    if (kind === 'research') return { kind: 'research' as const, post };
    if (kind === 'how-to') return { kind: 'how-to' as const, post };
    return { kind: 'regular' as const, post };
  });
}

function buildPocketVisibleItems(
  filter: PocketBlogFilterId,
  regularPosts: GeneratedPost[],
  filteredArticles: Article[],
): GridItem[] {
  const items: GridItem[] = [];

  if (filter === 'all' || filter === 'generated') {
    regularPosts.forEach((post) => items.push({ kind: 'regular', post }));
  }
  if (filter === 'all' || filter === 'dev.to' || filter === 'coderlegion') {
    const platform = filter === 'all' ? null : filter;
    filteredArticles
      .filter((a) => platform === null || a.platform === platform)
      .forEach((article) => items.push({ kind: 'external', article }));
  }

  return items;
}

function BlogPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openFilter, setOpenFilter] = useState<OpenBlogFilterId>('all');
  const [pocketFilter, setPocketFilter] = useState<PocketBlogFilterId>('all');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [blogSurface, setBlogSurface] = useState<'pocket' | 'open'>('pocket');

  useEffect(() => {
    const surface = isOpenPortfolioHost(window.location.hostname) ? 'open' : 'pocket';
    setBlogSurface(surface);
    setOpenFilter('all');
    setPocketFilter('all');
    fetch(`/api/blog/posts?surface=${surface}`)
      .then((res) => res.json())
      .then((data) => setGeneratedPosts(data || []))
      .catch(() => setGeneratedPosts([]));
  }, []);

  const filter = blogSurface === 'open' ? openFilter : pocketFilter;
  const prevFilter = useRef(filter);

  useEffect(() => {
    if (prevFilter.current !== filter) {
      prevFilter.current = filter;
      router.replace(`${pathname}?page=1`, { scroll: false });
    }
  }, [filter, pathname, router]);

  const pocketRegularPosts = generatedPosts;

  const pocketArticles =
    pocketFilter === 'all'
      ? featuredArticles
      : pocketFilter === 'generated'
        ? []
        : featuredArticles.filter((article) => article.platform === pocketFilter);

  const visibleItems =
    blogSurface === 'open'
      ? buildOpenVisibleItems(openFilter, generatedPosts)
      : buildPocketVisibleItems(pocketFilter, pocketRegularPosts, pocketArticles);

  const cardBorder = blogSurface === 'open' ? OPEN_BLOG_CARD_BORDER : BLOG_CARD_BORDER;
  const cardBorderColor = blogSurface === 'open' ? OPEN_BLOG_CARD_BORDER_COLOR : BLOG_CARD_BORDER_COLOR;
  const cardRestShadow =
    blogSurface === 'open' ? OPEN_BLOG_CARD_REST_SHADOW : '0 4px 18px rgba(245, 158, 11, 0.06)';

  const rawPage = parseInt(searchParams?.get('page') ?? '1', 10);
  const pageFromUrl = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / POSTS_PER_PAGE));
  const currentPage = Math.min(pageFromUrl, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagedItems = visibleItems.slice(start, start + POSTS_PER_PAGE);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    router.push(`${pathname}?page=${clamped}`, { scroll: true });
  };

  return (
    <>
      <ProductionNavbar />
      <SEOPageTracker />
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              ...(blogSurface === 'open'
                ? { color: 'var(--text)' }
                : {
                    background: 'linear-gradient(135deg, #6366f1 0%, #ff6b35 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }),
            }}
          >
            {blogSurface === 'open' ? 'Open Portfolio Engineering' : 'Building in Public'}
          </h1>
          <p
            style={{
              fontSize: '20px',
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto 32px',
            }}
          >
            {blogSurface === 'open'
              ? 'Research, sovereign engineering, and infrastructure deep-dives from the Open Portfolio substrate team.'
              : 'Technical deep-dives, architecture decisions, and devlogs from the Pocket Portfolio team.'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}
          >
            {(blogSurface === 'open' ? OPEN_BLOG_FILTER_CHIPS : POCKET_BLOG_FILTER_CHIPS).map(
              (chip) => {
                const active = filter === chip.id;
                const accent =
                  blogSurface === 'open'
                    ? 'var(--accent-warm)'
                    : (chip as (typeof POCKET_BLOG_FILTER_CHIPS)[number]).accent;
                const activeBg =
                  blogSurface === 'open'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : (chip as (typeof POCKET_BLOG_FILTER_CHIPS)[number]).activeBg;
                const setChip =
                  blogSurface === 'open'
                    ? () => setOpenFilter(chip.id as OpenBlogFilterId)
                    : () => setPocketFilter(chip.id as PocketBlogFilterId);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={setChip}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${active ? accent : 'var(--border-subtle)'}`,
                      background: active ? activeBg : 'transparent',
                      color: active ? accent : 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {chip.label}
                  </button>
                );
              },
            )}
          </div>
        </header>

        {visibleItems.length > 0 && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            Showing {start + 1}–{Math.min(start + POSTS_PER_PAGE, visibleItems.length)} of {visibleItems.length}{' '}
            posts
            {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {pagedItems.map((item) => {
            if (item.kind === 'regular') {
              const post = item.post;
              return (
                <Link
                  key={`generated-${post.slug}`}
                  href={`/blog/${post.slug}`}
                  onClick={() => trackBlogPostClick(post.title, 'generated', `/blog/${post.slug}`)}
                  style={{
                    display: 'block',
                    padding: '24px',
                    background: 'hsl(var(--card))',
                    border: cardBorder,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    boxShadow: cardRestShadow,
                  }}
                  onMouseEnter={(e) => blogCardHover(e.currentTarget, blogSurface, 'regular')}
                  onMouseLeave={(e) =>
                    blogCardRest(e.currentTarget, blogSurface, cardBorderColor, cardRestShadow)
                  }
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: 'var(--accent-warm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {post.pillar?.toUpperCase() || 'GENERATED'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                    {post.description}
                  </p>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div>By {post.author}</div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: 'var(--muted)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            }

            if (item.kind === 'research') {
              const post = item.post;
              return (
                <Link
                  key={`research-${post.slug}`}
                  href={`/blog/${post.slug}`}
                  onClick={() => trackBlogPostClick(post.title, 'research', `/blog/${post.slug}`)}
                  style={{
                    display: 'block',
                    padding: '24px',
                    background: 'hsl(var(--card))',
                    border: cardBorder,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    boxShadow: cardRestShadow,
                  }}
                  onMouseEnter={(e) => blogCardHover(e.currentTarget, blogSurface, 'research')}
                  onMouseLeave={(e) =>
                    blogCardRest(e.currentTarget, blogSurface, cardBorderColor, cardRestShadow)
                  }
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        background:
                          blogSurface === 'open' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: blogSurface === 'open' ? 'var(--accent-warm)' : '#3b82f6',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      RESEARCH
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                    {post.description}
                  </p>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div>By {post.author}</div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: 'var(--muted)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            }

            if (item.kind === 'how-to') {
              const post = item.post;
              return (
                <Link
                  key={`how-to-${post.slug}`}
                  href={`/blog/${post.slug}`}
                  onClick={() => trackBlogPostClick(post.title, 'how-to-in-tech', `/blog/${post.slug}`)}
                  style={{
                    display: 'block',
                    padding: '24px',
                    background: 'hsl(var(--card))',
                    border: cardBorder,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    boxShadow: cardRestShadow,
                  }}
                  onMouseEnter={(e) => blogCardHover(e.currentTarget, blogSurface, 'how-to')}
                  onMouseLeave={(e) =>
                    blogCardRest(e.currentTarget, blogSurface, cardBorderColor, cardRestShadow)
                  }
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        background:
                          blogSurface === 'open' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 255, 65, 0.1)',
                        color: blogSurface === 'open' ? 'var(--accent-warm)' : '#00ff41',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      HOW TO
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                    {post.description}
                  </p>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div>By {post.author}</div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: 'var(--muted)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            }

            const article = item.article;
            return (
              <a
                key={`external-${article.url}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackBlogPostClick(article.title, article.platform, article.url)}
                style={{
                  display: 'block',
                  padding: '24px',
                  background: 'hsl(var(--card))',
                  border: cardBorder,
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  boxShadow: cardRestShadow,
                }}
                onMouseEnter={(e) =>
                  blogCardHover(e.currentTarget, blogSurface, 'external', article.platform)
                }
                onMouseLeave={(e) =>
                  blogCardRest(e.currentTarget, blogSurface, cardBorderColor, cardRestShadow)
                }
              >
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '6px',
                      background:
                        article.platform === 'dev.to' ? 'rgba(59, 73, 223, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      color: article.platform === 'dev.to' ? 'rgb(59, 73, 223)' : 'rgb(139, 92, 246)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {article.platform === 'dev.to' ? 'DEV.TO' : 'CODERLEGION'}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
                  {article.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                  {article.description}
                </p>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div>
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div>By {article.author}</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: 'var(--muted)',
                        borderRadius: '4px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Blog pagination"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '48px',
            }}
          >
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-warm)',
                background: currentPage <= 1 ? 'var(--muted)' : 'var(--surface)',
                color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-warm)',
                background: currentPage >= totalPages ? 'var(--muted)' : 'var(--surface)',
                color: currentPage >= totalPages ? 'var(--text-muted)' : 'var(--text)',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Next
            </button>
          </nav>
        )}

        {blogSurface === 'pocket' && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'hsl(var(--card))',
            borderRadius: '12px',
            border: BLOG_CARD_BORDER,
            boxShadow: '0 4px 18px rgba(245, 158, 11, 0.06)',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Want More Content?</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Follow us on dev.to and join discussions on CoderLegion
          </p>
          <div
            style={{
              display: 'inline-flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <a
              href="https://dev.to/pocketportfolioapp"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBlogPlatformView('dev.to', 'view_all')}
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(59, 73, 223, 0.9) 0%, rgba(59, 73, 223, 1) 100%)',
                color: 'white',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 73, 223, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View All Dev.to Articles →
            </a>
            <Link
              href="/blog?page=1"
              onClick={() => {
                setPocketFilter('generated');
                trackBlogPlatformView('pocket-portfolio', 'view_all');
              }}
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(245, 158, 11, 1) 100%)',
                color: 'white',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View Pocket Portfolio Posts →
            </Link>
            <a
              href="https://coderlegion.com/5738/welcome-to-coderlegion-22s"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBlogPlatformView('coderlegion', 'join_discussion')}
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(139, 92, 246, 1) 100%)',
                color: 'white',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Join CoderLegion Discussion →
            </a>
          </div>
        </div>
        )}
      </div>
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 24px' }}>
          <ProductionNavbar />
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading blog…</p>
        </div>
      }
    >
      <BlogPageInner />
    </Suspense>
  );
}
