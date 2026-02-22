import type { Metadata } from 'next';
import DashboardClientLayout from './DashboardClientLayout';

export const metadata: Metadata = {
  title: 'Dashboard | Pocket Portfolio',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
