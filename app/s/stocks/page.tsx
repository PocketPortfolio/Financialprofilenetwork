import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse All Stocks A-Z | Pocket Portfolio',
  description: 'Browse all stocks alphabetically. Find market data, insider trading, and dividend history for any stock.',
};

export default function StocksDirectoryPage() {
  const allTickers = getAllTickers();
  const stocks = allTickers
    .filter(ticker => {
      const assetType = detectAssetType(ticker.toUpperCase());
      return assetType === AssetType.STOCK || assetType === AssetType.REIT;
    })
    .sort();

  // Group by first letter
  const grouped: Record<string, string[]> = {};
  stocks.forEach(ticker => {
    const firstLetter = ticker[0].toUpperCase();
    if (!grouped[firstLetter]) grouped[firstLetter] = [];
    grouped[firstLetter].push(ticker);
  });

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
        Browse Stocks A-Z
      </h1>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        fontSize: '16px'
      }}>
        {stocks.length.toLocaleString()} stocks available. Click any ticker to view market data, insider trading, and dividend history.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '32px' 
      }}>
        {Object.keys(grouped).sort().map(letter => (
          <div key={letter}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: 'var(--accent-warm)' 
            }}>
              {letter}
            </h2>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              {grouped[letter].map(ticker => (
                <li key={ticker}>
                  <Link
                    href={`/s/${ticker.toLowerCase()}`}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                  >
                    {ticker.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

