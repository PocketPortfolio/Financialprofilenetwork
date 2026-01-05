# CTO Technical Rundown: Google Drive Sync Issue
## Issue: Direct Drive Edits Not Syncing to Pocket Portfolio

**Date:** January 2025  
**Priority:** High  
**Status:** Under Investigation  
**Contact:** Pocket Portfolio Engineering Team

---

## Executive Summary

Pocket Portfolio implements a bidirectional sync system with Google Drive using the Google Drive API v3. Users can edit portfolio data either:
1. **In Pocket Portfolio** → Syncs to Drive ✅ (Working)
2. **Directly in Google Drive** (editing `pocket_portfolio_db.json`) → Should sync to Pocket Portfolio ❌ (Not Working)

**Current Behavior:** When users edit the JSON file directly in Google Drive (e.g., changing quantity from 3 to 4), the changes are **not reflected** in Pocket Portfolio, even though the file's `modifiedTime` is updated in Drive.

**Expected Behavior:** Changes made directly in Drive should be detected by our polling mechanism and automatically pulled into Pocket Portfolio within 2-5 seconds.

---

## Technical Architecture

### Sync Mechanism

1. **Polling Interval:** 2 seconds (`POLL_INTERVAL_MS = 2000`)
2. **Detection Method:** Compare Drive file `modifiedTime` with local `lastSyncTime`
3. **Pull Condition:** `driveTime > lastSyncTime + 1000` (1-second buffer to avoid race conditions)
4. **API Endpoint:** `GET https://www.googleapis.com/drive/v3/files/{fileId}?fields=id,name,modifiedTime,createdTime,size,parents`

### Current Implementation Flow

```
┌─────────────────┐
│  Pocket Portfolio│
│   (Local State)  │
└────────┬─────────┘
         │
         │ Poll every 2s
         ▼
┌─────────────────┐
│  Drive API      │
│  getFileMetadata │
└────────┬─────────┘
         │
         │ Compare modifiedTime
         ▼
    ┌─────────┐
    │ Newer?  │
    └────┬────┘
         │
    ┌────┴────┐
    │  YES    │  NO
    ▼         ▼
┌─────────┐  ┌──────────┐
│ Pull    │  │ Skip     │
│ Changes │  │ (Wait)   │
└─────────┘  └──────────┘
```

---

## Problem Statement

### User Report
> "I just edited the JSON file, I edited the quantity of stock from 3 to 4 and it didn't change on Pocket Portfolio. It shows you cannot edit element on drive and it appears on pocket portfolio. Except you clear the trade."

### Symptoms
1. ✅ **Pocket Portfolio → Drive sync:** Working correctly
2. ❌ **Drive → Pocket Portfolio sync:** Not detecting manual edits
3. ✅ **Deletion sync:** Works (clearing trades syncs correctly)

### Hypotheses

#### H1: Timestamp Comparison Issue
**Theory:** The `modifiedTime` from Drive API might not be updating immediately after manual edits, or there's a timezone/format mismatch.

**Evidence Needed:**
- Log `modifiedTime` values from Drive API before/after manual edits
- Compare Drive `modifiedTime` with local `lastSyncTime` format
- Check if Drive API returns updated timestamp immediately after edit

#### H2: Safeguard Logic Blocking Pulls
**Theory:** One of our safeguard mechanisms (recent upload, deletion in progress, CSV import) is incorrectly blocking legitimate Drive edits.

**Current Safeguards:**
- `shouldSkipDueToRecentUpload`: Blocks if upload within last 5 seconds
- `shouldSkipDueToVeryRecentChange`: Blocks if change is very recent (< 10 seconds)
- `shouldSkipDueToDeletion`: Blocks if deletion in progress (< 10 seconds)
- `shouldSkipDueToCsvImport`: Blocks if CSV import in progress (< 20 seconds)

**Evidence Needed:**
- Log which safeguard is blocking when Drive edit is made
- Verify safeguard timestamps are not persisting incorrectly

#### H3: Drive API Metadata Propagation Delay
**Theory:** Google Drive API might have a delay in updating `modifiedTime` after manual edits, causing our polling to miss the change.

**Evidence Needed:**
- Measure time between manual edit and `modifiedTime` update in Drive API
- Check if Drive API has eventual consistency guarantees

#### H4: File Content vs Metadata Mismatch
**Theory:** Drive API might update `modifiedTime` but the file content hasn't propagated yet, or vice versa.

**Evidence Needed:**
- Download file content immediately after detecting `modifiedTime` change
- Compare file content hash before/after edit

