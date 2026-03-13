'use client';

import Link from 'next/link';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export default function CheapestPortfolioTrackerPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the cheapest portfolio tracker with no subscription?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pocket Portfolio offers a free tier with no subscription required — use it forever at no cost. Optional Founders Club from £12/mo or £100/yr adds premium features. Making it the cheapest portfolio tracker with no subscription for the free tier."
        }
      },
      {
        "@type": "Question",
        "name": "Does Pocket Portfolio have a free tier?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Pocket Portfolio has a completely free tier that provides basic portfolio tracking tools with no subscription required. You can track your investments, import CSV files, and view real-time prices without paying anything."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Pocket Portfolio Founders Club?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Pocket Portfolio UK Founder's Club is an optional paid tier from £12/mo or £100/yr (cancel anytime) that includes unlimited API access, Discord priority, advanced analytics, and a permanent Founder badge."
        }
      },
      {
        "@type": "Question",
        "name": "How much does Pocket Portfolio cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pocket Portfolio offers a free tier with no subscription required. Optional UK Founder's Club (£12/mo or £100/yr) adds premium features. Other tiers like Code Supporter start at $50/year."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a monthly subscription for Pocket Portfolio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No subscription is required for the free tier — it is completely free forever. The optional UK Founder's Club is £12/mo or £100/yr. Other annual options start at $50/year."
        }
      },
      {
        "@type": "Question",
        "name": "How does Pocket Portfolio compare to other free portfolio trackers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pocket Portfolio is unique because it's local-first (your data stays on your device), open-source, and the free tier requires no subscription. Unlike other trackers that may sell your data or require cloud storage, Pocket Portfolio prioritizes privacy and data sovereignty."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProductionNavbar />
      <SEOPageTracker />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Hero Section */}
          <header style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 6vw, 60px)'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 'bold',
              lineHeight: '1.1',
              marginBottom: '24px',
              letterSpacing: '-0.03em',
              color: 'var(--text)'
            }}>
              Cheapest Portfolio Tracker with <span style={{ color: 'var(--accent-warm)' }}>No Subscription</span>
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto 32px auto'
            }}>
              Use our <strong>completely free tier</strong> forever — no subscription required. 
              Or optionally upgrade to <strong style={{ color: 'var(--accent-warm)' }}>Founders Club</strong> from £12/mo or £100/yr.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/sponsor"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  border: '2px solid var(--border-warm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                View Pricing →
              </Link>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '2px solid var(--border-warm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-warm)';
                  e.currentTarget.style.color = 'var(--accent-warm)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-warm)';
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Try Free Tier
              </Link>
            </div>
          </header>

          {/* Direct Answer Section */}
          <section style={{
            background: 'var(--surface)',
            border: '2px solid var(--border-warm)',
            borderRadius: '16px',
            padding: 'clamp(24px, 4vw, 40px)',
            marginBottom: 'clamp(32px, 5vw, 48px)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: 'var(--text)'
            }}>
              The Answer: Pocket Portfolio
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              lineHeight: '1.7',
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              <strong style={{ color: 'var(--text)' }}>Pocket Portfolio is the cheapest portfolio tracker with no subscription.</strong> Here's why:
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{
                  color: 'var(--accent-warm)',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)', fontSize: '18px' }}>Free Tier:</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.6' }}>
                    Completely free forever. Track portfolios, import CSVs, view real-time prices. No subscription required.
                  </p>
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{
                  color: 'var(--accent-warm)',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)', fontSize: '18px' }}>Optional Founders Club:</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.6' }}>
                    From £12/mo or £100/yr. Cancel anytime. Includes all premium features, unlimited API access, and priority support.
                  </p>
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{
                  color: 'var(--accent-warm)',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)', fontSize: '18px' }}>Local-First Privacy:</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.6' }}>
                    Your data stays on your device. No cloud storage required. No data sales. True financial sovereignty.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* Comparison Table */}
          <section style={{
            marginBottom: 'clamp(32px, 5vw, 48px)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              color: 'var(--text)'
            }}>
              Pocket Portfolio vs. Other Trackers
            </h2>
            <div style={{
              overflowX: 'auto',
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--border-warm)'
                  }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '12px',
                      color: 'var(--text)',
                      fontWeight: '600'
                    }}>Tracker</th>
                    <th style={{
                      textAlign: 'left',
                      padding: '12px',
                      color: 'var(--text)',
                      fontWeight: '600'
                    }}>Free Tier</th>
                    <th style={{
                      textAlign: 'left',
                      padding: '12px',
                      color: 'var(--text)',
                      fontWeight: '600'
                    }}>Premium option</th>
                    <th style={{
                      textAlign: 'left',
                      padding: '12px',
                      color: 'var(--text)',
                      fontWeight: '600'
                    }}>Monthly Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{
                    borderBottom: '1px solid var(--border-warm)',
                    background: 'rgba(245, 158, 11, 0.05)'
                  }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--accent-warm)' }}>Pocket Portfolio</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✓ Yes</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>£12/mo or £100/yr</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>£0 (free tier)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-warm)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Wealthfolio</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✓ Yes</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✗ No</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>N/A</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-warm)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Getquin</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✓ Yes</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✗ No</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>N/A</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-warm)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Yahoo Finance</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✓ Yes</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✗ No</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>£0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Sharesight</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Limited</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>✗ No</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>$19/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <section style={{
            background: 'var(--surface)',
            border: '2px solid var(--border-warm)',
            borderRadius: '16px',
            padding: 'clamp(24px, 4vw, 40px)',
            marginBottom: 'clamp(32px, 5vw, 48px)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 'bold',
              marginBottom: '32px',
              color: 'var(--text)'
            }}>
              Frequently Asked Questions
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}>
                  What is the cheapest portfolio tracker with no subscription?
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)'
                }}>
                  Pocket Portfolio offers a free tier with no subscription required — use it forever at no cost. Optional Founders Club from £12/mo or £100/yr adds premium features. Making it the cheapest portfolio tracker with no subscription for the free tier.
                </p>
              </div>
              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}>
                  Does Pocket Portfolio have a free tier?
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)'
                }}>
                  Yes, Pocket Portfolio has a completely free tier that provides basic portfolio tracking tools with no subscription required. You can track your investments, import CSV files, and view real-time prices without paying anything.
                </p>
              </div>
              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}>
                  What is the Pocket Portfolio Founders Club?
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)'
                }}>
                  The Pocket Portfolio UK Founder's Club is an optional paid tier from £12/mo or £100/yr (cancel anytime) that includes unlimited API access, white-label portfolio reports, Discord priority, advanced analytics, and a permanent Founder badge.
                </p>
              </div>
              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}>
                  How much does Pocket Portfolio cost?
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)'
                }}>
                  Pocket Portfolio offers a free tier with no subscription required. Optional UK Founder's Club (£12/mo or £100/yr) adds premium features. Other tiers like Code Supporter start at $50/year.
                </p>
              </div>
              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-warm)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}>
                  Is there a monthly subscription for Pocket Portfolio?
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)'
                }}>
                  No subscription is required for the free tier — it is completely free forever. The optional UK Founder's Club is £12/mo or £100/yr. Other annual options start at $50/year.
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}>
                  How does Pocket Portfolio compare to other free portfolio trackers?
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)'
                }}>
                  Pocket Portfolio is unique because it's local-first (your data stays on your device), open-source, and the free tier requires no subscription. Unlike other trackers that may sell your data or require cloud storage, Pocket Portfolio prioritizes privacy and data sovereignty.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section style={{
            textAlign: 'center',
            padding: 'clamp(32px, 5vw, 48px)',
            background: 'linear-gradient(135deg, var(--surface) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '2px solid var(--border-warm)',
            borderRadius: '16px'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              Ready to Get Started?
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Start tracking your portfolio for free (no subscription), or optionally upgrade to Founders Club from £12/mo or £100/yr.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/sponsor"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Founders Club →
              </Link>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '2px solid var(--border-warm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-warm)';
                  e.currentTarget.style.color = 'var(--accent-warm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-warm)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
              >
                Try Free Tier
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

