import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'JSON API Directory | Pocket Portfolio',
  description: 'Browse all available JSON API endpoints for ticker data. Free API for developers. No login required.',
};

export default function JsonApiDirectoryPage() {
  const allTickers = getAllTickers();
  const sortedTickers = [...allTickers].sort();

  // Group by first letter
  const grouped: Record<string, string[]> = {};
  sortedTickers.forEach(ticker => {
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
        JSON API Directory
      </h1>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '8px',
        fontSize: '16px'
      }}>
        Browse all available JSON API endpoints for ticker data. Free API for developers. No login required.
      </p>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        fontSize: '14px'
      }}>
        {sortedTickers.length.toLocaleString()} tickers available. Access via <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>/api/tickers/{'{symbol}'}/json</code>
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
                    href={`/s/${ticker.toLowerCase()}/json-api`}
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

