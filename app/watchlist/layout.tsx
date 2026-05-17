import type { Metadata } from 'next';
import DashboardClientLayout from '../dashboard/DashboardClientLayout';

export const metadata: Metadata = {
  title: 'Watchlist | Pocket Portfolio',
  robots: { index: false, follow: false, nocache: true },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
