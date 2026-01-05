# Reddit Launch Strategy - Universal CSV Importer

## Launch Plan

### Target Subreddits

1. **r/javascript** (Primary)
2. **r/webdev** (Secondary)
3. **r/opensource** (Cross-post)
4. **r/selfhosted** (If applicable)

### Optimal Posting Times

- **Tuesday-Thursday**: Best engagement
- **9-11 AM EST**: Peak traffic hours
- **Avoid**: Weekends, Monday mornings, Friday afternoons

---

## Post Templates

### r/javascript Post

**Title:**
```
I built a universal CSV parser for 15+ brokers (Robinhood, Fidelity, etc.) - open source
```

**Body:**
```markdown
I've been working on a portfolio tracker and got tired of manually parsing different broker CSV formats. So I built a universal parser that auto-detects and parses 15+ brokers into a normalized format.

**Features:**
- Auto-detects broker from CSV headers (Robinhood, Fidelity, Schwab, eToro, Trading212, etc.)
- Handles different date/number formats (US, UK, EU locales)
- Supports both CSV and Excel files
- Zero server dependencies - all parsing happens client-side
- Full TypeScript support

**Example:**
```typescript
import { parseCSV } from '@pocket-portfolio/importer';

const result = await parseCSV(file, 'en-US');
// Auto-detects broker and returns normalized trades
console.log(result.trades); // [{ date, ticker, type, qty, price, ... }]
```

**GitHub:** [github.com/PocketPortfolio/Financialprofilenetwork](https://github.com/PocketPortfolio/Financialprofilenetwork)

**Try it live:** [pocketportfolio.app](https://www.pocketportfolio.app) - upload your CSV and see it visualized instantly (no signup required)

**npm:** `npm install @pocket-portfolio/importer`

Built this as part of an open-source portfolio tracker. The parser is privacy-first - your data never leaves your device.

Would love feedback on the API design and any brokers you'd like to see added!
```

**Engagement Strategy:**
- Respond to all comments within 1-2 hours
- Answer technical questions thoroughly
- Share code examples if requested
- Thank people for feedback
- Avoid being overly promotional

---

### r/webdev Post

**Title:**
```
Show HN: Parse any broker CSV with one library - TypeScript, zero dependencies for core
```

**Body:**
```markdown
Hey r/webdev! I built a universal CSV parser that handles 15+ different broker formats (Robinhood, Fidelity, Schwab, eToro, etc.) with auto-detection and locale support.

**Why I built this:**
Every broker exports CSV files differently - different column names, date formats, number formats. I needed a unified way to parse them all for a portfolio tracker I'm building.

**Tech Stack:**
- TypeScript
- Client-side parsing (Papa Parse + SheetJS)
- Zero server dependencies
- Auto-detection via pattern matching

**What it does:**
- Auto-detects broker from CSV headers
- Normalizes all formats to a single structure
- Handles US/UK/EU date and number formats
- Supports CSV and Excel files
- Returns structured data with warnings for invalid rows

**Example:**
```typescript
import { parseCSV } from '@pocket-portfolio/importer';

// Just pass a file - it figures out the broker
const result = await parseCSV(file, 'en-US');
// Returns: { broker, trades[], warnings[], meta }
```

**GitHub:** [github.com/PocketPortfolio/Financialprofilenetwork](https://github.com/PocketPortfolio/Financialprofilenetwork)

**Live Demo:** [pocketportfolio.app](https://www.pocketportfolio.app) - try uploading your broker CSV

Open source, MIT licensed. Would love to add more brokers if you have specific formats you need!

**Questions:**
- What brokers are you using?
- Any edge cases I should handle?
- API design feedback?
```

**Engagement Strategy:**
- Focus on technical discussion
- Share implementation details if asked
- Discuss design decisions
- Be helpful and educational

---

### r/opensource Post

**Title:**
```
[Open Source] Universal broker CSV parser - privacy-first, client-side parsing
```

**Body:**
```markdown
I've open-sourced a universal CSV parser for 15+ brokers (Robinhood, Fidelity, Schwab, eToro, Trading212, etc.) that I built for my portfolio tracker.

**Privacy-First Design:**
- All parsing happens client-side
- Your data never leaves your device
- Zero server dependencies
- Perfect for privacy-conscious developers

**Features:**
- Auto-detects broker from CSV headers
- Handles different locales (US, UK, EU)
- Supports CSV and Excel files
- Full TypeScript support
- MIT licensed

**Use Cases:**
- Portfolio trackers
- Tax reporting tools
- Performance analysis
- Any app that needs to import broker data

**GitHub:** [github.com/PocketPortfolio/Financialprofilenetwork](https://github.com/PocketPortfolio/Financialprofilenetwork)

**npm:** `npm install @pocket-portfolio/importer`

**Live Demo:** [pocketportfolio.app](https://www.pocketportfolio.app)

Contributions welcome! Especially looking for:
- Additional broker formats
- Improved detection accuracy
- Better error messages
- Documentation improvements
```

**Engagement Strategy:**
- Emphasize open-source values
- Invite contributions
- Share roadmap
- Discuss community building

---

## Engagement Guidelines

### Do's
- ✅ Respond to comments promptly (within 1-2 hours)
- ✅ Answer technical questions thoroughly
- ✅ Share code examples when helpful
- ✅ Thank people for feedback
- ✅ Be genuine and helpful
- ✅ Follow subreddit rules

### Don'ts
- ❌ Don't be overly promotional
- ❌ Don't spam multiple subreddits at once
- ❌ Don't ignore negative feedback
- ❌ Don't make false claims
- ❌ Don't delete posts if they get downvoted

---

## Success Metrics

### r/javascript
- **Target upvotes:** 50+
- **Target comments:** 20+
- **Target GitHub stars:** +100-200

### r/webdev
- **Target upvotes:** 30+
- **Target comments:** 15+
- **Target GitHub stars:** +50-100

### r/opensource
- **Target upvotes:** 20+
- **Target comments:** 10+
- **Target GitHub stars:** +30-50

---

## Follow-Up Actions

### After Launch
1. Monitor comments and respond promptly
2. Track GitHub stars and npm downloads
3. Update README based on feedback
4. Address any issues reported
5. Thank contributors

### Week After Launch
1. Post update if significant improvements made
2. Share metrics (if positive)
3. Thank community for feedback
4. Announce new features if added

---

## Demo GIF Script

Create a GIF showing:
1. User drags CSV file onto page
2. File is parsed automatically
3. Broker is detected (show "Detected: Robinhood")
4. Trades are displayed in a table
5. Portfolio visualization appears

**Tools:**
- ScreenToGif (Windows)
- Kap (Mac)
- Peek (Linux)

**Duration:** 10-15 seconds
**Size:** < 5MB (optimize for web)

---

## Backup Plans

### If Post Gets Removed
- Check subreddit rules
- Repost with different title/format
- Try different subreddit
- Ask mods for clarification

### If Low Engagement
- Cross-post to related subreddits
- Share on Twitter/X
- Post on Hacker News
- Share in relevant Discord/Slack communities

---

## Notes

- Always read subreddit rules before posting
- Some subreddits have "Show HN" or "Project" tags - use them
- Be prepared for criticism - respond constructively
- Track which posts perform best for future launches









