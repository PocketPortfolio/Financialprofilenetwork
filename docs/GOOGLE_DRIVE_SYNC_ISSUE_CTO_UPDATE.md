# CTO Update: Google Drive Bidirectional Sync Issue
## Request for Google Drive API Team Assistance

**Date:** December 24, 2025  
**Priority:** High - Blocking Feature  
**Status:** ✅ **IMPLEMENTED: Optimistic Locking Solution** (Pending Verification)  
**Contact:** Pocket Portfolio Engineering Team

---

## Executive Summary

We are experiencing a **critical bidirectional sync issue** with Google Drive API v3. While our app successfully syncs changes **TO** Google Drive, changes made **directly in Google Drive** (manual edits via Drive web interface) are **not being detected or synced back** to our application.

**Impact:** Users cannot edit portfolio data in Google Drive and expect those changes to appear in Pocket Portfolio. This breaks the core bidirectional sync promise of the feature.

---

## Problem Statement

### Expected Behavior
1. User edits `pocket_portfolio_db.json` file directly in Google Drive (changes quantity, dates, or deletes trades)
2. Pocket Portfolio polling detects the change within 2-5 seconds
3. Pocket Portfolio pulls updated data from Drive
4. UI updates to reflect Drive changes
5. Both platforms remain in sync

### Current Behavior
- ✅ **Pocket Portfolio → Drive**: Works perfectly (changes sync to Drive)
- ❌ **Drive → Pocket Portfolio**: **Does not work** (Drive edits are not detected or are immediately overwritten)

### User-Reported Failures
- ❌ Edit quantity in Drive JSON → should update in Pocket Portfolio - **FAILED**
- ❌ Edit dates in Drive JSON → should update in Pocket Portfolio - **FAILED**
- ❌ Remove trades from Drive → should delete from Pocket Portfolio - **FAILED**
- ❌ Add trades to Drive → should create in Pocket Portfolio - **FAILED**

---

## Technical Architecture

### Sync Mechanism Overview

**Polling Strategy:**
- **Interval:** 2 seconds (`POLL_INTERVAL_MS = 2000`)
- **Method:** Version-based sync using Drive API `version` field and `headRevisionId`
- **Detection:** Compare `remoteVersion` vs `localVersion` (string comparison for revision IDs)

**Key Components:**
1. **Polling Loop** (`useGoogleDrive.ts:startPolling`)
   - Fetches file metadata every 2 seconds
   - Compares versions to detect changes
   - Calls `syncFromDrive()` when changes detected

2. **Auto-Sync Protection** (`dashboard/page.tsx`)
   - Prevents overwriting Drive changes immediately after pulling
   - Uses `recentlySyncedFromDrive()` check (15-second window)
   - Blocks auto-sync when `lastDriveSyncTimeRef` is recent

3. **Version Tracking**
   - `localVersion`: Last known version we synced (stored in React state + ref)
   - `remoteVersion`: Current version on Drive (from metadata API)
   - Uses `syncStateRef.current.localVersion` to avoid stale closures

### API Calls

**1. Get File Metadata (Every 2 seconds)**
```http
GET https://www.googleapis.com/drive/v3/files/{fileId}?fields=id,kind,name,version,headRevisionId,modifiedTime,createdTime,size,parents,lastModifyingUser
```

**Response Fields Used:**
- `version`: File version number (numeric string, e.g., "6395")
- `headRevisionId`: Latest revision ID (string, e.g., "0B09QDmSHdlvx...")
- `lastModifyingUser.emailAddress`: Email of last modifier
- `lastModifyingUser.me`: Boolean indicating if current user modified
- `modifiedTime`: ISO 8601 timestamp of last modification

**2. Download File (When Pull Needed)**
```http
GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media
```

---

## Investigation Findings

### What We've Discovered

**1. Polling IS Running**
- ✅ Polling loop is active (every 2 seconds)
- ✅ Metadata API calls are succeeding
- ✅ Version comparison logic is executing

**2. Version Detection Issue**
- **Problem:** Versions always appear to match (`localVersion === remoteVersion`)
- **Evidence:** Logs show `"versions-match": true` even after Drive edits
- **Root Cause Hypothesis:** Either:
  - Drive edits don't increment `version` field
  - Our app uploads to Drive immediately after user edits, causing versions to match
  - Version comparison logic has a bug

**3. Auto-Sync Overwriting Issue**
- **Problem:** Even when polling detects changes and pulls from Drive, auto-sync immediately overwrites Drive changes
- **Evidence:** Logs show `"driveTradesLength": 6` (user deleted 2 trades) but app syncs 8 trades, overwriting Drive
- **Root Cause:** `refreshTrades()` updates React state, triggering auto-sync `useEffect` before protection window expires

### Debug Logs Analysis

**Key Observations:**
1. `lastDriveSyncTimeRef` is being set correctly when `syncFromDrive` completes
2. However, `recentlySyncedFromDrive()` checks show `lastDriveSyncTime: 0` in many cases
3. Auto-sync runs every 1-2 seconds, constantly overwriting Drive changes
4. No `syncFromDrive:entry` logs found in recent runs, indicating polling isn't detecting changes

