'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackBlogPostClick, trackBlogPlatformView } from '../lib/analytics/events';
import { featuredArticles, type Article } from '../lib/blog/articles';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import ToolFooter from '../components/marketing/ToolFooter';
import SEOPageTracker from '../components/SEOPageTracker';

interface GeneratedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  pillar?: string;
}

export default function BlogPage() {
  const [filter, setFilter] = useState<'all' | 'dev.to' | 'coderlegion' | 'generated'>('all');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  useEffect(() => {
    // Fetch Pocket Portfolio posts metadata
    fetch('/api/blog/posts')
      .then(res => res.json())
      .then(data => setGeneratedPosts(data || []))
      .catch(() => setGeneratedPosts([]));
  }, []);

  const showGenerated = filter === 'all' || filter === 'generated';
  const showExternal = filter === 'all' || (filter !== 'generated');
  
  const filteredArticles = showExternal
    ? (filter === 'all' ? featuredArticles : featuredArticles.filter(article => article.platform === filter))
    : [];

  return (
    <>
      <ProductionNavbar />
      <SEOPageTracker />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
      {/* Header */}
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #ff6b35 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Building in Public
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Technical deep-dives, architecture decisions, and devlogs from the Pocket Portfolio team.
        </p>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `2px solid ${filter === 'all' ? 'var(--primary)' : 'var(--border)'}`,
              background: filter === 'all' ? 'var(--primary)' : 'transparent',
              color: filter === 'all' ? 'white' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('dev.to')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `2px solid ${filter === 'dev.to' ? 'rgb(59, 73, 223)' : 'var(--border)'}`,
              background: filter === 'dev.to' ? 'rgba(59, 73, 223, 0.1)' : 'transparent',
              color: filter === 'dev.to' ? 'rgb(59, 73, 223)' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Dev.to
          </button>
          <button
            onClick={() => setFilter('coderlegion')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `2px solid ${filter === 'coderlegion' ? 'rgb(139, 92, 246)' : 'var(--border)'}`,
              background: filter === 'coderlegion' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              color: filter === 'coderlegion' ? 'rgb(139, 92, 246)' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            CoderLegion
          </button>
          <button
            onClick={() => setFilter('generated')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `2px solid ${filter === 'generated' ? 'var(--accent-warm)' : 'var(--border)'}`,
              background: filter === 'generated' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              color: filter === 'generated' ? 'var(--accent-warm)' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Pocket Portfolio Posts
          </button>
        </div>
      </header>

      {/* Articles Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {/* Pocket Portfolio Posts */}
        {(filter === 'all' || filter === 'generated') && generatedPosts.map((post, index) => (
          <Link
            key={`generated-${index}`}
            href={`/blog/${post.slug}`}
            onClick={() => trackBlogPostClick(post.title, 'generated', `/blog/${post.slug}`)}
            style={{
              display: 'block',
              padding: '24px',
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--card-border)';
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--accent-warm)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {post.pillar?.toUpperCase() || 'GENERATED'}
              </span>
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>
              {post.title}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              {post.description}
            </p>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>By {post.author}</div>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {post.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      background: 'var(--muted)',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
        
        {/* External Articles */}
        {showExternal && filteredArticles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBlogPostClick(article.title, article.platform, article.url)}
            style={{
              display: 'block',
              padding: '24px',
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)';
              e.currentTarget.style.borderColor = article.platform === 'dev.to' 
                ? 'rgba(59, 73, 223, 0.4)' 
                : 'rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--card-border)';
            }}
          >
            {/* Platform Badge */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                background: article.platform === 'dev.to' 
                  ? 'rgba(59, 73, 223, 0.1)' 
                  : 'rgba(139, 92, 246, 0.1)',
                color: article.platform === 'dev.to' 
                  ? 'rgb(59, 73, 223)' 
                  : 'rgb(139, 92, 246)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {article.platform === 'dev.to' ? 'DEV.TO' : 'CODERLEGION'}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>
              {article.title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              {article.description}
            </p>

            {/* Date and Author */}
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>By {article.author}</div>
            </div>

            {/* Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    background: 'var(--muted)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: 'var(--card)',
        borderRadius: '12px',
        border: '1px solid var(--card-border)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Want More Content?
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-muted)',
          marginBottom: '24px'
        }}>
          Follow us on dev.to and join discussions on CoderLegion
        </p>
        <div style={{
          display: 'inline-flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
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
              transition: 'all 0.2s ease'
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
            href="/blog"
            onClick={() => {
              setFilter('generated');
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
              transition: 'all 0.2s ease'
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
              transition: 'all 0.2s ease'
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
      <ToolFooter />
    </div>
    </>
  );
}

