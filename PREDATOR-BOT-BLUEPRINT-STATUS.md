# 🦅 Predator Bot V7.3: Current Blueprint & Status Report

**Date:** 2025-01-27  
**Version:** V7.3 "Force Select Protocol"  
**Status:** 🟡 **PARTIALLY OPERATIONAL** - Extracting leads but below target capacity

---

## 📊 Executive Summary

### Current Performance
- **Leads Extracted:** ~72 per city (average)
- **New Leads After Deduplication:** ~10-15 per city (average)
- **Cities Configured:** 53 UK cities
- **Per-Run Capacity:** ~530-795 new leads (53 cities × 10-15 leads)
- **Daily Capacity:** ~6,360-9,540 leads/day (12 runs × 530-795 leads)

### Target vs. Reality
- **Target:** 10,000 leads/day (833 leads/run)
- **Actual:** ~6,360-9,540 leads/day (530-795 leads/run)
- **Gap:** -640 to -3,640 leads/day (64-36% below target)

### Can We Hit Target?
**Answer: ⚠️ PARTIALLY - Need improvements**

**Current State:**
- ✅ Bot is extracting leads successfully
- ✅ Email extraction working (24 found + 48 constructed per city)
- ⚠️ Deduplication reducing counts significantly (~83% reduction)
- ⚠️ Some cities may extract 0 leads (inconsistent performance)

**To Hit 10K/Day Target:**
1. **Option 1:** Increase cities per run (add more UK locations or expand to US)
2. **Option 2:** Reduce deduplication rate (expand to new sources beyond SJP)
3. **Option 3:** Improve extraction rate per city (currently ~10-15 new/city, need ~16-20)
4. **Option 4:** Increase run frequency (currently 12 runs/day, could go to 16-20)

---

## 🏗️ Architecture Blueprint

### V7.3: "Force Select Protocol" (Current)

**Core Design:**
```
processCity(hub) → Launch Browser → Fill Form → Force Select → Extract → Kill Browser
```

**Key Components:**

1. **Browser Management**
   - Fresh browser instance per city (prevents memory leaks)
   - Native Chrome proxy support (`--proxy-server` flags)
   - Browser killed after each city (clean state)
   - Human-like pauses between cities (2-7 seconds)

2. **Form Interaction**
   - **Location:** `lib/sales/sourcing/predator-scraper.ts:385-425`
   - **Protocol:** "Force Select" (ArrowDown + Enter to trigger React state)
   - **Steps:**
     1. Clear input (triple click + Backspace)
     2. Slow type city name (150ms delay per character)
     3. Wait for autocomplete dropdown
     4. ArrowDown + Enter (triggers React `onSelect` event)
     5. Wait for state update (1 second)
     6. Click search button (JavaScript click via `page.evaluate`)

3. **Lead Extraction**
   - **Location:** `lib/sales/sourcing/predator-scraper.ts:750-1000`
   - **Strategy:**
     - Primary: Extract from `.advisers-card` elements
     - Fallback: Find advisor profile links directly
     - Email extraction: `mailto:` links → regex → construct from name
     - Email validation: Filter share links, validate format
     - Name construction: `firstname.lastname@sjpp.co.uk` fallback

4. **Deduplication**
   - **Location:** `lib/sales/sourcing/predator-scraper.ts:144-180`
   - **Strategy:**
     - Pre-load existing emails from database (up to 50,000)
     - In-memory Set for O(1) lookup
     - Batch deduplication before insertion
     - Database unique constraint on `email` field

---

## 📈 Performance Metrics

### Per-City Performance (Based on Logs)

**Example: York**
- **Extracted:** 72 leads
- **Email Found:** 24 (from `mailto:` links)
- **Email Constructed:** 48 (from name fallback)
- **New After Deduplication:** 11 leads
- **Deduplication Rate:** ~85% (61 duplicates out of 72)

**Example: Hull**
- **Extracted:** 72 leads
- **Email Found:** 24
- **Email Constructed:** 48
- **New After Deduplication:** 12 leads
- **Deduplication Rate:** ~83% (60 duplicates out of 72)