**Sample Log Entry:**
```json
{
  "location": "useGoogleDrive.ts:polling:versions-match",
  "message": "Versions match - no pull needed",
  "data": {
    "localVersion": "6395",
    "remoteVersion": "6395",
    "refLocalVersion": "6395",
    "stateLocalVersion": "6395"
  }
}
```

---

## Attempted Fixes

### Fix 1: Use Ref Instead of State for Version Comparison
**Problem:** Polling was using stale `state.localVersion` from closure  
**Fix:** Changed to `syncStateRef.current.localVersion`  
**Result:** ❌ Still not detecting changes

### Fix 2: Improved `isRemoteNewer` Calculation
**Problem:** Logic didn't handle `null` localVersion correctly  
**Fix:** Added explicit null checks: `(localVersion === null && remoteVersion !== null) || (versionsAreDifferent && remoteVersion !== null && localVersion !== null)`  
**Result:** ❌ Still not detecting changes

### Fix 3: Extended Auto-Sync Block Window
**Problem:** 5-second window too short, auto-sync overwrote changes  
**Fix:** Increased to 15 seconds, added `markDriveSyncComplete()` to reset timer after `refreshTrades()`  
**Result:** ❌ Still not detecting changes (polling never triggers pull)

### Fix 4: External Modification Detection
**Problem:** Can't distinguish between our uploads and user edits  
**Fix:** Added detection for `modifiedByMe === false` to extend block window  
**Result:** ❌ Still not detecting changes

### Fix 5: ✅ **Optimistic Locking (Current Implementation)**
**Problem:** Race condition where auto-sync overwrites Drive edits before polling detects them  
**Fix:** Implemented optimistic locking with pre-write conflict check:
- `updatePortfolioFile()` now checks revision ID BEFORE uploading
- If revision ID changed on Drive, throws CONFLICT error (412)
- `syncToDrive()` catches conflict, pulls from Drive first, then retries
- Prevents "Lost Update" problem by checking before write, not after

**Implementation:**
- Modified `driveService.updatePortfolioFile()` to accept `lastKnownRevisionId` parameter
- Added conflict check: fetches current metadata, compares revision IDs
- If conflict detected, throws error with `code: 'CONFLICT'` and `status: 412`
- `syncToDrive()` handles conflict by pulling from Drive first, then allowing retry

**Status:** ✅ Implemented - Pending verification testing

---

## Critical Questions for Google Drive API Team

### Question 1: Version Field Behavior
**Q:** Does the `version` field increment when a file is **manually edited** in the Google Drive web interface, or only when edited via the Drive API?

**Context:** Our logs show versions always matching, even after manual Drive edits. We need to know if:
- Manual edits increment `version`
- Manual edits only change `headRevisionId` (not `version`)
- We should rely on `headRevisionId` comparison instead

**Current Implementation:**
```typescript
let remoteVersion = metadata.version || metadata.headRevisionId || null;
let localVersion = syncStateRef.current.localVersion;
if (remoteVersion === localVersion) {
  // Versions match - skip pull
}
```

### Question 2: `lastModifyingUser.me` Behavior
**Q:** When a user manually edits a file in Drive web interface using the **same Google account** that our app uses for API calls, does `lastModifyingUser.me` return `true` or `false`?

**Context:** We removed the `modifiedByMe` check per Google recommendation (Identity Trap), but we need to understand if this field can help us distinguish manual edits from API uploads.

**Previous Implementation (Removed):**
```typescript
if (modifiedByMe === true) {
  // Skip pull - our own upload
}
```

### Question 3: Revision ID Comparison
**Q:** Can we reliably compare `headRevisionId` strings to detect changes? Are revision IDs:
- Always unique for each change?
- Comparable as strings?
- Available immediately after a manual edit?

**Context:** We're using `headRevisionId` as a fallback when `version` is null, but we're not sure if it's reliable for detecting manual edits.

