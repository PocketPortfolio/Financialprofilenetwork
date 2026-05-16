import DashboardClientLayout from '../dashboard/DashboardClientLayout';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardClientLayout>
      <SEOPageTracker />
      {children}
    </DashboardClientLayout>
  );
}
