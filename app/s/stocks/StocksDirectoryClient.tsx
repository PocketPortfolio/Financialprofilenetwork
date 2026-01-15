'use client';

import { useState } from 'react';
import DirectoryHeroSearch from '@/app/components/DirectoryHeroSearch';
import DirectoryList from '@/app/components/DirectoryList';

interface StocksDirectoryClientProps {
  stocks: string[];
}

export default function StocksDirectoryClient({ stocks }: StocksDirectoryClientProps) {
  const [filteredStocks, setFilteredStocks] = useState<string[]>(stocks);

  return (
    <>
      <DirectoryHeroSearch
        headline="Explore 48,000+ Public Companies"
        placeholder="Search tickers (e.g., NVDA, TSLA) or companies..."
        allItems={stocks}
        linkPrefix="/s/"
        onFilter={setFilteredStocks}
      />
      
      <DirectoryList items={filteredStocks} linkPrefix="/s/" displayMode="grouped" />
    </>
  );
}

