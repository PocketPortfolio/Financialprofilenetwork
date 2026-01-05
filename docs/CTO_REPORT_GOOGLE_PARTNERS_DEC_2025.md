# CTO Report: Critical Sync & Data Integrity Issues
## Request for Google Cloud/Firebase & Drive API Team Assistance

**Date:** December 25, 2025  
**Priority:** 🔴 **CRITICAL** - Blocking Production Release  
**Status:** Multiple Active Issues Requiring Platform Support  
**Contact:** Pocket Portfolio Engineering Team

---

## Executive Summary

We are experiencing **two critical, interconnected issues** that are blocking our production release:

1. **Firebase Firestore Permission Denied Errors**: Trades created via CSV import are failing to delete/update with `permission-denied` errors, despite appearing to have correct ownership (`uid` field matches authenticated user).

2. **Google Drive Sync Loop**: Trades deleted from Drive are correctly detected, but sync fails due to Firebase permission errors, causing trades to reappear in a continuous loop.

**Impact:** Users cannot reliably sync data between Google Drive and Pocket Portfolio. Deleted trades keep reappearing, and manual Drive edits cannot be properly synchronized to Firebase.

---

## Issue #1: Firebase Firestore Permission Denied on Delete/Update

### Problem Statement

**Expected Behavior:**
- Trades created via CSV import should have `uid` field set to the authenticated user's ID
- Trades should be deletable/updatable by the user who created them
- Firestore security rules should allow operations when `resource.data.uid == request.auth.uid`

**Current Behavior:**
- ✅ `getTrades(userId)` successfully returns trades (filters by `where('uid', '==', userId)`)
- ✅ Trades appear to have correct `uid` field in query results
- ❌ `deleteDoc()` fails with `permission-denied` error
- ❌ `updateDoc()` fails with `permission-denied` error
- ❌ `getDoc()` fails with `permission-denied` when trying to verify ownership

### Evidence from Debug Logs

**Sample Error Log:**
```json
{
  "location": "tradeService.ts:deleteTrade:error",
  "message": "deleteTrade failed with error",
  "data": {
    "code": "permission-denied",
    "message": "Missing or insufficient permissions.",
    "name": "FirebaseError",
    "userId": "2nnmpQZ3lGTSi0jpMM34ZL1TSsQ2",
    "tradeId": "csv-1766671540107-4-rki1nvnay",
    "tradeUid": "2nnmpQZ3lGTSi0jpMM34ZL1TSsQ2",
    "uidMatch": true,
    "hasExistingUid": true,
    "existingUid": "2nnmpQZ3lGTSi0jpMM34ZL1TSsQ2"
  }
}
```

**Key Observations:**
1. `getTrades()` returns trades with `uid` matching `userId` (query succeeds)
2. `deleteTrade()` receives `existingUid` that matches `userId`
3. `deleteDoc()` still fails with `permission-denied`
4. Same pattern observed for `updateDoc()` operations

### Firestore Security Rules

**Current Rules (firebase/firestore.rules):**
```javascript
match /trades/{tradeId} {
  allow read: if isAuthenticated() && resource.data.uid == request.auth.uid;
  allow create: if isAuthenticated() 
    && request.resource.data.uid == request.auth.uid
    && request.resource.data.keys().hasAll(['uid', 'ticker', 'type', 'qty', 'price', 'currency', 'date', 'mock', 'createdAt']);
  allow update: if isAuthenticated() 
    && resource.data.uid == request.auth.uid
    && request.resource.data.uid == resource.data.uid;
  allow delete: if isAuthenticated() && resource.data.uid == request.auth.uid;
}
```

**Rule Logic:**
- Read: Requires `resource.data.uid == request.auth.uid`
- Delete: Requires `resource.data.uid == request.auth.uid`
- Update: Requires `resource.data.uid == request.auth.uid` AND `request.resource.data.uid == resource.data.uid`

### Code Implementation

**Trade Creation (CSV Import):**
```typescript
// app/services/tradeService.ts:313-336
static async importTrades(userId: string, trades: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
  const batch = [];
  const now = Timestamp.now();
  
  for (const trade of trades) {
    batch.push({
      ...trade,
      uid: userId, // ✅ Explicitly setting uid
      createdAt: now,
      updatedAt: now
    });
  }

  const docRefs = await Promise.all(
    batch.map(trade => addDoc(collection(db, 'trades'), trade))
  );
  
  return docRefs.map(ref => ref.id);
}
```

