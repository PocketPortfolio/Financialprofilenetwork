import type { Metadata } from 'next';
import DashboardClientLayout from '../dashboard/DashboardClientLayout';

export const metadata: Metadata = {
  title: 'Live Market Data | Pocket Portfolio',
  description:
    'Real-time stock and cryptocurrency prices with live market data. Track AAPL, GOOGL, MSFT, TSLA, NVDA, BTC, ETH and more.',
  robots: { index: true, follow: true },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
