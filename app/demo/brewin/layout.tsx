import type { Metadata } from 'next';
import DashboardClientLayout from '../../dashboard/DashboardClientLayout';

export const metadata: Metadata = {
  title: 'Manchester replica | Open Portfolio',
  robots: { index: false, follow: false, nocache: true },
};

export default function BrewinPilotLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
