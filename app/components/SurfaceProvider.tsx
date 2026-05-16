'use client';

/**
 * SurfaceProvider.tsx
 *
 * Single-purpose React context exposing the brand surface ('pocket' | 'open')
 * to every descendant. The default value is 'pocket', so every existing P.
 * route continues to render the standard Pocket Portfolio chrome without any
 * changes to call-sites. The app/open/layout.tsx wraps its tree with
 * <SurfaceProvider value="open"> so the O. monogram, wordmark, and metadata
 * resolve correctly on requests routed through the host-aware middleware.
 *
 * Why context instead of a prop:
 *   The Logo, navbar, and footer are mounted deep inside route layouts. Drilling
 *   a `surface` prop through every intermediate component would touch ~30 files
 *   for zero functional benefit. Context keeps the call-sites untouched and
 *   makes the dual-surface bifurcation transparent to existing P. code.
 *
 * Consumed by: app/components/Logo.tsx (and any future surface-aware widget).
 */

import React, { createContext, useContext } from 'react';
import type { Surface } from '../../lib/canonical-claims';

const SurfaceContext = createContext<Surface>('pocket');

export function SurfaceProvider({
  value,
  children,
}: {
  value: Surface;
  children: React.ReactNode;
}) {
  return <SurfaceContext.Provider value={value}>{children}</SurfaceContext.Provider>;
}

export function useSurface(): Surface {
  return useContext(SurfaceContext);
}
