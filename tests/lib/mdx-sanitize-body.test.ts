import { describe, expect, it } from 'vitest';
import {
  sanitizeMdxBodyAfterFrontmatter,
  stripLeadingDuplicateFrontmatterBlock,
  unwrapLeadingMdxOrMarkdownFence,
} from '@/lib/mdx-sanitize-body';

describe('unwrapLeadingMdxOrMarkdownFence', () => {
  it('removes outer ```mdx fence with nested code blocks', () => {
    const body = [
      '```mdx',
      '---',
      'title: "Dup"',
      '---',
      '',
      '# Hello',
      '',
      '```bash',
      'npm i',
      '```',
      '',
      '```',
    ].join('\n');

    const out = unwrapLeadingMdxOrMarkdownFence(body);
    expect(out).toContain('# Hello');
    expect(out).toContain('```bash');
    expect(out).not.toMatch(/^```mdx/m);
  });

  it('does not strip when body starts with a normal heading', () => {
    const body = '# Title\n\n```bash\nx\n```\n';
    expect(unwrapLeadingMdxOrMarkdownFence(body)).toBe(body);
  });
});

describe('stripLeadingDuplicateFrontmatterBlock', () => {
  it('removes leading --- yaml --- from body', () => {
    const inner = '---\ntitle: x\n---\n\nBody here';
    expect(stripLeadingDuplicateFrontmatterBlock(inner).trim()).toBe('Body here');
  });
});

describe('sanitizeMdxBodyAfterFrontmatter', () => {
  it('unwraps and strips duplicate frontmatter (JWT-style artifact)', () => {
    const body = [
      '```mdx',
      '---',
      'title: "T"',
      '---',
      '',
      '## Problem',
      '',
      '```js',
      '1',
      '```',
      '',
      '```',
    ].join('\n');

    const out = sanitizeMdxBodyAfterFrontmatter(body);
    expect(out.trim()).toBe('## Problem\n\n```js\n1\n```');
  });
});
