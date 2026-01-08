import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import ProductionNavbar from '../../components/marketing/ProductionNavbar';
import LandingFooter from '../../components/marketing/LandingFooter';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';
import React from 'react';
import MDXRenderer from '../../components/blog/MDXRenderer';

// Force dynamic rendering to avoid React version conflicts during static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// MDX Content component - now uses client component wrapper to avoid React 19/RSC conflicts
async function MDXContent({ content }: { content: string }) {
  try {
    // Serialize MDX content on server
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    });
    
    return <MDXRenderer source={mdxSource} />;
  } catch (error: any) {
    return (
      <div style={{
        padding: '2em',
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }}>
        <h2 style={{ color: 'var(--accent-warm)', marginBottom: '1em' }}>
          Error Loading Content
        </h2>
        <p style={{ marginBottom: '1em' }}>
          There was an error rendering this blog post. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{
            background: '#f5f5f5',
            padding: '1em',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
          }}>
            {error.message}
          </pre>
        )}
      </div>
    );
  }
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

    return {
      title: `${data.title} | Pocket Portfolio Blog`,
      description: data.description,
      keywords: data.tags || [],
      openGraph: {
        title: data.title,
        description: data.description,
        images: [data.image || 'https://www.pocketportfolio.app/brand/og-base.svg'],
        type: 'article',
        publishedTime: data.date, // Will be updated below if publishedAt exists
        authors: [data.author || 'Pocket Portfolio Team'],
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/blog/${resolvedParams.slug}`,
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
  
  if (!fs.existsSync(postPath)) {
    notFound();
  }

  // Parse MDX file with error handling
  let fileContents: string;
  let data: any;
  let content: string;
  
  try {
    fileContents = fs.readFileSync(postPath, 'utf-8');
    const parsed = matter(fileContents);
    data = parsed.data;
    content = parsed.content;
  } catch (error: any) {
    console.error(`Error parsing MDX file for ${resolvedParams.slug}:`, error);
    throw new Error(`Failed to parse blog post: ${error.message}`);
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

  // Extract AEO schemas from content
  const { extractFAQsFromContent, extractHowToSteps, generateFAQPageSchema, generateHowToSchema, generateQAPageSchema } = await import('@/app/lib/blog/aeoSchema');
  const faqs = extractFAQsFromContent(content);
  const howToSteps = extractHowToSteps(content, data.title);
  const postUrl = `https://www.pocketportfolio.app/blog/${resolvedParams.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image ? `https://www.pocketportfolio.app${data.image}` : 'https://www.pocketportfolio.app/brand/og-base.svg',
    datePublished: publishedAt || data.date,
    dateModified: data.dateModified || publishedAt || data.date,
    author: {
      '@type': 'Organization',
      name: data.author || 'Pocket Portfolio Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pocket Portfolio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.pocketportfolio.app/brand/pp-wordmark.svg',
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

  return (
    <>
      <SEOHead
        title={data.title}
        description={data.description}
        keywords={data.tags || []}
        canonical={`https://www.pocketportfolio.app/blog/${resolvedParams.slug}`}
        ogType="article"
        ogImage={data.image ? `https://www.pocketportfolio.app${data.image}` : undefined}
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
          padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)',
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        <header style={{ marginBottom: '48px' }}>
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
              gap: '16px', 
              flexWrap: 'wrap', 
              marginBottom: '24px', 
              fontSize: '14px', 
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
                border: '1px solid var(--border)',
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
                borderRadius: '12px', 
                marginBottom: '32px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
                    border: '1px solid var(--border)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <div 
          style={{ 
            fontSize: '18px', 
            lineHeight: '1.8', 
            color: 'var(--text)',
          }}
          className="blog-content"
        >
          <MDXContent content={content} />
        </div>
        
        {/* CTA Section */}
        <div
          style={{
            marginTop: '64px',
            padding: '32px',
            background: 'var(--surface-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
            Unlock Sovereign Sync
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Take control of your financial data with bidirectional Google Drive sync. Available for Corporate Sponsors and Founders Club members.
          </p>
          <Link
            href="/sponsor"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            Upgrade to Unlock →
          </Link>
        </div>
      </article>
      <LandingFooter />
    </>
  );
}