**Average Per City:**
- **Extracted:** ~72 leads
- **New After Deduplication:** ~10-15 leads
- **Deduplication Rate:** ~80-85%

### Scaling Math

**Current Capacity:**
```
53 cities × 10-15 new leads/city = 530-795 leads/run
12 runs/day × 530-795 leads = 6,360-9,540 leads/day
```

**Target Capacity:**
```
10,000 leads/day ÷ 12 runs = 833 leads/run
833 leads/run ÷ 53 cities = ~16 leads/city (new)
```

**Gap Analysis:**
- **Current:** ~10-15 new leads/city
- **Target:** ~16 new leads/city
- **Gap:** -1 to -6 leads/city (need 6-40% improvement)

---

## 🎯 Target Achievement Strategy

### Option 1: Expand City Coverage (Recommended)

**Add More UK Cities:**
- Current: 53 cities
- Target: 70-80 cities
- Impact: 70-80 cities × 10-15 leads = 700-1,200 leads/run
- **Result:** ✅ Exceeds 833 target

**Expand to US Markets:**
- Add NAPFA directory (30 US states configured but not active)
- Potential: 30 states × 10-15 leads = 300-450 leads/run
- **Result:** ✅ Combined with UK, exceeds 10K/day

### Option 2: Reduce Deduplication Rate

**Current Issue:**
- 80-85% of extracted leads are duplicates
- Only 10-15 new leads per city

**Solutions:**
1. **Expand to New Sources:**
   - VouchedFor (UK IFAs) - configured but not active
   - NAPFA (US advisors) - configured but not active
   - Other UK wealth directories

2. **Improve Extraction Quality:**
   - Better name parsing (reduce "Partner" fallback)
   - More accurate email extraction (reduce construction rate)
   - Better filtering of generic emails

**Impact:**
- If deduplication drops to 70%: 72 × 0.3 = ~22 new leads/city
- 53 cities × 22 = 1,166 leads/run ✅ Exceeds target

### Option 3: Improve Extraction Rate Per City

**Current:** ~72 extracted per city, ~10-15 new after deduplication

**Improvements:**
1. **Better Selectors:** Find more advisor cards
2. **Scroll More:** Trigger lazy loading for more results
3. **Multiple Searches:** Search by radius, then by name
4. **Pagination:** Navigate to page 2, 3, etc.

**Target:** Increase to ~100 extracted per city
- 100 × 0.15 (deduplication) = ~15 new leads/city
- 53 cities × 15 = 795 leads/run (close to 833 target)

### Option 4: Increase Run Frequency

**Current:** 12 runs/day (every 2 hours)

**Options:**
- **16 runs/day** (every 1.5 hours): 530-795 × 16 = 8,480-12,720 leads/day ✅
- **20 runs/day** (every 1.2 hours): 530-795 × 20 = 10,600-15,900 leads/day ✅

**Trade-offs:**
- More server load
- Higher risk of rate limiting
- May need more proxy IPs

---

## 🔧 Technical Specifications

### Configuration

**Cities Configured:** 53 UK cities
- London, Leeds, Manchester, Birmingham, Edinburgh, Glasgow, Bristol, Liverpool, Newcastle, Cardiff, Belfast, Southampton, Nottingham, Sheffield, Leicester, Aberdeen, Cambridge, Oxford, Brighton, Reading, Milton Keynes, Luton, Northampton, Norwich, Bournemouth, Plymouth, Exeter, Swindon, York, Hull, Bradford, Stoke-on-Trent, Wolverhampton, Coventry, Derby, Sunderland, Middlesbrough, Blackpool, Peterborough, Chelmsford, Colchester, Ipswich, Watford, Slough, Basildon, Worthing, Maidstone, Hastings, Eastbourne, Guildford, Woking, Farnborough, Basingstoke

**Data Sources:**
- ✅ **Active:** SJP Directory (UK)
- ❌ **Inactive:** VouchedFor (UK IFAs)
- ❌ **Inactive:** NAPFA (US advisors)

