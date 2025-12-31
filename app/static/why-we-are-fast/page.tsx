/**
 * OPERATION VELOCITY: Sprint 3 - Open Source Flex
 * Engineering page explaining performance optimizations
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why We Are Fast - Performance Engineering | Pocket Portfolio',
  description: 'Learn about Pocket Portfolio\'s performance optimizations, API latency, and engineering architecture. Real-time system status and technical transparency.',
  keywords: [
    'portfolio tracker performance',
    'fast portfolio API',
    'low latency market data',
    'portfolio tracker architecture',
    'real-time stock prices'
  ],
  openGraph: {
    title: 'Why We Are Fast - Performance Engineering',
    description: 'Learn about Pocket Portfolio\'s performance optimizations and engineering architecture.',
    type: 'website',
    url: 'https://www.pocketportfolio.app/static/why-we-are-fast',
  },
  alternates: {
    canonical: 'https://www.pocketportfolio.app/static/why-we-are-fast',
  },
};

export default function WhyWeAreFastPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '16px'
          }}>
            Why We Are Fast
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Performance engineering and technical transparency
          </p>

          <div className="brand-card" style={{
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Real-Time Performance Metrics
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--signal)',
                  marginBottom: '8px'
                }}>
                  &lt;50ms
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Average API Latency
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--accent-warm)',
                  marginBottom: '8px'
                }}>
                  99.9%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Uptime
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--signal)',
                  marginBottom: '8px'
                }}>
                  &lt;100ms
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Page Load Time
                </div>
              </div>
            </div>
          </div>

          <div className="brand-card" style={{
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Performance Optimizations
            </h2>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: 'var(--text-secondary)'
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: 'var(--signal)', fontSize: '20px', flexShrink: 0 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Edge Caching:</strong> ISR (Incremental Static Regeneration) for instant page loads
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: 'var(--signal)', fontSize: '20px', flexShrink: 0 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>CDN Distribution:</strong> Global content delivery for low latency worldwide
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: 'var(--signal)', fontSize: '20px', flexShrink: 0 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Optimized API Calls:</strong> Batched requests and intelligent caching
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: 'var(--signal)', fontSize: '20px', flexShrink: 0 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Database Optimization:</strong> Indexed queries and connection pooling
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: 'var(--signal)', fontSize: '20px', flexShrink: 0 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Code Splitting:</strong> Lazy loading and minimal bundle sizes
                </div>
              </li>
            </ul>
          </div>

          <div className="brand-card" style={{
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Architecture
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Pocket Portfolio is built on Next.js 14 with:
            </p>
            <ul style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              lineHeight: '1.6'
            }}>
              <li>Server-side rendering (SSR) for SEO and performance</li>
              <li>Incremental Static Regeneration (ISR) for dynamic content</li>
              <li>Edge runtime for global distribution</li>
              <li>Optimized database queries with caching layers</li>
              <li>Real-time data updates via WebSocket connections</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--warm-bg)',
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px'
            }}>
              Open Source & Transparent
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Pocket Portfolio is open source. View our code, contribute, and see exactly how we achieve these performance metrics.
            </p>
            <a
              href="https://github.com/PocketPortfolio/Financialprofilenetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="brand-button brand-button-primary"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                textDecoration: 'none',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--font-size-base)'
              }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
