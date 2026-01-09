/**
 * Health check endpoint for SystemStatus component
 */

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
  });
}
