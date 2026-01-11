# ✅ Token Update Checklist

## Current Error: 401 Unauthorized

This means the Access Token is either:
1. Not updated in `.env.local`
2. Invalid/incorrect
3. Not properly loaded

## ✅ Verification Steps

### 1. Check `.env.local` File

Make sure you have **ALL 4** Twitter credentials:

```bash
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_new_access_token  # ← Must be the NEW one after regeneration
TWITTER_ACCESS_TOKEN_SECRET=your_new_access_token_secret  # ← Must be the NEW one after regeneration
```

### 2. Verify Token Format

- **Access Token**: Usually starts with numbers (e.g., `1234567890-...`)
- **Access Token Secret**: Long alphanumeric string (e.g., `AbCdEf123456...`)

### 3. Common Issues

❌ **Old token still in file** - Make sure you replaced the old values  
❌ **Extra spaces** - No spaces around the `=` sign  
❌ **Quotes** - Don't use quotes around values  
❌ **Wrong file** - Must be `.env.local`, not `.env`  

### 4. After Updating `.env.local`

1. **Save the file**
2. **Close and reopen terminal** (or restart your IDE)
3. **Test again:**
   ```bash
   npm run test-metronome:post
   ```

### 5. If Still Not Working

Double-check in Twitter Developer Portal:
- Go to "Keys and tokens"
- Verify the Access Token shown matches what's in `.env.local`
- If they don't match, copy the correct one from Twitter

---

**The API Key and Secret don't change - only Access Token and Secret need updating!**

