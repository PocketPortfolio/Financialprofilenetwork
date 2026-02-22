/**
 * Test POST /api/support (run with dev server: npm run dev)
 * Usage: node scripts/test-support-api.js [baseUrl]
 * Example: node scripts/test-support-api.js http://localhost:3000
 */
const baseUrl = process.argv[2] || 'http://localhost:3000';

async function testSupportApi() {
  const form = new FormData();
  form.set('email', 'test@example.com');
  form.set('name', 'Test User');
  form.set('subject', 'Bug');
  form.set('message', 'This is a test from scripts/test-support-api.js');

  const res = await fetch(`${baseUrl}/api/support`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  if (res.ok) {
    console.log('OK: Support API accepted the request. Check ai@pocketportfolio.app for the email (if RESEND_API_KEY is set).');
  } else {
    console.log('FAIL:', data.error || res.statusText);
  }
}

testSupportApi().catch((e) => {
  console.error(e);
  process.exit(1);
});
