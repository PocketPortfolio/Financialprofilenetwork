# Pocket Portfolio

**A privacy-first, production-ready investment tracking platform**

Pocket Portfolio is a modern web application for tracking investments across stocks, crypto, and FX. Import trades from any broker, visualize your portfolio in real-time, and gain insights—all while keeping your data secure and private.

[![CI Pipeline](https://github.com/your-org/pocket-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/pocket-portfolio/actions)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-95%2B-success)](https://developers.google.com/web/tools/lighthouse)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

### Core Functionality
- **📊 CSV Import**: Auto-detect broker formats, normalize data, and handle duplicates
- **💹 Live Prices**: Multi-provider fallback (Yahoo → Chart → Stooq) with health monitoring
- **🔒 Privacy-First**: No PII collected, opt-in telemetry, GDPR-friendly
- **📱 PWA**: Offline support, installable, fast performance
- **🔐 Secure by Default**: Firebase Auth, CSP headers, least-privilege Firestore rules

### Advanced Features
- **Watchlists**: Track multiple symbols with real-time price updates
- **Mock Trades**: Test strategies before committing capital
- **CSV Rules Playground**: Debug and test CSV import rules
- **Price Pipeline Health**: Monitor provider uptime and fallback status
- **Export/Import**: JSON snapshots for backup and migration

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Firebase project (for auth & data)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/pocket-portfolio.git
cd pocket-portfolio

# Install dependencies
npm install

# Copy environment template
cp env.example.md .env.local

# Edit .env.local with your Firebase config
# Get keys from: https://console.firebase.google.com

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Environment Variables

See `env.example.md` for full list. Key variables:

```bash
# Client-side (exposed)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# Server-side (Vercel only)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## 🛠️ Development

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # TypeScript check
npm run format           # Prettier format
npm run format:check     # Check formatting

# Testing
npm run test             # Unit tests (Vitest)
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI
npm run e2e              # E2E tests (Playwright)
npm run e2e:ui           # Playwright UI

# CI
npm run ci               # Run full CI suite locally
```

## 📁 Project Structure

```
pocket-portfolio-app/
├── src/                   # React app source
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (circuit breaker, CSV, etc.)
│   ├── services/          # API clients, Firebase
│   └── types/             # TypeScript schemas (Zod)
├── api/                   # Vercel serverless functions
│   ├── quote.js           # Multi-provider price quotes
│   ├── health-price.js    # Price pipeline health
│   └── _health.js         # Shared health store
├── tests/                 # Test suites
│   ├── lib/               # Unit tests
│   ├── e2e/               # Playwright E2E
│   └── firestore-rules.spec.ts
├── docs/                  # Documentation
├── firebase/              # Firestore rules & indexes
└── .github/workflows/     # CI/CD pipelines
```

## 🔐 Security

- **CSP Headers**: Strict Content-Security-Policy configured in `vercel.json`
- **Firestore Rules**: Least-privilege, owner-only access (see `firebase/firestore.rules`)
- **No Secrets in Client**: All sensitive keys server-side only
- **Rate Limiting**: API endpoints protected
- **HTTPS Only**: Strict-Transport-Security enforced

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## 🧪 Testing

- **Unit Tests**: Vitest with 80%+ coverage requirement
- **E2E Tests**: Playwright for critical user flows
- **Firestore Rules**: Dedicated test suite
- **Lighthouse CI**: Performance & accessibility checks on every PR

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Automatic Deployments**:
- PRs → Preview deployment with Lighthouse check
- `main` branch → Production deployment

### Environment Setup (Vercel Dashboard)
1. Add all environment variables from `env.example.md`
2. Configure domains
3. Enable Vercel Analytics (optional)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make changes and add tests
4. Run `npm run ci` to verify locally
5. Commit using conventional commits
6. Push and open a Pull Request

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility)
- **LCP**: < 2.5s on median device
- **CLS**: < 0.1
- **Bundle Size**: < 600 KB (gzipped)

See [docs/performance-budget.md](docs/performance-budget.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Lightning-fast build tool
- [Firebase](https://firebase.google.com/) - Auth & data backend
- [Vercel](https://vercel.com/) - Deployment platform
- [PapaParse](https://www.papaparse.com/) - CSV parsing

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/pocket-portfolio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/pocket-portfolio/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)

---

**Made with ❤️ for the investment community**
