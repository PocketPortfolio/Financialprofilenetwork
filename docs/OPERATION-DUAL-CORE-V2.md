# Operation Dual-Core v2: Unified Content Engine

## Overview

Operation Dual-Core v2 implements a three-pronged content strategy:

1. **Human Engine**: Repatriate content from Dev.to and CoderLegion "Open-Fintech-Builders" Group to `pocketportfolio.app` (Canonical Strategy)
2. **Community Engine**: Convert CoderLegion "Weekly Rituals" (Ship Friday, Paper Club) into recurring blog franchises
3. **AI Engine**: Autonomous generator with strategic internal linking and "Sovereign" messaging

## Components

### 1. External Content Audit (`scripts/audit-external-content.ts`)

Analyzes three content sources:
- `dev.to/pocketportfolioapp`
- `coderlegion.com/user/Pocket+Portfolio`
- `coderlegion.com/groups/openfi-builders` (CRITICAL)

**Features:**
- Automatic pillar detection (philosophy, technical, market, product)
- Ritual detection (ship-friday, spec-clinic, paper-club)
- Priority scoring (high, medium, low)
- Generates `content/external-audit.json`

**Usage:**
```bash
npm run audit-external-content
```

### 2. Import Engine (`scripts/import-external-content.ts`)

Fetches posts from external sources and transforms them to MDX format.

**Features:**
- Fetches full article content via APIs
- Injects strategic homepage links with anchor text:
  - "Sovereign Financial Tracking"
  - "Google Drive Portfolio Sync"
  - "JSON-based Investment Tracker"
- Adds "Key Takeaways" section with Sovereign Sync messaging
- Injects CTA for Corporate/Founder tiers
- Sets canonical URLs in frontmatter

**Usage:**
```bash
npm run import-external-content
```

**Output:**
- MDX files saved to `content/posts/`
- Includes original date + `updated` field
- Preserves source metadata

### 3. Enhanced AI Generator (`scripts/generate-autonomous-blog.ts`)

Updated with strategic internal linking logic.

**New Features:**
- **Homepage Anchor Links**: Every post links to `/` using strategic anchor text
- **Cross-Pollination**: Contextual links based on keywords:
  - Privacy/data ownership → `/features/privacy`
  - Tech stocks/AAPL → `/stock/aapl`
  - Product pillar → `/features`
  - Market pillar → `/dashboard`
- **Key Takeaways Injection**: Hardcoded Sovereign Sync messaging
- **Ritual Support**: Detects and tags posts by weekly ritual

**Updated Interface:**
```typescript
interface BlogPost {
  // ... existing fields
  type?: 'ai-generated' | 'syndicated' | 'manual';
  source?: 'dev.to' | 'coderlegion_profile' | 'coderlegion_group' | null;
  ritual?: 'ship-friday' | 'spec-clinic' | 'paper-club' | null;
}
```

## Workflow

### Weekly Schedule

- **Monday**: Community Harvest (Import "Ship Friday" / Group Posts)
- **Tuesday**: AI Generation (Topic: Technical/Market)
- **Thursday**: AI Generation (Topic: Philosophy/Sovereignty)

### Immediate Actions

1. **Run Audit:**
   ```bash
   npm run audit-external-content
   ```

2. **Import High-Priority Posts:**
   ```bash
   npm run import-external-content
   ```

3. **Set Canonical URLs** (Manual):
   - CoderLegion: Edit post → Canonical URL → `https://pocketportfolio.app/blog/{slug}`
   - Dev.to: Edit post → Canonical URL → `https://pocketportfolio.app/blog/{slug}`

4. **Update Profile/Group Bios:**
   > "Building the Sovereign Financial Stack. Home of the Open-Fintech-Builders. Turning Google Drive into a Database."

## SEO Strategy

### Authority Bridge

Every blog post now includes:
1. **Homepage Link**: Contextual link to `/` with strategic anchor text
2. **Key Takeaways**: Explicit mention of "Sovereign Sync" and Google Drive database
3. **Cross-Links**: Relevant internal links based on content type

### Ritual Mapping

- **Ship Friday** → Product Pillar (Changelog & Updates)
- **Spec Clinic** → Technical Pillar (Engineering Deep Dives)
- **Paper Club** → Philosophy Pillar (Financial Theory & Crypto)

## Files Created

- `scripts/audit-external-content.ts` - External content audit
- `scripts/import-external-content.ts` - Import and transform external posts
- `docs/OPERATION-DUAL-CORE-V2.md` - This document

## Files Modified

- `scripts/generate-autonomous-blog.ts` - Added strategic linking
- `package.json` - Added npm scripts

## Next Steps

1. ✅ Scripts created
2. ✅ AI generator updated
3. ⏳ Run audit to discover content
4. ⏳ Import high-priority "Stop building fintech with databases" post
5. ⏳ Set canonical URLs on external platforms
6. ⏳ Update CoderLegion profile/group bios

## Notes

- CoderLegion API may require manual content copy-paste for some posts
- Canonical URL setup must be done manually on external platforms
- The audit script includes fallback manual entries for known high-value posts



