import { Metadata } from 'next';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export const metadata: Metadata = {
  title: 'Financial Sovereignty Glossary | Pocket Portfolio',
  description: 'Learn key financial concepts: Portfolio Beta, Sector Drift, Fee Drag, Sovereign Stack, and more. Free educational resources for investors.',
  openGraph: {
    title: 'Financial Sovereignty Glossary - Learn Investment Concepts',
    description: 'Master financial concepts with our comprehensive glossary. Understand Portfolio Beta, Sector Drift, Fee Drag, and the Sovereign Stack.',
    url: 'https://www.pocketportfolio.app/learn',
    siteName: 'Pocket Portfolio',
    type: 'website',
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      <ProductionNavbar />
      <SEOPageTracker />
      <main
        style={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-4)',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </main>
    </div>
  );
}

