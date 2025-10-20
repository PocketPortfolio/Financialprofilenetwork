# QA Runbook

## Local Development Testing

### Prerequisites
- Node.js 18+
- Firebase CLI installed: `npm install -g firebase-tools`
- Playwright browsers installed: `npx playwright install`

### Setup

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Start Firebase Emulators** (in separate terminal)
   ```bash
   firebase emulators:start
   ```
   
   Emulators will start on:
   - Auth: http://localhost:9099
   - Firestore: http://localhost:8080
   - Functions: http://localhost:5001

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   App will be available at http://localhost:3001

### Test Categories

#### Unit Tests (Vitest)
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

#### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run e2e:headed

# Run with UI
npm run e2e:ui

# Run specific test file
npx playwright test tests/e2e/auth.signin.spec.ts
```

#### Firestore Rules Tests
```bash
# Run rules tests
npm run test:rules
```

#### Lighthouse Performance Tests
```bash
# Build and run Lighthouse
npm run build
npm run preview
npm run test:lighthouse
```

### Common Issues

#### Flaky Tests
- **Problem**: Tests fail intermittently
- **Solution**: 
  - Use network stubs instead of real API calls
  - Ensure proper waits for async operations
  - Check for race conditions in component rendering

#### Auth Issues
- **Problem**: OAuth tests fail
- **Solution**: 
  - Ensure Firebase emulators are running
  - Clear emulator data: `firebase emulators:export --force`
  - Mock OAuth in E2E tests using MSW

#### Emulator Conflicts
- **Problem**: "Address already in use" errors
- **Solution**:
  - Kill running emulator processes
  - Clear emulator data between runs
  - Use `firebase emulators:exec` for isolated runs

#### Port Conflicts
- **Problem**: Port 3001 already in use
- **Solution**:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:3001 | xargs kill -9
  ```

## CI/CD

### Continuous Integration

The CI pipeline runs on every PR and includes:
1. **Linting** - Code style checks
2. **Type checking** - TypeScript validation
3. **Unit tests** - With coverage reporting
4. **E2E tests** - Critical user journeys
5. **Build** - Production build verification

### Viewing Test Results

#### Playwright Traces
When tests fail in CI:
1. Download the `test-results` artifact from GitHub Actions
2. Extract and open in Playwright:
   ```bash
   npx playwright show-trace path/to/trace.zip
   ```

#### Coverage Reports
1. Download the `coverage` artifact from GitHub Actions
2. Open `coverage/index.html` in a browser

#### Lighthouse Reports
1. Download the `lighthouse-results` artifact
2. Open `.lighthouseci/lhr-*.html` files

### Debugging Failed Tests

1. **Check test logs** in GitHub Actions output
2. **Download artifacts** (traces, screenshots, videos)
3. **Reproduce locally**:
   ```bash
   # Run same test configuration as CI
   PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
   ```

## Test Data Management

### Seeding Test Data

Test data is defined in `tests/seeds/index.json` and includes:
- Trades (sample portfolio data)
- Users (test accounts)
- Waitlist entries

The `seedData` function in `tests/utils/firebaseEmulator.ts` handles data loading.

### Clearing Test Data

```typescript
import { getTestApp, clearCollections } from './tests/utils/firebaseEmulator';

const { db } = getTestApp();
await clearCollections(db);
```

## Best Practices

### Test Isolation
- Each test should be independent
- Use `beforeEach` to set up fresh state
- Clean up after tests (clear databases, reset mocks)

### Deterministic Tests
- Use fake timers for date/time operations
- Set explicit timezone (UTC) in config
- Avoid real network calls (use mocks)

### Performance
- Parallelize tests where possible
- Use test.describe.configure({ mode: 'parallel' })
- Keep test data minimal

### Accessibility
- Run axe checks on all routes
- Test keyboard navigation
- Verify focus management

## Troubleshooting

### Firebase Emulator Issues

**Symptom**: "Could not reach Firestore backend"
```bash
# Solution: Restart emulators with clean state
firebase emulators:start --import=./emulator-data --export-on-exit
```

**Symptom**: Rules tests failing unexpectedly
```bash
# Solution: Update rules and restart
firebase deploy --only firestore:rules
firebase emulators:start --only firestore
```

### Playwright Issues

**Symptom**: "Browser not found"
```bash
# Solution: Reinstall browsers
npx playwright install --with-deps
```

**Symptom**: Tests timing out
- Increase timeout in playwright.config.ts
- Check for proper `waitForSelector` usage
- Ensure dev server is running

## Contact

For questions or issues:
- **Slack**: #qa-team
- **GitHub**: Create an issue with `qa` label
- **Email**: qa@pocketportfolio.app

---

**Last Updated**: 2025-10-18  
**Maintained by**: QA Team



