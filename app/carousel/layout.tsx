import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sovereign AI Carousel — Pocket Portfolio',
  description: '6-slide LinkedIn carousel export. Sovereign AI Imperative.',
  robots: 'noindex, nofollow',
};

export default function CarouselLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen carousel-export-root"
      style={{
        background: '#111827',
        color: '#F3F4F6',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: [
            /* Force dark branding and backgrounds in print (no theme dependency) */
            '.carousel-export-root, .carousel-export-root * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
            '@media print {',
            '  body { background: #111827 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
            '  .carousel-slide { page-break-after: always; page-break-inside: avoid; }',
            '  .carousel-slide:last-child { page-break-after: auto; }',
            '  @page { size: 1080px 1350px; margin: 0; }',
            '}',
          ].join(' '),
        }}
      />
      {children}
    </div>
  );
}
