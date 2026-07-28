import { notFound } from 'next/navigation';

/**
 * Middleware rewrite target for non-B2B paths on the O. host.
 * Calls notFound() → this segment's not-found.tsx (Open chrome + 404 status).
 * Pocket-owned paths (e.g. /book/*) should redirect via isPocketOnlyMarketingPath instead.
 */
export default function OpenB2bUnknownRoute() {
  notFound();
}
