import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { decodePortfolio } from '@/app/lib/share';
import ShareChart from './ShareChart';

export async function generateMetadata({ params }: { params: Promise<{ blob: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  return {
    title: 'Portfolio Allocation | Pocket Portfolio',
    description: 'View anonymized portfolio allocation. Generated locally, no server saw this data.',
    openGraph: {
      title: 'Portfolio Allocation | Pocket Portfolio',
      description: 'Privacy-first portfolio sharing. No login required.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Portfolio Allocation | Pocket Portfolio',
      description: 'Privacy-first portfolio sharing',
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ blob: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const data = decodePortfolio(resolvedParams.blob);
  
  if (!data || !data.positions || data.positions.length === 0) {
    notFound();
  }
  
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
              Portfolio Allocation
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Percent-only view. No dollar amounts shared.
            </p>
            
            {/* Pie Chart */}
            <div style={{ marginBottom: '32px', height: '400px' }}>
              <ShareChart positions={data.positions} />
            </div>
            
            {/* Position List */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {data.positions.map((pos, index) => (
                <div
                  key={pos.ticker}
                  style={{
                    padding: '16px',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: 'var(--text)',
                      fontSize: '16px'
                    }}>
                      {pos.ticker}
                    </span>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'var(--accent-warm)'
                    }}>
                      {pos.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sticky CTA Banner */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--accent-warm)',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginTop: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <p style={{
                  fontWeight: '600',
                  marginBottom: '4px',
                  fontSize: '16px'
                }}>
                  Generated locally by Pocket Portfolio
                </p>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  No server saw this data. Create yours.
                </p>
              </div>
              <a
                href="/dashboard?utm_source=share&utm_medium=viral&utm_campaign=signup"
                style={{
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: 'var(--accent-warm)',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}
              >
                Create Your Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ISR configuration - 1 day revalidation
export const revalidate = 86400;
