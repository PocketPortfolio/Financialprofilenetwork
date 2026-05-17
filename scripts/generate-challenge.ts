/**
 * Design Partnership Challenge — v1 bundle (markdown + PNG assets).
 *
 * Usage:
 *   npm run build:challenge -- --platform=multi
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  buildV1RegulatedVerticalsMarkdown,
  CHALLENGE_V1_CODERLEGION_BODY,
  CHALLENGE_V1_GITHUB_DISCUSSION_BODY,
  CHALLENGE_V1_URLS,
  countCharsNoSpaces,
  countWords,
} from './lib/challenges/design-partnership-v1';
import { writeDesignChallengeV1Assets } from './lib/design-challenge-assets';

type Platform = 'multi';

function parsePlatform(argv: string[]): Platform {
  for (const a of argv) {
    const m = /^--platform=(.+)$/.exec(a);
    if (m) {
      const v = (m[1] || '').toLowerCase();
      if (v === 'multi') return 'multi';
      throw new Error(`Unknown --platform=${m[1]}. Use: multi`);
    }
  }
  return 'multi';
}

const repoRoot = path.resolve(__dirname, '..');
const docsChallenges = path.join(repoRoot, 'docs', 'challenges');
const mdPath = path.join(docsChallenges, 'v1-regulated-verticals.md');
const assetsDir = path.join(docsChallenges, 'v1-assets');

const platform = parsePlatform(process.argv.slice(2));

if (platform === 'multi') {
  fs.mkdirSync(docsChallenges, { recursive: true });
  fs.writeFileSync(mdPath, buildV1RegulatedVerticalsMarkdown(), 'utf8');

  const written = writeDesignChallengeV1Assets(repoRoot, assetsDir);
  const manifest = {
    generatedAt: new Date().toISOString(),
    platform,
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
    assets: written.map((w) => ({
      file: path.relative(repoRoot, w.absolutePath).replace(/\\/g, '/'),
      width: w.width,
      height: w.height,
    })),
    wordCounts: {
      coderLegion: countWords(CHALLENGE_V1_CODERLEGION_BODY),
      githubDiscussionBody: countWords(CHALLENGE_V1_GITHUB_DISCUSSION_BODY),
      totalWords:
        countWords(CHALLENGE_V1_CODERLEGION_BODY) + countWords(CHALLENGE_V1_GITHUB_DISCUSSION_BODY),
      coderLegionCharsNoSpaces: countCharsNoSpaces(CHALLENGE_V1_CODERLEGION_BODY),
      githubCharsNoSpaces: countCharsNoSpaces(CHALLENGE_V1_GITHUB_DISCUSSION_BODY),
    },
    urls: CHALLENGE_V1_URLS,
  };
  fs.writeFileSync(path.join(assetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Wrote ${path.relative(repoRoot, mdPath)}`);
  console.log(`Wrote ${written.length} PNGs + manifest under ${path.relative(repoRoot, assetsDir)}`);
  console.log(
    `Word counts — CoderLegion: ${manifest.wordCounts.coderLegion}, GitHub body: ${manifest.wordCounts.githubDiscussionBody}, total: ${manifest.wordCounts.totalWords}`
  );
}
