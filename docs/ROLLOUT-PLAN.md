# Rollout & Backout Plan - Version 2.0

## Risk Assessment

### High Risk Areas

| Area | Risk Level | Impact | Likelihood | Mitigation |
|------|------------|--------|------------|------------|
| **Firestore Rules Changes** | 🔴 High | Users locked out | Low | Test thoroughly, deploy rules separately |
| **Price Provider Fallback** | 🟡 Medium | Stale prices | Medium | Monitor health endpoint, have rollback ready |
| **CSV Parser Rewrite** | 🟡 Medium | Import failures | Low | Keep old parser as fallback, extensive testing |
| **Auth Flow Changes** | 🔴 High | Login broken | Low | Test with test accounts, staged rollout |
| **Database Migrations** | 🔴 High | Data corruption | Low | Backup before migration, dual-read/dual-write |
| **Bundle Size Increase** | 🟢 Low | Slower load | Low | Monitor bundle size in CI |
| **API Breaking Changes** | 🔴 High | App crashes | Low | Version endpoints, maintain v1 compatibility |

### Low Risk Areas

| Area | Why Low Risk | Validation |
|------|--------------|------------|
| **UI Component Updates** | Isolated, no data impact | Visual regression tests |
| **Documentation Changes** | No code impact | Preview in PR |
| **New Features (opt-in)** | Users must enable | Feature flags |
| **Performance Optimizations** | Backward compatible | Lighthouse CI |
| **Accessibility Improvements** | Additive changes | A11y tests |

## Rollout Strategy

### Phase 0: Pre-Rollout (Week -1)

**Objectives**: Validate in staging, prepare rollback

#### Tasks
- [ ] Deploy to staging environment
- [ ] Run full test suite (unit + E2E + Firestore rules)
- [ ] Lighthouse audit (must pass thresholds)
- [ ] Security audit (npm audit, Gitleaks)
- [ ] Manual QA checklist completed
- [ ] Prepare rollback scripts
- [ ] Document rollback procedure
- [ ] Communicate rollout schedule to team

#### Success Criteria
- All tests passing
- Performance budget met
- No security vulnerabilities
- Team sign-off

---

### Phase 1: Canary Deployment (10% traffic, 24 hours)

**Objectives**: Validate with real traffic, catch unforeseen issues

#### Deployment
```bash
# Deploy to Vercel with canary routing
vercel --prod
# Note: Vercel Pro plan required for traffic splitting
```

#### Monitoring (First 4 Hours - Active)
- [ ] Error rate < 1%
- [ ] Latency p95 < 500ms
- [ ] Price provider health stable
- [ ] No auth failures
- [ ] CSV imports succeeding

#### Monitoring (Next 20 Hours - Passive)
- [ ] Error rate remains < 1%
- [ ] No user complaints
- [ ] Telemetry shows normal usage patterns

#### Success Criteria
- Error rate ≤ baseline + 0.5%
- No P0/P1 incidents
- User feedback neutral/positive
- Core Web Vitals within budget

#### Rollback Triggers
- Error rate > 5%
- Auth completely broken
- Data loss detected
- P0 incident lasting > 30 min

---

### Phase 2: Progressive Rollout (50% traffic, 24 hours)

**Objectives**: Scale to half of users, monitor performance at scale

#### Deployment
```bash
# Increase canary traffic to 50%
vercel promote [DEPLOYMENT_URL] --prod --target=50
```

#### Monitoring
- [ ] Error rate stable
- [ ] Latency does not increase
- [ ] Firebase quota usage acceptable
- [ ] No memory/timeout issues in serverless functions

#### Success Criteria
- Same as Phase 1
- Firebase read/write quotas < 70% of limit
- Vercel function execution times < 10s

#### Rollback Triggers
- Same as Phase 1
- Firebase quota exceeded
- Serverless function timeouts > 1%

---

### Phase 3: Full Rollout (100% traffic)

**Objectives**: Complete rollout to all users

#### Deployment
```bash
# Promote to 100% traffic
vercel promote [DEPLOYMENT_URL] --prod --target=100
```

#### Monitoring (First 48 Hours)
- [ ] Continuous monitoring of all metrics
- [ ] On-call engineer assigned
- [ ] Team available for rapid response

#### Success Criteria
- All Phase 1 & 2 criteria met at full scale
- No rollback triggered
- User feedback positive

#### Post-Rollout (Week +1)
- [ ] Review telemetry data
- [ ] Analyze performance metrics
- [ ] Document any issues/learnings
- [ ] Update runbook with new procedures
- [ ] Retrospective meeting

---

## Rollback Procedures

### Fast Rollback (< 5 minutes)

**Use When**: Critical P0 incident, immediate action required

```bash
# Option 1: Vercel Dashboard
# 1. Go to: https://vercel.com/YOUR_ORG/pocket-portfolio/deployments
# 2. Find last known good deployment (mark it with alias before rollout!)
# 3. Click "..." > "Promote to Production"

# Option 2: Vercel CLI
vercel rollback --prod
# Rolls back to previous production deployment

# Option 3: Specific Deployment
vercel rollback [DEPLOYMENT_URL] --prod
```

