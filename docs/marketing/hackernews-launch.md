# Hacker News Launch Strategy

## Post Template

### Title
```
Show HN: I built a local-first alternative to Delta/Blockfolio. No servers, 100% privacy.
```

### Body
```markdown
I've been frustrated with portfolio trackers that require signups, store your data on their servers, and make it hard to export your data. So I built Pocket Portfolio - a local-first portfolio tracker that works entirely in your browser.

**Key Features:**
- **Zero signup required** - Upload your broker CSV and start tracking immediately
- **100% local** - All data stored in browser localStorage, never sent to servers
- **15+ broker support** - Auto-detects and parses CSVs from Robinhood, Fidelity, eToro, Trading212, Coinbase, and more
- **Real-time prices** - Live P/L tracking with multi-source fallbacks
- **Open source** - MIT licensed, self-hostable
- **Privacy-first** - Your data never leaves your device unless you explicitly sync

**The Tech:**
- Next.js 14 with ISR for fast page loads
- Client-side CSV parsing (Papa Parse + SheetJS)
- localStorage for persistence (with quota management)
- Optional Firebase sync (if you want cloud backup)

**Try it:**
- Live demo: https://www.pocketportfolio.app
- GitHub: https://github.com/PocketPortfolio/Financialprofilenetwork
- Self-host: Docker setup included (see README)

**The Story:**
I started this because I wanted to track my portfolio across multiple brokers (Robinhood, eToro, Coinbase) but didn't want to give my data to another company. The solution? Parse everything client-side and store it locally. No servers, no signups, no tracking.

You can upload a CSV from any broker, and it'll auto-detect the format and parse it. Everything happens in your browser - your trades, positions, and P/L calculations are all computed locally.

**What's Next:**
- Adding more broker formats (contributions welcome!)
- Self-hosting improvements
- Optional encrypted sync service (E2E encrypted, zero-knowledge)

Would love feedback on the UX, especially the CSV import flow. Also happy to answer questions about the architecture or help with self-hosting setups.

[Demo GIF showing CSV drag-drop → instant visualization]
```

## Launch Strategy

### Timing
- **Day:** Tuesday, Wednesday, or Thursday
- **Time:** 9-11 AM PST (peak HN traffic)
- **Avoid:** Weekends, Monday mornings, Friday afternoons

### Preparation Checklist

- [ ] Test CSV import with multiple broker formats
- [ ] Verify self-hosting documentation is complete
- [ ] Create demo GIF (10-15 seconds, < 5MB)
- [ ] Prepare for traffic spike (scale infrastructure)
- [ ] Have GitHub repo ready and public
- [ ] Test all links in the post

### Engagement Plan

1. **Immediate (First Hour)**
   - Monitor comments closely
   - Respond to technical questions
   - Fix any reported bugs quickly
   - Thank early adopters

2. **First Day**
   - Address all comments
   - Share implementation details if asked
   - Discuss architecture decisions
   - Be helpful and educational

3. **Follow-Up**
   - Post updates if significant improvements made
   - Share metrics (if positive)
   - Thank community for feedback

### Expected Questions & Answers

**Q: How does it work without a server?**
A: All parsing happens client-side using Papa Parse and SheetJS. Portfolio data is stored in browser localStorage. Real-time prices are fetched from public APIs (Yahoo Finance, etc.) directly from the browser.

**Q: What about localStorage limits?**
A: localStorage typically has 5-10MB quota. We warn users at 80% usage and provide export/import functionality. For larger portfolios, users can sign up for optional cloud sync.

**Q: Can I self-host this?**
A: Yes! We include Docker setup and comprehensive self-hosting docs. See `docs/self-hosting.md` for details.

**Q: How do you make money?**
A: We don't! This is completely free and open source. Future optional encrypted sync service ($4/mo) will be the only paid feature, but the core app remains free.

**Q: What about security?**
A: Since everything is client-side, there's no server to hack. Your data never leaves your device unless you explicitly enable cloud sync. Even then, it's E2E encrypted (when we launch that feature).

**Q: Why not use IndexedDB instead of localStorage?**
A: localStorage is simpler and sufficient for most portfolios. We may add IndexedDB support for larger datasets in the future.

### Demo GIF Script

See `docs/marketing/demo-gif-script.md` for detailed instructions.

**Quick Version:**
1. Show landing page
2. Drag CSV file
3. Show "Detected: Robinhood" badge
4. Dashboard appears with portfolio
5. Show "No Signup Required" text

### Success Metrics

- **Target:** Front page (top 10)
- **Comments:** 50+ quality comments
- **GitHub Stars:** +500-1000
- **Traffic:** 10,000+ unique visitors
- **Signups:** Track conversion rate

### Risk Mitigation

**If Post Gets Flagged:**
- Check HN guidelines
- Repost with different title/format
- Ask mods for clarification

**If Low Engagement:**
- Cross-post to Reddit (r/selfhosted, r/opensource)
- Share on Twitter/X
- Post in relevant Discord/Slack communities

**If Technical Issues:**
- Have monitoring in place
- Be ready to scale infrastructure
- Have rollback plan ready

### Follow-Up Actions

**Week After Launch:**
1. Post update if significant improvements
2. Share metrics (if positive)
3. Thank community
4. Announce new features if added

**Month After Launch:**
1. Post "Show HN: Update" with improvements
2. Share user feedback
3. Discuss lessons learned

## Notes

- Be authentic and helpful
- Don't be overly promotional
- Focus on technical discussion
- Share code examples when helpful
- Thank people for feedback
- Be prepared for criticism

---

**Remember:** Hacker News values technical depth, authenticity, and helpfulness. Focus on the engineering and privacy aspects, not marketing.









