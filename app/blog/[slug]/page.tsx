import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isOpenBlogCategory, OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';
import { isNextNavigationError } from '@/lib/next-navigation-errors';
import { isOpenPortfolioHost, openSurfaceBaseUrl, pocketSurfaceBaseUrl } from '@/lib/surface-host';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { escapeAngleBracketsInProse } from '@/lib/mdx-escape';
import { sanitizeMdxBodyAfterFrontmatter } from '@/lib/mdx-sanitize-body';
import {
  extractFAQsFromContent,
  extractHowToSteps,
  generateFAQPageSchema,
  generateHowToSchema,
  generateQAPageSchema,
} from '@/app/lib/blog/aeoSchema';
import ProductionNavbar from '../../components/marketing/ProductionNavbar';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';
import React from 'react';
import MDXRenderer from '../../components/blog/MDXRenderer';

// Force dynamic rendering to avoid React version conflicts during static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

async function serializeBlogBody(content: string) {
  const safeContent = escapeAngleBracketsInProse(content);
  return serialize(safeContent, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  });
}

function MdxRenderError({ slug, message }: { slug: string; message: string }) {
  return (
    <div
      style={{
        padding: '2em',
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        border: '2px solid var(--border-warm)',
        color: 'var(--text)',
      }}
    >
      <h2 style={{ color: 'var(--accent-warm)', marginBottom: '1em' }}>Error Loading Content</h2>
      <p style={{ marginBottom: '1em' }}>
        There was an error rendering this blog post ({slug}). Please try refreshing the page.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  if (!fs.existsSync(postsDir)) return [];
  
  try {
    const files = fs.readdirSync(postsDir);
    return files
      .filter(file => file.endsWith('.mdx'))
      .map(file => ({ slug: file.replace('.mdx', '') }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const postPath = path.join(process.cwd(), 'content', 'posts', `${resolvedParams.slug}.mdx`);
  
  if (!fs.existsSync(postPath)) {
    return { title: 'Post Not Found' };
  }

  try {
    const fileContents = fs.readFileSync(postPath, 'utf-8');
    const { data } = matter(fileContents);

    const host = (await headers()).get('host')?.split(':')[0] ?? '';
    const onOpen = isOpenPortfolioHost(host);
    const siteBase = onOpen ? OPEN_URLS.home : 'https://www.pocketportfolio.app';
    const brand = onOpen ? SURFACE_ORG.open.name : 'Pocket Portfolio';
    const fallbackOgImage = `${siteBase}/api/og?title=${encodeURIComponent(data.title || `${brand} Blog`)}&description=${encodeURIComponent(data.description || 'Sovereign Local-First Wealth Tracker')}&v=6`;
    return {
      title: `${data.title} | ${brand} Blog`,
      description: data.description,
      keywords: data.tags || [],
      openGraph: {
        title: data.title,
        description: data.description,
        images: [data.image || fallbackOgImage],
        type: 'article',
        publishedTime: data.date, // Will be updated below if publishedAt exists
        authors: [data.author || `${brand} Team`],
        url: `${siteBase}/blog/${resolvedParams.slug}`,
      },
      alternates: {
        canonical: `${siteBase}/blog/${resolvedParams.slug}`,
      },
    };
  } catch (error) {
    return { title: 'Post Not Found' };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const postPath = path.join(process.cwd(), 'content', 'posts', `${resolvedParams.slug}.mdx`);
  
  // ✅ Enhanced file existence check with detailed logging
  if (!fs.existsSync(postPath)) {
    console.error('[Blog Post] File not found:', {
      slug: resolvedParams.slug,
      postPath,
      cwd: process.cwd(),
      postsDir: path.join(process.cwd(), 'content', 'posts'),
      postsDirExists: fs.existsSync(path.join(process.cwd(), 'content', 'posts')),
      availableFiles: fs.existsSync(path.join(process.cwd(), 'content', 'posts')) 
        ? fs.readdirSync(path.join(process.cwd(), 'content', 'posts')).slice(0, 10)
        : 'N/A',
    });
    notFound();
  }

  // ✅ Validate file is readable and not empty
  try {
    const fileStats = fs.statSync(postPath);
    if (fileStats.size === 0) {
      console.error('[Blog Post] File is empty:', {
        slug: resolvedParams.slug,
        postPath,
        size: fileStats.size,
      });
      throw new Error(`Blog post file is empty: ${resolvedParams.slug}`);
    }
  } catch (statError: any) {
    console.error('[Blog Post] Cannot read file stats:', {
      slug: resolvedParams.slug,
      postPath,
      error: statError.message,
    });
    throw new Error(`Cannot access blog post file: ${statError.message}`);
  }

  // Parse MDX file with error handling
  let fileContents: string;
  let data: any;
  let content: string;
  
  try {
    fileContents = fs.readFileSync(postPath, 'utf-8');
    
    // ✅ Validate file contents
    if (!fileContents || fileContents.trim().length === 0) {
      throw new Error('File contents are empty');
    }
    
    const parsed = matter(fileContents);
    data = parsed.data;
    content = sanitizeMdxBodyAfterFrontmatter(parsed.content);

    // ✅ Validate parsed data
    if (!data || !data.title) {
      throw new Error('Frontmatter missing required fields (title)');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Content body is empty');
    }
    
    // ✅ Log successful parsing (helps with debugging)
    console.log('[Blog Post] Successfully parsed:', {
      slug: resolvedParams.slug,
      title: data.title,
      contentLength: content.length,
      hasImage: !!data.image,
    });
  } catch (error: unknown) {
    if (isNextNavigationError(error)) throw error;
    const err = error as { message?: string; stack?: string };
    console.error('[Blog Post] Error parsing MDX file:', {
      slug: resolvedParams.slug,
      postPath,
      fileExists: fs.existsSync(postPath),
      fileSize: fs.existsSync(postPath) ? fs.statSync(postPath).size : 0,
      error: err.message,
      errorStack: err.stack,
    });
    throw new Error(`Failed to parse blog post: ${err.message ?? 'Unknown error'}`);
  }

  const host = (await headers()).get('host')?.split(':')[0] ?? '';
  const onOpenSurface = isOpenPortfolioHost(host);
  const category = typeof data.category === 'string' ? data.category : 'deep-dive';
  const technical = isOpenBlogCategory(category);
  if (onOpenSurface && !technical) {
    redirect(`${pocketSurfaceBaseUrl(host)}/blog/${resolvedParams.slug}`);
  }
  if (!onOpenSurface && technical) {
    redirect(`${openSurfaceBaseUrl(host)}/blog/${resolvedParams.slug}`);
  }

  // ✅ Load publishedAt from calendar files
  let publishedAt: string | null = null;
  try {
    // Try main calendar first
    const mainCalendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
    if (fs.existsSync(mainCalendarPath)) {
      const mainCalendar = JSON.parse(fs.readFileSync(mainCalendarPath, 'utf-8'));
      const postInCalendar = mainCalendar.find((p: any) => p.slug === resolvedParams.slug);
      if (postInCalendar?.publishedAt) {
        publishedAt = postInCalendar.publishedAt;
      }
    }
    
    // If not found, try how-to calendar
    if (!publishedAt) {
      const howToCalendarPath = path.join(process.cwd(), 'content', 'how-to-tech-calendar.json');
      if (fs.existsSync(howToCalendarPath)) {
        const howToCalendar = JSON.parse(fs.readFileSync(howToCalendarPath, 'utf-8'));
        const postInCalendar = howToCalendar.find((p: any) => p.slug === resolvedParams.slug);
        if (postInCalendar?.publishedAt) {
          publishedAt = postInCalendar.publishedAt;
        }
      }
    }
    
    // If not found, try research calendar
    if (!publishedAt) {
      const researchCalendarPath = path.join(process.cwd(), 'content', 'research-calendar.json');
      if (fs.existsSync(researchCalendarPath)) {
        const researchCalendar = JSON.parse(fs.readFileSync(researchCalendarPath, 'utf-8'));
        const postInCalendar = researchCalendar.find((p: any) => p.slug === resolvedParams.slug);
        if (postInCalendar?.publishedAt) {
          publishedAt = postInCalendar.publishedAt;
        }
      }
    }
  } catch (error) {
    // Silently fail - publishedAt is optional
    console.warn('Could not load publishedAt from calendar:', error);
  }

  // Format date and time for display
  const dateDisplay = new Date(data.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const timeDisplay = publishedAt 
    ? new Date(publishedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : null;

  const faqs = extractFAQsFromContent(content);
  const howToSteps = extractHowToSteps(content, data.title);
  const siteBase = onOpenSurface ? OPEN_URLS.home : 'https://www.pocketportfolio.app';
  const brand = onOpenSurface ? SURFACE_ORG.open.name : 'Pocket Portfolio';
  const postUrl = `${siteBase}/blog/${resolvedParams.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image
      ? `${siteBase}${data.image}`
      : `${siteBase}/api/og?title=${encodeURIComponent(data.title || `${brand} Blog`)}&description=${encodeURIComponent(data.description || 'Sovereign Local-First Wealth Tracker')}&v=6`,
    datePublished: publishedAt || data.date,
    dateModified: data.dateModified || publishedAt || data.date,
    author: {
      '@type': 'Organization',
      name: data.author || `${brand} Team`,
    },
    publisher: {
      '@type': 'Organization',
      name: brand,
      logo: {
        '@type': 'ImageObject',
        url: onOpenSurface
          ? `${OPEN_URLS.home}/brand/pp-monogram-amber.png`
          : 'https://www.pocketportfolio.app/brand/pp-monogram-amber.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  // Generate AEO schemas
  const faqSchema = generateFAQPageSchema(faqs, postUrl);
  const howToSchema = generateHowToSchema(data.title, data.description, howToSteps, postUrl);
  const qaSchema = generateQAPageSchema(data.title, data.description, faqs, postUrl);

  let mdxBody: React.ReactNode;
  try {
    const mdxSource = await serializeBlogBody(content);
    mdxBody = <MDXRenderer source={mdxSource} />;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Blog Post MDX Error]', {
      slug: resolvedParams.slug,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
    mdxBody = <MdxRenderError slug={resolvedParams.slug} message={err.message ?? 'Unknown error'} />;
  }

  return (
    <>
      <SEOHead
        title={data.title}
        description={data.description}
        keywords={data.tags || []}
        canonical={postUrl}
        ogType="article"
        ogImage={data.image ? `${siteBase}${data.image}` : undefined}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {qaSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
        />
      )}
      <ProductionNavbar />
      <article 
        style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'clamp(24px, 6vw, 60px) clamp(16px, 4vw, 24px)',
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
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
              alignItems: 'center'
            }}
          >
            <span>
              {dateDisplay}
              {timeDisplay && (
                <span style={{ marginLeft: '8px', opacity: 0.8 }}>
                  at {timeDisplay}
                </span>
              )}
            </span>
            <span>By {data.author || 'Pocket Portfolio Team'}</span>
            {data.pillar && (
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                background: 'var(--surface-elevated)',
                border: '2px solid var(--border-warm)',
                fontSize: '12px',
                textTransform: 'capitalize',
              }}>
                {data.pillar}
              </span>
            )}
          </div>
          {data.image && (
            <img 
              src={data.image} 
              alt={data.title}
              style={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: '12px', 
                marginBottom: '32px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                maxWidth: '100%'
              }}
            />
          )}
          {data.tags && data.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {data.tags.map((tag: string, i: number) => (
                <span
                  key={i}
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
          )}
        </header>
        
        {/* Video Embed for Research Posts */}
        {data.category === 'research' && data.videoId && (
          <div style={{ 
            marginBottom: '48px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0
          }}>
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
                height: '100%'
              }}
            />
          </div>
        )}
        
        <div 
          style={{ 
            fontSize: 'clamp(16px, 3vw, 18px)', 
            lineHeight: '1.8', 
            color: 'var(--text)',
            width: '100%',
            maxWidth: '100%',
            overflowWrap: 'break-word',
            wordWrap: 'break-word'
          }}
          className="blog-content"
        >
          {mdxBody}
        </div>
        
        {/* Transparency Footer for Research Posts */}
        {data.category === 'research' && (
          <div style={{ 
            marginTop: '48px', 
            padding: '16px 24px', 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            borderTop: '1px solid color-mix(in srgb, var(--border-warm) 45%, transparent)',
            textAlign: 'center',
            background: 'var(--surface-elevated)',
            borderRadius: '8px',
          }}>
            This research was autonomously synthesized by the Pocket Portfolio Engine.
          </div>
        )}
        
        {/* CTA Section */}
        <div
          style={{
            marginTop: '64px',
            padding: 'clamp(20px, 4vw, 32px)',
            background: 'var(--surface-elevated)',
            borderRadius: '12px',
            border: '2px solid var(--border-warm)',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
            Unlock Sovereign Sync
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
            Take control of your financial data with bidirectional Google Drive sync. Available for Corporate Sponsors and Founders Club members.
          </p>
          <Link
            href="/sponsor"
            style={{
              display: 'inline-block',
              padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 28px)',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              maxWidth: '100%'
            }}
          >
            Upgrade to Unlock →
          </Link>
        </div>
      </article>
    </>
  );
}