**Post-Rollback**:
1. Verify app is working
2. Post incident update
3. Investigate root cause
4. Fix and re-test before next attempt

---

### Partial Rollback (Firestore Rules Only)

**Use When**: Rules breaking auth but code is fine

```bash
# 1. Checkout last known good rules
git checkout HEAD~1 firebase/firestore.rules

# 2. Deploy rules only
firebase deploy --only firestore:rules --project=YOUR_PROJECT

# 3. Verify users can access data
# Test with user account in staging
```

---

### Data Migration Rollback

**Use When**: Migration caused data issues

```bash
# 1. Stop migration (if running)
# Kill migration process

# 2. Restore from backup
firebase firestore:import gs://YOUR_BACKUP_BUCKET/YYYYMMDD

# 3. Verify data integrity
# Spot-check critical documents

# 4. Communicate to users
# Explain any data loss (if applicable)
```

---

## Rollback Decision Matrix

| Symptom | Severity | Action | Decision Maker |
|---------|----------|--------|----------------|
| Error rate 1-5% | P2 | Monitor closely | On-call engineer |
| Error rate 5-10% | P1 | Prepare rollback, investigate | Tech lead |
| Error rate > 10% | P0 | Immediate rollback | On-call (no approval needed) |
| Auth broken (all users) | P0 | Immediate rollback | On-call |
| Auth broken (< 10% users) | P1 | Investigate, prepare rollback | Tech lead |
| Price fetching broken | P1 | Check providers, consider rollback | On-call |
| CSV import failing | P2 | Monitor, investigate | Tech lead |
| Performance degradation (LCP > 4s) | P2 | Investigate, optimize | Tech lead |

---

## Communication Plan

### Internal Communication

| Phase | Channel | Frequency | Audience |
|-------|---------|-----------|----------|
| Pre-rollout | Slack #engineering | Once | All engineers |
| Canary | Slack #incidents | Hourly updates | On-call + leads |
| Progressive | Slack #incidents | Every 4 hours | On-call + leads |
| Full rollout | Slack #engineering | Daily | All engineers |
| Incident | Slack #incidents | Real-time | All engineers |

### External Communication

| Event | Channel | Timing | Content |
|-------|---------|--------|---------|
| Major rollout | Twitter/X | 24 hours before | "Exciting updates coming to Pocket Portfolio!" |
| Planned downtime | In-app banner | 48 hours before | "Scheduled maintenance on [DATE]" |
| Incident (P0/P1) | Status page | Immediately | "We're investigating an issue..." |
| Resolution | Status page + Twitter | After fix | "Issue resolved. Details: ..." |

---

## Monitoring Dashboard

### Key Metrics to Watch

| Metric | Tool | Alert Threshold | Action |
|--------|------|-----------------|--------|
| Error rate | Vercel Analytics | > 5% | Investigate |
| Latency (p95) | Vercel Analytics | > 1s | Optimize or rollback |
| LCP | Vercel Analytics | > 4s | Investigate |
| Price provider health | Custom `/api/health-price` | All unhealthy | Check providers |
| Firebase read/write | Firebase Console | > 80% quota | Optimize queries |
| Auth failures | Firebase Console | > 5% | Investigate |

### Dashboard Links
- **Vercel**: https://vercel.com/YOUR_ORG/pocket-portfolio/analytics
- **Firebase**: https://console.firebase.google.com/project/YOUR_PROJECT
- **Upstash** (if used): https://console.upstash.com/

---

## Post-Rollout Checklist

**Day 1**:
- [ ] Monitor dashboard continuously
- [ ] Review error logs
- [ ] Check user feedback channels
- [ ] Verify critical flows working

**Week 1**:
- [ ] Analyze telemetry data
- [ ] Review performance metrics vs. baseline
- [ ] Document any issues encountered
- [ ] Update rollback procedures if needed

**Week 4**:
- [ ] Retrospective meeting with team
- [ ] Update risk assessment based on learnings
- [ ] Plan next rollout improvements
- [ ] Archive rollout logs and metrics

---

## Contacts & Escalation

| Role | Contact | For Issues |
|------|---------|------------|
| On-Call Engineer | Slack @oncall | Any incident |
| Tech Lead | Slack @tech-lead | Decision approval |
| Engineering Manager | Slack @eng-manager | P0 escalation |
| Security Team | security@example.com | Security incidents |
| Vercel Support | support@vercel.com | Platform issues |
| Firebase Support | Firebase Console | Database/Auth issues |

---

## Lessons Learned Template

After each rollout, document:

### What Went Well
- [List successes]

### What Went Wrong
- [List issues]

### Actionable Items
- [ ] [Improvement 1]
- [ ] [Improvement 2]

### Rollout Metrics
- **Deployment duration**: X minutes
- **Incidents**: X (P0: X, P1: X, P2: X)
- **Rollbacks**: X
- **User impact**: X users affected
- **Downtime**: X minutes

