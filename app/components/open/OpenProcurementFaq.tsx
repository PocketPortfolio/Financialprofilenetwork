import { generateFAQPageSchema } from '@/app/lib/blog/aeoSchema';
import { OPEN_AEO_PROCUREMENT_FAQS } from '@/lib/canonical-claims';

type FaqEntry = (typeof OPEN_AEO_PROCUREMENT_FAQS)[number];

type OpenProcurementFaqProps = {
  pageUrl: string;
  /** Subset of SSOT FAQs; defaults to full procurement set. */
  faqs?: readonly FaqEntry[];
  heading?: string;
};

export default function OpenProcurementFaq({
  pageUrl,
  faqs = OPEN_AEO_PROCUREMENT_FAQS,
  heading = 'Procurement & diligence FAQ',
}: OpenProcurementFaqProps) {
  const faqItems = faqs.map((f) => ({ question: f.question, answer: f.answer }));
  const jsonLd = generateFAQPageSchema(faqItems, pageUrl);

  return (
    <section style={{ marginTop: 40, marginBottom: 8 }}>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{heading}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {faqs.map((faq) => (
          <div
            key={faq.question}
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '16px 18px',
              background: 'var(--surface)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.4 }}>
              {faq.question}
            </h3>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
