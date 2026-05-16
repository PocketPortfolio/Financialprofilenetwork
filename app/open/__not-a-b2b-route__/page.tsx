import { notFound } from 'next/navigation';

/** Middleware rewrite target for non-B2B paths on the O. host (triggers app/open/not-found.tsx). */
export default function OpenB2bUnknownRoute() {
  notFound();
}
