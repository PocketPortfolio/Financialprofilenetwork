# QA Exit Criteria

## Production-Ready Gates

All gates below must pass before deploying to production.

### Coverage
- **Unit test coverage**: ≥ 80% lines, 75% branches
- **Critical E2E tests**: 100% pass rate on tests tagged `@critical`
- **All test suites**: Zero flaky tests in CI

### Functionality
- **Critical User Journeys (CUJs)**: All pass
  - Google Sign-In (success & failure paths)
  - CSV Import (eToro, Coinbase, OpenBrokerCSV formats)
  - Portfolio positions (add/remove trades, P/L calculations)
  - Live quotes with provider fallback
  - Waitlist submission with deduplication
- **Firestore Rules**: 100% pass rate
- **API Contracts**: All Zod schemas validated against live/mock responses

### Performance
- **Lighthouse (mobile)**: 
  - Performance ≥ 0.85
  - Accessibility ≥ 0.95
  - Best Practices ≥ 0.95
  - SEO ≥ 0.90
- **Web Vitals**:
  - LCP (Largest Contentful Paint) ≤ 2.5s
  - CLS (Cumulative Layout Shift) < 0.1
  - TBT (Total Blocking Time) ≤ 200ms

### Security & Privacy
- **Rate Limiting**: 
  - Correct 429 responses with headers (`X-RateLimit-*`, `Retry-After`)
  - Backoff mechanism works as expected
- **Security Headers**: 
  - Content-Security-Policy (CSP) with nonce
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy denying camera/mic/geolocation
- **Privacy**: No PII (email, uid) in client-side telemetry payloads
- **Secrets**: No API keys or secrets in code (gitleaks scan passes)

### Quality
- **Console Errors**: Zero console errors in CUJs
- **Uncaught Promises**: No uncaught promise rejections
- **Accessibility**: Zero serious/critical violations (axe-core)
- **Focus Management**: Keyboard navigation works; focus rings visible

## Sign-Off Checklist

Before production deployment, verify:

- [ ] All automated tests pass in CI
- [ ] Test artifacts reviewed (Playwright traces, LHCI reports, coverage)
- [ ] Performance budgets met for all routes
- [ ] Security headers verified in staging
- [ ] Privacy compliance confirmed (no PII in logs/analytics)
- [ ] Rate limiting tested under load
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Error states and fallbacks tested
- [ ] Manual smoke test on staging environment

## Metrics Dashboard

Track these metrics weekly:
- Test pass rate: Target 100%
- Test execution time: Target < 10 minutes
- Coverage delta: No decrease week-over-week
- Lighthouse scores: Monitor trends
- Production error rate: Target < 0.1%

---

**Last Updated**: 2025-10-18  
**Owner**: QA Team


