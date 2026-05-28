/**
 * Abba Lawal press portrait — speaking photo SSOT (UK Black Business Show).
 * Never use abba-uk-black-business-show-deck.png (layout mockup with IMAGE placeholders).
 */
import fs from 'node:fs';
import path from 'node:path';

const PORTRAIT_CANDIDATES = [
  'abba-uk-black-business-show-1640.jpg',
  'abba-uk-black-business-show-3072.jpg',
  'abba-uk-black-business-show-820.jpg',
  'IMG_9086-original.png',
] as const;

export function resolveAbbaSpeakingPortrait(repoRoot: string): string | null {
  const base = path.join(repoRoot, 'public', 'press', 'abba');
  for (const name of PORTRAIT_CANDIDATES) {
    const p = path.join(base, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}
