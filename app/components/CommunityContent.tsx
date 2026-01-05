'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StructuredData from './StructuredData';
import { trackBlogPostClick, trackBlogPlatformView } from '../lib/analytics/events';
import { featuredArticles, type Article } from '../lib/blog/articles';

interface PocketPortfolioPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  pillar?: string;
}

interface CombinedArticle {
  title: string;
  description: string;
  url: string;
  platform: 'dev.to' | 'coderlegion' | 'pocket-portfolio';
  date: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  tags: string[];
  slug?: string; // For Pocket Portfolio posts
  isInternal?: boolean; // For Pocket Portfolio posts
}

export default function CommunityContent() {
  const [pocketPortfolioPosts, setPocketPortfolioPosts] = useState<PocketPortfolioPost[]>([]);
  const [combinedArticles, setCombinedArticles] = useState<CombinedArticle[]>([]);

  useEffect(() => {
    // Fetch from all sources in parallel
    Promise.all([
      fetch('/api/blog/posts').then(res => res.json()).catch(() => []),
      fetch('/api/blog/external-posts').then(res => res.json()).catch(() => ({ devto: [], coderlegion: [] }))
    ]).then(([ppData, externalData]) => {
      const ppPosts = (ppData || []) as PocketPortfolioPost[];
      const devToPosts = (externalData as any)?.devto || [];
      const coderLegionPosts = (externalData as any)?.coderlegion || [];
      
      setPocketPortfolioPosts(ppPosts);
      
      // Convert Pocket Portfolio posts to CombinedArticle format
      const ppArticles: CombinedArticle[] = ppPosts.slice(0, 3).map((post: PocketPortfolioPost) => ({
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
        platform: 'pocket-portfolio' as const,
        date: post.date,
        datePublished: post.date,
        author: post.author || 'Pocket Portfolio Team',
        tags: post.tags || [],
        slug: post.slug,
        isInternal: true
      }));
      
      // Convert dev.to posts to CombinedArticle format
      const devToArticles: CombinedArticle[] = devToPosts.slice(0, 2).map((post: any) => ({
        title: post.title,
        description: post.description,
        url: post.url,
        platform: 'dev.to' as const,
        date: post.date,
        datePublished: post.datePublished,
        author: post.author || 'Pocket Portfolio Team',
        tags: post.tags || [],
        isInternal: false
      }));
      
      // Convert CoderLegion posts to CombinedArticle format
      const coderLegionArticles: CombinedArticle[] = coderLegionPosts.slice(0, 2).map((post: any) => ({
        title: post.title,
        description: post.description,
        url: post.url,
        platform: 'coderlegion' as const,
        date: post.date,
        datePublished: post.datePublished,
        author: post.author || 'Pocket Portfolio Team',
        tags: post.tags || [],
        isInternal: false
      }));
      
      // Smart balancing: ensure at least 1 from each platform if available
      const allArticles = [...ppArticles, ...devToArticles, ...coderLegionArticles];
      const platformCounts = {
        'pocket-portfolio': 0,
        'dev.to': 0,
        'coderlegion': 0
      };
      
      const balanced: CombinedArticle[] = [];
      const targetCount = 6;
      
      // First pass: ensure at least 1 from each platform
      for (const article of allArticles) {
        if (balanced.length >= targetCount) break;
        
        const platform = article.platform;
        if (platformCounts[platform] === 0) {
          balanced.push(article);
          platformCounts[platform]++;
        }
      }
      
      // Second pass: fill remaining slots with best posts (sorted by date)
      const remaining = allArticles
        .filter(a => !balanced.find(b => b.url === a.url))
        .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
      
      for (const article of remaining) {
        if (balanced.length >= targetCount) break;
        balanced.push(article);
        platformCounts[article.platform]++;
      }
      
      // Final sort by date (newest first)
      balanced.sort((a, b) => 
        new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
      );
      
      setCombinedArticles(balanced);
    }).catch(() => {
      // Fallback to static featured articles if all APIs fail
      const externalArticles: CombinedArticle[] = featuredArticles.map(article => ({
        ...article,
        platform: article.platform as 'dev.to' | 'coderlegion',
        isInternal: false
      }));
      setCombinedArticles(externalArticles);
    });
  }, []);

  return (
    <>
      {/* Article Structured Data for SEO */}
      {combinedArticles.map((article, index) => (
        <StructuredData
          key={`structured-${index}`}
          type="Article"
          data={{
            headline: article.title,
            description: article.description,
            url: article.isInternal ? `https://www.pocketportfolio.app${article.url}` : article.url,
            datePublished: article.datePublished || new Date().toISOString(),
            dateModified: article.dateModified || article.datePublished || new Date().toISOString(),
            author: {
              '@type': 'Organization',
              name: 'Pocket Portfolio Team'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Pocket Portfolio',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.pocketportfolio.app/brand/pp-wordmark.svg'
              }
            }
          }}
        />
      ))}
    <section 
      className="brand-surface" 
      style={{ 
        padding: '48px 24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(255, 107, 53, 0.02) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ff6b35 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Building in Public
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Join our developer community. Read technical deep-dives, architecture decisions, and devlogs from the Pocket Portfolio team.
          </p>
        </div>

        {/* Articles Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {combinedArticles.length === 0 ? (
            // Loading state - show external articles while fetching
            featuredArticles.map((article, index) => (
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
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>
                  {article.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-muted)', 
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {article.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px',
                  marginTop: 'auto'
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
            ))
          ) : (
            combinedArticles.map((article, index) => {
              const CardComponent = article.isInternal ? Link : 'a';
              const cardProps = article.isInternal 
                ? { href: article.url }
                : { 
                    href: article.url, 
                    target: '_blank', 
                    rel: 'noopener noreferrer' 
                  };

              // Platform-specific styling
              const platformStyles = {
                'dev.to': {
                  badgeBg: 'rgba(59, 73, 223, 0.1)',
                  badgeColor: 'rgb(59, 73, 223)',
                  hoverBorder: 'rgba(59, 73, 223, 0.4)',
                  hoverShadow: 'rgba(59, 73, 223, 0.15)'
                },
                'coderlegion': {
                  badgeBg: 'rgba(139, 92, 246, 0.1)',
                  badgeColor: 'rgb(139, 92, 246)',
                  hoverBorder: 'rgba(139, 92, 246, 0.4)',
                  hoverShadow: 'rgba(139, 92, 246, 0.15)'
                },
                'pocket-portfolio': {
                  badgeBg: 'rgba(245, 158, 11, 0.1)',
                  badgeColor: 'rgb(245, 158, 11)',
                  hoverBorder: 'rgba(245, 158, 11, 0.4)',
                  hoverShadow: 'rgba(245, 158, 11, 0.15)'
                }
              };

              const styles = platformStyles[article.platform];

              return (
                <CardComponent
                  key={index}
                  {...cardProps}
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
                    e.currentTarget.style.boxShadow = `0 8px 24px ${styles.hoverShadow}`;
                    e.currentTarget.style.borderColor = styles.hoverBorder;
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
                      background: styles.badgeBg,
                      color: styles.badgeColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {article.platform === 'dev.to' ? 'DEV.TO' : 
                       article.platform === 'coderlegion' ? 'CODERLEGION' : 
                       'POCKET PORTFOLIO'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-muted)', 
                    marginBottom: '16px',
                    lineHeight: '1.6'
                  }}>
                    {article.description}
                  </p>

                  {/* Tags */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px',
                    marginTop: 'auto'
                  }}>
                    {article.tags.slice(0, 3).map((tag, i) => (
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
                </CardComponent>
              );
            })
          )}
        </div>

        {/* CTA to view more */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a 
              href="https://dev.to/pocketportfolioapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brand-button-primary"
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
              onClick={() => trackBlogPlatformView('pocket-portfolio', 'view_all')}
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
              className="brand-button-secondary"
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
      </div>
    </section>
    </>
  );
}

