'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useSurface } from './SurfaceProvider';
import { isOpenSurfaceRoute, pocketSurfaceBaseUrl } from '@/lib/surface-host';

type MarketingLinkProps = ComponentProps<typeof Link>;

/**
 * Same-origin link on the B2B surface when the route is aliased under app/open/.
 * Consumer-only paths resolve to the Pocket apex (explicit cross-surface navigation).
 */
export default function MarketingLink({ href, children, ...rest }: MarketingLinkProps) {
  const surface = useSurface();
  const path = typeof href === 'string' ? href.split('?')[0] : href.pathname ?? '';

  if (surface === 'open' && path && !isOpenSurfaceRoute(path)) {
    const pocketBase =
      typeof window !== 'undefined'
        ? pocketSurfaceBaseUrl(window.location.hostname)
        : 'https://www.pocketportfolio.app';
    const pocketHref = `${pocketBase.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}${
      typeof href === 'string' && href.includes('?') ? href.slice(href.indexOf('?')) : ''
    }`;
    return (
      <a href={pocketHref} {...(rest as ComponentProps<'a'>)}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
