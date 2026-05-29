import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isOpenBlogCategory, OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';
import { isNextNavigationError } from '@/lib/next-navigation-errors';
import { isOpenPortfolioHost, openSurfaceBaseUrl, pocketSurfaceBaseUrl } from '@/lib/surface-host';
import { escapeAngleBracketsInProse } from '@/lib/mdx-escape';
import { sanitizeMdxBodyAfterFrontmatter } from '@/lib/mdx-sanitize-body';
import BlogMarkdownBody from '../../components/blog/BlogMarkdownBody';
import ProductionNavbar from '../../components/marketing/ProductionNavbar';
import Link from 'next/link';
import React from 'react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';

async function getRequestHost(): Promise<string> {
  try {
    return (await headers()).get('host')?.split(':')[0] ?? '';
  } catch {
    return '';
  }
}

type BlogPostFrontmatter = {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  image?: string;
  pillar?: string;
  category?: string;
  tags?: string[];
  videoId?: string;
  dateModified?: string;
};

function toSerializableString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
}

function normalizeFrontmatter(raw: Record<string, unknown>): BlogPostFrontmatter {
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t) => (typeof t === 'string' ? t : String(t)))
    : undefined;

  return {
    title: typeof raw.title === 'string' ? raw.title : 'Untitled',
    description: toSerializableString(raw.description),
    date: toSerializableString(raw.date),
    author: toSerializableString(raw.author),
    image: toSerializableString(raw.image),
    pillar: toSerializableString(raw.pillar),
    category: toSerializableString(raw.category),
    tags,
    videoId: toSerializableString(raw.videoId),
    dateModified: toSerializableString(raw.dateModified),
  };
}

