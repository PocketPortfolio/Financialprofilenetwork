import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'AI in Wealth Management Without Warehousing Client Ledgers',
  description:
    'How wealth platforms add generative AI over portfolio data without duplicating client ledgers into a vendor vault — custody, bounded context, and diligence path.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/ai-in-wealth-management' },
  openGraph: {
    title: 'AI in Wealth Management Without a Client Data Warehouse | Open Portfolio',
    description:
      'Generative use cases plus custody requirements — edge ingestion to bounded inference.',
    url: 'https://www.openportfolio.co.uk/learn/ai-in-wealth-management',
    type: 'article',
  },
};

export default function AiInWealthManagementPage() {
  return (
    <SovereignPillarArticle
      articleSlug="ai-in-wealth-management"
      breadcrumbLabel="AI in Wealth Management"
      title="AI in Wealth Management Without Warehousing Client Ledgers"
      subtitle="Generative assistants for wealth platforms — without turning every client ledger into a third-party vault."
      body={[
        'Wealth-tech buyers do not ask “can we add a chatbot?” They ask whether generative AI can sit on portfolio and CRM context without creating a second warehouse of client ledgers. That is the data chasm: useful models want context; regulated operators cannot casually duplicate PII into a vendor cloud.',
        'Open Portfolio’s answer is a BYOC inference boundary. Broker exports and approved aggregates are normalized at the edge; the enterprise keeps IdP and storage; inference receives a bounded, request-scoped context — not an open-ended retention of raw financial DNA. Pocket Portfolio is the live harness proving adapters under CSV chaos, not Open’s default enterprise store.',
        'CTO and CISO diligence should separate three questions: (1) what is ingested and where, (2) what crosses the inference hop, and (3) what is retained after the response. Architecture pages and design-partner briefs exist so those answers are inspectable — not promised as certification theatre.',
        'Use this pillar when evaluating generative use cases for portfolio commentary, exception triage, or operator assistants. Pair it with DORA / EU AI Act framing and the edge-vs-warehouse comparison before booking a diligence call.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
      procurementFaqIndices={[0, 1, 5]}
      aeo={{
        definition:
          'AI in wealth management without warehousing means running generative models over bounded, edge-assembled portfolio context while the buyer keeps IdP and approved storage — not mirroring client ledgers into a vendor vault.',
        limitation:
          'Does not eliminate DPIA, DORA, or EU AI Act obligations; does not claim SOC 2 certification or zero-leakage guarantees.',
        sourceReceipt: '@pocket-portfolio/importer (MIT) · /architecture · /llms.txt',
        lastReviewed: '2026-09-21',
        comparisonRows: [
          {
            approach: 'BYOC inference boundary (Open Portfolio)',
            fitsWhen: 'Buyer must keep ledger custody and still ship AI assistants',
            failsWhen: 'You need a hosted CRM/warehouse as the system of record',
          },
          {
            approach: 'Central client-ledger warehouse + LLM',
            fitsWhen: 'You already operate a governed data lake and accept vault liability',
            failsWhen: 'Procurement rejects a new PII gravity well for AI alone',
          },
          {
            approach: 'Redaction-only wrappers on raw exports',
            fitsWhen: 'Narrow demos with synthetic data',
            failsWhen: 'Structural exclusion and retention contracts are required',
          },
        ],
        siblingLinks: [
          { href: '/learn/ai-for-financial-advisors', label: 'AI for financial advisors' },
          { href: '/learn/dora-eu-ai-act-wealth', label: 'DORA & EU AI Act' },
          { href: '/learn/edge-ingestion-vs-warehouse', label: 'Edge vs warehouse' },
        ],
      }}
    />
  );
}
