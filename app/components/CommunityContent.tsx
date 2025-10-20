'use client';

import React from 'react';

interface Article {
  title: string;
  description: string;
  url: string;
  platform: 'dev.to' | 'coderlegion';
  date: string;
  tags: string[];
}

const featuredArticles: Article[] = [
  {
    title: "Price Pipeline Health — transparency you can see (and trust)",
    description: "Learn how Pocket Portfolio built a transparent price pipeline with real-time health monitoring and fallback providers.",
    url: "https://dev.to/pocketportfolioapp/price-pipeline-health-transparency-you-can-see-and-trust",
    platform: "dev.to",
    date: "2024-10",
    tags: ["infrastructure", "transparency", "real-time"]
  },
  {
    title: "Devlog: Building the Price Pipeline Health Card",
    description: "A deep dive into designing and implementing the Price Pipeline Health Card so users know when data is fresh or on fallback.",
    url: "https://dev.to/pocketportfolioapp/devlog-building-the-price-pipeline-health-card",
    platform: "dev.to",
    date: "2024-10",
    tags: ["devlog", "ui/ux", "monitoring"]
  },
  {
    title: "Designing a 'Never-0.00' Price Pipeline in the Real World",
    description: "Exploring the architectural decisions behind a resilient price pipeline that never shows $0.00 to users.",
    url: "https://dev.to/pocketportfolioapp/designing-a-never-0-00-price-pipeline",
    platform: "dev.to",
    date: "2024-10",
    tags: ["architecture", "reliability", "design"]
  },
  {
    title: "Today's ship: Mock-Trade Lab, 5-min CSV Import, and bulletproof Price Fallbacks",
    description: "Shipping updates including the Mock-Trade Lab for testing strategies, faster CSV imports, and resilient price fallbacks.",
    url: "https://coderlegion.com/5738/todays-ship-mock-trade-lab-csv-import-price-fallbacks",
    platform: "coderlegion",
    date: "2024-10",
    tags: ["features", "csv", "testing"]
  },
  {
    title: "DISCUSS: The 'Never 0.00' Challenge — design a resilient price pipeline",
    description: "Community discussion on designing a resilient client-to-edge price pipeline that never fails users.",
    url: "https://coderlegion.com/5738/discuss-never-0-00-challenge",
    platform: "coderlegion",
    date: "2024-10",
    tags: ["discussion", "community", "architecture"]
  }
];

export default function CommunityContent() {
  return (
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
          {featuredArticles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
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

        {/* CTA to view more */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a 
              href="https://dev.to/pocketportfolioapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brand-button-primary"
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
            <a 
              href="https://coderlegion.com/5738/welcome-to-coderlegion-22s" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brand-button-secondary"
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
  );
}

