/**
 * Route Verification Script
 * Checks all footer links and common routes for 404s
 */

import { existsSync } from 'fs';
import { join } from 'path';

const routesToCheck = [
  // Footer links
  '/for/advisors',
  '/tools/google-sheets-formula',
  '/sponsor',
  '/openbrokercsv',
  '/static/portfolio-tracker',
  '/static/csv-etoro-to-openbrokercsv',
  '/live',
  '/dashboard',
  '/s', // This might 404 - needs verification
];

const appDir = join(process.cwd(), 'app');

function routeExists(route: string): boolean {
  // Remove leading slash
  const path = route.startsWith('/') ? route.slice(1) : route;
  
  // Check if page.tsx exists
  const pagePath = join(appDir, path, 'page.tsx');
  const layoutPath = join(appDir, path, 'layout.tsx');
  
  // For dynamic routes, check parent directory
  if (path.includes('[')) {
    const parentPath = path.split('/[')[0];
    const parentPagePath = join(appDir, parentPath, '[symbol]', 'page.tsx');
    return existsSync(parentPagePath);
  }
  
  return existsSync(pagePath) || existsSync(layoutPath);
}

console.log('🔍 Verifying routes...\n');

const results: { route: string; exists: boolean }[] = [];

routesToCheck.forEach(route => {
  const exists = routeExists(route);
  results.push({ route, exists });
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${route}`);
});

const missingRoutes = results.filter(r => !r.exists);

if (missingRoutes.length > 0) {
  console.log(`\n⚠️  Found ${missingRoutes.length} missing route(s):`);
  missingRoutes.forEach(r => console.log(`   - ${r.route}`));
  process.exit(1);
} else {
  console.log('\n✅ All routes verified!');
  process.exit(0);
}



















