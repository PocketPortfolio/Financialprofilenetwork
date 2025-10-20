# Contributing to Pocket Portfolio

Thank you for considering contributing to Pocket Portfolio! This document outlines the process and guidelines.

## Code of Conduct

Be respectful, inclusive, and constructive. See our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** with tests
5. **Run CI checks** locally
6. **Push** and open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/pocket-portfolio.git
cd pocket-portfolio

# Add upstream remote
git remote add upstream https://github.com/original/pocket-portfolio.git

# Install dependencies
npm install

# Create .env.local with your Firebase config
cp env.example.md .env.local

# Start development server
npm run dev
```

## Branch Naming

Use conventional prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Build/tooling changes

Example: `feat/add-export-to-pdf`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/tooling

### Examples
```
feat(csv): add support for Schwab CSV format

fix(prices): handle null values in quote response

docs(readme): update installation instructions

test(api): add tests for circuit breaker
```

## Code Standards

### TypeScript
- **No `any` types** without justification
- **Strict mode** enabled
- Use `interface` for object shapes, `type` for unions/aliases
- Export types alongside functions

### React
- **Functional components** with hooks
- **Props interfaces** for all components
- Use `React.FC` sparingly (prefer explicit return types)
- Keep components < 200 lines (split if larger)

### Naming
- **Files**: camelCase for utilities, PascalCase for components
- **Components**: PascalCase (`LiveTable.tsx`)
- **Hooks**: camelCase with `use` prefix (`useLivePrices.ts`)
- **Utils**: camelCase (`csvNormalizer.ts`)

### Imports
Order imports:
1. External libraries
2. Internal aliases (`@components`, `@lib`)
3. Relative imports
4. Types (separate `import type` if possible)

```typescript
import { useState } from 'react';
import { useLivePrices } from '@hooks/useLivePrices';
import { formatPrice } from '../lib/formatters';
import type { Quote } from '@types/schemas';
```

## Testing Requirements

### Unit Tests (Vitest)
- **Coverage**: ≥ 80% for touched files
- Test critical logic, edge cases, error handling
- Mock external dependencies (Firebase, fetch)
- Keep tests fast (< 100ms per test)

```typescript
import { describe, it, expect } from 'vitest';

describe('myFunction', () => {
  it('should handle valid input', () => {
    expect(myFunction('valid')).toBe('expected');
  });

  it('should throw on invalid input', () => {
    expect(() => myFunction('')).toThrow();
  });
});
```

### E2E Tests (Playwright)
- Add tests for new user flows
- Test critical paths (CSV import, price fetching)
- Use `data-testid` for stable selectors
- Keep tests isolated (no dependencies)

### Run Tests Locally
```bash
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run e2e           # E2E tests
npm run ci            # Full CI suite
```

## Pull Request Process

1. **Create PR** against `develop` branch (not `main`)
2. **Fill out template** with description and screenshots
3. **Link issues** using "Closes #123"
4. **Wait for CI** to pass (all checks must be green)
5. **Address reviews** promptly
6. **Squash commits** if requested

### PR Title
Use conventional commit format:
```
feat(watchlist): add remove button for symbols
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if UI change)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No new warnings/errors
```

## Code Review Guidelines

### For Authors
- Keep PRs focused and small (< 400 lines)
- Respond to feedback within 48 hours
- Explain complex logic with comments
- Update docs if behavior changes

### For Reviewers
- Review within 48 hours
- Be constructive and kind
- Focus on logic, not style (linter handles that)
- Approve if no blocking issues

## Documentation

Update docs for:
- New features (README, feature docs)
- API changes (API docs, schemas)
- Breaking changes (CHANGELOG, migration guide)
- Configuration (env variables, setup)

## Performance Considerations

- Avoid blocking the main thread
- Lazy load heavy components
- Use React.memo for expensive renders
- Check bundle impact (`npm run build`)

## Accessibility

- Use semantic HTML
- Add ARIA labels for icons/buttons
- Test keyboard navigation
- Ensure color contrast ≥ 4.5:1

## Security

- Never commit secrets/keys
- Sanitize user input
- Use parameterized queries
- Follow least-privilege principle

## Questions?

- Open a [Discussion](https://github.com/original/pocket-portfolio/discussions)
- Join our [Discord](https://discord.gg/Ch9PpjRzwe)
- Tag maintainers in your PR

Thank you for contributing! 🎉

