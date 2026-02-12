/**
 * Verify production logo URL returns 200 and image/png.
 * Run after deploy: node scripts/verify-production-logo.mjs
 * Usage: npm run verify:logo-url
 */
const LOGO_URL = 'https://www.pocketportfolio.app/brand/pp-monogram.png';

async function main() {
  const res = await fetch(LOGO_URL, { method: 'HEAD' });
  const contentType = res.headers.get('content-type') || '';
  const ok = res.ok && contentType.toLowerCase().includes('image/png');
  if (ok) {
    console.log('OK', LOGO_URL);
    console.log('  Status:', res.status, 'Content-Type:', contentType);
    process.exit(0);
  }
  console.error('FAIL', LOGO_URL);
  console.error('  Status:', res.status, 'Content-Type:', contentType);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
