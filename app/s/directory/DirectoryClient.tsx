'use client';

import { useState } from 'react';
import DirectoryHeroSearch from '@/app/components/DirectoryHeroSearch';
import DirectoryList from '@/app/components/DirectoryList';

interface DirectoryClientProps {
  tickers: string[];
}

export default function DirectoryClient({ tickers }: DirectoryClientProps) {
  const [filteredTickers, setFilteredTickers] = useState<string[]>(tickers);

  return (
    <>
      <DirectoryHeroSearch
        headline="JSON Data Index"
        placeholder="Find developer endpoints..."
        allItems={tickers}
        linkPrefix="/s/"
        linkSuffix="/json-api"
        onFilter={setFilteredTickers}
      />
      
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {tickers.length.toLocaleString()} tickers available. Access via <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>/api/tickers/{'{symbol}'}/json</code>
      </p>
      
      <DirectoryList items={filteredTickers} linkPrefix="/s/" linkSuffix="/json-api" displayMode="grouped" />
    </>
  );
}

