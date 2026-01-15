import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import StocksDirectoryClient from './StocksDirectoryClient';

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

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
      minHeight: '60vh'
    }}>
      <StocksDirectoryClient stocks={stocks} />
    </div>
  );
}

