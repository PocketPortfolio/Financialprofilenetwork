import { describe, expect, it } from 'vitest';
import {
  NEWSROOM_IMPORT_WEDGES,
  wedgeLinksForCategory,
} from '../../lib/newsroom/conversion-wedges';

describe('newsroom conversion wedges', () => {
  it('maps regulatory lane to advisor report + import', () => {
    const links = wedgeLinksForCategory('REGULATORY COMPLIANCE');
    expect(links).toHaveLength(2);
    expect(links[0].href).toContain('/for/advisors');
    expect(links[0].target).toBe('advisors');
    expect(links[1].href).toContain(NEWSROOM_IMPORT_WEDGES.ghostfolio);
  });

  it('maps wealth-tech lane to ghostfolio + advisors', () => {
    const links = wedgeLinksForCategory('WEALTH-TECH SCALING');
    expect(links.some((l) => l.target === 'import_ghostfolio')).toBe(true);
    expect(links.some((l) => l.target === 'advisors')).toBe(true);
  });

  it('maps market intelligence lane to IBKR + T212 imports', () => {
    const links = wedgeLinksForCategory('MARKET INTELLIGENCE');
    expect(links.some((l) => l.href.includes(NEWSROOM_IMPORT_WEDGES.ibkr))).toBe(true);
    expect(links.some((l) => l.href.includes(NEWSROOM_IMPORT_WEDGES.trading212))).toBe(true);
  });

  it('appends newsroom UTM params on wedge hrefs', () => {
    const [link] = wedgeLinksForCategory('REGULATORY COMPLIANCE');
    expect(link.href).toContain('utm_source=newsroom');
    expect(link.href).toContain('utm_medium=briefing');
  });
});
