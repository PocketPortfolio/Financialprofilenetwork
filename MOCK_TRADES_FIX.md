# Mock Trades Fix - Action Required

## Issue Identified
Mock trades were failing due to Firestore permission errors: "Missing or insufficient permissions."

## Root Causes
1. **accountService.ts** was querying incorrect Firestore collection paths:
   - Was trying to access `/users/{userId}/trades` (doesn't exist in production)
   - Was trying to access `/pp/{uid}/meta` (doesn't exist)
   - Should have been using `/trades` with `uid` filter

2. **Firestore Rules** were missing the `mock` field in validation requirements

## Fixes Applied

### ✅ 1. Updated `app/services/accountService.ts`
- Fixed `exportUserData()` to query `/trades` collection with `uid` filter
- Fixed `deleteUserData()` to only query `/trades` collection
- Removed references to non-existent `/pp/{uid}/meta` collection

### ✅ 2. Updated `firebase/firestore.rules`
- Added `mock` field to required fields list in trade creation validation
- Changed line 61 from:
  ```
  && request.resource.data.keys().hasAll(['uid', 'ticker', 'type', 'qty', 'price', 'currency', 'date', 'createdAt']);
  ```
  To:
  ```
  && request.resource.data.keys().hasAll(['uid', 'ticker', 'type', 'qty', 'price', 'currency', 'date', 'mock', 'createdAt']);
  ```

## ⚠️ CRITICAL ACTION REQUIRED

**You MUST deploy the updated Firestore rules for mock trades to work!**

### Option A: Firebase Console (Fastest)
1. Go to: https://console.firebase.google.com/project/pocket-portfolio-67fa6/firestore/rules
2. Copy the entire contents of `firebase/firestore.rules`
3. Paste into the Firebase Console editor
4. Click "Publish"

### Option B: Firebase CLI
```bash
firebase login
firebase deploy --only firestore:rules
```

## Testing After Deployment
1. Clear browser cache and reload the application
2. Sign in with Google
3. Go to Dashboard
4. Upload a CSV file or add manual trades
5. Verify trades appear without permission errors
6. Test "Export Data" functionality
7. Test "Delete Account" functionality (use test account!)

## Expected Results After Fix
- ✅ CSV imports work without permission errors
- ✅ Mock trades can be created and viewed
- ✅ Export data downloads correctly
- ✅ Delete account removes all user trades
- ✅ No more "Missing or insufficient permissions" errors

## Files Modified
- `app/services/accountService.ts` - Fixed Firestore collection paths
- `firebase/firestore.rules` - Added `mock` field validation

## Build Status
✅ Application built successfully
✅ No TypeScript errors
✅ Ready for deployment after Firestore rules are published

