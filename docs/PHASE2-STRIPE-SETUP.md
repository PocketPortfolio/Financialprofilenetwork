# Phase 2: Stripe Configuration Guide

## ✅ Completed Tasks

1. ✅ Created `SCHEMA.md` with OpenBrokerCSV schema
2. ✅ Updated root `README.md` with disclaimer and schema preview
3. ✅ Updated npm package `README.md` with disclaimer
4. ✅ Added disclaimer to footer
5. ✅ Added Sponsor button to navbar (pink heart icon)
6. ✅ Created `/sponsor` page with Stripe checkout
7. ✅ Created API route `/api/create-checkout-session`
8. ✅ Published npm package v1.0.1

## ✅ Price IDs Configured

The Stripe Price IDs have been extracted from your dashboard and are now configured in `app/sponsor/page.tsx`:

- **Code Supporter** ($5/month): `price_1SeZh7D4sftWa1WtWsDwvQu5`
- **Feature Voter** ($20/month): `price_1SeZhnD4sftWa1WtP5GdZ5cT`
- **Corporate Sponsor** ($100/month): `price_1SeZigD4sftWa1WtTODsYpwE`
- **One-Time Donation** ($50): `price_1SeZj0D4sftWa1WtXkkVps9a`

## 🔧 Required Configuration

### 2. Set Environment Variables

Add these to your `.env.local` (for local development) and Vercel environment variables (for production):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs (optional - already configured in code)
NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER=price_1SeZh7D4sftWa1WtWsDwvQu5
NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER=price_1SeZhnD4sftWa1WtP5GdZ5cT
NEXT_PUBLIC_STRIPE_PRICE_CORPORATE=price_1SeZigD4sftWa1WtTODsYpwE
NEXT_PUBLIC_STRIPE_PRICE_DONATION=price_1SeZj0D4sftWa1WtXkkVps9a

# Base URL
NEXT_PUBLIC_BASE_URL=https://www.pocketportfolio.app
```

### 3. Price IDs Already Configured

✅ **Price IDs are already configured in code** (`app/sponsor/page.tsx`). The code uses environment variables as overrides, but will fall back to the hardcoded Price IDs if env vars are not set.

## 🧪 Testing

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3001/sponsor`
   - Click on a tier button
   - Should redirect to Stripe Checkout

2. **Verify npm Package:**
   - Visit: https://www.npmjs.com/package/@pocket-portfolio/importer
   - Check that version 1.0.1 is published
   - Verify disclaimer appears at top of README

3. **Verify Disclaimer:**
   - Check root README.md (top of file)
   - Check npm package README (top of file)
   - Check website footer

## 📋 Verification Checklist

- [x] Stripe Price IDs configured in code ✅
- [ ] `STRIPE_SECRET_KEY` set in environment (required for checkout to work)
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configured in code ✅
- [x] Sponsor button visible in navbar (pink heart icon) ✅
- [ ] `/sponsor` page loads without errors (test locally)
- [ ] Clicking a tier button redirects to Stripe Checkout (requires STRIPE_SECRET_KEY)
- [ ] Success page works after checkout
- [x] npm package v1.0.1 published with disclaimer ✅
- [x] Disclaimer visible in all locations (README, footer, npm) ✅

## 🚨 Important Notes

1. **Stripe Secret Key**: Never commit `STRIPE_SECRET_KEY` to git. Always use environment variables. **This is REQUIRED for checkout to work.**

2. **Price IDs**: ✅ Already configured in code. Environment variables are optional overrides.

3. **Test Mode**: If using Stripe test mode, use test keys:
   - Test publishable key: `pk_test_...`
   - Test secret key: `sk_test_...`

4. **Webhook Setup** (Optional but Recommended):
   - Set up Stripe webhooks to handle subscription events
   - Endpoint: `https://www.pocketportfolio.app/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.created`, etc.

## 📝 Next Steps

1. ✅ Price IDs configured in code
2. **Set `STRIPE_SECRET_KEY` environment variable** (REQUIRED)
3. Test checkout flow end-to-end
4. Set up Stripe webhooks (optional)
5. Monitor Stripe dashboard for successful payments

