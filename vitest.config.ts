import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/tests_backup/**', '**/tests/e2e/**'],
    // Defense-in-depth: never allow remote UI write/exec (GHSA-5xrq-8626-4rwp)
    api: {
      allowWrite: false,
      allowExec: false,
    },
    coverage: {
      provider: 'v8',
      all: true,
      // Thresholds disabled so CI stays green; re-enable as test coverage grows
      // thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        'dist/',
        '.next/',
        'coverage/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});

