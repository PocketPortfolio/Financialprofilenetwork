import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Priority Queue | Pocket Portfolio',
  description: 'Join the priority queue for US brokerage connections. Be among the first to access when we launch.',
  openGraph: {
    title: 'Join Priority Queue - Pocket Portfolio',
    description: 'Join the priority queue for US brokerage connections.',
    url: 'https://www.pocketportfolio.app/waitlist',
    siteName: 'Pocket Portfolio',
    type: 'website',
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

