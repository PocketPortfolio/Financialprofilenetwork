# Changelog

All notable changes to Pocket Portfolio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Broker-Agnostic CSV Import System 📊
- **Import Adapters**: 15 broker adapters for US, UK/EU, and crypto exchanges
- **Auto-Detection**: Smart broker detection with 95%+ accuracy on fixtures
- **Locale Support**: i18n-aware date/number parsing for en-US, en-GB, de-DE, fr-FR
- **Feature Flag**: `NEXT_PUBLIC_IMPORT_ADAPTERS_V1` for gradual rollout
- **UI Components**: 4-step import wizard with preview and confirmation
- **Server Route**: Optional server-side parsing for large files (>10MB)
- **Analytics**: Privacy-safe telemetry for import events
- **Testing**: Comprehensive unit tests, E2E tests, and contract validation
- **Documentation**: Developer guide and broker matrix with known quirks

### Added - Brand V2 Rebrand 🎨
- **Design Tokens**: Complete CSS custom property system for colors, typography, spacing, shadows, and more
- **Theme System**: BrandProvider with light/dark/contrast/system modes and localStorage persistence
- **Brand Utilities**: CSS-first utility classes for cards, badges, KPIs, responsive layouts
- **Animations**: Subtle, purposeful motion with `prefers-reduced-motion` support
- **SEO System**: Comprehensive metadata helpers, JSON-LD structured data, dynamic OG images
- **Brand Assets**: New SVG logo mark and wordmark with evidence-first aesthetic
- **Analytics**: Brand engagement events (theme toggle, nav clicks, CTA interactions)
- **Brand Documentation**: Voice guide, tokens reference, and architectural decision record

### Added - Previous Features
- **Waitlist System**: Complete waitlist signup functionality with privacy-first design
  - Email collection with deduplication and rate limiting
  - Privacy-preserving analytics and monitoring
  - Admin interface for development and management
  - Comprehensive test coverage (unit and E2E)
  - GDPR-compliant data handling
  - Mobile-responsive signup forms
  - CTA buttons in header and footer
- **Price Pipeline Resilience**: Circuit breaker, timeout wrappers, multi-provider fallback
- **CSV Auto-Detection**: Header mapping, delimiter detection, duplicate detection
- **CSV Rules Playground**: Debug and test CSV imports before uploading
- **Watchlist Component**: Track multiple symbols with live price updates
- **Telemetry System**: Privacy-first analytics with user consent
- **Security Hardening**: Enhanced Firestore rules, auth guards, CSP headers
- **Performance Budgets**: Lighthouse CI, bundle size limits, Core Web Vitals targets
- **Accessibility**: WCAG 2.1 Level AA compliance, keyboard navigation, ARIA labels
- **Comprehensive Tests**: Vitest units (80%+ coverage), Playwright E2E, Firestore rules tests
- **CI/CD Pipelines**: Automated lint/test/build/deploy with GitHub Actions
- **Documentation**: README, CONTRIBUTING, performance budget, accessibility checklist

### Changed
- **TypeScript**: Upgraded to strict mode with comprehensive type coverage
- **Build System**: Vite with code splitting and vendor chunking
- **API Layer**: Standardized error normalization and retry logic
- **Component Architecture**: Added Suspense boundaries, skeleton loaders, error boundaries

### Fixed
- **Price Fetching**: Improved fallback handling when primary provider fails
- **CSV Parsing**: Better encoding detection and error messages
- **Layout Shift**: Reduced CLS by adding skeleton loaders

### Security
- **Firestore Rules**: Least-privilege access with owner-only data
- **CSP Headers**: Strict Content-Security-Policy configured
- **Rate Limiting**: API endpoints protected from abuse
- **Input Validation**: Zod schemas for all data inputs

## [1.0.0] - 2024-01-15

### Added
- Initial release
- CSV trade import with PapaParse
- Manual trade entry with mock trade support
- Google authentication with Firebase
- Live price proxies for Yahoo Finance
- Progressive Web App with offline caching
- Basic portfolio metrics

### Security
- Firebase Auth integration
- Firestore security rules
- HTTPS enforced

## [0.9.0] - 2023-12-01

### Added
- Beta release for testing
- Core portfolio tracking
- CSV import MVP

---

## Version Guidelines

### Major (X.0.0)
- Breaking changes
- Major feature overhauls
- Architecture changes

### Minor (x.X.0)
- New features
- Non-breaking enhancements
- Deprecations

### Patch (x.x.X)
- Bug fixes
- Security patches
- Documentation updates

## Release Process

1. Update CHANGELOG with new version
2. Update package.json version
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions deploys to production
6. Create GitHub Release with notes

