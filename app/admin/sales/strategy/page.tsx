'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileHeader from '@/app/components/nav/MobileHeader';

export default function AdminSalesStrategyPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  // Check admin status (same logic as sales page)
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const token = await user.getIdTokenResult();
        const hasAdminClaim = token.claims.admin === true;
        setIsAdmin(hasAdminClaim);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!authLoading && user) {
      checkAdmin();
    } else if (!authLoading && !user) {
      setCheckingAdmin(false);
    }
  }, [user, authLoading]);

  if (authLoading || checkingAdmin) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <>
        <MobileHeader title="Sales Strategy" />
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text)',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Access Denied</h1>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              You need admin privileges to access this page.
            </p>
            <Link 
              href="/dashboard"
              style={{
                padding: '12px 24px',
                background: 'var(--signal)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: '500'
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHeader title="Sales Strategy" />
      <div className="brand-surface" style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {/* Admin Navigation */}
          <div className="brand-card" style={{ 
            padding: 'var(--space-3)', 
            marginBottom: 'var(--space-6)',
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}>
            <Link
              href="/admin/analytics"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                transition: 'all var(--transition-fast)',
                border: '1px solid transparent',
              }}
            >
              Analytics
            </Link>
            <Link
              href="/admin/sales"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                transition: 'all var(--transition-fast)',
                border: '1px solid transparent',
              }}
            >
              Sales Pilot
            </Link>
            <Link
              href="/admin/sales/strategy"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-semibold)',
                backgroundColor: 'var(--signal)',
                border: '1px solid var(--signal)',
              }}
            >
              Strategy
            </Link>
          </div>

          {/* Page Header */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-bold)', margin: 0, color: 'var(--text)' }}>
              Email Funnel Strategy
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              The Machine's Playbook: How the AI Sales Pilot navigates conversations
            </p>
          </div>

          {/* Funnel Flowchart */}
          <div className="brand-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--text)', fontSize: 'var(--font-size-xl)' }}>
              Email Sequence Flow
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Step 1: Cold Open */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--signal)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--signal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'var(--font-bold)',
                  }}>
                    1
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-lg)' }}>
                    Cold Open (Initial Contact)
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  <strong>Purpose:</strong> Hook with data (The "Nvidia Problem") - 60% of retail portfolios are dangerously over-exposed to US Tech.
                  <br />
                  <strong>Focus:</strong> White Label Portal for IFAs. No sponsorship pitches.
                  <br />
                  <strong>Product Selection:</strong> Corporate Ecosystem ($1,000/year) - Includes White Label features
                </p>
              </div>

              {/* Wait 3 Days */}
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                ⏱️ Wait 3 Days (No Response)
              </div>

              {/* Step 2: Value Add */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--info)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'var(--font-bold)',
                  }}>
                    2
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-lg)' }}>
                    Value Add (Follow-Up)
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  <strong>Purpose:</strong> Sell the "Sovereign Portal" - Privacy-first dashboard that calculates risk client-side.
                  <br />
                  <strong>Focus:</strong> Clients' data never leaves their device. Branded dashboard for their firm.
                </p>
              </div>

              {/* Wait 4 Days */}
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                ⏱️ Wait 4 Days (No Response)
              </div>

              {/* Step 3: Objection Killer */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--warning)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'var(--font-bold)',
                  }}>
                    3
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-lg)' }}>
                    Objection Killer (Privacy/Security)
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  <strong>Purpose:</strong> Address integration concerns - works alongside Intelliflo/Xplan.
                  <br />
                  <strong>Focus:</strong> Clients connect via Open Banking. Simple setup process.
                </p>
              </div>

              {/* Wait 7 Days */}
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                ⏱️ Wait 7 Days (No Response)
              </div>

              {/* Step 4: Breakup */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--muted)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'var(--font-bold)',
                  }}>
                    4
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-lg)' }}>
                    Breakup (Soft Close)
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  <strong>Purpose:</strong> Final attempt with graceful exit. "If this isn't the right time, no worries."
                  <br />
                  <strong>Focus:</strong> Leave door open, update status to DO_NOT_CONTACT if no response.
                </p>
              </div>
            </div>
          </div>

          {/* Audience Tailoring */}
          <div className="brand-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--text)', fontSize: 'var(--font-size-xl)' }}>
              Audience Tailoring
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)', color: 'var(--text)' }}>
                  Primary Target
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  UK Independent Financial Advisors (IFAs), St. James's Place Partners
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)', color: 'var(--text)' }}>
                  Product Focus
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Corporate Ecosystem ($1,000/year) - White Label Portal with Sovereign Client Dashboard
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)', color: 'var(--text)' }}>
                  Industry Focus
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Wealth Management, Financial Advisory, Portfolio Risk Analysis
                </div>
              </div>
            </div>
          </div>

          {/* Templates Modal Trigger */}
          <div className="brand-card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--text)', fontSize: 'var(--font-size-xl)' }}>
              System Prompts
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              The AI doesn't use static templates. Instead, it uses dynamic prompts that adapt to each lead's context.
            </p>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--signal)',
                color: 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-semibold)',
              }}
            >
              {showTemplates ? 'Hide' : 'View'} System Prompts
            </button>

            {showTemplates && (
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ color: 'var(--text)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
                    Initial Email Prompt
                  </h3>
                  <pre style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}>
{`Generate a cold outreach email to [Lead Name] at [Company].

Context:
- Company: [Company Name]
- Tech Stack: [Tech Stack]
- Research: [Research Summary]

CRITICAL PRODUCT INFORMATION:
Pocket Portfolio is a LOCAL-FIRST portfolio tracking platform.
- Data Sovereignty: Your portfolio data lives in YOUR Google Drive
- Privacy-Absolute: Data never leaves your device unless you explicitly sync
- Zero Vendor Lock-In: Export everything, own your data completely
- Free JSON API: No API key required for public data
- No Monthly Fees: Core functionality is free

ACTIVE PRODUCTS (ONLY PITCH THESE):
- Founder's Club: £100 (lifetime)
- Corporate Ecosystem: $1,000/year
- Developer Utility: $200/year
- Code Supporter: $50/year

REQUIREMENTS:
- Focus on "Data Privacy" and "Local-First Architecture"
- Reference their tech stack
- Select ONE product from the active products list
- DO NOT pitch non-existent features`}
                  </pre>
                </div>
                <div>
                  <h3 style={{ color: 'var(--text)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
                    Follow-Up Email Prompt
                  </h3>
                  <pre style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}>
{`Generate a follow-up email (Value Add or Objection Killer).

Previous Context:
- Last email sent: [Date]
- Lead status: [Status]
- Previous subject: [Subject]

REQUIREMENTS:
- Provide value (case study, feature highlight, use case)
- Address common objections if applicable
- Reinforce privacy/sovereignty message
- Keep it concise and non-pushy`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