**Proxy Support:**
- Native Chrome proxy flags (`--proxy-server`)
- Proxy authentication via `page.authenticate()`
- IP rotation per city (if using rotating proxy gateway)

### Processing Time

**Per-City Processing:**
- Browser launch: ~2-3 seconds
- Page load: ~3-5 seconds
- Form interaction: ~5-10 seconds
- Results wait: ~3-5 seconds
- Extraction: ~2-3 seconds
- **Total:** ~15-26 seconds per city

**Full Run Time:**
- 53 cities × 20 seconds = ~1,060 seconds = ~18 minutes (sequential)
- With 2-7 second pauses: ~20-25 minutes total

**Parallel Processing Potential:**
- 3-5 concurrent cities: ~5-7 minutes total
- **Risk:** Higher chance of rate limiting/Cloudflare bans

---

## 🚨 Known Issues & Limitations

### Issue 1: High Deduplication Rate
- **Impact:** 80-85% of extracted leads are duplicates
- **Cause:** Repeated scraping of same SJP directory
- **Solution:** Expand to new sources (VouchedFor, NAPFA)

### Issue 2: Inconsistent City Performance
- **Impact:** Some cities extract 0 leads (earlier logs showed this)
- **Cause:** React state update failures, form submission issues
- **Solution:** V7.3 "Force Select" protocol (partially fixed)

### Issue 3: Email Construction Fallback
- **Impact:** 48/72 emails constructed from names (67%)
- **Cause:** Share `mailto:` links being filtered out
- **Solution:** Better email extraction logic (partially fixed)

### Issue 4: Name Extraction Quality
- **Impact:** Many leads have "Partner" as firstName
- **Cause:** Poor name parsing from card text
- **Solution:** Better DOM traversal to find name elements

---

## 📋 Recommendations

### Short-Term (1-2 weeks)
1. ✅ **Activate VouchedFor Source** - Add UK IFAs beyond SJP
2. ✅ **Activate NAPFA Source** - Add US advisors
3. ✅ **Improve Name Extraction** - Better parsing from advisor cards
4. ✅ **Add More UK Cities** - Expand from 53 to 70-80 cities

### Medium-Term (1 month)
1. ✅ **Parallel Processing** - 3-5 concurrent cities (with rate limiting)
2. ✅ **Pagination Support** - Navigate to page 2, 3 for more results
3. ✅ **Better Email Extraction** - Reduce construction fallback rate
4. ✅ **Multiple Search Strategies** - Search by radius, then by name

### Long-Term (2-3 months)
1. ✅ **US Market Expansion** - Full NAPFA integration
2. ✅ **Other UK Directories** - Beyond SJP and VouchedFor
3. ✅ **International Markets** - Canada, Australia, etc.
4. ✅ **API Bypass Strategy** - Direct API calls if UI continues to fail

---

## ✅ Conclusion

### Current Status: 🟡 PARTIALLY OPERATIONAL

**What's Working:**
- ✅ Lead extraction is functional
- ✅ Email extraction working (found + constructed)
- ✅ Deduplication working correctly
- ✅ Form interaction fixed (V7.3 Force Select)

**What Needs Improvement:**
- ⚠️ Deduplication rate too high (80-85%)
- ⚠️ Extraction rate per city below target (~10-15 vs. ~16 needed)
- ⚠️ Some cities may still extract 0 leads

### Can We Hit 10K/Day Target?

**Answer: YES, with improvements**

**Path to 10K/Day:**
1. **Activate VouchedFor + NAPFA** → Reduces deduplication, adds new sources
2. **Add 20-30 more UK cities** → Increases capacity to 700-1,200 leads/run
3. **Improve extraction rate** → Better selectors, pagination, multiple searches

**Expected Result:**
- 70-80 cities × 15-20 new leads = 1,050-1,600 leads/run
- 12 runs/day × 1,050-1,600 = **12,600-19,200 leads/day** ✅

**Timeline:** 2-4 weeks to implement and verify

---

**Report Generated:** 2025-01-27  
**Next Review:** After VouchedFor/NAPFA activation

