# Sales Sidecar Setup Guide

This document explains how to set up and use the AI Sales Pilot module.

## Architecture Overview

The Sales Sidecar is a **separate module** from the main Pocket Portfolio app. It uses:

- **Database:** Supabase (PostgreSQL) - isolated from main app Firebase
- **Queue:** Trigger.dev (for async jobs)
- **Email:** Resend API
- **AI:** Vercel AI SDK (OpenAI GPT-4o)

**Key Principle:** Strict data isolation. User data (Firebase) never touches sales data (Supabase).

## Prerequisites

1. **Supabase Account**
   - Create a new project: https://supabase.com
   - Get connection string from: Project Settings → Database → Connection String
   - Enable `pgvector` extension for embeddings

2. **Resend Account**
   - Sign up: https://resend.com
   - Get API key from: API Keys section
   - Verify your domain

3. **OpenAI Account**
   - Get API key: https://platform.openai.com/api-keys

4. **Trigger.dev Account** (optional, for async jobs)
   - Sign up: https://trigger.dev
   - Get API key from dashboard

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in:
   ```bash
   SUPABASE_SALES_DATABASE_URL=postgresql://...
   RESEND_API_KEY=re_...
   OPENAI_API_KEY=sk-...
   SALES_RATE_LIMIT_PER_DAY=50
   EMERGENCY_STOP=false
   ```

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```

   This creates the following tables:
   - `leads` - Lead information
   - `conversations` - Email history
   - `embeddings` - Vector embeddings for RAG
   - `audit_logs` - Compliance audit trail

## Usage

### 1. Create a Lead

```bash
curl -X POST http://localhost:3001/api/agent/leads \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cto@example.com",
    "companyName": "Example Corp",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "CTO",
    "dataSource": "manual"
  }'
```

### 2. Send an Email

```bash
curl -X POST http://localhost:3001/api/agent/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "uuid-here",
    "emailType": "initial"
  }'
```

### 3. View Admin Dashboard

Navigate to: `http://localhost:3001/admin/sales`

Features:
- View all leads
- Send emails manually
- Monitor metrics
- Emergency stop toggle

## API Endpoints

### `POST /api/agent/leads`
Create a new lead.

### `GET /api/agent/leads?page=1&limit=50&status=NEW`
List leads with pagination.

### `POST /api/agent/send-email`
Send an AI-generated email to a lead.

**Body:**
```json
{
  "leadId": "uuid",
  "emailType": "initial" | "follow_up" | "objection_handling"
}
```

### `POST /api/agent/webhooks/resend`
Webhook endpoint for Resend inbound emails.

### `POST /api/agent/kill-switch`
Activate/deactivate emergency stop.

### `GET /api/agent/conversations?leadId=uuid`
Get conversation history for a lead.

## Compliance Features

### AI Disclosure
Every email automatically includes:
```
---
I am an AI Sales Pilot for Pocket Portfolio. Reply 'STOP' to pause.
Automated outreach • Human supervisor monitoring this thread.
```

### Guardrails
- **Forbidden phrases:** "guaranteed return", "risk-free", etc.
- **PII detection:** Credit cards, SSNs
- **Financial advice:** Blocks investment recommendations
- **Tone check:** Prevents aggressive sales language

### Opt-Out Handling
If a lead replies with "STOP", "unsubscribe", or "not interested":
1. Lead status → `DO_NOT_CONTACT`
2. `optOut` flag → `true`
3. Confirmation email sent
4. Conversation archived

## Rate Limiting

- **Default:** 50 emails/day (configurable via `SALES_RATE_LIMIT_PER_DAY`)
- **Storage:** Vercel KV (Redis)
- **Window:** 24 hours (resets at midnight UTC)

## Emergency Stop

Set `EMERGENCY_STOP=true` in environment variables to instantly pause all outbound emails.

Or use the admin dashboard toggle.

## Database Schema

### Leads
- `id` (UUID)
- `email` (unique)
- `companyName`
- `status` (NEW, CONTACTED, INTERESTED, DO_NOT_CONTACT, etc.)
- `score` (0-100)
- `techStackTags` (array)
- `optOut` (boolean)

### Conversations
- `id` (UUID)
- `leadId` (FK)
- `type` (INITIAL_OUTREACH, FOLLOW_UP, etc.)
- `direction` (outbound/inbound)
- `classification` (INTERESTED, NOT_INTERESTED, etc.)
- `aiReasoning` (text)

### Audit Logs
- `id` (UUID)
- `leadId` (FK, nullable)
- `action` (EMAIL_SENT, EMAIL_RECEIVED, etc.)
- `aiReasoning` (text)
- `humanOverride` (boolean)

## Next Steps

1. **Integrate Lead Data Source**
   - Update `app/agent/researcher.ts` to connect to Apollo/Proxycurl
   - Implement lead enrichment logic

2. **Set up Trigger.dev Jobs**
   - Create job for lead enrichment
   - Create job for follow-up emails

3. **Configure Resend Webhooks**
   - Point webhook URL to `/api/agent/webhooks/resend`
   - Verify webhook signature

4. **Warm Up Email Domain**
   - Start with 10 emails/day
   - Gradually increase to 50/day
   - Monitor deliverability

## Troubleshooting

### "SUPABASE_SALES_DATABASE_URL is required"
- Ensure environment variable is set in `.env.local`
- Check Supabase connection string format

### "Rate limit reached"
- Increase `SALES_RATE_LIMIT_PER_DAY` or wait for reset
- Check Vercel KV connection

### "Compliance violation"
- Review email content for forbidden phrases
- Ensure AI disclosure is included

### "Emergency stop activated"
- Set `EMERGENCY_STOP=false` in environment
- Or use admin dashboard to deactivate

## Support

For issues or questions, check:
- `/docs/SALES-SIDECAR-SETUP.md` (this file)
- `/app/agent/config.ts` (identity & rules)
- `/lib/sales/compliance.ts` (compliance checks)










