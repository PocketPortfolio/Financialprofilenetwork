# Performance Budget

## Bundle Size Limits

| Asset Type | Budget | Current | Status |
|------------|--------|---------|--------|
| Main JS | 200 KB | TBD | ✅ |
| Vendor (React) | 150 KB | TBD | ✅ |
| Vendor (Firebase) | 200 KB | TBD | ✅ |
| Total JS | 600 KB | TBD | ✅ |
| CSS | 50 KB | TBD | ✅ |
| Images | 500 KB | TBD | ✅ |
| **Total** | **1.5 MB** | **TBD** | **✅** |

## Core Web Vitals

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | < 2.5s | 2.5s - 4s | > 4s |
| **FID** (First Input Delay) | ≤ 100ms | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | ≤ 1.8s | < 1.8s | 1.8s - 3s | > 3s |
| **TBT** (Total Blocking Time) | ≤ 200ms | < 200ms | 200ms - 600ms | > 600ms |

## Network Performance

### 3G Network (Slow)
- **Target**: App should be interactive within 5s on Slow 3G
- **LCP**: ≤ 5s
- **TBT**: ≤ 1s

### 4G Network (Fast)
- **Target**: App should be interactive within 2s
- **LCP**: ≤ 2.5s
- **TBT**: ≤ 300ms

## Code Splitting Strategy

1. **Route-based splitting**:
   - Landing page bundle
   - App dashboard bundle
   - CSV playground bundle (lazy)
   - Admin tools (lazy)

2. **Vendor splitting**:
   - `react-vendor`: React + ReactDOM
   - `firebase-vendor`: Firebase SDK
   - `chart-libs`: Chart.js (if used, lazy load)

3. **Dynamic imports**:
   - CSV parser (PapaParse) - lazy load on demand
   - Charting libraries - lazy load
   - PDF export (if implemented) - lazy load

## Optimization Checklist

- [x] Code splitting configured
- [x] Tree shaking enabled
- [x] Minification enabled (Vite default)
- [ ] Brotli compression on Vercel
- [x] Image optimization (WebP where possible)
- [x] Lazy loading for heavy components
- [x] Service Worker for offline caching
- [ ] Font subsetting (if custom fonts used)
- [x] Preconnect to critical domains
- [x] Resource hints (preload/prefetch)

## Monitoring

- **Lighthouse CI**: Run on every PR
- **Bundle Analyzer**: Check bundle composition monthly
- **Real User Monitoring (RUM)**: Track Core Web Vitals from real users via telemetry

## Enforcement

- Bundle size checked in CI (fails if > budget)
- Lighthouse CI enforces performance score ≥ 85
- Accessibility score ≥ 95

## Review Schedule

- **Weekly**: Check Lighthouse scores in CI
- **Monthly**: Review bundle composition and update budgets
- **Quarterly**: Comprehensive performance audit

