import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import InsiderTradingDirectoryClient from './InsiderTradingDirectoryClient';

export const metadata: Metadata = {
  title: 'Browse Insider Trading Data A-Z | Pocket Portfolio',
  description: 'Browse all stocks with insider trading data. Track Form 4 filings, executive transactions, and insider ownership changes.',
};

export default function InsiderTradingDirectoryPage() {
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
      <InsiderTradingDirectoryClient initialStocks={stocks} />
    </div>
  );
}

