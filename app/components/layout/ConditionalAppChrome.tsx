'use client';

import { usePathname } from 'next/navigation';
import TabBar from '@/app/components/nav/TabBar';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function ConditionalAppChrome() {
  const pathname = usePathname() ?? '';
  const isBook = pathname.startsWith('/book');

  if (isBook) return null;

  return (
    <>
      <ErrorBoundary scope="tab-bar">
        <TabBar />
      </ErrorBoundary>
      <ErrorBoundary scope="global-footer">
        <GlobalFooter />
      </ErrorBoundary>
    </>
  );
}
