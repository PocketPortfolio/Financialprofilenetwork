'use client';

import React, { useState } from 'react';
import DirectoryHeroSearch from '@/app/components/DirectoryHeroSearch';
import DirectoryList from '@/app/components/DirectoryList';

interface InsiderTradingDirectoryClientProps {
  initialStocks: string[];
}

export default function InsiderTradingDirectoryClient({ initialStocks }: InsiderTradingDirectoryClientProps) {
  const [filteredStocks, setFilteredStocks] = useState(initialStocks);

  return (
    <>
      <DirectoryHeroSearch
        headline="Insider Trading Data"
        placeholder="Search tickers with insider filings (e.g., NVDA, TSLA)..."
        allItems={initialStocks}
        onFilter={setFilteredStocks}
        linkPrefix="/s/"
        linkSuffix="/insider-trading"
      />
      
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {filteredStocks.length.toLocaleString()} stocks and REITs with insider trading data available.
      </p>
      
      <DirectoryList 
        items={filteredStocks} 
        linkPrefix="/s/" 
        linkSuffix="/insider-trading"
        displayMode="grouped" 
      />
    </>
  );
}