function loadPost(slug: string): { content: string; data: BlogPostFrontmatter } | null {
  const postPath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`);

  try {
    if (!fs.existsSync(postPath)) return null;

    const stat = fs.statSync(postPath);
    if (!stat.isFile() || stat.size === 0) return null;

    const fileContents = fs.readFileSync(postPath, 'utf-8');
    if (!fileContents.trim()) return null;

    const parsed = matter(fileContents);
    const data = normalizeFrontmatter((parsed.data ?? {}) as Record<string, unknown>);
    if (!data.title?.trim()) return null;

    const content = sanitizeMdxBodyAfterFrontmatter(parsed.content);
    if (!content.trim()) return null;

    return { content, data };
  } catch (error) {
    console.error('[Blog Post] loadPost failed:', { slug, error });
    return null;
  }
}

function formatPostDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPostTime(timeStr?: string | null): string | null {
  if (!timeStr) return null;
  const parsed = new Date(timeStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function renderPostBody(content: string): React.ReactNode {
  const safeContent = escapeAngleBracketsInProse(content);
  return <BlogMarkdownBody markdown={safeContent} />;
}

/** No generateStaticParams — avoids build-time prerender + headers()/RSC crashes on /open/blog/[slug]. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = loadPost(slug);
  if (!loaded) {
    return { title: 'Post Not Found' };
  }

  const { data } = loaded;
  const host = await getRequestHost();
  const onOpen = isOpenPortfolioHost(host);
  const siteBase = onOpen ? OPEN_URLS.home : 'https://www.pocketportfolio.app';
  const brand = onOpen ? SURFACE_ORG.open.name : 'Pocket Portfolio';
  const fallbackOgImage = `${siteBase}/api/og?title=${encodeURIComponent(data.title)}&description=${encodeURIComponent(data.description || 'Sovereign Local-First Wealth Tracker')}&v=6`;
  const published = data.date ?? undefined;

  return {
    title: `${data.title} | ${brand} Blog`,
    description: data.description,
    keywords: data.tags,
    openGraph: {
      title: data.title,
      description: data.description,
      images: [data.image || fallbackOgImage],
      type: 'article',
      publishedTime: published,
      authors: [data.author || `${brand} Team`],
      url: `${siteBase}/blog/${slug}`,
    },
    alternates: {
      canonical: `${siteBase}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  try {
    const loaded = loadPost(resolvedParams.slug);
    if (!loaded) {
      notFound();
    }

    const { content, data } = loaded;

    const host = await getRequestHost();
    const onOpenSurface = host ? isOpenPortfolioHost(host) : false;
    const category = data.category ?? 'deep-dive';
    const technical = isOpenBlogCategory(category);

    if (host) {
      if (onOpenSurface && !technical) {
        redirect(`${pocketSurfaceBaseUrl(host)}/blog/${resolvedParams.slug}`);
      }
      if (!onOpenSurface && technical) {
        redirect(`${openSurfaceBaseUrl(host)}/blog/${resolvedParams.slug}`);
      }
    }

    let publishedAt: string | null = null;
    try {
      const calendarPaths = [
        path.join(process.cwd(), 'content', 'blog-calendar.json'),
        path.join(process.cwd(), 'content', 'how-to-tech-calendar.json'),
        path.join(process.cwd(), 'content', 'research-calendar.json'),
      ];
      for (const calendarPath of calendarPaths) {
        if (!publishedAt && fs.existsSync(calendarPath)) {
          const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf-8')) as Array<{
            slug?: string;
            publishedAt?: string;
          }>;
          const hit = calendar.find((p) => p.slug === resolvedParams.slug);
          if (hit?.publishedAt) {
            publishedAt = toSerializableString(hit.publishedAt) ?? null;
          }
        }
      }
    } catch {
      publishedAt = null;
    }

    const dateDisplay = formatPostDate(data.date);
    const timeDisplay = formatPostTime(publishedAt);
    const mdxBody = renderPostBody(content);

    return (
      <>
        <ProductionNavbar />
        <article
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: 'clamp(24px, 6vw, 60px) clamp(16px, 4vw, 24px)',
            minHeight: 'calc(100vh - 200px)',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}
        >
          <header style={{ marginBottom: 'clamp(32px, 6vw, 48px)' }}>
            <Link
              href="/blog"
              style={{
                display: 'inline-block',
                marginBottom: '24px',
                color: 'var(--accent-warm)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              ← Back to Blog
            </Link>
            <h1
              style={{
                fontSize: 'clamp(32px, 6vw, 48px)',
                fontWeight: '700',
                marginBottom: '16px',
                lineHeight: '1.2',
                color: 'var(--text)',
              }}
            >
              {data.title}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: 'clamp(8px, 2vw, 16px)',
                flexWrap: 'wrap',
                marginBottom: '24px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                color: 'var(--text-secondary)',
                alignItems: 'center',
              }}
            >
              {dateDisplay ? (
                <span>
                  {dateDisplay}
                  {timeDisplay ? (
                    <span style={{ marginLeft: '8px', opacity: 0.8 }}>at {timeDisplay}</span>
                  ) : null}
                </span>
              ) : null}
              <span>By {data.author || 'Pocket Portfolio Team'}</span>
              {data.pillar ? (
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-elevated)',
                    border: '2px solid var(--border-warm)',
                    fontSize: '12px',
                    textTransform: 'capitalize',
                  }}
                >
                  {data.pillar}
                </span>
              ) : null}
            </div>
            {data.image ? (
              <img
                src={data.image}
                alt={data.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  marginBottom: '32px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  maxWidth: '100%',
                }}
              />
            ) : null}
            {data.tags && data.tags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      background: 'var(--surface-elevated)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      border: '2px solid var(--border-warm)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {data.category === 'research' && data.videoId ? (
            <div
              style={{
                marginBottom: '48px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                height: 0,
              }}
            >
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${data.videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          ) : null}

          <div
            style={{
              fontSize: 'clamp(16px, 3vw, 18px)',
              lineHeight: '1.8',
              color: 'var(--text)',
              width: '100%',
              maxWidth: '100%',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
            }}
            className="blog-content"
          >
            {mdxBody}
          </div>

          {data.category === 'research' ? (
            <div
              style={{
                marginTop: '48px',
                padding: '16px 24px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                borderTop: '1px solid color-mix(in srgb, var(--border-warm) 45%, transparent)',
                textAlign: 'center',
                background: 'var(--surface-elevated)',
                borderRadius: '8px',
              }}
            >
              This research was autonomously synthesized by the Pocket Portfolio Engine.
            </div>
          ) : null}
        </article>
      </>
    );
  } catch (error: unknown) {
    if (isNextNavigationError(error)) throw error;
    console.error('[Blog Post] unhandled render error:', {
      slug: resolvedParams.slug,
      error,
    });
    return (
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ color: 'var(--text)', marginBottom: '12px' }}>Post temporarily unavailable</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Content temporarily unavailable.</p>
        <Link href="/blog" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
          ← Back to Blog
        </Link>
      </article>
    );
  }
}