**Trade Deletion:**
```typescript
// app/services/tradeService.ts:78-203
static async deleteTrade(userId: string, tradeId: string, existingUid?: string): Promise<void> {
  const tradeRef = doc(db, 'trades', tradeId);
  
  // Skip getDoc() if existingUid matches userId (optimization)
  if (existingUid && existingUid === userId) {
    tradeUid = existingUid;
  } else {
    // Verify ownership via getDoc()
    const tradeDoc = await getDoc(tradeRef); // ❌ Fails with permission-denied
    tradeUid = tradeDoc.data()?.uid;
  }
  
  // Attempt deletion
  await deleteDoc(tradeRef); // ❌ Fails with permission-denied
}
```

### Hypotheses

**Hypothesis A: Data Integrity Issue**
- Documents were created without `uid` field, or `uid` field is null/undefined
- `getTrades()` query filters these out, but some documents still exist without proper `uid`
- Firestore rules reject operations because `resource.data.uid` doesn't exist or doesn't match

**Hypothesis B: Security Rule Evaluation Issue**
- Firestore rules are evaluating `resource.data.uid` incorrectly
- Possible caching issue where rules see stale data
- Possible issue with how `request.auth.uid` is resolved in rule context

**Hypothesis C: Document Creation Timing Issue**
- Documents were created before user authentication was fully established
- `uid` field was set, but `request.auth.uid` was different at creation time
- Security rules now reject because `resource.data.uid != request.auth.uid`

### Questions for Firebase Team

1. **Q: Why would `getTrades()` (with `where('uid', '==', userId)`) return documents that fail `deleteDoc()` with `permission-denied`?**
   - If the query succeeds, shouldn't the documents have `uid == userId`?
   - Why would Firestore rules reject deletion if `resource.data.uid == request.auth.uid`?

2. **Q: Can Firestore security rules see different data than queries?**
   - Is there a caching/consistency issue where rules evaluate against stale data?
   - Should we add explicit null checks in rules: `resource.data.uid != null && resource.data.uid == request.auth.uid`?

3. **Q: What is the recommended approach for verifying document ownership before delete/update?**
   - Should we always call `getDoc()` first, or can we trust query results?
   - Is there a better pattern for handling ownership verification?

4. **Q: Are there known issues with `addDoc()` not properly setting fields in security rule context?**
   - Could documents be created with `uid` field missing or incorrect?
   - Should we use transactions or batch writes to ensure atomicity?

---

## Issue #2: Google Drive Sync Loop

### Problem Statement

**Expected Behavior:**
1. User deletes trade from Drive JSON file
2. App detects change via content-based polling
3. App syncs from Drive, identifies trade to delete
4. App deletes trade from Firebase
5. Sync completes, trade no longer appears in app

**Current Behavior:**
1. ✅ User deletes trade from Drive
2. ✅ App detects change (content-based detection working)
3. ✅ App syncs from Drive, identifies trade to delete
4. ❌ App fails to delete from Firebase (permission-denied)
5. ❌ Trade remains in Firebase
6. ❌ Auto-sync uploads trade back to Drive
7. ❌ Loop repeats indefinitely

### Evidence from Debug Logs

**Sync Detection (Working):**
```json
{
  "location": "useGoogleDrive.ts:polling:content-check-diff",
  "message": "Content differs - pulling from Drive",
  "data": {
    "driveTradeCount": 7,
    "localTradeCount": 8,
    "tradesDiffer": true
  }
}
```

**Deletion Attempt (Failing):**
```json
{
  "location": "useGoogleDrive.ts:syncFromDrive:deletion-complete",
  "message": "Deletion operations completed",
  "data": {
    "tradesToDeleteCount": 1,
    "successfulDeletions": 0,
    "failedDeletionsCount": 1,
    "deletedTradeIds": ["csv-1766671540107-4-rki1nvnay"]
  }
}
```

**Auto-Sync Re-uploading:**
```json
{
  "location": "useGoogleDrive.ts:syncToDrive:after-upload",
  "message": "Upload to Drive completed",
  "data": {
    "tradesUploaded": 8,
    "oldLastSyncTime": "2025-12-25T14:08:49.367Z"
  }
}
```

### Root Cause

