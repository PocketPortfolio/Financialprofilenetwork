import { describe, expect, it } from 'vitest';
import { resolveSponsorPersonaTab } from '@/app/components/sponsor/SponsorDeck';

describe('resolveSponsorPersonaTab', () => {
  it('defaults unknown tiers to null (caller uses investors)', () => {
    expect(resolveSponsorPersonaTab(null)).toBeNull();
    expect(resolveSponsorPersonaTab('')).toBeNull();
    expect(resolveSponsorPersonaTab('unknown')).toBeNull();
  });

  it('maps legacy tier deep links to persona panes', () => {
    expect(resolveSponsorPersonaTab('founder')).toBe('investors');
    expect(resolveSponsorPersonaTab('code-supporter')).toBe('developers');
    expect(resolveSponsorPersonaTab('developer-utility')).toBe('developers');
    expect(resolveSponsorPersonaTab('corporate')).toBe('institutions');
  });
});
