# Operation "Organic Magnet" - Setup Guide

## ✅ Implementation Complete

All three magnet tools have been successfully implemented:

1. **Phase 2: Tax Conversion Tool** - `/tools/[conversion_pair]`
2. **Phase 1: Google Sheets API Tool** - `/tools/google-sheets-formula`
3. **Phase 3: Advisor White-Label Tool** - `/for/advisors`

## 🔧 Required Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install the newly added `@pocket-portfolio/importer` package.

### 2. Configure Stripe Webhook

#### Step 1: Get Webhook Secret

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://www.pocketportfolio.app/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the "Signing secret" (starts with `whsec_`)

#### Step 2: Set Environment Variables

Add to your `.env.local` (local) and Vercel environment variables (production):

```bash
# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase Admin (for API key storage)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Step 3: Deploy Firestore Rules

The Firestore rules have been updated to allow API key storage (server-side only). Deploy them:

```bash
firebase deploy --only firestore:rules
```

Or manually copy `firebase/firestore.rules` to Firebase Console.

### 3. Test the Implementation

#### Test Tax Conversion Tool

1. Visit: `http://localhost:3001/tools/fidelity-to-turbotax`
2. Upload a Fidelity CSV file
3. Verify conversion works
4. Check that Sustainability Widget appears after download

#### Test Google Sheets Tool

1. Visit: `http://localhost:3001/tools/google-sheets-formula`
2. Enter a ticker (e.g., AAPL)
3. Copy the generated formula
4. Test with `demo_key` (should work)
5. Test rate limiting (make 21 requests quickly)

#### Test Advisor Tool

1. Visit: `http://localhost:3001/for/advisors`
2. Upload a logo
3. Verify preview updates
4. Test Corporate License gate (should show upgrade message)

### 4. Test Stripe Webhook (Production)

#### Using Stripe CLI (Recommended for Local Testing)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

#### Production Testing

1. Make a test purchase on `/sponsor`
2. Check webhook logs in Stripe Dashboard
3. Verify API key is stored in Firestore
4. Check success page displays API key

### 5. Verify API Key Validation

1. Get an API key from a successful purchase
2. Test in Google Sheets tool with the key
3. Verify unlimited access (no rate limiting)
4. Test with invalid key (should return 401)

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Tax Conversion Tool**
   - Conversion rate: Downloads / Visitors
   - Target: 25% (realistic: 10-15%)
   - Revenue: Sustainability Widget clicks → Sponsor page

2. **Google Sheets Tool**
   - Formula generation: # of formulas generated
   - API usage: Free tier vs. Paid tier
   - Conversion: Rate limit hits → Sponsor page
   - Target: 50-75 paying users by Month 3

3. **Advisor Tool**
   - Logo uploads: # of advisors uploading logos
   - Preview views: # of previews generated
   - Conversion: Preview → Corporate License
   - Target: 8-12 licenses by Month 3

### Google Analytics Events

All tools include GA4 event tracking:
- `tax_conversion` - Tax tool conversions
- `formula_generated` - Google Sheets formula generation
- `api_rate_limit` - Rate limit hits
- `advisor_preview` - Advisor tool previews

## 🚀 Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set environment variables (Stripe webhook secret, Firebase Admin)
- [ ] Deploy Firestore rules
- [ ] Configure Stripe webhook endpoint
- [ ] Test all three tools locally
- [ ] Deploy to production
- [ ] Submit new pages to Google Search Console
- [ ] Monitor webhook events in Stripe Dashboard
- [ ] Verify API key issuance works
- [ ] Test rate limiting on production

## 📝 Notes

### API Key Format

- Format: `pp_<base64>`
- Length: ~45 characters
- Storage: Firestore `apiKeys` and `apiKeysByEmail` collections
- Corporate License: Separate key stored in `corporateLicenses` collection

### Rate Limiting

- **Free Tier (demo_key)**: 20 calls/hour per IP
- **Paid Tier**: Unlimited (validated against Firestore)
- Storage: In-memory Map (production should use Redis/Vercel KV)

### Corporate License

- Stored in `localStorage` as `CORPORATE_KEY`
- Validated client-side in Advisor tool
- Server-side validation can be added for PDF generation

## 🐛 Troubleshooting

### Webhook Not Receiving Events

1. Check webhook secret is set correctly
2. Verify endpoint URL in Stripe Dashboard
3. Check server logs for errors
4. Test with Stripe CLI

### API Keys Not Appearing

1. Check Firestore rules are deployed
2. Verify Firebase Admin credentials
3. Check webhook is processing events
4. Verify email is stored in localStorage

### Rate Limiting Not Working

1. Check in-memory map is working (restarts reset limits)
2. Consider migrating to Redis/Vercel KV for production
3. Verify API key validation logic

## 🎯 Next Steps

1. **Optimize Rate Limiting**: Migrate to Redis/Vercel KV
2. **Add PDF Generation**: Implement server-side PDF generation for Advisor tool
3. **Email Delivery**: Send API keys via email (optional)
4. **Analytics Dashboard**: Build internal dashboard for monitoring
5. **A/B Testing**: Test different upsell messages

---

**Status**: ✅ All implementation complete, ready for testing and deployment.



