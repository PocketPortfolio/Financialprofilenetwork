# Stripe Integration Debug Checklist

## Current Issue
The deployed application is using a Stripe **secret key** (`sk_live_...`) instead of a **publishable key** (`pk_live_...`) in the client-side code.

## Root Cause
`NEXT_PUBLIC_*` environment variables are embedded at **build time** into the JavaScript bundle. If the build happened before the environment variable was set correctly, the bundle contains the old (wrong) value.

## Solution: Force Fresh Build

### Step 1: Verify Vercel Environment Variable
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Verify it's set to: `pk_live_51SeZTKD4sftWa1WtU6oGAzAVSAp6qTLUOPMbK5gaetspAelBzAou1epdTwj9ngybvv8ZiSWJgdbSfSeaRCTezO9T00OzhxwstL`
4. Ensure it's set for **Production** environment

### Step 2: Clear Build Cache and Redeploy
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the **three dots (⋯)** on the latest deployment
3. Select **"Redeploy"**
4. **IMPORTANT:** Uncheck **"Use existing Build Cache"**
5. Click **"Redeploy"**

### Step 3: Verify After Deployment
1. Wait for deployment to complete
2. Open browser console (F12)
3. Look for: `🔍 Stripe Configuration:`
4. Check the output:
   - `keyType: "PUBLISHABLE ✅"` = Correct
   - `keyType: "SECRET ❌ (WRONG!)"` = Still wrong, need to check env var again

## Debugging Added

The code now includes console logging to help diagnose issues:

### Client-Side (Browser Console)
- `🔍 Stripe Configuration:` - Shows what key is being used
- `✅ Stripe.js loaded successfully` - Confirms Stripe loaded
- `🔄 Creating checkout session for:` - Shows checkout attempt
- `✅ Checkout session created:` - Confirms session creation
- `❌ API Error:` - Shows API errors

### Server-Side (Vercel Logs)
- `🔄 Creating Stripe checkout session:` - Shows API call
- `✅ Stripe checkout session created:` - Confirms success
- `❌ Stripe not initialized` - Missing secret key

## Verification Steps

1. **Check Browser Console:**
   ```
   🔍 Stripe Configuration: {
     envVarSet: true/false,
     keyPrefix: "pk_live_51SeZTKD4s...",
     keyType: "PUBLISHABLE ✅",
     keyLength: 105
   }
   ```

2. **Test Checkout Flow:**
   - Click any tier button
   - Should see: `🔄 Creating checkout session for:`
   - Should see: `✅ Checkout session created:`
   - Should redirect to Stripe Checkout

3. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check `/api/create-checkout-session` logs
   - Should see: `✅ Stripe checkout session created:`

## Common Issues

### Issue: Still seeing secret key after redeploy
**Solution:** 
- Double-check environment variable name (no typos)
- Ensure it's set for Production environment
- Try deleting and recreating the variable
- Check for duplicate variables with similar names

### Issue: Environment variable not found
**Solution:**
- Variable name must be exactly: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Must start with `NEXT_PUBLIC_` for client-side access
- Must be set before build runs

### Issue: API returns 500 error
**Solution:**
- Check `STRIPE_SECRET_KEY` is set (server-side only)
- Check Vercel function logs for error details
- Verify secret key starts with `sk_live_`

## Key Differences

| Key Type | Prefix | Used For | Location |
|----------|--------|----------|----------|
| **Publishable** | `pk_live_...` | Client-side (`loadStripe`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| **Secret** | `sk_live_...` | Server-side (API routes) | `STRIPE_SECRET_KEY` |

## Next Steps After Fix

1. ✅ Verify Stripe.js loads correctly
2. ✅ Test checkout flow end-to-end
3. ✅ Monitor Vercel logs for any errors
4. ✅ Remove debug logging (optional, for production)








