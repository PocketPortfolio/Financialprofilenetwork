# Production Database Migrations

## Overview

This document describes the production-safe database migration strategy for the Sales Sidecar. All migrations are designed to be **idempotent** (safe to run multiple times) and **non-destructive** (only adds columns, never drops).

## Safety Features

✅ **Idempotent**: Safe to run multiple times  
✅ **Non-destructive**: Only adds columns, never drops  
✅ **Verified**: CI/CD blocks deployment if schema is incorrect  
✅ **Fast failure**: Exits immediately on critical errors  

## Pre-Deployment Checklist

Before deploying code that requires schema changes:

- [ ] Test migration in development environment
- [ ] Verify migration script is idempotent
- [ ] Backup production database (Supabase dashboard)
- [ ] Run migration in staging (if available)
- [ ] Verify schema after migration

## Migration Process

### 1. Before Deployment

```bash
# Verify current schema
npm run db:verify

# Run migration (idempotent, safe)
npm run db:migrate:prod
```

### 2. Deploy Code

- Push to main branch
- GitHub Actions will automatically:
  1. Verify schema before deployment
  2. Run migrations if needed
  3. Block deployment if schema is incorrect

### 3. Post-Deployment

```bash
# Verify schema matches expectations
npm run db:verify
```

## Available Scripts

### `npm run db:verify`
**Read-only schema verification**
- Checks if all required columns exist
- Exits with error code 1 if schema is incorrect
- Used in CI/CD to block deployments

### `npm run db:migrate:prod`
**Production-safe migration**
- Idempotent: Safe to run multiple times
- Only adds missing columns
- Creates indexes if needed
- Verifies schema after migration

### `npm run db:create`
**Initial table creation**
- Creates all base tables (leads, conversations, etc.)
- Only needed for fresh database setup
- Includes Sprint 4 fields

### `npm run db:push`
**Manual migration (development)**
- For local development only
- Uses manual SQL migration file

## CI/CD Integration

### Deployment Workflow (`.github/workflows/deploy.yml`)

The deployment workflow automatically:

1. **Verifies Schema** (blocks deployment if wrong)
   ```yaml
   - name: Verify Database Schema
     run: npm run db:verify
   ```

2. **Runs Migrations** (if needed, non-blocking)
   ```yaml
   - name: Run Database Migrations
     run: npm run db:migrate:prod
   ```

### Autonomous Revenue Engine (`.github/workflows/autonomous-revenue-engine.yml`)

All jobs verify schema before running:

- `source-leads`: Verifies schema before sourcing
- `enrich-and-email`: Verifies schema before processing
- `process-inbound`: Verifies schema before processing

## Required Columns (Sprint 4)

The following columns are required in the `leads` table:

- `location` (TEXT) - Lead location
- `timezone` (TEXT) - Timezone for scheduling
- `detected_language` (TEXT) - Detected language code
- `detected_region` (TEXT) - Detected region code
- `news_signals` (JSONB) - News events array
- `scheduled_send_at` (TIMESTAMP) - Scheduled send time

## Troubleshooting

### Schema Verification Fails

**Error**: `Missing X required column(s)`

**Solution**:
```bash
npm run db:migrate:prod
```

### Migration Fails

**Error**: `Migration failed: [error message]`

**Check**:
1. Database connection string is correct
2. Database user has ALTER TABLE permissions
3. No conflicting migrations running

**Solution**: Check Supabase logs and retry migration

### Table Doesn't Exist

**Error**: `leads table does not exist`

**Solution**:
```bash
npm run db:create
```

## Manual Production Migration

If you need to run migrations manually in production:

1. **Connect to Supabase Dashboard**
   - Go to SQL Editor
   - Use production database connection

2. **Run Migration Script**
   ```bash
   # Set production database URL
   export SUPABASE_SALES_DATABASE_URL="postgresql://..."
   
   # Run migration
   npm run db:migrate:prod
   ```

3. **Verify**
   ```bash
   npm run db:verify
   ```

## Rollback Strategy

**Note**: Current migrations are **additive only** (no rollback needed)

If you need to remove columns in the future:

1. **Create rollback migration script**
2. **Test in development**
3. **Backup production data**
4. **Run rollback migration**
5. **Verify schema**

## Best Practices

1. **Always test migrations locally first**
2. **Run `db:verify` before deploying**
3. **Keep migrations idempotent**
4. **Document schema changes in PR descriptions**
5. **Monitor deployment logs for migration errors**

## Environment Variables

Required for migrations:

- `SUPABASE_SALES_DATABASE_URL` - Production database connection string
- Must be set in:
  - GitHub Secrets (for CI/CD)
  - Vercel Environment Variables (for production)
  - `.env.local` (for local development)

## Support

If migrations fail in production:

1. Check GitHub Actions logs
2. Check Supabase logs
3. Verify environment variables
4. Run `npm run db:verify` manually
5. Contact DevOps team if issue persists

