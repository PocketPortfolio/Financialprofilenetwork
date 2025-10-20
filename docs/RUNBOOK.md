# Operational Runbook

## Overview

This runbook provides operational procedures for Pocket Portfolio production environment.

## Architecture

- **Frontend**: Vite + React, deployed on Vercel Edge Network
- **Backend**: Vercel Serverless Functions (Edge Runtime)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Caching**: Upstash Redis (optional)

## Monitoring

### Health Checks

**Price Pipeline Health**
- URL: `https://pocketportfolio.app/api/health-price`
- Expected: HTTP 200, providers array with health status
- Alert if: All providers show `activeFallback: false` and recent failures

**Application Health**
- URL: `https://pocketportfolio.app/`
- Expected: HTTP 200, LCP < 2.5s
- Alert if: 5xx errors, LCP > 4s

### Metrics to Watch

1. **Error Rate**: < 1% of requests
2. **Latency (p95)**: < 500ms for API, < 2.5s for LCP
3. **Availability**: > 99.5% uptime
4. **Price Provider Health**: At least 1 provider healthy

### Dashboards

- **Vercel Analytics**: Real-time traffic and errors
- **Firebase Console**: Auth failures, Firestore usage
- **Upstash Dashboard**: Redis cache hit rate (if enabled)

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P0** | Total outage | 15 min | App down, all users affected |
| **P1** | Major degradation | 1 hour | Price fetching broken |
| **P2** | Partial degradation | 4 hours | CSV import slow |
| **P3** | Minor issue | 1 day | UI glitch |

### Escalation Path

1. **On-call engineer** (primary responder)
2. **Tech lead** (if unresolved in 30 min)
3. **Engineering manager** (if P0/P1 and unresolved in 1 hour)

### Communication Channels

- **Status Page**: Update at https://status.pocketportfolio.app (if available)
- **Twitter/X**: Post updates @pocketportfolio
- **Discord**: Pin message in #incidents channel

## Common Issues

### Issue: All Price Providers Failing

**Symptoms**: Health endpoint shows all providers unhealthy

**Diagnosis**:
```bash
# Check provider health
curl https://pocketportfolio.app/api/health-price

# Check if Yahoo is blocked
curl -v https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL

# Check Vercel logs
vercel logs --project=pocket-portfolio --since=1h
```

**Resolution**:
1. Check if Yahoo Finance is experiencing outage
2. Verify Vercel Edge Functions are deployed
3. Check rate limits (429 responses)
4. If Yahoo blocked, enable `DISABLE_YAHOO_QUOTE=1` to force fallback

**Prevention**: Monitor provider health, implement exponential backoff

---

### Issue: Firebase Auth Down

**Symptoms**: Users can't sign in, 5xx errors

**Diagnosis**:
```bash
# Check Firebase status
open https://status.firebase.google.com/

# Check Firestore rules deployment
firebase deploy --only firestore:rules --project=YOUR_PROJECT
```

**Resolution**:
1. Check Firebase Status Dashboard
2. Verify project quotas not exceeded
3. Check service account permissions
4. If Firebase down, communicate to users via status page

**Prevention**: Monitor Firebase uptime, set up billing alerts

---

### Issue: High Memory Usage (Serverless Functions)

**Symptoms**: 500 errors, slow responses, functions timing out

**Diagnosis**:
```bash
# Check Vercel function logs
vercel logs --project=pocket-portfolio --since=30m | grep "Task timed out"

# Check function memory usage in Vercel dashboard
```

**Resolution**:
1. Identify heavy functions (likely `/api/quote` with many symbols)
2. Increase function memory in `vercel.json`:
   ```json
   {
     "functions": {
       "api/quote.js": { "memory": 1024 }
     }
   }
   ```
3. Deploy: `vercel --prod`

**Prevention**: Implement request batching, limit symbols per request

---

### Issue: Firestore Quota Exceeded

**Symptoms**: 429 errors, read/write failures

**Diagnosis**:
```bash
# Check Firestore usage in Firebase Console
# Navigate to: Firestore Database > Usage

# Check current quotas
# Free tier: 50K reads/day, 20K writes/day
```

**Resolution**:
1. Identify high-volume queries (check telemetry collection)
2. Optimize queries with indexes
3. Consider upgrading to Blaze plan if legitimate usage
4. Implement client-side caching to reduce reads

**Prevention**: Monitor daily usage, set up alerts at 80%

---

### Issue: CSP Violations Blocking Resources

**Symptoms**: Console errors, resources not loading

