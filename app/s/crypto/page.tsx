import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse All Cryptocurrencies | Pocket Portfolio',
  description: 'Browse all cryptocurrencies. Find market data and price history for Bitcoin, Ethereum, and more.',
};

export default function CryptoDirectoryPage() {
  const allTickers = getAllTickers();
  const cryptos = allTickers
    .filter(ticker => detectAssetType(ticker.toUpperCase()) === AssetType.CRYPTO)
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
        Browse Cryptocurrencies
      </h1>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        fontSize: '16px'
      }}>
        {cryptos.length.toLocaleString()} cryptocurrencies available.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {cryptos.map(ticker => (
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

