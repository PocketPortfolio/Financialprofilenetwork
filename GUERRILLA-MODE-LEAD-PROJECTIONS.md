# 📊 Guerrilla Mode: Expected Lead Projections

**Date:** 2025-01-27  
**Mode:** Guerrilla Mode (No Proxy)  
**Workflow:** GitHub Actions (Every 2 Hours)

---

## 🎯 Expected Lead Counts

### **Guerrilla Mode (Current - No Proxy)**

**Per Run:**
- **Cities Processed:** 5 random cities
- **Leads per City:** ~10-15 new leads (after deduplication)
- **Expected per Run:** 5 × 10-15 = **50-75 leads/run**

**Per Day:**
- **Runs per Day:** 12 runs (every 2 hours)
- **Expected per Day:** 12 × 50-75 = **600-900 leads/day**

**Coverage:**
- **City-Scrapes per Day:** 12 × 5 = 60 city-scrapes/day
- **Total Cities:** 53 UK cities
- **Full Coverage:** All 53 cities covered in ~11 days (some cities may repeat)

---

### **Full Mode (With Proxy - Future)**

**Per Run:**
- **Cities Processed:** 53 cities (all UK hubs)
- **Leads per City:** ~10-15 new leads (after deduplication)
- **Expected per Run:** 53 × 10-15 = **530-795 leads/run**

**Per Day:**
- **Runs per Day:** 12 runs (every 2 hours)
- **Expected per Day:** 12 × 530-795 = **6,360-9,540 leads/day**

**Coverage:**
- **City-Scrapes per Day:** 12 × 53 = 636 city-scrapes/day
- **Full Coverage:** All 53 cities covered multiple times per day

---

## 📈 Lead Extraction Breakdown

### Per City Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| **Advisors Found** | ~60-70 | Total advisors discovered per city |
| **Emails Extracted** | ~72 | Found (24) + Constructed (48) |
| **Valid Emails** | ~60-65 | After validation (MX records, etc.) |
| **New Leads** | ~10-15 | After deduplication (~83% are duplicates) |
| **Deduplication Rate** | ~83% | 60-57 leads filtered as duplicates |

### Why ~10-15 New Leads per City?

**Extraction Flow:**
1. **Found:** ~72 emails extracted per city
2. **Validated:** ~60-65 pass email validation
3. **Deduplicated:** ~50-55 are duplicates (already in database)
4. **Result:** ~10-15 new leads saved

**Deduplication Factors:**
- Same advisors appear in multiple cities
- Previous runs have already captured these leads
- Email cache contains 1,880+ existing emails

---

## 🔄 GitHub Workflow Schedule

**Workflow:** `.github/workflows/autonomous-revenue-engine.yml`

**Job:** `source-leads`
- **Schedule:** Every 2 hours (`0 */2 * * *`)
- **Cron Times:** 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00 UTC
- **Runs per Day:** 12 runs

**Expected Behavior:**
- Each run selects **5 random cities** (Guerrilla Mode)
- Each run processes cities sequentially
- Each run takes ~2-3 minutes (5 cities × ~25 seconds)
- Leads are saved to database immediately

---

## 📊 Daily Projections

### Guerrilla Mode (Current)

**Conservative Estimate:**
- **Per Run:** 50 leads (5 cities × 10 leads)
- **Per Day:** 600 leads (12 runs × 50 leads)

**Optimistic Estimate:**
- **Per Run:** 75 leads (5 cities × 15 leads)
- **Per Day:** 900 leads (12 runs × 75 leads)

**Realistic Estimate:**
- **Per Run:** 60-65 leads (average)
- **Per Day:** 720-780 leads/day

### Full Mode (With Proxy)

**Conservative Estimate:**
- **Per Run:** 530 leads (53 cities × 10 leads)
- **Per Day:** 6,360 leads (12 runs × 530 leads)

**Optimistic Estimate:**
- **Per Run:** 795 leads (53 cities × 15 leads)
- **Per Day:** 9,540 leads (12 runs × 795 leads)

**Realistic Estimate:**
- **Per Run:** 650-700 leads (average)
- **Per Day:** 7,800-8,400 leads/day

---

## 🎯 Target vs. Reality

### Target (Original)
- **Target:** 10,000 leads/day
- **Per Run:** 833 leads (10,000 ÷ 12)

### Guerrilla Mode (Current)
- **Actual:** 600-900 leads/day
- **Per Run:** 50-75 leads
- **Gap:** -9,100 to -9,400 leads/day (91-94% below target)

### Full Mode (With Proxy)
- **Actual:** 6,360-9,540 leads/day
- **Per Run:** 530-795 leads
- **Gap:** -460 to -3,640 leads/day (5-36% below target)

---

## 💡 Why Guerrilla Mode is Lower

**Guerrilla Mode Trade-offs:**
- ✅ **Avoids Cloudflare Bans:** Only 5 cities per run
- ✅ **Sustainable:** Can run continuously without IP bans
- ⚠️ **Lower Volume:** 5 cities vs. 53 cities per run
- ⚠️ **Slower Coverage:** Takes ~11 days to cover all cities

**Full Mode Benefits:**
- ✅ **Higher Volume:** 53 cities per run
- ✅ **Faster Coverage:** All cities covered multiple times per day
- ⚠️ **Requires Proxy:** $52.50/month for IPRoyal
- ⚠️ **Risk of Bans:** Without proxy, gets banned after ~10 cities

---

## 📅 Weekly Projections

### Guerrilla Mode (7 Days)

**Week 1:**
- **Daily Average:** 720 leads/day
- **Weekly Total:** ~5,040 leads/week
- **Cities Covered:** ~420 city-scrapes (some repeats)
- **Unique Coverage:** All 53 cities covered 1-2 times

### Full Mode (7 Days)

**Week 1:**
- **Daily Average:** 8,100 leads/day
- **Weekly Total:** ~56,700 leads/week
- **Cities Covered:** 4,452 city-scrapes
- **Unique Coverage:** All 53 cities covered ~84 times

---

## ✅ Summary

**Current Setup (Guerrilla Mode):**
- **Per Run:** 50-75 leads
- **Per Day:** 600-900 leads
- **Status:** ✅ Operational, sustainable, no proxy needed

**With Proxy (Full Mode):**
- **Per Run:** 530-795 leads
- **Per Day:** 6,360-9,540 leads
- **Status:** ⏳ Requires proxy purchase ($52.50/month)

**Target:**
- **Per Run:** 833 leads
- **Per Day:** 10,000 leads
- **Status:** ⚠️ Requires improvements (more cities, better extraction, or proxy)

---

**Report Generated:** 2025-01-27  
**Next Update:** After proxy purchase or extraction improvements

