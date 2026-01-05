# Sovereign Sync Implementation Guide

## Overview

Sovereign Sync is a Google Drive integration that allows users to sync their portfolio data across devices while maintaining full data sovereignty. The feature is available exclusively to Founder's Club members.

## Architecture

### Components

1. **Google Drive Service** (`app/lib/google-drive/driveService.ts`)
   - Handles OAuth authentication with Google
   - Manages file operations (create, read, update)
   - Uses Google Identity Services for client-side OAuth

2. **React Hook** (`app/hooks/useGoogleDrive.ts`)
   - Manages sync state
   - Provides connect/disconnect functionality
   - Handles automatic sync with debouncing (5s delay)
   - Checks for updates on app load

3. **UI Components**
   - `CloudStatusIcon`: Dashboard header indicator
   - `DriveSyncSettings`: Settings page section

### Data Flow

1. **On Connect:**
   - User authenticates with Google Drive
   - System searches for existing `pocket_portfolio_db.json`
   - If found, compares timestamps (Drive vs Local)
   - Pulls newer data or creates new file

2. **On Edit:**
   - Changes trigger debounced sync (5s delay)
   - Portfolio data is serialized to JSON
   - File is updated in Google Drive

3. **On App Load:**
   - Checks for Drive connection
   - Compares file timestamps
   - Pulls updates if Drive is newer

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing: `pocket-portfolio-sync`
3. Enable **Google Drive API v3**
4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add authorized origins:
   - `http://localhost:3001` (development)
   - `https://www.pocketportfolio.app` (production)
7. Copy the **Client ID**

### 2. Environment Variables

Add to `.env` and Vercel:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. OAuth Scope

The implementation uses the minimal scope:
- `https://www.googleapis.com/auth/drive.file` - Only access files created by the app

This ensures user trust by not requesting full Drive access.

## File Format

The sync file (`pocket_portfolio_db.json`) matches the export format:

```json
{
  "trades": [...],
  "metadata": {
    "createdAt": "2025-01-23T...",
    "lastUpdated": "2025-01-23T...",
    "version": "1.0.0",
    "tradeCount": 10,
    "dataSize": 1234
  }
}
```

## Premium Gating

The feature is gated to Founder's Club members:

```typescript
const { tier } = usePremiumTheme();
const isFoundersClub = tier === 'foundersClub';
```

Free users see an upgrade modal when attempting to connect.

## Conversion Hints

1. **Export Toast:** When users export CSV, they see: "Tired of manual backups? Enable Auto-Sync to Drive."
2. **Settings Visibility:** Drive sync section is always visible, creating FOMO for free users
3. **Dashboard Icon:** Cloud status icon shows sync state, encouraging connection

## Security Considerations

1. **Token Storage:** Access tokens stored in localStorage (encrypted in future)
2. **Scope Limitation:** Only `drive.file` scope requested
3. **File Isolation:** Only app-created files are accessible
4. **Encryption:** Optional AES-256 encryption before sync (Phase 2)

## Future Enhancements (Phase 2)

1. **Encryption:** Implement client-side encryption before sync
2. **Excel Export:** Generate `pocket_view.xlsx` for read-only viewing
3. **Conflict Resolution:** UI for handling sync conflicts
4. **Sync History:** Track sync events and errors

## Testing

### Local Testing

1. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`
2. Run `npm run dev`
3. Navigate to Settings → Data Sovereignty & Sync
4. Click "Connect Google Drive"
5. Complete OAuth flow
6. Verify file appears in Google Drive
7. Make changes to portfolio
8. Verify sync after 5 seconds

### Production Testing

1. Verify environment variable in Vercel
2. Test OAuth flow in production
3. Test sync across multiple devices
4. Verify premium gating works correctly

## Troubleshooting

### OAuth Errors
- Verify Client ID is correct
- Check authorized origins match exactly
- Ensure Drive API is enabled

### Sync Failures
- Check browser console for errors
- Verify token hasn't expired
- Check Drive API quota limits

### File Not Found
- First sync creates the file automatically
- Verify user has Drive storage available

## Support

For issues or questions, contact the engineering team.








