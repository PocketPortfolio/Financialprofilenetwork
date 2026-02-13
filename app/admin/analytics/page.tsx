'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileHeader from '@/app/components/nav/MobileHeader';

interface AnalyticsData {
  monetization: {
    totalMRR: number;
    patronCount: number;
    goal: number;
    subscriptions: Array<{
      tier: string;
      count: number;
      revenue: number;
    }>;
    foundersClub: {
      revenue: number;
      count: number;
    };
    oneTimeDonations: number; // Deprecated - kept for backwards compatibility
  };
  toolUsage: {
    taxConverter: {
      total: number;
      successful: number;
      byPair: Record<string, number>;
      last7Days: number;
    };
    googleSheets: {
      total: number;
      formulasGenerated: number;
      copies: number;
      last7Days: number;
    };
    advisorTool: {
      total: number;
      pdfsGenerated: number;
      last7Days: number;
    };
    csvDownloads: {
      total: number;
      last7Days: number;
      last24Hours: number;
      byTicker: Record<string, number>;
    };
  };
  seoPages: {
    totalViews: number;
    topPages: Array<{ path: string; views: number }>;
    conversionRate: number;
  };
  npm: {
    packages: Array<{
      name: string;
      version: string;
      monthlyDownloads: number;
      last7Days: number;
      error?: boolean;
    }>;
    totalMonthlyDownloads: number;
    totalLast7Days: number;
    packageCount: number;
  };
  blogPosts: {
    total: number;
    published: number;
    pending: number;
    overdue: number;
    failed: number;
    posts: Array<{
      id: string;
      title: string;
      slug: string;
      date: string;
      scheduledDate: string;
      scheduledTime: string | null;
      status: 'pending' | 'published' | 'failed';
      pillar: string;
      category?: string; // ✅ ADD CATEGORY
      isOverdue: boolean;
      hasFiles: boolean;
      publishedTime: string | null;
      daysOverdue: number;
    }>;
    error?: string;
  };
  leads: {
    total: number;
    last7Days: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    recent: Array<{
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      companyName: string;
      status: string;
      createdAt: string;
      dataSource: string | null;
    }>;
  };
  googleSignups?: {
    total: number;
    last7Days: number;
    cohortSinceOct2025: number;
    signups: Array<{
      email: string;
      uid: string;
      displayName: string | null;
      firstName: string | null;
      createdAt: string;
    }>;
    error?: string;
  };
  timeRange: '7d' | '30d' | '90d' | 'all';
  lastUpdated?: string;
}

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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
          // Don't redirect immediately, let user see the access denied message
          console.log('User does not have admin privileges');
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading && user) {
      checkAdmin();
    } else if (!loading && !user) {
      setCheckingAdmin(false);
    }
  }, [user, loading]);

  // Fetch analytics data
  useEffect(() => {
    if (!isAdmin || checkingAdmin) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch analytics data' }));
          throw new Error(errorData.error || 'Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAdmin, checkingAdmin, timeRange]);

  // Show loading while checking auth
  if (loading || checkingAdmin) {
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
    );
  }

  return (
    <>
      {/* Mobile Header - matches dashboard */}
      <MobileHeader title="Analytics Dashboard" />
      
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'var(--space-6)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
      <div style={{
        marginBottom: 'var(--space-8)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--space-4)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-2)',
              color: 'var(--text)'
            }}>
              Analytics Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
              Track SEO pages, monetization, and tool usage
            </p>
            {analyticsData?.lastUpdated && (
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: loadingData ? 'var(--warning)' : 'var(--signal)',
                  display: 'inline-block',
                  animation: loadingData ? 'pulse 2s infinite' : 'none'
                }} />
                Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
                {!loadingData && (
                  <span style={{ 
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    marginLeft: '4px'
                  }}>
                    (Auto-refreshes every 5 minutes)
                  </span>
                )}
              </p>
            )}
          </div>
          
          {/* Time Range Selector */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${timeRange === range ? 'var(--signal)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  background: timeRange === range ? 'var(--signal)' : 'var(--surface)',
                  color: timeRange === range ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: timeRange === range ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingData && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading analytics data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: 'var(--space-6)'
        }}>
          {error}
        </div>
      )}

      {/* Analytics Data */}
      {analyticsData && !loadingData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Monetization Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              💰 Monetization
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)'
            }}>
              <MetricCard
                label="Monthly Recurring Revenue"
                value={`$${analyticsData.monetization.totalMRR.toFixed(2)}`}
                subtitle={`Goal: $${analyticsData.monetization.goal}`}
                progress={Math.min((analyticsData.monetization.totalMRR / analyticsData.monetization.goal) * 100, 100)}
              />
              <MetricCard
                label="Active Patrons"
                value={analyticsData.monetization.patronCount.toString()}
                subtitle="Monthly subscribers"
              />
              <MetricCard
                label="UK Founder's Club"
                value={`£${analyticsData.monetization.foundersClub.revenue.toFixed(2)}`}
                subtitle={`${analyticsData.monetization.foundersClub.count} lifetime members`}
              />
            </div>

            {/* Subscription Breakdown */}
            {analyticsData.monetization.subscriptions.length > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                  Subscription Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {analyticsData.monetization.subscriptions.map((sub) => (
                    <div
                      key={sub.tier}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'var(--surface-elevated)',
                        borderRadius: '6px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <span style={{ fontWeight: '500' }}>{sub.tier}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600' }}>{sub.count} patrons</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ${sub.revenue.toFixed(2)}/mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Tool Usage Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              🛠️ Tool Usage
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              {/* Tax Converter */}
              <ToolCard
                title="Tax Converter"
                total={analyticsData.toolUsage.taxConverter.total}
                successful={analyticsData.toolUsage.taxConverter.successful}
                last7Days={analyticsData.toolUsage.taxConverter.last7Days}
                conversionRate={
                  analyticsData.toolUsage.taxConverter.total > 0
                    ? (analyticsData.toolUsage.taxConverter.successful / analyticsData.toolUsage.taxConverter.total) * 100
                    : 0
                }
                topPairs={Object.entries(analyticsData.toolUsage.taxConverter.byPair)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([pair, count]) => ({ pair, count }))}
              />

              {/* Google Sheets */}
              <ToolCard
                title="Google Sheets Tool"
                total={analyticsData.toolUsage.googleSheets.total}
                successful={analyticsData.toolUsage.googleSheets.copies}
                last7Days={analyticsData.toolUsage.googleSheets.last7Days}
                conversionRate={
                  analyticsData.toolUsage.googleSheets.total > 0
                    ? (analyticsData.toolUsage.googleSheets.copies / analyticsData.toolUsage.googleSheets.total) * 100
                    : 0
                }
                copies={analyticsData.toolUsage.googleSheets.copies}
              />

              {/* Advisor Tool */}
              <ToolCard
                title="Advisor Tool"
                total={analyticsData.toolUsage.advisorTool.total}
                successful={analyticsData.toolUsage.advisorTool.pdfsGenerated}
                last7Days={analyticsData.toolUsage.advisorTool.last7Days}
                conversionRate={
                  analyticsData.toolUsage.advisorTool.total > 0
                    ? (analyticsData.toolUsage.advisorTool.pdfsGenerated / analyticsData.toolUsage.advisorTool.total) * 100
                    : 0
                }
              />
            </div>
          </section>

          {/* CSV Downloads Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              📥 CSV Downloads
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)'
            }}>
              <MetricCard
                label="Total Downloads"
                value={analyticsData.toolUsage.csvDownloads.total.toLocaleString()}
                subtitle="All time"
              />
              <MetricCard
                label="Last 7 Days"
                value={analyticsData.toolUsage.csvDownloads.last7Days.toLocaleString()}
                subtitle="Recent activity"
              />
              <MetricCard
                label="Last 24 Hours"
                value={analyticsData.toolUsage.csvDownloads.last24Hours.toLocaleString()}
                subtitle="Real-time"
              />
            </div>

            {/* Top Tickers */}
            {Object.keys(analyticsData.toolUsage.csvDownloads.byTicker).length > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                  Top Downloaded Tickers
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {Object.entries(analyticsData.toolUsage.csvDownloads.byTicker)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([ticker, count]) => (
                      <div key={ticker} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'var(--card)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}>
                        <span style={{ fontWeight: '600', color: 'var(--text)' }}>{ticker}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{count} download{count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>

          {/* SEO Pages Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              📈 SEO Pages
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)'
            }}>
              <MetricCard
                label="Total Page Views"
                value={analyticsData.seoPages.totalViews.toLocaleString()}
                subtitle={`${timeRange} period`}
              />
              <MetricCard
                label="Conversion Rate"
                value={`${analyticsData.seoPages.conversionRate.toFixed(1)}%`}
                subtitle="Views → Signups"
              />
            </div>

            {/* Top Pages */}
            {analyticsData.seoPages.topPages.length > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                  Top Pages
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {analyticsData.seoPages.topPages.map((page, index) => (
                    <div
                      key={page.path}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'var(--surface-elevated)',
                        borderRadius: '6px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--signal)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {index + 1}
                        </span>
                        <Link
                          href={page.path}
                          style={{
                            color: 'var(--signal)',
                            textDecoration: 'none',
                            fontSize: '14px'
                          }}
                        >
                          {page.path}
                        </Link>
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>
                        {page.views.toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* NPM Packages Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              📦 NPM Packages
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)'
            }}>
              <MetricCard
                label="This Month"
                value={analyticsData.npm.totalMonthlyDownloads.toLocaleString()}
                subtitle="All packages combined"
              />
              <MetricCard
                label="Last 7 Days"
                value={analyticsData.npm.totalLast7Days.toLocaleString()}
                subtitle="Recent downloads"
              />
              <MetricCard
                label="Active Packages"
                value={analyticsData.npm.packageCount.toString()}
                subtitle="Published packages"
              />
            </div>

            {/* Package Breakdown */}
            {analyticsData.npm.packages.length > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                  Package Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {analyticsData.npm.packages
                    .sort((a, b) => b.monthlyDownloads - a.monthlyDownloads)
                    .map((pkg) => (
                      <div
                        key={pkg.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          background: 'var(--surface-elevated)',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          opacity: pkg.error ? 0.6 : 1
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <a
                              href={`https://www.npmjs.com/package/${pkg.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--signal)',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '14px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              {pkg.name}
                            </a>
                            <span style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              background: 'var(--surface)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              v{pkg.version}
                            </span>
                            {pkg.error && (
                              <span style={{
                                fontSize: '11px',
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                Error
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', gap: 'var(--space-4)' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Monthly
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                              {pkg.monthlyDownloads.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Last 7d
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                              {pkg.last7Days.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>

          {/* Blog Posts Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)',
            marginTop: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              📝 Blog Posts (Autonomous Engine)
            </h2>

            {/* Summary Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)'
            }}>
              <MetricCard
                label="Total Posts"
                value={analyticsData.blogPosts.total.toString()}
                subtitle="Scheduled"
              />
              <MetricCard
                label="Published"
                value={analyticsData.blogPosts.published.toString()}
                subtitle="Live"
              />
              <MetricCard
                label="Pending"
                value={analyticsData.blogPosts.pending.toString()}
                subtitle="Scheduled"
              />
              <MetricCard
                label="Overdue"
                value={analyticsData.blogPosts.overdue.toString()}
                subtitle={analyticsData.blogPosts.overdue > 0 ? "⚠️ Action needed" : "All on track"}
              />
            </div>

            {/* Posts Table */}
            <div style={{
              marginTop: 'var(--space-4)',
              maxHeight: '600px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  background: 'var(--surface-elevated)',
                  borderBottom: '2px solid var(--border)',
                  zIndex: 10
                }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Scheduled Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Published Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Pillar</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.blogPosts.posts.map((post, index) => {
                    const isOverdue = post.isOverdue;
                    const statusColor = post.status === 'published' 
                      ? '#10b981' 
                      : post.status === 'failed' 
                      ? '#ef4444' 
                      : isOverdue 
                      ? '#f59e0b' 
                      : '#6b7280';
                    
                    return (
                      <tr
                        key={post.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: isOverdue ? 'rgba(245, 158, 11, 0.1)' : index % 2 === 0 ? 'var(--surface)' : 'var(--surface-elevated)'
                        }}
                      >
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: statusColor,
                            color: 'white'
                          }}>
                            {post.status === 'published' ? '✅ Published' : 
                             post.status === 'failed' ? '❌ Failed' : 
                             isOverdue ? `⚠️ Overdue (${post.daysOverdue}d)` : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: isOverdue ? '600' : '400' }}>
                            {post.title}
                          </div>
                          {!post.hasFiles && post.status === 'published' && (
                            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                              ⚠️ Files missing
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            background: post.category === 'how-to-in-tech' 
                              ? 'rgba(34, 197, 94, 0.1)' 
                              : post.category === 'research'
                              ? 'rgba(59, 130, 246, 0.1)'
                              : 'var(--surface-elevated)',
                            color: post.category === 'how-to-in-tech' 
                              ? '#22c55e' 
                              : post.category === 'research'
                              ? '#3b82f6'
                              : 'var(--text)',
                            borderRadius: '4px',
                            fontWeight: '600',
                            border: post.category === 'how-to-in-tech' 
                              ? '1px solid #22c55e' 
                              : post.category === 'research'
                              ? '1px solid #3b82f6'
                              : '1px solid var(--border)'
                          }}>
                            {post.category === 'how-to-in-tech' ? '📝 How to' : 
                             post.category === 'research' ? '🔬 Research' : 
                             '📚 Deep Dive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          <div>
                            {new Date(post.scheduledDate).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {post.scheduledTime && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: 'var(--text-tertiary)',
                              marginTop: '2px'
                            }}>
                              {post.scheduledTime} UTC
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          {post.publishedTime 
                            ? new Date(post.publishedTime).toLocaleString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                              })
                            : '-'}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{
                            textTransform: 'capitalize',
                            fontSize: '12px',
                            padding: '2px 6px',
                            background: 'var(--surface-elevated)',
                            borderRadius: '4px'
                          }}>
                            {post.pillar}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Warning for overdue posts */}
            {analyticsData.blogPosts.overdue > 0 && (
              <div style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                color: '#f59e0b'
              }}>
                <strong>⚠️ Warning:</strong> {analyticsData.blogPosts.overdue} post(s) are overdue. 
                The health check workflow should auto-trigger generation. Check GitHub Actions if posts don't appear.
              </div>
            )}
          </section>

          {/* App signups (Google) - always show section when dashboard loaded so it never looks "removed" */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)',
            marginTop: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              🔐 App Signups (Google)
            </h2>
            {!analyticsData.googleSignups ? (
              <div style={{
                padding: 'var(--space-3)',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                color: '#f59e0b',
                fontSize: '14px'
              }}>
                Not available — analytics API may be from an older deployment. Redeploy from main to enable.
              </div>
            ) : analyticsData.googleSignups.error ? (
              <div style={{
                padding: 'var(--space-3)',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                {analyticsData.googleSignups.error}
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{
                    background: 'var(--bg)',
                    padding: 'var(--space-4)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--signal)', marginBottom: '4px' }}>
                      {analyticsData.googleSignups.total}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total (cohort ≥ Oct 27, 2025)</div>
                  </div>
                  <div style={{
                    background: 'var(--bg)',
                    padding: 'var(--space-4)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-warm)', marginBottom: '4px' }}>
                      {analyticsData.googleSignups.last7Days}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Last 7 Days</div>
                  </div>
                  <div style={{
                    background: 'var(--bg)',
                    padding: 'var(--space-4)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand)', marginBottom: '4px' }}>
                      {analyticsData.googleSignups.cohortSinceOct2025}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Cohort ≥ Oct 27, 2025</div>
                  </div>
                </div>
                {analyticsData.googleSignups.signups.length > 0 && (
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: 'var(--space-3)',
                      color: 'var(--text)'
                    }}>
                      Recent signups (full cohort)
                    </h3>
                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          background: 'var(--surface-elevated)',
                          borderBottom: '2px solid var(--border)',
                          zIndex: 1
                        }}>
                          <tr>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Signed up</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.googleSignups.signups.map((s) => (
                            <tr
                              key={s.uid}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                background: 'var(--surface)'
                              }}
                            >
                              <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{s.email}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--text)' }}>
                                {s.displayName || s.firstName || '—'}
                              </td>
                              <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {new Date(s.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Leads Section */}
          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: 'var(--space-4)',
              color: 'var(--text)'
            }}>
              Priority Queue Leads
            </h2>
            
            {analyticsData.leads && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{
                    background: 'var(--bg)',
                    padding: 'var(--space-4)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--signal)', marginBottom: '4px' }}>
                      {analyticsData.leads.total}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Leads</div>
                  </div>
                  <div style={{
                    background: 'var(--bg)',
                    padding: 'var(--space-4)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-warm)', marginBottom: '4px' }}>
                      {analyticsData.leads.last7Days}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Last 7 Days</div>
                  </div>
                </div>

                {analyticsData.leads.recent.length > 0 && (
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: 'var(--space-4)',
                      color: 'var(--text)'
                    }}>
                      Recent Leads
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)'
                    }}>
                      {analyticsData.leads.recent.map((lead) => (
                        <div
                          key={lead.id}
                          style={{
                            background: 'var(--bg)',
                            padding: 'var(--space-3)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                                {lead.firstName && lead.lastName 
                                  ? `${lead.firstName} ${lead.lastName}` 
                                  : lead.email}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                {lead.companyName} • {lead.email}
                              </div>
                            </div>
                            <div style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              background: lead.status === 'NEW' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: lead.status === 'NEW' ? 'var(--accent-warm)' : 'var(--brand)',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {lead.status}
                            </div>
                          </div>
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: 'var(--muted)'
                          }}>
                            {new Date(lead.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* Navigation */}
      <div style={{
        marginTop: 'var(--space-8)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 'var(--space-4)'
      }}>
        <Link
          href="/dashboard"
          style={{
            padding: '12px 24px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'var(--text)',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--signal)';
            e.currentTarget.style.color = 'var(--signal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text)';
          }}
        >
         ← Back to Dashboard
         </Link>
       </div>
     </div>
    </>
  );
}

// Helper Components
function MetricCard({ 
  label, 
  value, 
  subtitle, 
  progress 
}: { 
  label: string; 
  value: string; 
  subtitle?: string; 
  progress?: number;
}) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '8px'
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 'var(--space-1)' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {subtitle}
        </div>
      )}
      {progress !== undefined && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <div style={{
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              background: 'var(--signal)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({
  title,
  total,
  successful,
  last7Days,
  conversionRate,
  topPairs,
  copies
}: {
  title: string;
  total: number;
  successful: number;
  last7Days: number;
  conversionRate: number;
  topPairs?: Array<{ pair: string; count: number }>;
  copies?: number;
}) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '8px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Uses:</span>
          <span style={{ fontWeight: '600' }}>{total.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Successful:</span>
          <span style={{ fontWeight: '600', color: 'var(--signal)' }}>{successful.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Last 7 Days:</span>
          <span style={{ fontWeight: '600' }}>{last7Days.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Conversion Rate:</span>
          <span style={{ fontWeight: '600' }}>{conversionRate.toFixed(1)}%</span>
        </div>
        {copies !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Copies:</span>
            <span style={{ fontWeight: '600' }}>{copies.toLocaleString()}</span>
          </div>
        )}
        {topPairs && topPairs.length > 0 && (
          <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              Top Conversion Pairs:
            </div>
            {topPairs.map(({ pair, count }) => (
              <div key={pair} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{pair}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

