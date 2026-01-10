# Resend Webhook Setup Guide

## Overview

This guide walks you through setting up Resend webhooks to track email delivery statuses (bounced, delayed, delivered) for the Sales Pilot system. This is critical for the **Throttle Governor** and **Dead Lead Purge** systems.

---

## Step 1: Get Your Webhook URL

Your webhook endpoint is already deployed at:

```
https://www.pocketportfolio.app/api/agent/webhooks/resend
```

**For local development:**
```
http://localhost:3001/api/agent/webhooks/resend
```

---

## Step 2: Access Resend Dashboard

1. Go to [https://resend.com](https://resend.com)
2. Log in to your account
3. Navigate to **Settings** → **Webhooks** (or **API Keys** → **Webhooks**)

---

## Step 3: Create a New Webhook

1. Click **"Add Webhook"** or **"Create Webhook"**
2. Fill in the webhook configuration:

   **Webhook URL:**
   ```
   https://www.pocketportfolio.app/api/agent/webhooks/resend
   ```

   **Events to Subscribe To:**
   - ✅ `email.sent` (already handled)
   - ✅ `email.delivered` (optional - for success tracking)
   - ✅ `email.bounced` (REQUIRED - for dead lead detection)
   - ✅ `email.delivery_delayed` (REQUIRED - for throttle governor)
   - ✅ `email.received` (already handled)
   - ✅ `email.complained` (optional - for spam complaints)
   - ✅ `email.opened` (optional - for engagement tracking)
   - ✅ `email.clicked` (optional - for engagement tracking)

   **Note:** At minimum, you MUST enable:
   - `email.bounced`
   - `email.delivery_delayed`

3. Click **"Save"** or **"Create Webhook"**

---

## Step 4: Verify Webhook Secret (Optional but Recommended)

Resend will generate a webhook secret. To enable signature verification:

1. Copy the webhook secret from Resend dashboard
2. Add it to your `.env.local`:

```bash
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

3. Uncomment the signature verification code in `app/api/agent/webhooks/resend/route.ts`:

```typescript
// Verify webhook signature
const signature = request.headers.get('resend-signature');
if (!verifySignature(signature, body)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

**Note:** For now, signature verification is disabled for easier testing. Enable it in production.

---

## Step 5: Test the Webhook

### Option A: Use Resend's Test Feature

1. In Resend dashboard, find your webhook
2. Click **"Test Webhook"** or **"Send Test Event"**
3. Select event type: `email.bounced` or `email.delivery_delayed`
4. Check your application logs to verify the webhook was received

### Option B: Manual Test with cURL

```bash
# Test bounced event
curl -X POST https://www.pocketportfolio.app/api/agent/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.bounced",
    "data": {
      "id": "test-email-id-123",
      "to": "test@example.com",
      "bounce_type": "hard",
      "bounce_sub_type": "invalid_email"
    }
  }'

# Test delivery_delayed event
curl -X POST https://www.pocketportfolio.app/api/agent/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.delivery_delayed",
    "data": {
      "id": "test-email-id-456",
      "to": "test@example.com",
      "last_event": "delivery_delayed"
    }
  }'
```

### Option C: Check Application Logs

After sending a test email, check your application logs for:

```
❌ Email bounced for lead <lead-id>: hard (invalid_email)
⚠️  Email delivery delayed for lead <lead-id>: delivery_delayed
```

---

## Step 6: Verify Webhook is Working

### Check Audit Logs

Run this SQL query to verify webhook events are being logged:

```sql
SELECT 
  action,
  ai_reasoning,
  metadata->>'deliveryStatus' as delivery_status,
  metadata->>'bounceType' as bounce_type,
  created_at
FROM audit_logs
WHERE metadata->>'deliveryStatus' IN ('bounced', 'delivery_delayed')
ORDER BY created_at DESC
LIMIT 10;
```

### Check Lead Status Updates

Run this SQL query to verify leads are being marked as UNQUALIFIED:

```sql
SELECT 
  id,
  email,
  company_name,
  status,
  updated_at
FROM leads
WHERE status = 'UNQUALIFIED'
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

## Step 7: Monitor Webhook Health

### In Resend Dashboard

1. Go to **Webhooks** → **Your Webhook**
2. Check the **"Recent Events"** or **"Webhook Logs"** section
3. Look for:
   - ✅ **200 OK** responses (success)
   - ❌ **4xx/5xx** responses (errors)

### In Your Application

Check application logs for webhook processing:

```bash
# If using Vercel
vercel logs --follow

# If using local dev
# Check console output
```

---

## Step 8: Troubleshooting

### Webhook Not Receiving Events

1. **Check Webhook URL:**
   - Ensure it's publicly accessible (not localhost)
   - Test with `curl` or Postman

2. **Check Resend Configuration:**
   - Verify webhook is enabled
   - Verify events are subscribed
   - Check webhook logs in Resend dashboard

3. **Check Application Logs:**
   - Look for webhook POST requests
   - Check for errors in webhook handler

### Events Not Processing Correctly

1. **Check Database:**
   - Verify `conversations` table has `emailId` matching Resend email IDs
   - Verify `audit_logs` table is receiving events

2. **Check Code:**
   - Verify webhook handler is deployed
   - Check for TypeScript/build errors

### Signature Verification Failing

1. **Check Secret:**
   - Verify `RESEND_WEBHOOK_SECRET` is set correctly
   - Ensure secret matches Resend dashboard

2. **Check Headers:**
   - Verify `resend-signature` header is being sent
   - Check signature format matches Resend's expected format

---

## Step 9: Production Checklist

Before going live, ensure:

- [ ] Webhook URL is production URL (not localhost)
- [ ] Webhook secret is set in production environment
- [ ] Signature verification is enabled (uncomment code)
- [ ] All required events are subscribed (`bounced`, `delivery_delayed`)
- [ ] Webhook is tested and working
- [ ] Application logs are monitored
- [ ] Database queries are working to verify events

---

## Step 10: Monitor and Maintain

### Daily Checks

1. Check Resend webhook logs for errors
2. Check application logs for webhook processing
3. Verify throttle governor is working (check `delivery_delayed` rate)
4. Run `purge-dead-leads` script if needed

### Weekly Checks

1. Review bounce rates in Resend dashboard
2. Check domain blacklist for problematic domains
3. Review throttle governor effectiveness
4. Check Auto-Replenishment is working (leads being sourced after UNQUALIFIED)

---

## Additional Resources

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks)
- [Resend Webhook Events Reference](https://resend.com/docs/webhooks/events)
- [Sales Pilot Webhook Handler Code](../app/api/agent/webhooks/resend/route.ts)
- [Throttle Governor Code](../lib/sales/throttle-governor.ts)

---

## Support

If you encounter issues:

1. Check application logs
2. Check Resend webhook logs
3. Verify database connections
4. Test webhook endpoint manually with cURL
5. Check Resend API status page

---

**Last Updated:** January 2026  
**Status:** Production Ready ✅

