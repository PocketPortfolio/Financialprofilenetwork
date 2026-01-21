import { Metadata } from 'next';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export const metadata: Metadata = {
  title: 'Cheapest Portfolio Tracker with No Subscription | Pocket Portfolio',
  description: 'Pocket Portfolio offers a £100 lifetime deal with no subscription fees. Or use our completely free tier forever. The cheapest portfolio tracker with no monthly subscription.',
  openGraph: {
    title: 'Cheapest Portfolio Tracker with No Subscription - Pocket Portfolio',
    description: '£100 lifetime deal or free forever. No monthly subscription required. Local-first privacy.',
    url: 'https://www.pocketportfolio.app/cheapest-portfolio-tracker-no-subscription',
    siteName: 'Pocket Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheapest Portfolio Tracker with No Subscription',
    description: '£100 lifetime deal or free forever. No monthly subscription.',
  },
};

export default function CheapestPortfolioTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