### Question 4: Race Condition Handling
**Q:** What is the recommended approach for handling race conditions where:
1. User edits file in Drive (version increments)
2. Our app polls and detects change
3. Our app starts pulling from Drive
4. Our app's auto-sync uploads to Drive (version increments again)
5. Next poll sees versions match (user's edit is lost)

**Context:** We've implemented a 15-second auto-sync block after pulling from Drive, but this might not be sufficient if polling detects changes too late.

### Question 5: Real-Time Sync Alternatives
**Q:** Is there a better approach than polling for detecting Drive changes? Options we're considering:
- **Push Notifications:** Does Drive API support webhooks/push notifications?
- **Changes API:** Should we use `changes.list` endpoint instead of polling metadata?
- **Drive Activity API:** Would this provide better change detection?

**Current Approach:**
- Polling `files.get` every 2 seconds
- Comparing versions to detect changes

**Alternative Considered:**
- Using `changes.list` with `pageToken` to track changes
- Would this be more reliable for detecting manual edits?

---

## Recommended Next Steps

### For Google Drive API Team

1. **Clarify Version Behavior**
   - Confirm if `version` increments on manual edits
   - Provide guidance on using `headRevisionId` vs `version`

2. **Review Our Implementation**
   - Validate our version comparison logic
   - Suggest improvements to change detection

3. **Recommend Best Practices**
   - Best approach for bidirectional sync
   - Handling race conditions
   - Real-time change detection alternatives

### For Our Team (Pending Google Response)

1. **Implement Changes API** (if recommended)
   - Switch from polling `files.get` to `changes.list`
   - Track changes using `pageToken`

2. **Add Conflict Resolution**
   - Detect when both platforms modify simultaneously
   - Implement merge strategy or last-write-wins

3. **Improve Logging**
   - Add more detailed version tracking
   - Log all Drive API responses for analysis

---

## Technical Details

### Code Locations

**Optimistic Locking (NEW - Current Implementation):**
- File: `app/lib/google-drive/driveService.ts`
- Function: `updatePortfolioFile()` (line ~567)
- Conflict check: Fetches metadata before upload, compares revision IDs
- Error: Throws `CONFLICT` error (412) if revision ID changed

**Conflict Handling:**
- File: `app/hooks/useGoogleDrive.ts`
- Function: `syncToDrive()` (line ~400)
- Conflict handling: Catches CONFLICT error, pulls from Drive, then retries
- Line ~532-620: Try-catch block with conflict handling

**Polling Logic:**
- File: `app/hooks/useGoogleDrive.ts`
- Function: `startPolling()` (line ~1032)
- Polling interval: 2 seconds
- Version comparison: Line ~1260-1320

**Auto-Sync Protection:**
- File: `app/dashboard/page.tsx`
- Function: `handleDriveSync()` (line ~644)
- Protection window: 5 seconds (reduced from 15)
- Reset function: `markDriveSyncComplete()` (line ~1545)

**Version Tracking:**
- State: `syncState.localVersion` (React state)
- Ref: `syncStateRef.current.localVersion` (for polling)
- Update: After `syncFromDrive()` completes (line ~968)

### Debug Logs

**Log File:** `.cursor/debug.log` (NDJSON format)  
**Key Log Locations:**
- `useGoogleDrive.ts:polling:version-values-detailed` - Version comparison details
- `useGoogleDrive.ts:polling:versions-match` - When versions match (no pull)
- `useGoogleDrive.ts:polling:version-pull` - When pull is triggered
- `useGoogleDrive.ts:syncFromDrive:entry` - When pull starts
- `dashboard/page.tsx:auto-sync:sync-call` - When auto-sync runs

**Sample Log Query:**
```bash
# Find all version checks
grep "version-values-detailed" .cursor/debug.log

# Find all pull attempts
grep "version-pull" .cursor/debug.log

# Find auto-sync calls
grep "auto-sync:sync-call" .cursor/debug.log
```

---

## Environment Details

- **API Version:** Google Drive API v3
- **Authentication:** OAuth 2.0 (same account for API and manual edits)
- **File Type:** JSON file (`pocket_portfolio_db.json`)
- **File Size:** ~5-50 KB (small JSON files)
- **Polling Frequency:** 2 seconds
- **Framework:** React/Next.js (TypeScript)
- **Browser:** Chrome/Edge (latest)

---

## Contact Information

**Engineering Team:** Pocket Portfolio Development Team  
**Issue Tracker:** Internal tracking system  
**Priority:** High - Blocking core feature  
**Timeline:** Need resolution ASAP for production release

---

## Appendix: Code Snippets

### Version Comparison Logic
```typescript
// Current implementation (useGoogleDrive.ts:1260-1320)
let remoteVersion = metadata.version || metadata.headRevisionId || null;
let localVersion = syncStateRef.current.localVersion; // Use ref to avoid stale closure

if (remoteVersion === localVersion) {
  // Versions match - no changes
  return; // IDLE - no changes
}

const versionsAreDifferent = localVersion !== remoteVersion;
const isRemoteNewer = (localVersion === null && remoteVersion !== null) || 
                      (versionsAreDifferent && remoteVersion !== null && localVersion !== null);

if (isRemoteNewer) {
  await syncFromDrive(); // Pull changes
}
```

### Auto-Sync Protection
```typescript
// Current implementation (dashboard/page.tsx:680-716)
useEffect(() => {
  if (recentlySyncedFromDrive()) {
    return; // Skip auto-sync - recently pulled from Drive
  }
  
  const handler = setTimeout(() => {
    if (!syncState.isSyncing && !recentlySyncedFromDrive()) {
      syncToDrive(undefined, trades);
    }
  }, 1000);
  
  return () => clearTimeout(handler);
}, [trades, syncState.isSyncing, recentlySyncedFromDrive]);
```

---

**End of CTO Update**

