import { describe, expect, it } from 'vitest';
import {
  buildLlmsFullDocumentation,
  buildLlmsSummaryForHost,
  buildOpenLlmsSummary,
  buildPocketLlmsSummary,
  isOpenPortfolioHost,
} from '@/lib/llms-feed';
import { complianceBadgeForCountry } from '@/app/components/compliance/ComplianceBanner';

describe('llms-feed', () => {
  it('detects Open Portfolio hosts', () => {
    expect(isOpenPortfolioHost('www.openportfolio.co.uk')).toBe(true);
    expect(isOpenPortfolioHost('www.pocketportfolio.app')).toBe(false);
  });

  it('builds host-aware summary feeds', () => {
    const pocket = buildLlmsSummaryForHost('www.pocketportfolio.app');
    const open = buildLlmsSummaryForHost('www.openportfolio.co.uk');
    expect(pocket).toContain('Pocket Portfolio');
    expect(open).toContain('Open Portfolio');
    expect(open).toContain('sovereign-ai-architecture');
  });

  it('includes Wave 1 pillars in pocket and full docs', () => {
    expect(buildPocketLlmsSummary()).toContain('dora-eu-ai-act-wealth');
    expect(buildOpenLlmsSummary()).toContain('stateless-edge-ingestion');
    expect(buildLlmsFullDocumentation()).toContain('stateless-edge-ingestion');
  });
});

describe('complianceBadgeForCountry', () => {
  it('returns UK badge for GB', () => {
    expect(complianceBadgeForCountry('GB').pill).toContain('FCA');
  });

  it('returns EU badge for DE', () => {
    expect(complianceBadgeForCountry('DE').pill).toContain('DORA');
  });

  it('returns US default badge', () => {
    expect(complianceBadgeForCountry('US').pill).toContain('SOC 2');
  });
});
