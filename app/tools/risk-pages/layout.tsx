import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Stock Risk Pages - Browse 15,000+ Risk Analysis Tools | Pocket Portfolio',
  description: 'Browse and search 15,000+ stock risk analysis pages. Calculate portfolio risk and Beta score for any ticker. Free tool with no login required.',
  keywords: 'stock risk calculator, portfolio beta, risk analysis, ticker risk pages, volatility calculator',
  openGraph: {
    title: 'Track Stock Risk Pages - Browse 15,000+ Risk Analysis Tools',
    description: 'Browse and search 15,000+ stock risk analysis pages. Calculate portfolio risk and Beta score for any ticker.',
    type: 'website',
    url: 'https://www.pocketportfolio.app/tools/risk-pages',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Stock Risk Pages - Browse 15,000+ Risk Analysis Tools',
    description: 'Browse and search 15,000+ stock risk analysis pages. Calculate portfolio risk and Beta score for any ticker.',
  },
  alternates: {
    canonical: 'https://www.pocketportfolio.app/tools/risk-pages',
  },
};

export default function RiskPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}





