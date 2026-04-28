import fs from 'node:fs';
import path from 'node:path';

import { MOAT_CLAIMS, ORG, PERSON_ABBA, POSITIONING, TAGLINE_LONG } from '../lib/canonical-claims';

type Section = {
  title: string;
  body: string;
};

function trimLines(s: string) {
  return s
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trim();
}

function clamp(s: string, maxChars: number) {
  const t = s.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function mdSection({ title, body }: Section) {
  return `## ${title}\n\n${trimLines(body)}\n`;
}

function main() {
  const anchor = 'https://www.pocketportfolio.app/press';
  const linkedinCompany = ORG.sameAs.find((u) => u.includes('linkedin.com/company')) ?? 'https://www.linkedin.com/company/pocket-portfolio-community/';
  const linkedinPersonal = PERSON_ABBA.sameAs.find((u) => u.includes('linkedin.com/in/')) ?? 'https://www.linkedin.com/in/abba-l-0395681b9/';
  const devto = ORG.sameAs.find((u) => u.includes('dev.to')) ?? 'https://dev.to/pocketportfolioapp';
  const coderlegion = ORG.sameAs.find((u) => u.includes('coderlegion.com')) ?? 'https://coderlegion.com/user/Pocket+Portfolio';

  const limitedScope = MOAT_CLAIMS.limitedScopeProcessor;

  const header = trimLines(`
# SOCIAL POST PACK — Phase 3 (SSOT-generated)
**Canonical Anchor:** ${anchor}  
**Tagline (verbatim):** ${POSITIONING.primary}

This file is generated from \`lib/canonical-claims.ts\` to minimize narrative drift.
Do not manually rewrite claims; paste as-is.
`);

  const sections: Section[] = [
    {
      title: 'LinkedIn Personal — About / Featured',
      body: `
**Featured link:** ${anchor}

**About (paste-ready):**
${clamp(
  `${TAGLINE_LONG}\n\n${limitedScope.longForm}\n\nCanonical anchor: ${anchor}`,
  2600,
)}

**Profiles**
- LinkedIn: ${linkedinPersonal}
- GitHub: ${PERSON_ABBA.sameAs.find((u) => u.includes('github.com')) ?? 'https://github.com/PocketPortfolio'}
`,
    },
    {
      title: 'LinkedIn Company — Tagline / About',
      body: `
**Company page:** ${linkedinCompany}

**Tagline (paste-ready):**
${POSITIONING.primary}

**About (paste-ready):**
${clamp(
  `${TAGLINE_LONG}\n\nSovereign substrate: 11 public npm packages for broker ingestion, plus a press-grade canonical claim set for automated due diligence.\n\nCanonical anchor: ${anchor}`,
  2000,
)}
`,
    },
    {
      title: 'X / Twitter — 3-post thread',
      body: `
**Post 1/3**
${clamp(
  `${POSITIONING.primary}\n\nWe’re building local-first wealth-tech ingestion: import broker data without warehousing PII.\n\n${anchor}`,
  280,
)}

**Post 2/3**
${clamp(
  `Moat claim (verbatim): ${limitedScope.phrase}.\n\n${limitedScope.longForm}`,
  280,
)}

**Post 3/3**
${clamp(
  `Receipts > vibes: canonical claims + JSON-LD live on /press, and 11 npm packages now point to the same anchor.\n\n${anchor}`,
  280,
)}
`,
    },
    {
      title: 'CoderLegion — Bio / External link',
      body: `
**Profile:** ${coderlegion}

**External link:** ${anchor}

**Bio (paste-ready):**
${clamp(
  `${POSITIONING.primary} ${POSITIONING.secondary}\n\n${limitedScope.longForm}\n\n${anchor}`,
  600,
)}
`,
    },
    {
      title: 'dev.to — Bio / Website',
      body: `
**Profile:** ${devto}

**Website:** ${anchor}

**Bio (paste-ready):**
${clamp(`${POSITIONING.primary} ${limitedScope.longForm} ${anchor}`, 600)}
`,
    },
  ];

  const out = `${header}\n\n${sections.map(mdSection).join('\n')}`;

  const outPath = path.join(process.cwd(), 'docs', 'seed', 'phase3', 'SOCIAL-POST-PACK.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

main();

