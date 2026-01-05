# How to Extract Firebase Admin Credentials from JSON

If you downloaded the `serviceAccountKey.json` file from Firebase Console, here's how to extract the values for your `.env.local` file.

## Step 1: Download the JSON File

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pocket-portfolio-67fa6`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (e.g., `pocket-portfolio-67fa6-firebase-adminsdk-xxxxx.json`)

## Step 2: Extract Values

The JSON file looks like this:

```json
{
  "type": "service_account",
  "project_id": "pocket-portfolio-67fa6",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@pocket-portfolio-67fa6.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pocket-portfolio-67fa6.iam.gserviceaccount.com"
}
```

## Step 3: Add to .env.local

Extract these three values and add them to your `.env.local`:

```bash
# From the JSON file:
FIREBASE_PROJECT_ID=pocket-portfolio-67fa6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pocket-portfolio-67fa6.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Important Notes:

1. **FIREBASE_PROJECT_ID**: Copy the `project_id` value exactly
2. **FIREBASE_CLIENT_EMAIL**: Copy the `client_email` value exactly
3. **FIREBASE_PRIVATE_KEY**: 
   - Copy the entire `private_key` value (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - **Keep the quotes** around it
   - **Keep the `\n` characters** - they're important!
   - The value should look like: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

## Step 4: Verify Setup

Run the verification script:

```bash
npm run verify-env
```

This will check:
- ✅ All required variables are set
- ✅ Variables are in the correct format
- ✅ Firebase Admin SDK can initialize

## Quick Copy-Paste Helper

If you have the JSON file open, you can use this mapping:

| JSON Field | .env Variable | Example Value |
|------------|---------------|---------------|
| `project_id` | `FIREBASE_PROJECT_ID` | `pocket-portfolio-67fa6` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@...` |
| `private_key` | `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

## Common Mistakes

❌ **Wrong**: `FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...` (missing quotes)
✅ **Correct**: `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

❌ **Wrong**: Removing `\n` characters
✅ **Correct**: Keep all `\n` characters as they appear in the JSON

❌ **Wrong**: Using `NEXT_PUBLIC_FIREBASE_PROJECT_ID` for admin SDK
✅ **Correct**: Use `FIREBASE_PROJECT_ID` (without `NEXT_PUBLIC_` prefix)

## Security Reminder

⚠️ **Never commit the JSON file or `.env.local` to git!**
- The JSON file contains sensitive credentials
- `.env.local` is already in `.gitignore`
- Delete the JSON file after extracting values

---

**After setting up, test with**: `npm run verify-env`


