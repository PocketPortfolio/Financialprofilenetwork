'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuotes } from '../hooks/useDataFetching';
import SEOHead from '../components/SEOHead';
import Header from '../components/Header';

interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  description?: string;
}

export default function NewsPage() {
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const { data: quotesData } = useQuotes(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setNews(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNews();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <SEOHead 
          title="News - Pocket Portfolio"
          description="Stay updated with the latest financial news and market insights"
        />
        <Header />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to view news</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Stay updated with the latest financial news and market insights
            </p>
            <button
              onClick={signInWithGoogle}
              style={{
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <SEOHead 
        title="News - Pocket Portfolio"
        description="Stay updated with the latest financial news and market insights"
      />
      <Header />
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Financial News
          </h1>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '18px'
          }}>
            Stay updated with the latest market news and insights
          </p>
        </div>

        {loading ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
            <p>Loading latest news...</p>
          </div>
        ) : error ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Error loading news</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : news.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No news available</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Check back later for the latest financial news
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {news.map((article, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => window.open(article.url, '_blank')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: 0,
                    color: 'var(--text)',
                    lineHeight: '1.4'
                  }}>
                    {article.title}
                  </h3>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                    marginLeft: '16px'
                  }}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                
                {article.description && (
                  <p style={{ 
                    color: 'var(--muted)', 
                    fontSize: '14px',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5'
                  }}>
                    {article.description}
                  </p>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--muted)'
                }}>
                  <span>{article.source}</span>
                  <span style={{ color: 'var(--accent-warm)' }}>Read more →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
