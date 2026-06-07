import { describe, it, expect } from 'vitest';
import {
  parseBriefingBullets,
  stripBriefingMarkdownFences,
} from '../../app/lib/ai/clientBriefingPrompt';

describe('clientBriefingPrompt — production bullet parsing', () => {
  it('strips ```markdown fences and parses real bullets', () => {
    const raw = `\`\`\`markdown
- Portfolio returned +4.2% vs S&P 500 +3.1% over the period.
- NVDA and MSFT drove most of the upside at 38% of gains.
- Beta remains elevated at 1.24 with 42% concentration in tech.
\`\`\``;

    expect(stripBriefingMarkdownFences(raw)).not.toContain('```');
    const bullets = parseBriefingBullets(raw);
    expect(bullets).toHaveLength(3);
    expect(bullets[0]).toContain('Portfolio returned');
    expect(bullets.every((b) => !b.includes('```'))).toBe(true);
  });

  it('never treats fence markers as bullet content', () => {
    const raw = '```markdown\n```';
    const bullets = parseBriefingBullets(raw);
    expect(bullets).toHaveLength(0);
  });

  it('parses plain list without fences', () => {
    const raw = `- Line one about performance.
- Line two about drivers.
- Line three about risk concentration.`;
    expect(parseBriefingBullets(raw)).toEqual([
      'Line one about performance.',
      'Line two about drivers.',
      'Line three about risk concentration.',
    ]);
  });
});
