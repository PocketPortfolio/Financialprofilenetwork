import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import ProductionNavbar from '../../components/marketing/ProductionNavbar';
import LandingFooter from '../../components/marketing/LandingFooter';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';

// MDX components for custom rendering
const mdxComponents = {
  a: (props: any) => <a {...props} style={{ color: 'var(--accent-warm)', textDecoration: 'underline' }} />,
  code: (props: any) => (
    <code {...props} style={{ 
      background: 'var(--surface-elevated)', 
      padding: '2px 6px', 
      borderRadius: '4px',
      fontSize: '0.9em',
      fontFamily: 'Courier New, monospace',
      color: 'var(--accent-warm)'
    }} />
  ),
  pre: (props: any) => (
    <pre {...props} style={{
      background: 'var(--surface-elevated)',
      padding: '1em',
      borderRadius: '8px',
      overflowX: 'auto',
      marginBottom: '1.5em',
      border: '1px solid var(--border)'
    }} />
  ),
};

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postPath = path.join(process.cwd(), 'content', 'posts', `${params.slug}.mdx`);
  
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
        authors: [data.author || 'Pocket Portfolio AI'],
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/blog/${params.slug}`,
      },
    };
  } catch (error) {
    return { title: 'Post Not Found' };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const postPath = path.join(process.cwd(), 'content', 'posts', `${params.slug}.mdx`);
  
  if (!fs.existsSync(postPath)) {
    notFound();
  }

  const fileContents = fs.readFileSync(postPath, 'utf-8');
  const { data, content } = matter(fileContents);

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
      name: data.author || 'Pocket Portfolio AI',
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
      '@id': `https://www.pocketportfolio.app/blog/${params.slug}`,
    },
  };

  return (
    <>
      <SEOHead
        title={data.title}
        description={data.description}
        keywords={data.tags || []}
        canonical={`https://www.pocketportfolio.app/blog/${params.slug}`}
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
            <span>By {data.author || 'Pocket Portfolio AI'}</span>
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
          <MDXRemote source={content} components={mdxComponents} />
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

