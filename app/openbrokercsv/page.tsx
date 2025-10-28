'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

export default function OpenBrokerCSVPage() {
  return (
    <>
      <SEOHead
        title="OpenBrokerCSV - Standardized Trading Data Format"
        description="OpenBrokerCSV is an open-source CSV format specification for standardizing trading data across brokerage platforms. Import your trades from any broker into Pocket Portfolio with our universal format."
        keywords={[
          'openbrokercsv',
          'csv format',
          'trading data',
          'broker import',
          'portfolio import',
          'standardized format',
          'etoro csv',
          'broker csv',
          'trading history',
          'portfolio data'
        ]}
        canonical="https://www.pocketportfolio.app/openbrokercsv"
        ogType="website"
      />
      
      <StructuredData 
        type="Product" 
        data={{
          name: 'OpenBrokerCSV',
          description: 'Open-source CSV format specification for standardizing trading data across brokerage platforms',
          url: 'https://www.pocketportfolio.app/openbrokercsv',
          image: 'https://www.pocketportfolio.app/brand/og-base.png',
          offers: {
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31'
          },
          aggregateRating: {
            ratingValue: '4.8',
            reviewCount: '25',
            bestRating: '5',
            worstRating: '1'
          }
        }} 
      />

      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid var(--card-border)', 
        background: 'var(--chrome)', 
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo size="medium" showWordmark={true} />
            </Link>
            <Link 
              href="/app" 
              style={{ 
                padding: '8px 16px', 
                background: 'var(--brand)', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '6px', 
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px' }}>
          OpenBrokerCSV
        </h1>
        
        <div style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            What is OpenBrokerCSV?
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
            OpenBrokerCSV is an open-source CSV format specification designed to standardize 
            how trading data is exported and imported across different brokerage platforms.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
            This standardization makes it easier to:
          </p>
          <ul style={{ fontSize: '16px', lineHeight: '1.6', marginLeft: '24px' }}>
            <li>Import trading data into Pocket Portfolio</li>
            <li>Switch between different brokers without data loss</li>
            <li>Maintain consistent portfolio tracking across platforms</li>
            <li>Enable third-party tools to work with standardized data</li>
          </ul>
        </div>

        <div style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            CSV Format Specification
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
            The OpenBrokerCSV format includes the following required columns:
          </p>
          <div style={{ 
            background: 'var(--bg)', 
            border: '1px solid var(--card-border)', 
            borderRadius: '8px', 
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            overflow: 'auto'
          }}>
            <pre>{`Date, Ticker, Type, Currency, Quantity, Price, Commission, Fees
2025-01-15, AAPL, Stock, USD, 10, 175.50, 0, 0
2025-01-14, GOOGL, Stock, USD, 5, 142.30, 0, 0
2025-01-13, MSFT, Stock, USD, 8, 378.20, 0, 0`}</pre>
          </div>
        </div>

        <div style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Supported Brokers
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
            We provide conversion tools for the following brokers:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link 
              href="/static/csv-etoro-to-openbrokercsv" 
              style={{ 
                background: 'var(--bg)', 
                border: '1px solid var(--card-border)', 
                borderRadius: '8px', 
                padding: '16px',
                textDecoration: 'none',
                color: 'var(--text)',
                display: 'block',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>eToro</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Convert eToro CSV to OpenBrokerCSV format</p>
            </Link>
            
            <div style={{ 
              background: 'var(--bg)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              padding: '16px',
              opacity: 0.6
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>More Brokers</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Coming soon: Robinhood, TD Ameritrade, Interactive Brokers</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: '80px', 
        padding: '32px 24px', 
        borderTop: '1px solid var(--card-border)', 
        textAlign: 'center', 
        background: 'var(--chrome)' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            © 2025 Pocket Portfolio — Built with the community.
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}