The sync loop is **caused by Issue #1** (Firebase permission errors). The Drive sync mechanism is working correctly, but cannot complete because Firebase operations fail.

### Current Mitigation Attempts

1. **Orphaned Trade Tracking**: We've implemented logic to track trades that fail deletion and exclude them from future syncs (stored in `localStorage`).
2. **Graceful Error Handling**: Using `Promise.allSettled()` to continue sync even if some operations fail.
3. **Content-Based Detection**: Successfully detecting Drive changes via content comparison.

**Status:** Mitigations help but don't solve the root cause (Firebase permission issues).

---

## Technical Architecture

### Sync Flow

```
┌─────────────────┐
│  Google Drive   │
│  (Source)       │
└────────┬────────┘
         │
         │ User edits/deletes in Drive
         ▼
┌─────────────────┐
│  Polling Loop   │ ◄─── Every 1-3 seconds
│  (Content Check)│
└────────┬────────┘
         │
         │ Detects change
         ▼
┌─────────────────┐
│ syncFromDrive() │
└────────┬────────┘
         │
         │ Downloads Drive data
         ▼
┌─────────────────┐
│  Compare Trades │
│  (ID + Content) │
└────────┬────────┘
         │
         │ Identifies trades to delete
         ▼
┌─────────────────┐
│ deleteTrade()   │ ◄─── ❌ FAILS: permission-denied
│ updateTrade()   │ ◄─── ❌ FAILS: permission-denied
└────────┬────────┘
         │
         │ Operations fail
         ▼
┌─────────────────┐
│  Trades Remain  │
│  in Firebase    │
└────────┬────────┘
         │
         │ Auto-sync triggers
         ▼
┌─────────────────┐
│ syncToDrive()   │
└────────┬────────┘
         │
         │ Uploads trades back to Drive
         ▼
┌─────────────────┐
│  Loop Repeats   │
└─────────────────┘
```

### Key Components

**1. Polling System** (`app/hooks/useGoogleDrive.ts`)
- Interval: 1-3 seconds (aggressive polling)
- Detection: Content-based comparison + version checks
- Status: ✅ Working correctly

**2. Sync Logic** (`app/hooks/useGoogleDrive.ts:syncFromDrive`)
- Downloads Drive data
- Compares with Firebase trades
- Identifies trades to create/update/delete
- Status: ✅ Working correctly

**3. Firebase Operations** (`app/services/tradeService.ts`)
- `deleteTrade()`: ❌ Failing with permission-denied
- `updateTrade()`: ❌ Failing with permission-denied
- `getTrades()`: ✅ Working correctly

**4. Auto-Sync** (`app/dashboard/page.tsx`)
- Uploads local changes to Drive
- Status: ✅ Working (but causes loop due to failed deletions)

---

## Attempted Fixes

### Fix 1: Skip `getDoc()` Check
**Problem:** `getDoc()` was failing with permission-denied  
**Fix:** Skip `getDoc()` when `existingUid` matches `userId`  
**Result:** ❌ `deleteDoc()` still fails with permission-denied

### Fix 2: Orphaned Trade Tracking
**Problem:** Failed deletions cause infinite loop  
**Fix:** Track orphaned trades in `localStorage`, exclude from sync  
**Result:** ⚠️ Mitigates loop but doesn't solve root cause

### Fix 3: Content-Based Detection
**Problem:** Version-based detection not reliable  
**Fix:** Added content comparison as fallback  
**Result:** ✅ Successfully detects Drive changes

### Fix 4: Graceful Error Handling
**Problem:** Sync fails completely when operations fail  
**Fix:** Use `Promise.allSettled()` to continue despite failures  
**Result:** ⚠️ Sync continues but trades remain in Firebase

---

## Critical Questions for Google Teams

### For Firebase/Firestore Team

1. **Q: Why do documents returned by `where('uid', '==', userId)` queries fail `deleteDoc()` with `permission-denied`?**
   - **Context:** Our query filters by `uid == userId`, so returned documents should have correct `uid`
   - **Expected:** `deleteDoc()` should succeed if `resource.data.uid == request.auth.uid`
   - **Actual:** `deleteDoc()` fails with `permission-denied`
   - **Request:** Please investigate why security rules reject operations on documents that pass ownership queries

