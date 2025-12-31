/**
 * Health check endpoint for SystemStatus component
 */

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