#### H5: Polling Not Running
**Theory:** The polling interval might not be active or is being stopped unexpectedly.

**Evidence Needed:**
- Verify polling interval is running
- Check if polling is stopped during certain operations

---

## Technical Details for Google Partners

### API Usage

**Endpoint:** `GET https://www.googleapis.com/drive/v3/files/{fileId}`

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
```
fields=id,name,modifiedTime,createdTime,size,parents
```

**Response Example:**
```json
{
  "id": "1a2b3c4d5e6f7g8h9i0j",
  "name": "pocket_portfolio_db.json",
  "modifiedTime": "2025-01-23T10:30:45.123Z",
  "createdTime": "2025-01-20T08:15:30.456Z",
  "size": "1234",
  "parents": ["0AbCdEfGhIjKl"]
}
```

### OAuth Scope
- **Scope Used:** `https://www.googleapis.com/auth/drive.file`
- **Permission:** Only access files created by the app
- **Token Storage:** Encrypted `refresh_token` in `localStorage`

### File Format
- **File Name:** `pocket_portfolio_db.json`
- **MIME Type:** `application/json`
- **Location:** User's Google Drive (in "Pocket Portfolio" folder or custom folder)

### Sync State Management
- **Local State:** React state + `localStorage` (for unauthenticated users)
- **Cloud State:** Firebase Firestore (for authenticated users)
- **Drive State:** JSON file in user's Google Drive

---

## Questions for Google Drive API Team

1. **Metadata Consistency:**
   - When a user manually edits a file in Google Drive (via web UI), how quickly is `modifiedTime` updated in the Drive API?
   - Is there eventual consistency, or is it immediate?
   - Are there any caching layers that might delay metadata updates?

2. **File Content Propagation:**
   - After a manual edit, is there a delay between when `modifiedTime` updates and when the file content is available via `GET /files/{fileId}`?
   - Should we use `alt=media` parameter to ensure we get the latest content?

3. **Polling Best Practices:**
   - Is polling every 2 seconds acceptable, or should we use a different approach?
   - Are there rate limits we should be aware of for `getFileMetadata` calls?
   - Would Google Drive Push Notifications be more appropriate for this use case?

4. **Timestamp Precision:**
   - What is the precision of `modifiedTime`? (milliseconds, seconds?)
   - Are there any timezone considerations we should account for?
   - Should we use `modifiedTime` or `modifiedByMeTime` for detecting user edits?

5. **Alternative Approaches:**
   - Should we use Google Drive Push Notifications (webhooks) instead of polling?
   - Are there any Drive API features specifically designed for bidirectional sync scenarios?

---

## Debugging Steps Taken

1. ✅ Added comprehensive logging to track:
   - Drive metadata checks
   - Timestamp comparisons
   - Safeguard logic decisions
   - File content before/after operations

2. ✅ Implemented safeguards to prevent:
   - Race conditions during uploads
   - Overwriting during CSV imports
   - Pulling stale data during deletions

3. 🔄 **In Progress:** Investigating why manual Drive edits aren't detected

---

## Next Steps

1. **Immediate:**
   - Collect runtime logs during manual Drive edit scenario
   - Analyze timestamp values and safeguard decisions
   - Verify polling is active during manual edits

2. **Short-term:**
   - Implement Google Drive Push Notifications (if recommended by Google)
   - Add file content hash comparison to detect changes even if timestamps are equal
   - Consider using `modifiedByMeTime` if it's more reliable for detecting user edits

3. **Long-term:**
   - Evaluate alternative sync architectures
   - Consider conflict resolution strategies for simultaneous edits

---

## Contact Information

**Engineering Team:** Pocket Portfolio  
**Repository:** [Private - Contact for access]  
**API Documentation:** https://developers.google.com/drive/api/v3/reference

---

## Appendix: Code References

### Polling Implementation
- **File:** `app/hooks/useGoogleDrive.ts`
- **Function:** `startPolling()` (line ~627)
- **Interval:** 2000ms
- **Detection Logic:** Lines 650-720

### Sync From Drive
- **File:** `app/hooks/useGoogleDrive.ts`
- **Function:** `syncFromDrive()` (line ~454)
- **Updates:** Firebase/localStorage + React state

### Drive Service
- **File:** `app/lib/google-drive/driveService.ts`
- **Method:** `getFileMetadata()` - Fetches file metadata including `modifiedTime`

---

**Document Version:** 1.0  
**Last Updated:** January 23, 2025  
**Status:** Awaiting Google Partner Response








