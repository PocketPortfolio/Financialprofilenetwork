import { describe, expect, it } from 'vitest';
import {
  classifyGscPage,
  classifyGscQuery,
  classifyOpenGscPage,
  clickShareByBucket,
  openPageClickShare,
} from '../../lib/telemetry/classify-gsc-query';

describe('GSC signal vs noise classifier', () => {
  it('labels farm residue queries', () => {
    expect(classifyGscQuery('xinxx')).toBe('farm');
    expect(classifyGscQuery('xvlxx')).toBe('farm');
  });

  it('labels import intent', () => {
    expect(classifyGscQuery('ghostfolio import')).toBe('import');
    expect(classifyGscQuery('trading 212 csv')).toBe('import');
    expect(classifyGscQuery('interactive brokers portfolio')).toBe('import');
  });

  it('labels brand and enterprise', () => {
    expect(classifyGscQuery('pocket portfolio')).toBe('brand');
    expect(classifyGscQuery('sovereign ai wealth')).toBe('enterprise');
    expect(classifyGscQuery('ifa white label report')).toBe('wm_advisor');
  });

  it('classifies pages for click-share mix', () => {
    expect(classifyGscPage('https://www.pocketportfolio.app/s/xinxx')).toBe('farm');
    expect(classifyGscPage('https://www.pocketportfolio.app/import/ghostfolio')).toBe('import');
    expect(classifyGscPage('https://www.pocketportfolio.app/for/advisors')).toBe('wm_advisor');
  });

  it('computes farm click share from classified rows', () => {
    const share = clickShareByBucket([
      { clicks: 90, impressions: 1000, bucket: 'farm' },
      { clicks: 10, impressions: 400, bucket: 'import' },
    ]);
    expect(share.farm.share).toBe(0.9);
    expect(share.import.share).toBe(0.1);
  });

  it('classifies Open blog farm vs B2B pillar pages', () => {
    expect(
      classifyOpenGscPage('https://www.openportfolio.co.uk/blog/how-to-use-redis'),
    ).toBe('blog_farm');
    expect(classifyOpenGscPage('https://www.openportfolio.co.uk/architecture')).toBe('pillar');
    expect(classifyOpenGscPage('https://www.openportfolio.co.uk/learn/local-first')).toBe('pillar');
  });

  it('computes Open blog vs pillar click share', () => {
    const share = openPageClickShare([
      { clicks: 45, bucket: 'blog_farm' },
      { clicks: 6, bucket: 'pillar' },
    ]);
    expect(share.blog_farm.share).toBeCloseTo(0.882, 2);
    expect(share.pillar.share).toBeCloseTo(0.118, 2);
  });
});
