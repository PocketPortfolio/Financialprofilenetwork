import MobileHeader from '@/app/components/nav/MobileHeader';
import ToolFooter from '@/app/components/marketing/ToolFooter';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export default function ImportLayout({
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
      <MobileHeader title="Import Trades" />
      <SEOPageTracker />
      <main
        style={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px var(--space-4)',
          paddingTop: '16px',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </main>
      <ToolFooter />
    </div>
  );
}

