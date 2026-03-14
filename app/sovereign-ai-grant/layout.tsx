import type { Metadata } from 'next';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import GlobalFooter from '@/app/components/layout/GlobalFooter';

export const metadata: Metadata = {
  title: 'Sovereign AI Proof-of-Concept — Pocket Portfolio Technical Blueprint',
  description:
    'Proof-of-concept for UK sovereign, local-first AI financial infrastructure. Technical blueprint: three pillars, architecture, and grant alignment.',
  robots: 'noindex, nofollow',
};

export default function SovereignAIGrantLayout({
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
