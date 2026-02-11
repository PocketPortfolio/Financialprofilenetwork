import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import GlobalFooter from '@/app/components/layout/GlobalFooter';

export default function BookLayout({
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
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <ProductionNavbar />
      <div style={{ flexGrow: 1 }}>{children}</div>
      <GlobalFooter />
    </div>
  );
}
