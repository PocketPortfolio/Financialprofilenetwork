import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse All ETFs | Pocket Portfolio',
  description: 'Browse all Exchange-Traded Funds (ETFs). Find market data, dividend history, and performance metrics.',
};

export default function ETFDirectoryPage() {
  const allTickers = getAllTickers();
  const etfs = allTickers
    .filter(ticker => detectAssetType(ticker.toUpperCase()) === AssetType.ETF)
    .sort();

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px',
      minHeight: '60vh'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        marginBottom: '8px',
        color: 'var(--text)'
      }}>
        Global ETF List
      </h1>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        fontSize: '16px'
      }}>
        {etfs.length.toLocaleString()} ETFs available. Click any ETF to view market data and dividend history.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {etfs.map(ticker => (
          <Link
            key={ticker}
            href={`/s/${ticker.toLowerCase()}`}
            style={{
              padding: '16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              display: 'block',
            }}
          >
            {ticker.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}