2. **Q: Can we get more detailed error information from Firestore security rule failures?**
   - **Context:** Current errors only show "Missing or insufficient permissions"
   - **Request:** Can we see which specific rule condition failed? (e.g., "resource.data.uid != request.auth.uid")

3. **Q: Is there a recommended pattern for handling documents with missing or incorrect `uid` fields?**
   - **Context:** We suspect some documents may have been created without proper `uid` values
   - **Request:** Best practices for data migration/cleanup of orphaned documents

4. **Q: Should we add explicit null checks in security rules?**
   - **Current Rule:** `resource.data.uid == request.auth.uid`
   - **Proposed:** `resource.data.uid != null && resource.data.uid == request.auth.uid`
   - **Request:** Is this recommended, or does Firestore handle nulls automatically?

### For Google Drive API Team

1. **Q: Is content-based change detection the recommended approach for detecting manual Drive edits?**
   - **Context:** We're using content comparison as fallback when version checks fail
   - **Request:** Confirmation that this is acceptable, or recommendation for better approach

2. **Q: Are there rate limits or best practices for aggressive polling (1-3 second intervals)?**
   - **Context:** We're polling every 1-3 seconds to detect changes quickly
   - **Request:** Guidance on optimal polling frequency vs. API limits

---

## Recommended Next Steps

### Immediate Actions Needed

1. **Firebase Team Investigation**
   - Review Firestore security rules evaluation
   - Investigate why `deleteDoc()` fails on documents returned by ownership queries
   - Provide guidance on data integrity issues

2. **Data Audit**
   - Verify actual `uid` field values in Firestore documents
   - Identify documents with missing or incorrect `uid` fields
   - Plan migration/cleanup strategy

3. **Rule Enhancement**
   - Add explicit null checks to security rules
   - Consider adding debug logging to rule evaluation (if available)

### Long-Term Solutions

1. **Implement Data Migration**
   - Fix orphaned documents with missing/incorrect `uid` fields
   - Ensure all future documents have proper `uid` values

2. **Enhanced Error Handling**
   - Better error messages from Firestore
   - Automatic cleanup of orphaned documents

3. **Monitoring & Alerting**
   - Track permission-denied errors
   - Alert on data integrity issues

---

## Environment Details

- **Firebase Project:** Production Firestore database
- **API Version:** Google Drive API v3, Firebase Firestore v9
- **Authentication:** Firebase Auth (OAuth 2.0)
- **Framework:** React/Next.js (TypeScript)
- **Browser:** Chrome/Edge (latest)
- **File Type:** JSON files in Google Drive
- **Collection:** `/trades` (root-level collection)

---

## Debug Logs & Evidence

**Log File Location:** `.cursor/debug.log` (NDJSON format)

**Key Log Patterns:**
```bash
# Find all permission-denied errors
grep "permission-denied" .cursor/debug.log

# Find deletion attempts
grep "deleteTrade:attempting-delete" .cursor/debug.log

# Find sync operations
grep "syncFromDrive:deletion-complete" .cursor/debug.log
```

**Sample Error Sequence:**
1. `syncFromDrive:deletion-analysis` - Identifies trade to delete
2. `deleteTrade:skip-getDoc` - Skips getDoc() check (optimization)
3. `deleteTrade:attempting-delete` - Attempts deletion
4. `deleteTrade:error` - Fails with `permission-denied`
5. `syncFromDrive:deletion-complete` - Reports `successfulDeletions: 0`

---

## Contact Information

**Engineering Team:** Pocket Portfolio Development Team  
**Issue Priority:** 🔴 **CRITICAL** - Blocking Production Release  
**Timeline:** Need resolution ASAP for production deployment  
**Support Channels:** Google Cloud Support, Firebase Support, Drive API Support

---

## Appendix: Code References

### Firestore Security Rules
**File:** `firebase/firestore.rules`  
**Lines:** 56-66 (trades collection rules)

### Trade Service
**File:** `app/services/tradeService.ts`
- **Import Trades:** Lines 313-336
- **Delete Trade:** Lines 78-203
- **Update Trade:** Lines 231-310
- **Get Trades:** Lines 52-75

### Drive Sync
**File:** `app/hooks/useGoogleDrive.ts`
- **Sync From Drive:** Lines 813-1200
- **Polling:** Lines 1282-1500
- **Content Detection:** Lines 1600-1700

---

**End of CTO Report**







