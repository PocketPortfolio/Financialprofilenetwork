import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import { OPEN_LEARN_GLOSSARY_SLUGS, type OpenLearnGlossarySlug } from '@/lib/surface-host';

/** Slugs with dedicated metadata wrappers under app/open/learn/<slug>/ */
const DEDICATED_OPEN_WRAPPERS = new Set([
  'sovereign-stack',
  'sovereign-finance',
  'local-first',
  'vendor-lock-in',
]);

const DYNAMIC_SLUGS = OPEN_LEARN_GLOSSARY_SLUGS.filter(
  (slug) => !DEDICATED_OPEN_WRAPPERS.has(slug),
) as OpenLearnGlossarySlug[];

async function loadLearnPage(slug: OpenLearnGlossarySlug): Promise<ComponentType> {
  switch (slug) {
    case 'portfolio-beta':
      return (await import('../../../learn/portfolio-beta/page')).default;
    case 'sector-drift':
      return (await import('../../../learn/sector-drift/page')).default;
    case 'fee-drag':
      return (await import('../../../learn/fee-drag/page')).default;
    case 'realised-vs-unrealised':
      return (await import('../../../learn/realised-vs-unrealised/page')).default;
    case 'dollar-cost-averaging':
      return (await import('../../../learn/dollar-cost-averaging/page')).default;
    case 'json-finance':
      return (await import('../../../learn/json-finance/page')).default;
    default:
      notFound();
  }
}

export function generateStaticParams() {
  return DYNAMIC_SLUGS.map((slug) => ({ slug }));
}

export default async function OpenLearnGlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(DYNAMIC_SLUGS as readonly string[]).includes(slug)) {
    notFound();
  }
  const Page = await loadLearnPage(slug as OpenLearnGlossarySlug);
  return <Page />;
}
