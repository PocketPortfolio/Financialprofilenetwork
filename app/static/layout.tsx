import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export default function StaticLayout({
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

