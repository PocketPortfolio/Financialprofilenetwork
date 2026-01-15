/**
 * OPERATION VELOCITY: Data Intent Expansion
 * /s/[symbol]/insider-trading - Target: Active traders and analysts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTickerMetadata, getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType } from '@/app/lib/portfolio/sectorClassification';
import { AssetType } from '@/app/lib/portfolio/sectorClassification';
import { getInsiderData } from '@/app/lib/api/insider';
import Link from 'next/link';


// Generate static params for all tickers
export async function generateStaticParams() {
  const allTickers = getAllTickers();
  return allTickers.slice(0, 500).map((symbol) => ({
    symbol: symbol.toLowerCase().replace(/-/g, ''),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();
  const metadata = await getTickerMetadata(symbol);
  
  if (!metadata) {
    return {
      title: `${symbol} Insider Trading - Form 4 Filings & Transactions | Pocket Portfolio`,
      description: `Track ${symbol} insider trading activity including Form 4 filings, executive transactions, and insider ownership changes.`,
    };
  }

  return {
    title: `${metadata.name} (${symbol}) Insider Trading - Form 4 Filings & Transactions | Pocket Portfolio`,
    description: `Track ${metadata.name} (${symbol}) insider trading activity including Form 4 filings, executive transactions, insider ownership changes, and transaction types.`,
    keywords: [
      `${symbol} insider trading`,
      `${symbol} Form 4`,
      `${symbol} insider transactions`,
      `${symbol} executive trades`,
      `${symbol} insider ownership`,
      `${symbol} SEC filings`
    ],
    openGraph: {
      title: `${metadata.name} (${symbol}) Insider Trading`,
      description: `Track insider trading activity and Form 4 filings for ${symbol}.`,
      type: 'website',
      url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/insider-trading`,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/insider-trading`,
    },
  };
}

// Note: fetchInsiderData is now handled by getInsiderData from @/app/lib/api/insider
// This uses yahoo-finance2 library which properly handles session/crumb validation

export default async function InsiderTradingPage({ params }: { params: Promise<{ symbol: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const normalizedSymbol = resolvedParams.symbol.toUpperCase().replace(/-/g, '');
  const metadata = await getTickerMetadata(normalizedSymbol);
  
  // 🛑 ASSET TYPE GUARD: Check if asset supports insider trading
  const assetType = detectAssetType(normalizedSymbol);
  const hasInsiderData = assetType === AssetType.STOCK || assetType === AssetType.REIT;
  
  // Fetch insider data if asset type supports it (using yahoo-finance2 with proper session handling)
  const insiderDataResult = hasInsiderData 
    ? await getInsiderData(normalizedSymbol) 
    : { valid: false, reason: 'Asset type does not support insider data' };
  
  // For ETFs, Crypto, Bonds, etc. - show explanation
  if (!hasInsiderData) {
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
              fontSize: '30px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              {metadata?.name || normalizedSymbol} Insider Trading
            </h1>
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {normalizedSymbol} is an {assetType === AssetType.ETF ? 'ETF' : assetType.toLowerCase()}, which does not have corporate insider trading data.
              </p>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                Insider trading data (Form 4 filings) is only available for individual stocks and REITs. ETFs, mutual funds, and other pooled investment vehicles do not have corporate insiders.
              </p>
              <div>
                <Link
                  href={`/s/${normalizedSymbol.toLowerCase()}`}
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
                  View {normalizedSymbol} Overview →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!metadata) {
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
              fontSize: '30px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              {normalizedSymbol} Insider Trading
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Track insider trading activity for {normalizedSymbol} including Form 4 filings and executive transactions.
            </p>
          </div>
        </div>
      </div>
    );
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
          <h1 style={{
            fontSize: '30px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '16px'
          }}>
            {metadata.name} ({normalizedSymbol}) Insider Trading
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Track insider trading activity for {metadata.name} ({normalizedSymbol}) including Form 4 filings, 
            executive transactions, insider ownership changes, and transaction types.
          </p>

          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Recent Insider Transactions
            </h2>
            {!insiderDataResult.valid ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ marginBottom: '8px' }}>
                  {insiderDataResult.reason || 'No recent insider trading transactions available for ' + normalizedSymbol + '.'}
                </p>
                {insiderDataResult.reason && insiderDataResult.reason.includes('Asset type') ? null : (
                  <p style={{ fontSize: '14px' }}>
                    Insider trading data may be delayed by 24-48 hours from SEC filings.
                  </p>
                )}
              </div>
            ) : insiderDataResult.transactions && insiderDataResult.transactions.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {insiderDataResult.transactions.map((transaction: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: 'var(--surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          {transaction.filerName || transaction.name || 'Unknown Insider'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}>
                          {transaction.title || transaction.position || 'Insider'}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: transaction.transactionText?.includes('Purchase') || transaction.transactionText?.includes('Buy') 
                            ? '#34d399' 
                            : transaction.transactionText?.includes('Sale') || transaction.transactionText?.includes('Sell')
                            ? '#f87171'
                            : 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          {transaction.transactionText || transaction.transactionCode || 'Transaction'}
                        </div>
                        {transaction.shares && (
                          <div style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                          }}>
                            {new Intl.NumberFormat('en-US').format(transaction.shares)} shares
                          </div>
                        )}
                      </div>
                    </div>
                    {transaction.value && (
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginTop: '8px'
                      }}>
                        Value: ${new Intl.NumberFormat('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }).format(transaction.value)}
                      </div>
                    )}
                    {transaction.startDate && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px'
                      }}>
                        Date: {new Date(transaction.startDate * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--text-secondary)'
              }}>
                <p>No recent insider trading transactions available for {normalizedSymbol}.</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Insider trading data may be delayed by 24-48 hours from SEC filings.
                </p>
              </div>
            )}
          </div>
          
          {/* Insider Holders Section */}
          {insiderDataResult.holders && insiderDataResult.holders.length > 0 && (
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                Major Insider Holders
              </h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {insiderDataResult.holders.map((holder: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: 'var(--surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {holder.name || 'Unknown Holder'}
                      </div>
                      {holder.relation && (
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}>
                          {holder.relation}
                        </div>
                      )}
                    </div>
                    {holder.shares && (
                      <div style={{
                        textAlign: 'right'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--text)'
                        }}>
                          {new Intl.NumberFormat('en-US').format(holder.shares)} shares
                        </div>
                        {holder.value && (
                          <div style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginTop: '4px'
                          }}>
                            ${new Intl.NumberFormat('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            }).format(holder.value)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Transaction Types
            </h2>
            <ul style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              lineHeight: '1.6'
            }}>
              <li>Open Market Purchases</li>
              <li>Open Market Sales</li>
              <li>Option Exercises</li>
              <li>Grants and Awards</li>
              <li>Dispositions</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Why Track Insider Trading?
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              Insider trading activity can provide insights into company performance and executive confidence. 
              Track {normalizedSymbol} insider transactions to make informed investment decisions.
            </p>
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
              marginBottom: '16px'
            }}>
              Monitor Insider Activity
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Sign in to Pocket Portfolio to track insider trading activity for {normalizedSymbol} and other holdings.
            </p>
            <a
              href="/dashboard?utm_source=seo&utm_medium=insider_trading&utm_campaign=signup"
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
              Track Insider Activity
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ISR configuration - 1 hour revalidation (insider data changes frequently)
// Using 0 to force revalidation on every request until cache is stable
export const revalidate = 0; // Force dynamic rendering for now
