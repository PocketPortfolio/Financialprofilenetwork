import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import CryptoDirectoryClient from './CryptoDirectoryClient';

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
      padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
      minHeight: '60vh'
    }}>
      <CryptoDirectoryClient cryptos={cryptos} />
    </div>
  );
}

