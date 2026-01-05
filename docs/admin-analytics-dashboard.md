# Admin Analytics Dashboard

Complete guide to setting up and using the Admin Analytics Dashboard.

## Overview

The Admin Analytics Dashboard provides real-time insights into:
- 💰 **Monetization**: MRR, patrons, subscriptions, donations
- 🛠️ **Tool Usage**: Tax converter, Google Sheets, Advisor tool metrics
- 📈 **SEO Pages**: Page views, top pages, conversion rates

## Setup Instructions

### Step 1: Set Admin Custom Claim

Before accessing the dashboard, you need to set your Firebase user's admin custom claim.

#### Option A: Using the Script (Recommended)

1. Ensure your `.env.local` has Firebase Admin credentials:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. Run the script:
   ```bash
   npm run set-admin your-email@example.com
   ```
   
   Or directly with ts-node:
   ```bash
   ts-node --project scripts/tsconfig.json scripts/set-admin-claim.ts your-email@example.com
   ```

3. **Important**: Sign out and sign in again for the claim to take effect.

#### Option B: Manual Setup

If you have Firebase Admin SDK access, you can set the claim programmatically:

```typescript
import { getAuth } from 'firebase-admin/auth';

const auth = getAuth();
await auth.setCustomUserClaims(userUid, { admin: true });
```

### Step 2: Deploy Firestore Rules

Update your Firestore security rules to allow tool usage and page view tracking:

```bash
firebase deploy --only firestore:rules
```

The rules allow:
- Anyone to create `toolUsage` and `pageViews` documents (for analytics)
- Only admins to read these collections

### Step 3: Access the Dashboard

1. Sign in to your Pocket Portfolio account
2. Navigate to `/admin/analytics`
3. If you see "Access Denied", ensure:
   - You've set the admin custom claim
   - You've signed out and signed in again
   - Your Firebase token has been refreshed

## Dashboard Features

### Time Range Filtering

- **7 Days**: Last week's data
- **30 Days**: Last month's data (default)
- **90 Days**: Last quarter's data
- **All Time**: Complete historical data

### Monetization Section

Displays:
- **Monthly Recurring Revenue (MRR)**: Current MRR with progress toward goal
- **Active Patrons**: Number of monthly subscribers
- **One-Time Donations**: Donations from last 30 days
- **Subscription Breakdown**: Tier-by-tier breakdown with patron counts

### Tool Usage Section

Tracks three main tools:

1. **Tax Converter**
   - Total uses
   - Successful conversions
   - Last 7 days usage
   - Conversion rate
   - Top conversion pairs (e.g., "fidelity-to-turbotax")

2. **Google Sheets Tool**
   - Total uses
   - Formulas generated
   - Copy actions
   - Last 7 days usage
   - Conversion rate

3. **Advisor Tool**
   - Total uses
   - PDFs generated
   - Last 7 days usage
   - Conversion rate

### SEO Pages Section

Shows:
- **Total Page Views**: Across all SEO pages
- **Conversion Rate**: Views → Signups percentage
- **Top Pages**: Top 10 most viewed pages with view counts

## Data Sources

### Monetization Data
- **Source**: Stripe API
- **Updated**: Real-time (fetched on page load and every 5 minutes)
- **Collections**: Active subscriptions, payment intents

### Tool Usage Data
- **Source**: Firestore `toolUsage` collection
- **Updated**: Real-time as users interact with tools
- **Tracking**: Automatic via `app/lib/analytics/tools.ts`

### SEO Page Data
- **Source**: Firestore `pageViews` collection
- **Updated**: Real-time as pages are viewed
- **Tracking**: Can be integrated with page view tracking

## Integrating Tool Tracking

To track tool usage in your components, import and use the tracking functions:

```typescript
import { 
  trackToolPageView, 
  trackToolInteraction, 
  trackToolSuccess,
  trackToolDownload,
  trackToolCopy 
} from '@/app/lib/analytics/tools';

// Track page view
useEffect(() => {
  trackToolPageView('tax_converter', {
    sourceBroker: 'fidelity',
    targetSoftware: 'turbotax'
  });
}, []);

// Track file upload
const handleFileUpload = (file: File) => {
  trackToolInteraction('tax_converter', 'file_upload', {
    fileSize: file.size,
    conversionPair: 'fidelity-to-turbotax'
  });
};

// Track successful conversion
const handleConversionSuccess = (data: any) => {
  trackToolSuccess('tax_converter', {
    tradeCount: data.length,
    conversionPair: 'fidelity-to-turbotax'
  });
};

// Track download
const handleDownload = () => {
  trackToolDownload('tax_converter', 'csv', {
    tradeCount: convertedData.length
  });
};
```

## API Endpoints

### GET `/api/admin/analytics`

Fetches aggregated analytics data.

**Query Parameters:**
- `range`: Time range (`7d`, `30d`, `90d`, `all`)

**Response:**
```json
{
  "monetization": {
    "totalMRR": 150.00,
    "patronCount": 5,
    "goal": 200,
    "subscriptions": [...],
    "oneTimeDonations": 50.00
  },
  "toolUsage": {
    "taxConverter": {...},
    "googleSheets": {...},
    "advisorTool": {...}
  },
  "seoPages": {
    "totalViews": 1000,
    "topPages": [...],
    "conversionRate": 15.5
  },
  "timeRange": "30d",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/tool-usage`

Tracks tool usage events.

**Body:**
```json
{
  "toolType": "tax_converter",
  "action": "file_upload",
  "metadata": {
    "conversionPair": "fidelity-to-turbotax",
    "fileSize": 1024
  }
}
```

## Troubleshooting

### "Access Denied" Error

1. Verify admin claim is set:
   ```typescript
   const token = await user.getIdTokenResult();
   console.log('Is admin?', token.claims.admin === true);
   ```

2. Sign out and sign in again to refresh the token

3. Check Firebase Admin credentials in `.env.local`

### No Data Showing

1. **Monetization**: Verify Stripe API key is set in environment variables
2. **Tool Usage**: Check that tools are calling tracking functions
3. **SEO Pages**: Ensure page view tracking is implemented

### Firestore Permission Errors

1. Deploy updated Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Verify rules allow:
   - Anonymous writes to `toolUsage` and `pageViews`
   - Admin reads from these collections

## Security Notes

- Admin dashboard requires Firebase custom claim `admin: true`
- All analytics data is read-only for admins
- Tool usage tracking is anonymous (no PII stored)
- Firestore rules enforce admin-only reads

## Future Enhancements

Potential additions:
- Real-time charts and graphs
- Export data to CSV/JSON
- Email reports
- Custom date ranges
- Comparison periods
- Alert thresholds

