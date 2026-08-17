'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { isBrewinPilotEmail } from '@/app/lib/demo/brewin-manchester-pilot';
import Dashboard from '@/app/dashboard/page';

/**
 * Allowlisted GTM replica. Stays on this path so Admin → Brewin replica stays active.
 */
export default function BrewinPilotEntryPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const allowed = isBrewinPilotEmail(user?.email);

  if (loading) {
    return (
      <main style={{ padding: '48px 24px', color: 'var(--text-secondary)', fontSize: 13 }}>
        Opening Manchester replica…
      </main>
    );
  }

  if (isAuthenticated && allowed) {
    return <Dashboard />;
  }

  return (
    <main style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 20, color: 'var(--text)', marginBottom: 12 }}>Pilot replica locked</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
        This design-partner dashboard is limited to the named operator account. Sign in with that
        account, then reopen Admin → Brewin replica.
      </p>
      <p style={{ marginTop: 20 }}>
        <Link href="/dashboard" style={{ color: 'var(--accent-warm)' }}>
          Return to dashboard
        </Link>
      </p>
    </main>
  );
}
