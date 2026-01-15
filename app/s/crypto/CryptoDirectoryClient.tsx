'use client';

import { useState } from 'react';
import DirectoryHeroSearch from '@/app/components/DirectoryHeroSearch';
import DirectoryList from '@/app/components/DirectoryList';

interface CryptoDirectoryClientProps {
  cryptos: string[];
}

export default function CryptoDirectoryClient({ cryptos }: CryptoDirectoryClientProps) {
  const [filteredCryptos, setFilteredCryptos] = useState<string[]>(cryptos);

  return (
    <>
      <DirectoryHeroSearch
        headline="Sovereign Crypto Assets"
        placeholder="Search coins (e.g., BTC, ETH, SOL)..."
        allItems={cryptos}
        linkPrefix="/s/"
        onFilter={setFilteredCryptos}
      />
      
      <DirectoryList items={filteredCryptos} linkPrefix="/s/" displayMode="grid" />
    </>
  );
}

