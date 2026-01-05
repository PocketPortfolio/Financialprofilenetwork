# Drive JSON Edit Sync Issue - Google Partners Support Request

## Problem Statement

Users can edit the `pocket_portfolio_db.json` file directly in Google Drive, but these edits are **not syncing back to Pocket Portfolio**. The app should support **bidirectional, real-time sync** where both platforms can work side-by-side and respect each other's changes.

## Expected Behavior

1. User edits JSON file in Google Drive (e.g., removes a trade)
2. Pocket Portfolio detects the change within 15 seconds (polling interval)
3. Pocket Portfolio pulls the updated data from Drive
4. UI updates to reflect the Drive changes
5. Both platforms remain in sync

## Current Behavior

- ✅ Pocket Portfolio → Drive sync works (changes in app sync to Drive)
- ❌ Drive → Pocket Portfolio sync **does not work** (Drive edits are not detected)

## Technical Architecture

### Sync Mechanism

- **Polling Interval**: 15 seconds (`VERSION_POLL_INTERVAL_MS = 15000`)
- **Sync Method**: Version-based sync using Drive API `version` field and `headRevisionId`
- **Detection Logic**: 
  - Fetch file metadata every 15 seconds
  - Compare `remoteVersion` vs `localVersion` (numeric comparison)
  - If `remoteVersion > localVersion` AND `modifiedByMe === false`, pull changes

### Current Implementation

```typescript
// Polling logic in useGoogleDrive.ts
1. Fetch metadata: driveService.getFileMetadata(fileId)
2. Get version: metadata.version || metadata.headRevisionId
3. Check modifier: metadata.lastModifyingUser?.me
4. If modifiedByMe === true: Skip pull (our own upload)
5. If modifiedByMe === false AND remoteVersion > localVersion: Pull changes
6. Call syncFromDrive() to download and apply changes
```

## Hypotheses for Why Sync Fails

### Hypothesis 1: `lastModifyingUser.me` Incorrectly True
**Issue**: When user edits JSON in Drive using the same Google account, `lastModifyingUser.me` might be `true`, causing the app to skip pulling changes.

**Evidence Needed**: 
- Check if `lastModifyingUser.me` is `true` when user manually edits in Drive
- Verify if Drive API correctly identifies manual edits vs. API uploads

**Question for Google**: Does `lastModifyingUser.me` return `true` for manual edits made by the same user in the Drive web interface?

### Hypothesis 2: Version Not Incrementing on Manual Edits
**Issue**: Drive API `version` field might not increment when file is edited manually in Drive web interface.

**Evidence Needed**:
- Check if `version` field changes when JSON is edited in Drive
- Verify if `headRevisionId` changes instead

**Question for Google**: Does the `version` field increment when a file is manually edited in Drive web interface, or only when edited via API?

### Hypothesis 3: Polling Not Running
**Issue**: Polling might be stopped or blocked by safeguards (deletion, CSV import, etc.).

**Evidence Needed**:
- Check if polling interval is active
- Verify if safeguards are incorrectly blocking polls

### Hypothesis 4: Version Comparison Logic Error
**Issue**: Numeric comparison might fail if versions are strings or null.

**Evidence Needed**:
- Check if versions are being compared correctly
- Verify if fallback to timestamp comparison is working

## API Calls Being Made

### 1. Get File Metadata (Every 15 seconds)
```javascript
GET https://www.googleapis.com/drive/v3/files/{fileId}?fields=id,kind,name,version,headRevisionId,modifiedTime,createdTime,size,parents,lastModifyingUser
```

**Response Fields Used**:
- `version`: File version number
- `headRevisionId`: Latest revision ID
- `lastModifyingUser.emailAddress`: Email of last modifier
- `lastModifyingUser.me`: Boolean indicating if current user modified
- `modifiedTime`: Timestamp of last modification

### 2. Download File (When Pull Needed)
```javascript
GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media
```

## Debugging Information

### Instrumentation Added

We've added extensive logging to track:
1. **Polling cycles**: When polling runs, what metadata is fetched
2. **Version comparison**: Local vs. remote version values and comparison results
3. **Modifier check**: Who modified the file (`lastModifyingUser`)
4. **Pull decisions**: Why pulls are or aren't happening
5. **Sync execution**: When `syncFromDrive()` is called and what data is received

### Log Locations

All debug logs are sent to: `http://127.0.0.1:43110/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0`

Key log events:
- `polling:metadata-fetched`: Drive metadata fetched during polling
- `polling:modification-check`: Check of who modified the file
- `polling:external-modification`: External edit detected
- `polling:own-modification`: Our own upload detected (skip pull)
- `polling:version-comparison`: Numeric version comparison
- `polling:will-pull`: Decision to pull changes
- `polling:version-pull`: Actually pulling from Drive
- `syncFromDrive:called`: Sync function called
- `syncFromDrive:downloaded`: Data downloaded from Drive

## Questions for Google Partner Engineering

1. **`lastModifyingUser.me` Behavior**:
   - Does `lastModifyingUser.me` return `true` for manual edits made by the same user in Drive web interface?
   - Is there a way to distinguish between API uploads and manual edits?

2. **Version Field Behavior**:
   - Does the `version` field increment when a file is manually edited in Drive?
   - Should we rely on `headRevisionId` instead for detecting manual edits?

3. **Real-time Sync Recommendations**:
   - What's the recommended approach for detecting Drive file changes?
   - Should we use Drive API webhooks instead of polling?
   - Is there a push notification mechanism for file changes?

4. **Best Practices**:
   - What's the recommended polling interval for file change detection?
   - Are there rate limits we should be aware of?

## Reproduction Steps

1. Connect Pocket Portfolio to Google Drive
2. Wait for initial sync to complete
3. Open `pocket_portfolio_db.json` in Google Drive
4. Manually edit the file (e.g., remove a trade entry)
5. Save the file in Drive
6. Wait 30 seconds (2 polling cycles)
7. **Expected**: Pocket Portfolio should detect and pull the changes
8. **Actual**: Changes are not detected/synced

## Next Steps

1. **Collect Debug Logs**: Run reproduction with instrumentation enabled
2. **Analyze Logs**: Check which hypothesis is correct
3. **Engage Google Partners**: Share findings and get API behavior clarification
4. **Implement Fix**: Based on Google's recommendations

## Related Files

- `app/hooks/useGoogleDrive.ts`: Main sync logic
- `app/lib/google-drive/driveService.ts`: Drive API wrapper
- `app/lib/google-drive/types.ts`: Type definitions








