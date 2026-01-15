import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import DirectoryClient from './DirectoryClient';

export const metadata: Metadata = {
  title: 'JSON API Directory | Pocket Portfolio',
  description: 'Browse all available JSON API endpoints for ticker data. Free API for developers. No login required.',
};

export default function JsonApiDirectoryPage() {
  const allTickers = getAllTickers();
  const sortedTickers = [...allTickers].sort();

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
      minHeight: '60vh'
    }}>
      <DirectoryClient tickers={sortedTickers} />
    </div>
  );
}

