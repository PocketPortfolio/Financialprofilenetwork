'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileHeader from '@/app/components/nav/MobileHeader';
import { RevenueWidget } from '@/app/components/sales/RevenueWidget';
import { ActionFeed } from '@/app/components/sales/ActionFeed';
import { LeadDetailsDrawer } from '@/app/components/sales/LeadDetailsDrawer';
import { extractFirstNameFromEmail, isRealFirstName } from '@/lib/sales/name-validation';

interface Lead {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string;
  jobTitle: string | null;
  score: number;
  status: string;
  techStackTags: string[];
  createdAt: string;
  lastContactedAt: string | null;
  researchSummary: string | null;
  researchData: any;
}

interface RevenueMetrics {
  currentRevenue: number;
  projectedRevenue: number;
  pipelineValue: number;
  targetRevenue: number;
  progressPercentage: number;
}

interface Metrics {
  revenue: RevenueMetrics;
  revenueVelocity?: number;
  revenueDecisions?: {
    requiredLeadVolume: number;
    currentLeadVolume: number;
    adjustment: {
      action: 'increase' | 'decrease' | 'maintain';
      reason: string;
      newVolume: number;
    };
  };
  activity: {
    emailsSentToday: number;
    replyRate: number;
    totalOutbound: number;
    totalInbound: number;
  };
  statusCounts: {
    total: number;
    new: number;
    researching: number;
    contacted: number;
    interested: number;
    negotiating: number;
    converted: number;
    doNotContact: number;
  };
}

interface LeadDetails {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string;
  jobTitle: string | null;
  score: number;
  status: string;
  techStackTags: string[];
  researchSummary: string | null;
  researchData: any;
  latestReasoning: string | null;
  conversations: Array<{
    id: string;
    type: string;
    subject: string | null;
    body: string;
    aiReasoning: string | null;
    direction: string;
    createdAt: string;
  }>;
}

