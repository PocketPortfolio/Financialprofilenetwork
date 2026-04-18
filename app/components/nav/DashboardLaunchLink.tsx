'use client';

import { Suspense, type ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { dashboardHrefWithInviteFromSearchParams } from '@/app/lib/viral/dashboardInviteHref';

const DEFAULT_DASHBOARD_UTM = '/dashboard?utm_source=site&utm_medium=nav_launch&utm_campaign=signup';
const LANDING_HOME_DASHBOARD_UTM =
  '/dashboard?utm_source=landing&utm_medium=launch_app&utm_campaign=signup';

type Props = Omit<ComponentProps<typeof Link>, 'href'>;

function DashboardLaunchLinkInner(props: Props) {
  const sp = useSearchParams();
  const pathname = usePathname();
  let href = dashboardHrefWithInviteFromSearchParams(sp);
  if (href === '/dashboard' && pathname === '/') {
    href = LANDING_HOME_DASHBOARD_UTM;
  }
  return <Link href={href} {...props} />;
}

/** Preserves invite query params from the current page when navigating to /dashboard. */
export default function DashboardLaunchLink(props: Props) {
  return (
    <Suspense fallback={<Link href={DEFAULT_DASHBOARD_UTM} {...props} />}>
      <DashboardLaunchLinkInner {...props} />
    </Suspense>
  );
}
