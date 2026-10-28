import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../..');

describe('Open landing proof video deploy gate', () => {
  it('keeps enterprise GTM MP4s on disk for public/', () => {
    for (const rel of [
      'public/marketing/open-landing-enterprise-gtm-1080.mp4',
      'public/marketing/open-landing-enterprise-gtm-4k.mp4',
      'public/marketing/open-landing-enterprise-gtm-poster.jpg',
    ]) {
      const abs = path.join(root, rel);
      expect(fs.existsSync(abs), rel).toBe(true);
      expect(fs.statSync(abs).size).toBeGreaterThan(1024);
    }
  });

  it('re-includes public MP4s after blanket *.mp4 in .vercelignore', () => {
    const text = fs.readFileSync(path.join(root, '.vercelignore'), 'utf8');
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.replace(/#.*$/, '').trim())
      .filter(Boolean);

    expect(lines).toContain('*.mp4');
    expect(
      lines.some((l) => l === '!public/**/*.mp4' || l === '!public/marketing/**/*.mp4'),
    ).toBe(true);
  });

  it('OPEN_LANDING_VIDEO SSOT points at marketing enterprise GTM assets', () => {
    const claims = fs.readFileSync(path.join(root, 'lib/canonical-claims.ts'), 'utf8');
    expect(claims).toContain('open-landing-enterprise-gtm-1080.mp4');
    expect(claims).toContain('open-landing-enterprise-gtm-4k.mp4');
    expect(claims).toContain('open-landing-enterprise-gtm-poster.jpg');
  });
});
