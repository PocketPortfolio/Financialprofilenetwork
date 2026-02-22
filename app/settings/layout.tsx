import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Pocket Portfolio',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
