import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  OPEN_INSTITUTIONAL_PILLARS,
  OPEN_LEARN_HUB_COPY,
  OPEN_NAV,
  OPEN_URLS,
} from '@/lib/canonical-claims';

describe('Open Learn hub (enterprise gateway)', () => {
  it('defines four institutional pillars as SSOT', () => {
    expect(OPEN_INSTITUTIONAL_PILLARS).toHaveLength(4);
    const slugs = OPEN_INSTITUTIONAL_PILLARS.map((p) => p.slug);
    expect(slugs).toEqual([
      'sovereign-ai-architecture',
      'dora-eu-ai-act-wealth',
      'stateless-edge-ingestion',
      'enterprise-design-partnership',
    ]);
  });

  it('uses institutional hub copy — not Pocket glossary framing', () => {
    expect(OPEN_LEARN_HUB_COPY.title).toContain('Institutional Architecture');
    expect(OPEN_LEARN_HUB_COPY.title.toLowerCase()).not.toContain('glossary');
    expect(OPEN_LEARN_HUB_COPY.ctaPrimaryHref).toBe('/tier1designpartner');
  });

  it('Open nav includes Learn entry point', () => {
    expect(OPEN_NAV.some((item) => item.href === '/learn')).toBe(true);
  });

  it('Open learn page does not re-export Pocket glossary', () => {
    const pagePath = resolve(process.cwd(), 'app/open/learn/page.tsx');
    const source = readFileSync(pagePath, 'utf8');
    expect(source).not.toContain("../../learn/page");
    expect(source).toContain('OpenLearnHub');
  });

  it('pillar URLs match Open canonical learn paths', () => {
    for (const pillar of OPEN_INSTITUTIONAL_PILLARS) {
      expect(pillar.url).toBe(`${OPEN_URLS.learnHub}/${pillar.slug}`);
    }
  });
});
