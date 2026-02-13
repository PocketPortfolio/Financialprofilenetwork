/**
 * Short URL for Stack Reveal email logo. Proxies the image so email clients get
 * 200 + PNG. Tries EMAIL_LOGO_URL, then Cloudinary, so we never 404.
 */

import { NextRequest } from 'next/server';

const DEFAULT_LOGO =
  'https://www.pocketportfolio.app/brand/pp-monogram.png';
const CLOUDINARY_LOGO =
  'https://res.cloudinary.com/dknmhvm7a/image/upload/v1770925627/pocket-portfolio/pp-monogram.png';

const UA = 'Mozilla/5.0 (compatible; PocketPortfolio-Email/1; +https://www.pocketportfolio.app)';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  const primary = process.env.EMAIL_LOGO_URL || DEFAULT_LOGO;
  let res = await fetch(primary, { headers: { 'User-Agent': UA } });
  if (!res.ok) res = await fetch(CLOUDINARY_LOGO, { headers: { 'User-Agent': UA } });
  if (!res.ok) res = await fetch(DEFAULT_LOGO, { headers: { 'User-Agent': UA } });
  if (!res.ok) return new Response(null, { status: res.status });
  const body = await res.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(body.byteLength),
      'Content-Disposition': 'inline; filename="pp-monogram.png"',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
