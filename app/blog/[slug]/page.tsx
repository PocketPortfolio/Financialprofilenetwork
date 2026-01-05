import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import ProductionNavbar from '../../components/marketing/ProductionNavbar';
import LandingFooter from '../../components/marketing/LandingFooter';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';
import React from 'react';

// Force dynamic rendering to avoid React version conflicts during static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// MDX components for custom rendering (RSC-compatible)
// Using React.createElement to avoid React version conflicts during build
// CRITICAL: All standard HTML elements must be defined to prevent render errors
const mdxComponents = {
  // Headings
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => 
    React.createElement('h1', { 
      ...props, 
      style: { 
        fontSize: '2em', 
        fontWeight: '700', 
        marginTop: '1.5em', 
        marginBottom: '0.5em',
        lineHeight: '1.3',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => 
    React.createElement('h2', { 
      ...props, 
      style: { 
        fontSize: '1.5em', 
        fontWeight: '600', 
        marginTop: '1.2em', 
        marginBottom: '0.5em',
        lineHeight: '1.4',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => 
    React.createElement('h3', { 
      ...props, 
      style: { 
        fontSize: '1.25em', 
        fontWeight: '600', 
        marginTop: '1em', 
        marginBottom: '0.5em',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => 
    React.createElement('h4', { 
      ...props, 
      style: { 
        fontSize: '1.1em', 
        fontWeight: '600', 
        marginTop: '0.8em', 
        marginBottom: '0.4em',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => 
    React.createElement('h5', { 
      ...props, 
      style: { 
        fontSize: '1em', 
        fontWeight: '600', 
        marginTop: '0.6em', 
        marginBottom: '0.4em',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => 
    React.createElement('h6', { 
      ...props, 
      style: { 
        fontSize: '0.9em', 
        fontWeight: '600', 
        marginTop: '0.5em', 
        marginBottom: '0.3em',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  
  // Text elements
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => 
    React.createElement('p', { 
      ...props, 
      style: { 
        marginBottom: '1em', 
        lineHeight: '1.8',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  strong: (props: React.HTMLAttributes<HTMLElement>) => 
    React.createElement('strong', { 
      ...props, 
      style: { 
        fontWeight: '700',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  em: (props: React.HTMLAttributes<HTMLElement>) => 
    React.createElement('em', { 
      ...props, 
      style: { 
        fontStyle: 'italic',
        ...props.style 
      } 
    }),
  
  // Lists
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => 
    React.createElement('ul', { 
      ...props, 
      style: { 
        marginBottom: '1em', 
        paddingLeft: '1.5em',
        listStyleType: 'disc',
        ...props.style 
      } 
    }),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => 
    React.createElement('ol', { 
      ...props, 
      style: { 
        marginBottom: '1em', 
        paddingLeft: '1.5em',
        ...props.style 
      } 
    }),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => 
    React.createElement('li', { 
      ...props, 
      style: { 
        marginBottom: '0.5em',
        lineHeight: '1.6',
        color: 'var(--text)',
        ...props.style 
      } 
    }),
  
  // Links and code
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => 
    React.createElement('a', { 
      ...props, 
      style: { 
        color: 'var(--accent-warm)', 
        textDecoration: 'underline', 
        ...props.style 
      } 
    }),
  code: (props: React.HTMLAttributes<HTMLElement>) => 
    React.createElement('code', { 
      ...props, 
      style: { 
        background: 'var(--surface-elevated)', 
        padding: '2px 6px', 
        borderRadius: '4px',
        fontSize: '0.9em',
        fontFamily: 'Courier New, monospace',
        color: 'var(--accent-warm)',
        ...props.style
      } 
    }),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => 
    React.createElement('pre', { 
      ...props, 
      style: {
        background: 'var(--surface-elevated)',
        padding: '1em',
        borderRadius: '8px',
        overflowX: 'auto',
        marginBottom: '1.5em',
        border: '1px solid var(--border)',
        ...props.style
      } 
    }),
  
  // Blockquote and horizontal rule
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => 
    React.createElement('blockquote', { 
      ...props, 
      style: { 
        borderLeft: '4px solid var(--accent-warm)',
        paddingLeft: '1em',
        marginLeft: '0',
        marginBottom: '1em',
        marginTop: '1em',
        fontStyle: 'italic',
        color: 'var(--text-secondary)',
        ...props.style 
      } 
    }),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => 
    React.createElement('hr', { 
      ...props, 
      style: { 
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '2em 0',
        ...props.style 
      } 
    }),
  
  // Images
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => 
    React.createElement('img', { 
      ...props, 
      style: { 
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        marginBottom: '1em',
        marginTop: '1em',
        ...props.style 
      } 
    }),
  
  // Tables
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => 
    React.createElement('div', { 
      style: { 
        overflowX: 'auto', 
        marginBottom: '2em',
        marginTop: '1.5em',
        borderRadius: '12px',
        border: '1px solid rgba(128, 128, 128, 0.2)',
        background: 'var(--surface-elevated)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      } 
    },
      React.createElement('table', { 
        ...props, 
        style: {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '16px',
          lineHeight: '1.6',
          minWidth: '100%',
          ...props.style
        } 
      })
    ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => 
    React.createElement('thead', { 
      ...props, 
      style: {
        background: 'var(--surface)',
        borderBottom: '2px solid rgba(128, 128, 128, 0.3)',
        ...props.style
      } 
    }),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => 
    React.createElement('tbody', props),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => 
    React.createElement('tr', { 
      ...props, 
      style: {
        borderBottom: '1px solid rgba(128, 128, 128, 0.15)',
        transition: 'background 0.2s ease',
        ...props.style
      } 
    }),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => 
    React.createElement('th', { 
      ...props, 
      style: {
        padding: '18px 20px',
        textAlign: 'left',
        fontWeight: '700',
        color: 'var(--text)',
        fontSize: '15px',
        letterSpacing: '0.01em',
        borderRight: '1px solid rgba(128, 128, 128, 0.15)',
        whiteSpace: 'nowrap',
        ...props.style
      } 
    }),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => 
    React.createElement('td', { 
      ...props, 
      style: {
        padding: '18px 20px',
        color: 'var(--text-secondary)',
        borderRight: '1px solid rgba(128, 128, 128, 0.15)',
        verticalAlign: 'top',
        fontSize: '15px',
        lineHeight: '1.7',
        ...props.style
      } 
    }),
};

// MDX Content component with error handling
// Must be defined after mdxComponents
async function MDXContent({ content }: { content: string }) {
  try {
    return (
      <MDXRemote 
        source={content} 
        components={mdxComponents} 
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }} 
      />
    );
  } catch (error: any) {
    console.error('Error rendering MDX content:', error);
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
        publishedTime: data.date,
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image ? `https://www.pocketportfolio.app${data.image}` : 'https://www.pocketportfolio.app/brand/og-base.svg',
    datePublished: data.date,
    dateModified: data.dateModified || data.date,
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
      '@id': `https://www.pocketportfolio.app/blog/${resolvedParams.slug}`,
    },
  };

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
            <span>{new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