**Diagnosis**:
```bash
# Check browser console for CSP violations
# Look for: "Refused to load script from..."

# Review CSP header in vercel.json
```

**Resolution**:
1. Identify blocked resource domain
2. Update `vercel.json` CSP header to allow domain
3. Test in preview deployment first
4. Deploy to production

**Prevention**: Test CSP changes in preview environments

## Deployment Procedures

### Standard Deployment (Production)

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run CI checks locally
npm run ci

# 3. Deploy to production
vercel --prod

# 4. Monitor deployment
# Watch Vercel dashboard for build status
# Check https://pocketportfolio.app/ loads correctly

# 5. Verify critical paths
# - Sign in works
# - Price fetching works
# - CSV import works
```

### Hotfix Deployment

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Make minimal fix
# Edit files...

# 3. Test locally
npm run dev
npm run test

# 4. Commit and push
git commit -m "fix: critical bug description"
git push origin hotfix/critical-bug

# 5. Deploy immediately
vercel --prod

# 6. Create PR for review (post-deploy)
# Merge to main after review
```

### Rollback Procedure

```bash
# Option 1: Vercel Dashboard
# 1. Go to https://vercel.com/YOUR_ORG/pocket-portfolio/deployments
# 2. Find last known good deployment
# 3. Click "..." menu > "Promote to Production"

# Option 2: CLI
# 1. List deployments
vercel ls pocket-portfolio --prod

# 2. Rollback to specific deployment
vercel rollback [DEPLOYMENT_URL] --prod

# 3. Verify rollback
curl -I https://pocketportfolio.app/
```

**Rollback Decision Criteria**:
- Error rate > 5%
- P0 incident unresolved after 30 min
- Critical functionality broken

## Maintenance Windows

### Scheduled Maintenance

**When**: Tuesdays 02:00-04:00 UTC (low traffic window)

**Procedure**:
1. Announce 48 hours in advance
2. Post maintenance banner on app
3. Perform maintenance
4. Verify all systems operational
5. Remove banner and announce completion

### Database Migrations

```bash
# 1. Test migration in dev environment
npm run dev
# Run migration script

# 2. Backup production data
firebase firestore:export gs://YOUR_BACKUP_BUCKET

# 3. Deploy migration
# migrations run on-demand, not automatically

# 4. Monitor for errors
# Check Firestore logs, app error rate

# 5. Rollback plan ready
# Keep migration rollback script handy
```

## Disaster Recovery

### Data Backup

- **Frequency**: Daily automated backups (Firestore)
- **Retention**: 30 days
- **Location**: Firebase automated backups + GCS bucket

**Manual Backup**:
```bash
firebase firestore:export gs://YOUR_BACKUP_BUCKET/$(date +%Y%m%d)
```

### Data Restore

```bash
# 1. Identify backup to restore
gsutil ls gs://YOUR_BACKUP_BUCKET/

# 2. Restore Firestore data
firebase firestore:import gs://YOUR_BACKUP_BUCKET/20240115

# 3. Verify data integrity
# Check Firestore console, spot-check documents
```

### Recovery Time Objectives (RTO)

| Incident Type | RTO | RPO |
|---------------|-----|-----|
| App deployment issue | 15 min | 0 (rollback) |
| Database corruption | 2 hours | 24 hours (daily backup) |
| Total infrastructure loss | 4 hours | 24 hours |

## Security Incidents

### Suspected Breach

1. **Isolate**: Rotate all API keys and secrets immediately
2. **Assess**: Check audit logs (Firebase, Vercel)
3. **Notify**: Email affected users within 72 hours (GDPR)
4. **Document**: Create incident report
5. **Review**: Post-mortem and preventive measures

### Rotating Secrets

```bash
# 1. Generate new secrets
# Firebase: Console > Project Settings > Service Accounts > Generate Key
# Upstash: Dashboard > Database > REST API > Regenerate Token

# 2. Update Vercel environment variables
vercel env rm UPSTASH_REDIS_REST_TOKEN production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# 3. Redeploy
vercel --prod

# 4. Verify old secrets no longer work
```

## Contact Information

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call Engineer | Slack #incidents | 24/7 |
| Tech Lead | tech-lead@example.com | Business hours |
| Security Team | security@example.com | 24/7 |
| Firebase Support | Firebase Console | 24/7 (Paid plan) |
| Vercel Support | support@vercel.com | 24/7 (Pro plan) |

## Related Documentation

- [Architecture Diagram](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Security Policy](SECURITY.md)
- [Performance Budget](docs/performance-budget.md)

