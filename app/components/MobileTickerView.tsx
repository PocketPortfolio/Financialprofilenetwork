import React from 'react';
import SocialShare from './viral/SocialShare';
import TickerJsonData from './TickerJsonData';
import TickerStockInfo from './TickerStockInfo';
import TickerThickContent from './TickerThickContent';
import CompanyLogo from './CompanyLogo';
import TickerCsvDownload from './TickerCsvDownload';

interface MobileTickerViewProps {
  normalizedSymbol: string;
  metadata: any;
  content: any;
  faqStructuredData: any;
  initialQuoteData: any;
}

export default function MobileTickerView({
  normalizedSymbol,
  metadata,
  content,
  faqStructuredData,
  initialQuoteData
}: MobileTickerViewProps) {
  return (
    <div style={{
        background: 'var(--bg)',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 16px'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Company Logo */}
              <CompanyLogo 
                key={normalizedSymbol}
                symbol={normalizedSymbol}
                metadata={metadata}
                name={metadata?.name || normalizedSymbol}
                size={64}
              />
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h1 style={{
                  fontSize: '30px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '8px',
                  lineHeight: '1.2'
                }}>
                  {content.h1}
                </h1>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>
                  {content.description}
                </p>
              </div>
              
              <div style={{ flexShrink: 0 }}>
                <SocialShare
                  title={content.title}
                  description={content.description}
                  url={`https://www.pocketportfolio.app/s/${normalizedSymbol.toLowerCase()}`}
                  context="ticker_page"
                  platforms={['twitter', 'linkedin', 'facebook', 'copy']}
                  hashtags={[normalizedSymbol, 'StockAnalysis', 'PortfolioTracker']}
                />
              </div>
            </div>
          </div>

          {/* Product Hunt Badge */}
          <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '500px',
            margin: '0 auto 24px',
            background: 'var(--card)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <img 
                alt="Pocket Portfolio" 
                src="https://ph-files.imgix.net/22f9f173-77d7-4560-90cd-8a059d3cc612.svg?auto=format&fit=crop&w=80&h=80" 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
              <div style={{
                flex: '1 1 0%',
                minWidth: 0
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Pocket Portfolio
                </h3>
                <p style={{
                  margin: '4px 0px 0px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  The Local-First Investment Tracker. Stop paying monthly fees
                </p>
              </div>
            </div>
            <a 
              href="https://www.producthunt.com/products/pocket-portfolio?embed=true&utm_source=embed&utm_medium=post_embed" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '12px',
                padding: '8px 16px',
                background: 'rgb(255, 97, 84)',
                color: 'rgb(255, 255, 255)',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Check it out on Product Hunt →
            </a>
          </div>

          {/* 🚨 THICK CONTENT LAYERS */}
          <TickerThickContent
            symbol={normalizedSymbol}
            name={metadata?.name || `${normalizedSymbol} Inc.`}
            price={initialQuoteData?.price ?? null}
            changePercent={initialQuoteData?.changePct ?? null}
            peRatio={metadata?.peRatio}
            assetType={
              normalizedSymbol.includes('USD') || 
              normalizedSymbol.includes('BTC') || 
              normalizedSymbol.includes('ETH') ||
              metadata?.exchange?.toLowerCase().includes('crypto') ||
              metadata?.sector?.toLowerCase() === 'cryptocurrency'
                ? 'CRYPTO' 
                : 'STOCK'
            }
          />

          {/* CSV Download Section - Above the fold */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '12px'
            }}>
              Download {normalizedSymbol} Historical Data
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Export {normalizedSymbol} historical price, volume, and dividend data in CSV format. 
              Compatible with Excel, Google Sheets, and all data analysis tools.
            </p>
            <TickerCsvDownload symbol={normalizedSymbol} name={metadata?.name} />
          </div>

          {/* JSON Data Section */}
          {metadata && (
            <TickerJsonData
              symbol={normalizedSymbol}
              name={metadata.name}
              exchange={metadata.exchange}
              sector={metadata.sector}
            />
          )}

          {/* Stock Information Card */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text)',
                margin: 0
              }}>
                {content.h2[0]}
              </h2>
              <span style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                {metadata.exchange} • {metadata.sector || 'General'}
              </span>
            </div>
            
            <TickerStockInfo symbol={normalizedSymbol} initialData={initialQuoteData ? {
              price: initialQuoteData.price ?? null,
              change: initialQuoteData.change ?? null,
              changePct: initialQuoteData.changePct ?? null,
              currency: initialQuoteData.currency || 'USD'
            } : null} />
          </div>

          {/* Content Body */}
          <div 
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              color: 'var(--text)',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{ __html: content.body }}
          />

          {/* Portfolio Integration */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              {content.h2[1]}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Import {normalizedSymbol} positions from broker CSVs or export {normalizedSymbol} historical data to JSON using Pocket Portfolio's free portfolio integration platform.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <a
                href={content.cta.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'var(--accent-warm)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  alignSelf: 'flex-start'
                }}
              >
                {content.cta.text}
              </a>
              <a
                href="/import"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'var(--surface-elevated)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  alignSelf: 'flex-start'
                }}
              >
                Import Trades
              </a>
            </div>
          </div>

          {/* Internal Links */}
          {content.internalLinks.length > 0 && (
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                Related Content
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {content.internalLinks.slice(0, 8).map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    style={{
                      color: 'var(--accent-warm)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      transition: 'color 0.2s'
                    }}
                  >
                    → {link.anchor}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                Free Portfolio Tracking
              </h3>
              <ul style={{
                listStyleType: 'disc',
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                lineHeight: '1.6'
              }}>
                <li>Track {normalizedSymbol} performance</li>
                <li>Real-time price updates</li>
                <li>Portfolio analytics</li>
                <li>No signup required</li>
              </ul>
            </div>
            
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                Open Source
              </h3>
              <ul style={{
                listStyleType: 'disc',
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                lineHeight: '1.6'
              }}>
                <li>Community-driven</li>
                <li>Privacy-first</li>
                <li>Always ad-free</li>
                <li>Transparent code</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}