export default function AdminSalesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loadingLeadDetails, setLoadingLeadDetails] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fresh' | 'active' | 'archive'>('fresh');

  // Tab configuration
  const tabConfig = {
    fresh: {
      label: 'Fresh',
      statuses: ['NEW', 'RESEARCHING'],
      color: 'var(--signal)',
      emoji: '🟢',
    },
    active: {
      label: 'Active',
      statuses: ['CONTACTED', 'REPLIED', 'INTERESTED', 'NEGOTIATING'],
      color: 'var(--warning)',
      emoji: '🟡',
    },
    archive: {
      label: 'Archive',
      statuses: ['CONVERTED', 'NOT_INTERESTED', 'DO_NOT_CONTACT'],
      color: 'var(--muted)',
      emoji: '⚪',
    },
  };

  // Calculate badge counts from all leads
  const getTabCount = (tab: 'fresh' | 'active' | 'archive'): number => {
    if (!leads.length) return 0;
    const statuses = tabConfig[tab].statuses;
    return leads.filter(lead => statuses.includes(lead.status)).length;
  };

  // Filter leads based on active tab
  const filteredLeads = leads.filter(lead => 
    tabConfig[activeTab].statuses.includes(lead.status)
  );

  // Check admin status
  useEffect(() => {
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
        
        if (!hasAdminClaim) {
          console.log('User does not have admin privileges');
        }
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

  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;
    
    // Load sequentially to avoid connection pool exhaustion
    const loadSequentially = async () => {
      await checkHealth();
      await loadData();
      await loadMetrics();
      checkEmergencyStop();
    };
    
    loadSequentially();
    
    const metricsInterval = setInterval(loadMetrics, 30000); // Refresh metrics every 30s
    return () => clearInterval(metricsInterval);
  }, [isAdmin, checkingAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      // Load all leads (higher limit) for accurate tab counts
      const response = await fetch('/api/agent/leads?limit=1000');
      
      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load leads`);
      }
      
      const data = await response.json();
      const leadsData = data.leads || [];
      setLeads(leadsData);
    } catch (err: any) {
      console.error('Error loading leads:', err);
      // Show detailed error message
      const errorMessage = err.message || 'Failed to load leads. Check console for details.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/agent/metrics');
      if (!response.ok) return;
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const checkEmergencyStop = async () => {
    // In a real app, this would check an API endpoint
    setEmergencyStop(process.env.EMERGENCY_STOP === 'true');
  };

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/agent/health');
      const health = await response.json();
      
      if (health.database.status === 'error') {
        setError(`Database Error: ${health.database.message}`);
      } else if (health.environment.status === 'error') {
        setError(`Configuration Error: ${health.environment.message}`);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const toggleEmergencyStop = async () => {
    try {
      const response = await fetch('/api/agent/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: emergencyStop ? 'deactivate' : 'activate',
        }),
      });
      if (!response.ok) throw new Error('Failed to toggle kill switch');
      setEmergencyStop(!emergencyStop);
      setToast({ 
        message: `Emergency stop ${emergencyStop ? 'deactivated' : 'activated'}`, 
        type: 'success' 
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ 
        message: err.message || 'Failed to toggle emergency stop', 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleViewLead = async (leadId: string) => {
    setLoadingLeadDetails(leadId);
    try {
      const response = await fetch(`/api/agent/leads/${leadId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load lead details' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load lead details`);
      }
      const data = await response.json();
      
      // Merge lead data with additional fields from API response
      // The API returns { lead, conversations, latestReasoning, researchSummary, researchData }
      // But the component expects a flat LeadDetails object
      const leadDetails: LeadDetails = {
        ...data.lead,
        conversations: data.conversations || [],
        latestReasoning: data.latestReasoning || null,
        researchSummary: data.researchSummary || data.lead?.researchSummary || null,
        researchData: data.researchData || data.lead?.researchData || null,
      };
      
      setSelectedLead(leadDetails);
      setDrawerOpen(true);
    } catch (err: any) {
      console.error('Error loading lead details:', err);
      setToast({ 
        message: err.message || 'Failed to load lead details. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoadingLeadDetails(null);
    }
  };


  // Show loading while checking auth
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

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <>
        <MobileHeader title="Sales Pilot" />
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
              {!isAuthenticated 
                ? 'You must be logged in to access this page.'
                : 'You need admin privileges to access this page.'}
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

  if (loading && !metrics) {
    return (
      <>
        <MobileHeader title="Sales Pilot" />
        <div className="brand-surface" style={{ padding: 'var(--space-6)', minHeight: '100vh' }}>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHeader title="Sales Pilot" />
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
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Analytics
          </Link>
          <Link
            href="/admin/sales"
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
            Sales Pilot
          </Link>
          <Link
            href="/admin/sales/strategy"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Strategy
          </Link>
          {/* Waitlist tab removed per Ticket 4.2 - Focus on active revenue only */}
        </div>

        {/* Page Header */}
        <div style={{
          marginBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 'var(--space-4)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'var(--space-4)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--signal) 0%, var(--accent-warm) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-lg)',
                }}>
                  🤖
                </div>
                <h1 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-bold)',
                  margin: 0,
                  color: 'var(--text)'
                }}>
                  Sales Pilot
                </h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                Autonomous AI Sales Agent for Pocket Portfolio
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: emergencyStop ? 'var(--danger)' : 'var(--signal)',
                    display: 'inline-block',
                    animation: !emergencyStop ? 'pulse 2s infinite' : 'none'
                  }} />
                  <span style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--text-secondary)',
                    fontWeight: 'var(--font-medium)',
                  }}>
                    Status: <span style={{ color: emergencyStop ? 'var(--danger)' : 'var(--signal)' }}>
                      {emergencyStop ? 'STOPPED' : 'ACTIVE'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={toggleEmergencyStop}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                backgroundColor: emergencyStop ? 'var(--signal)' : 'var(--danger)',
                color: 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-semibold)',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {emergencyStop ? 'Resume Operations' : 'Emergency Stop'}
            </button>
          </div>
        </div>

        {/* Revenue Widget */}
        {metrics?.revenue && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <RevenueWidget metrics={metrics.revenue} />
            {metrics.revenueVelocity !== undefined && (
              <div className="brand-card" style={{ 
                marginTop: 'var(--space-4)', 
                padding: 'var(--space-5)',
                background: 'linear-gradient(135deg, var(--signal) 0%, var(--accent-warm) 100%)',
                color: 'var(--text)',
              }}>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  marginBottom: 'var(--space-2)',
                  fontWeight: 'var(--font-medium)',
                }}>
                  Current Velocity
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-bold)', 
                  color: 'white',
                  marginBottom: 'var(--space-1)',
                }}>
                  £{metrics.revenueVelocity.toLocaleString()}/month
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  (Projected)
                </div>
                {metrics.revenueDecisions && (
                  <div style={{ 
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}>
                    <div style={{ marginBottom: 'var(--space-1)' }}>
                      <strong>AI Decision:</strong> {metrics.revenueDecisions.adjustment.reason}
                    </div>
                    <div>
                      Prospecting Volume: {metrics.revenueDecisions.currentLeadVolume} → {metrics.revenueDecisions.adjustment.newVolume} leads/day
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 400px', 
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
        }}>
          {/* Leads Table */}
          <div className="brand-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-xl)' }}>
                  Leads Pipeline
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ 
                    padding: 'var(--space-1) var(--space-3)', 
                    backgroundColor: 'var(--surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    {filteredLeads.length} {activeTab === 'fresh' ? 'pending' : activeTab === 'active' ? 'active' : 'archived'}
                  </span>
                </div>
              </div>

              {/* Pipeline Tabs */}
              <div style={{ 
                borderBottom: '2px solid var(--border)',
                display: 'flex',
                gap: 'var(--space-2)',
              }}>
                {(Object.keys(tabConfig) as Array<'fresh' | 'active' | 'archive'>).map((tabKey) => {
                  const tab = tabConfig[tabKey];
                  const count = getTabCount(tabKey);
                  const isActive = activeTab === tabKey;
                  
                  return (
                    <button
                      key={tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'none',
                        border: 'none',
                        borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        bottom: '-2px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'var(--text)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.label}</span>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: isActive ? tab.color : 'var(--surface-elevated)',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-bold)',
                        minWidth: '24px',
                        textAlign: 'center',
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={{ 
                padding: 'var(--space-3)', 
                backgroundColor: 'var(--danger-muted)', 
                color: 'var(--danger)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--font-size-sm)',
              }}>
                {error}
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Company
                    </th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Contact
                    </th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Score
                    </th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'right', 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ 
                        padding: 'var(--space-6)', 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)',
                      }}>
                        {activeTab === 'fresh' && 'No fresh leads. All caught up! 🎉'}
                        {activeTab === 'active' && 'No active conversations.'}
                        {activeTab === 'archive' && 'No archived leads.'}
                        {leads.length === 0 && 'No leads yet. Create your first lead to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr 
                        key={lead.id}
                        style={{ 
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => handleViewLead(lead.id)}
                      >
                        <td style={{ padding: 'var(--space-3)' }}>
                          <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text)', marginBottom: 'var(--space-1)' }}>
                            {lead.companyName}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                            {lead.email}
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-3)' }}>
                          <div style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                            {(() => {
                              // Use database firstName if it's a real name, otherwise try to extract from email
                              let displayFirstName = null;
                              
                              // Check if database firstName is a real name
                              if (lead.firstName && isRealFirstName(lead.firstName)) {
                                displayFirstName = lead.firstName.trim();
                              } else if (lead.email) {
                                // Try to extract from email, but only if it looks like a real name
                                displayFirstName = extractFirstNameFromEmail(lead.email);
                              }
                              
                              return displayFirstName
                                ? `${displayFirstName} - ${lead.jobTitle || 'Founder'}`
                                : (lead.jobTitle || 'Founder');
                            })()}
                          </div>
                          {(lead.lastName && lead.lastName.trim()) && (
                            <div style={{ fontSize: '11px', color: 'var(--accents-5)' }}>
                              {lead.lastName.trim()}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: 'var(--space-3)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: 'var(--surface-elevated)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${lead.score}%`,
                                height: '100%',
                                backgroundColor: lead.score >= 80 ? 'var(--signal)' : lead.score >= 50 ? 'var(--warning)' : 'var(--muted)',
                              }} />
                            </div>
                            <span style={{ 
                              fontSize: 'var(--font-size-sm)', 
                              color: 'var(--text)',
                              fontWeight: 'var(--font-medium)',
                              minWidth: '35px',
                            }}>
                              {lead.score}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-3)' }}>
                          <span style={{
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: getStatusColor(lead.status),
                            color: 'var(--text)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-medium)',
                            display: 'inline-block',
                          }}>
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLead(lead.id);
                            }}
                            disabled={loadingLeadDetails === lead.id}
                            style={{
                              padding: 'var(--space-1) var(--space-2)',
                              backgroundColor: 'var(--surface-elevated)',
                              color: 'var(--text)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: loadingLeadDetails === lead.id ? 'wait' : 'pointer',
                              fontSize: 'var(--font-size-xs)',
                              opacity: loadingLeadDetails === lead.id ? 0.6 : 1,
                              transition: 'opacity 0.2s ease',
                            }}
                          >
                            {loadingLeadDetails === lead.id ? 'Loading...' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Metrics Cards */}
            {metrics && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-3)',
              }}>
                <div className="brand-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                    Emails Today
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text)' }}>
                    {metrics.activity.emailsSentToday}
                  </div>
                </div>
                <div className="brand-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                    Reply Rate
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--signal)' }}>
                    {metrics.activity.replyRate.toFixed(1)}%
                  </div>
                </div>
                <div className="brand-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                    Interested
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--signal)' }}>
                    {metrics.statusCounts.interested}
                  </div>
                </div>
                <div className="brand-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                    Converted
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--signal)' }}>
                    {metrics.statusCounts.converted}
                  </div>
                </div>
              </div>
            )}

            {/* Action Feed */}
            <ActionFeed />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: 'var(--space-4)',
            backgroundColor: toast.type === 'error' ? 'var(--error)' : 'var(--signal)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 10000,
            maxWidth: '400px',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out',
          }}
          onClick={() => setToast(null)}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            gap: 'var(--space-3)' 
          }}>
            <span style={{ flex: 1, lineHeight: 'var(--line-normal)' }}>{toast.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                padding: 0,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Lead Details Drawer */}
      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLead(null);
        }}
      />
      </div>
    </>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'NEW': 'var(--muted)',
    'RESEARCHING': 'var(--info)',
    'CONTACTED': 'var(--warning)',
    'REPLIED': 'var(--info)',
    'INTERESTED': 'var(--signal)',
    'NEGOTIATING': 'var(--accent-warm)',
    'NOT_INTERESTED': 'var(--danger)',
    'DO_NOT_CONTACT': 'var(--danger-muted)',
    'CONVERTED': 'var(--signal)',
  };
  return colors[status] || 'var(--muted)';
}
