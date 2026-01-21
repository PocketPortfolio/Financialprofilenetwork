import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Portfolio Risk Calculator | Pocket Portfolio',
  description: 'Check your portfolio beta and volatility exposure instantly. No login required. Powered by Pocket Portfolio.',
  openGraph: {
    title: 'How risky is your portfolio?',
    description: 'I just checked my Portfolio Beta score on Pocket Portfolio. Check yours for free.',
    url: 'https://www.pocketportfolio.app/tools/risk-calculator',
    siteName: 'Pocket Portfolio',
    type: 'website',
    // images: ['/images/tools/risk-calc-og.png'], // Create this image later
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How risky is your portfolio?',
    description: 'Check your Portfolio Beta score instantly. Free tool - no login required.',
    // images: ['/images/tools/risk-calc-og.png'],
  },
};

export default function RiskCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

