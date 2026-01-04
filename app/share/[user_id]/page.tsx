/**
 * OPERATION VELOCITY: Sprint 3 - Viral Loop
 * /share/[user_id] - Public, anonymized portfolio view for sharing
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShareButtons from './ShareButtons';

export async function generateMetadata({ params }: { params: Promise<{ user_id: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  // In production, fetch user portfolio data to generate dynamic metadata
  // For now, use generic metadata
  
  return {
    title: `Portfolio Performance | Pocket Portfolio`,
    description: `View anonymized portfolio performance and 1-year chart. Share your investment results.`,
    openGraph: {
      title: `Portfolio Performance | Pocket Portfolio`,
      description: `View anonymized portfolio performance and 1-year chart.`,
      type: 'website',
      url: `https://www.pocketportfolio.app/share/${resolvedParams.user_id}`,
      images: [
        {
          url: `/api/og/portfolio?user_id=${resolvedParams.user_id}`,
          width: 1200,
          height: 630,
          alt: 'Portfolio Performance Chart',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Portfolio Performance | Pocket Portfolio`,
      description: `View anonymized portfolio performance and 1-year chart.`,
      images: [`/api/og/portfolio?user_id=${resolvedParams.user_id}`],
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/share/${resolvedParams.user_id}`,
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ user_id: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const userId = resolvedParams.user_id;
  
  // In production, fetch user portfolio data from database
  // For now, show a placeholder
  
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
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Portfolio Performance
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Anonymized portfolio view shared by a Pocket Portfolio user.
            </p>
            
            {/* Portfolio Chart Placeholder */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '32px',
              height: '400px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                1-Year Performance Chart
                <br />
                (Dynamic chart will be generated here)
              </div>
            </div>
            
            {/* Portfolio Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#16a34a',
                  marginBottom: '8px'
                }}>
                  +15.2%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  1-Year Return
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
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  12
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Positions
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
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  Tech
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Primary Sector
                </div>
              </div>
            </div>
            
            {/* Share Actions */}
            <div style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                Share This Portfolio
              </h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <ShareButtons userId={userId} />
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my portfolio performance on Pocket Portfolio')}&url=${encodeURIComponent(`https://www.pocketportfolio.app/share/${userId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 16px',
                    background: 'var(--accent-warm)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                    display: 'inline-block'
                  }}
                >
                  Share on Twitter
                </a>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div style={{
            background: 'var(--warm-bg)',
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px'
            }}>
              Track Your Own Portfolio
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Import your trades and share your performance with Pocket Portfolio.
            </p>
            <a
              href="/dashboard?utm_source=seo&utm_medium=share_page&utm_campaign=signup"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--accent-warm)',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ISR configuration - 1 day revalidation
export const revalidate = 86400;
