'use client';

import { Suspense, type ComponentProps } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { dashboardHrefWithInviteFromSearchParams } from '@/app/lib/viral/dashboardInviteHref';

type Props = Omit<ComponentProps<typeof Link>, 'href'>;

function DashboardLaunchLinkInner(props: Props) {
  const sp = useSearchParams();
  const href = dashboardHrefWithInviteFromSearchParams(sp);
  return <Link href={href} {...props} />;
}

/** Preserves invite query params from the current page when navigating to /dashboard. */
export default function DashboardLaunchLink(props: Props) {
  return (
    <Suspense fallback={<Link href="/dashboard" {...props} />}>
      <DashboardLaunchLinkInner {...props} />
    </Suspense>
  );
}
