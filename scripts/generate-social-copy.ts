import fs from 'node:fs';
import path from 'node:path';

import {
  FOUNDER_CREDENTIALS_ABBA,
  MOAT_CLAIMS,
  ORG,
  PERSON_ABBA,
  POSITIONING,
  TAGLINE_LONG,
} from '../lib/canonical-claims';

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
  const founderHeadline = FOUNDER_CREDENTIALS_ABBA.headline;
  const founderHighlights = FOUNDER_CREDENTIALS_ABBA.highlights.map((h) => `- ${h}`).join('\n');
  const founderLead = clamp(
    `I specialise in architecting scalable AI and data platforms that bridge complex enterprise requirements with user-centric digital products.\n\nRecognition:\n${founderHighlights}`,
    1200,
  );

  const header = trimLines(`
# SOCIAL POST PACK — Phase 3 (SSOT-generated, expert-led)
**Canonical Anchor:** ${anchor}  
**Tagline (verbatim):** ${POSITIONING.primary}

This file is generated from \`lib/canonical-claims.ts\` to minimize narrative drift.
Do not manually rewrite claims; paste as-is.
`);

  const sections: Section[] = [
    {
      title: 'LinkedIn Personal — Headline / About / Featured',
      body: `
**Featured link:** ${anchor}

**Headline (paste-ready):**
${founderHeadline}

**About (paste-ready):**
${clamp(
  `${founderLead}\n\nCurrently, I’m building Pocket Portfolio — ${POSITIONING.primary}\n\n${limitedScope.longForm}\n\nCanonical anchor: ${anchor}`,
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
${POSITIONING.primary} Architected by award-recognised expertise.

**About (paste-ready):**
${clamp(
  `${TAGLINE_LONG}\n\nFounded by ${PERSON_ABBA.name} — ${founderHeadline}.\n\n${limitedScope.longForm}\n\nSovereign substrate: 11 public npm packages for broker ingestion, plus a press-grade canonical claim set for automated due diligence.\n\nCanonical anchor: ${anchor}`,
  2000,
)}
`,
    },
    {
      title: 'X / Twitter — 3-post thread',
      body: `
**Post 1/3**
${clamp(
  `From enterprise-scale AI & data platforms to ${POSITIONING.primary}\n\nI’m ${PERSON_ABBA.name}. We’re redefining wealth-tech ingestion with a privacy-first, local-first mandate.\n\n${anchor}`,
  280,
)}

**Post 2/3**
${clamp(
  `${FOUNDER_CREDENTIALS_ABBA.highlights[1]}\n\nNow applying that same data-scale rigor to fintech ingestion.\n\n${anchor}`,
  280,
)}

**Post 3/3**
${clamp(
  `Why “Sovereign”? ${limitedScope.phrase} by design: parses in-browser, stateless inference, no PII warehousing.\n\n${anchor}`,
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
  `${FOUNDER_CREDENTIALS_ABBA.highlights[3]}\n\nArchitect of ${POSITIONING.primary} ${POSITIONING.secondary}\n\n${limitedScope.longForm}\n\n${anchor}`,
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
${clamp(`${FOUNDER_CREDENTIALS_ABBA.highlights[0]} Building Pocket Portfolio: ${POSITIONING.primary} ${limitedScope.longForm} ${anchor}`, 600)}
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

