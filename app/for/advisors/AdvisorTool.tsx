'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { 
  trackToolPageView, 
  trackToolInteraction, 
  trackToolSuccess,
  trackToolDownload,
  trackToolError 
} from '@/app/lib/analytics/tools';

interface PortfolioData {
  clientName: string;
  totalValue: number;
  positions: Array<{
    ticker: string;
    shares: number;
    value: number;
    allocation: number;
  }>;
}

export default function AdvisorTool() {
  const { user, isAuthenticated } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hasCorporateLicense, setHasCorporateLicense] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    clientName: 'Sample Client',
    totalValue: 125000,
    positions: [
      { ticker: 'AAPL', shares: 100, value: 17500, allocation: 14 },
      { ticker: 'MSFT', shares: 50, value: 18750, allocation: 15 },
      { ticker: 'GOOGL', shares: 75, value: 11250, allocation: 9 },
      { ticker: 'TSLA', shares: 200, value: 50000, allocation: 40 },
      { ticker: 'NVDA', shares: 30, value: 15000, allocation: 12 },
      { ticker: 'AMZN', shares: 40, value: 12500, allocation: 10 },
    ]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track page view on mount
  useEffect(() => {
    trackToolPageView('advisor_tool');
  }, []);

  // Check for corporate license from authenticated user's subscription
  useEffect(() => {
    const checkCorporateLicense = async () => {
      setCheckingLicense(true);
      
      if (!isAuthenticated || !user) {
        // Not authenticated - check localStorage as fallback (for legacy users)
        const corporateKey = typeof window !== 'undefined' 
          ? localStorage.getItem('CORPORATE_KEY') 
          : null;
        setHasCorporateLicense(corporateKey === 'VALID_CORPORATE_KEY');
        setCheckingLicense(false);
        return;
      }

      // Check cache first to avoid unnecessary API calls
      const cacheKey = `apiKeys_${user.email}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);
        if (age < 5 * 60 * 1000) { // 5 minutes
          try {
            const data = JSON.parse(cachedData);
            const hasLicense = !!data.corporateLicense;
            setHasCorporateLicense(hasLicense);
            setCheckingLicense(false);
            return; // Don't fetch if we have fresh cache
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }

      try {
        // Get Firebase ID token
        const idToken = await user.getIdToken();
        
        // Fetch corporate license from API
        const response = await fetch('/api/api-keys/user', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const hasLicense = !!data.corporateLicense;
          setHasCorporateLicense(hasLicense);
          
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          
          // Store in localStorage for persistence (optional, for client-side checks)
          if (hasLicense && data.corporateLicense) {
            localStorage.setItem('CORPORATE_KEY', data.corporateLicense);
          } else {
            localStorage.removeItem('CORPORATE_KEY');
          }
        } else if (response.status === 503) {
          // Quota exceeded - use cached data
          if (cachedData) {
            try {
              const data = JSON.parse(cachedData);
              setHasCorporateLicense(!!data.corporateLicense);
            } catch (e) {
              // Invalid cache
            }
          } else {
            // Fallback to localStorage check
            const corporateKey = typeof window !== 'undefined' 
              ? localStorage.getItem('CORPORATE_KEY') 
              : null;
            setHasCorporateLicense(corporateKey === 'VALID_CORPORATE_KEY');
          }
        } else {
          // API call failed - fallback to localStorage check
          const corporateKey = typeof window !== 'undefined' 
            ? localStorage.getItem('CORPORATE_KEY') 
            : null;
          setHasCorporateLicense(corporateKey === 'VALID_CORPORATE_KEY');
        }
      } catch (error) {
        console.error('Error checking corporate license:', error);
        // Use cached data on error
        if (cachedData) {
          try {
            const data = JSON.parse(cachedData);
            setHasCorporateLicense(!!data.corporateLicense);
          } catch (e) {
            // Invalid cache, fallback to localStorage
            const corporateKey = typeof window !== 'undefined' 
              ? localStorage.getItem('CORPORATE_KEY') 
              : null;
            setHasCorporateLicense(corporateKey === 'VALID_CORPORATE_KEY');
          }
        } else {
          // Fallback to localStorage on error
          const corporateKey = typeof window !== 'undefined' 
            ? localStorage.getItem('CORPORATE_KEY') 
            : null;
          setHasCorporateLicense(corporateKey === 'VALID_CORPORATE_KEY');
        }
      } finally {
        setCheckingLicense(false);
      }
    };

    checkCorporateLicense();
  }, [user, isAuthenticated]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      trackToolError('advisor_tool', 'invalid_file_type', {
        fileType: file.type,
        fileSize: file.size
      });
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      trackToolError('advisor_tool', 'file_too_large', {
        fileSize: file.size,
        maxSize: 5 * 1024 * 1024
      });
      alert('Logo file must be less than 5MB');
      return;
    }

    setLogoFile(file);

    // Track logo upload
    trackToolInteraction('advisor_tool', 'logo_upload', {
      fileSize: file.size
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDownload = useCallback(() => {
    if (!hasCorporateLicense) {
      trackToolError('advisor_tool', 'license_required', {
        hasLogo: !!logo
      });
      alert('To generate high-res PDFs for clients without watermarks, requires a Corporate License ($100/mo).\n\nPreview is available for free. Get your Corporate License at pocketportfolio.app/sponsor');
      return;
    }

    // Track PDF generation attempt
    trackToolInteraction('advisor_tool', 'logo_upload', {
      hasCorporateLicense: true
    });

    // TODO: Generate PDF with logo replacement
    // For now, track as success when PDF would be generated
    trackToolSuccess('advisor_tool', {
      hasCorporateLicense: true,
      hasLogo: !!logo
    });

    trackToolDownload('advisor_tool', 'pdf', {
      hasCorporateLicense: true,
      hasLogo: !!logo
    });

    alert('PDF generation will be implemented with server-side PDF library. This requires Corporate License validation.');
  }, [hasCorporateLicense, logo]);

  return (
    <div className="brand-card" style={{ padding: 'var(--space-6)' }}>
      {/* Logo Upload */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}>
          Upload Firm Logo (Optional)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {logo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <img 
                src={logo} 
                alt="Firm Logo" 
                style={{
                  height: '64px',
                  width: 'auto',
                  maxWidth: '300px',
                  objectFit: 'contain'
                }}
              />
              <button
                onClick={() => {
                  setLogo(null);
                  setLogoFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="brand-link"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--danger)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-2)'
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
              <div style={{
                padding: 'var(--space-3) var(--space-6)',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                transition: 'border-color 0.2s ease',
                background: 'var(--surface-elevated)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              >
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  Click to upload logo (PNG, JPG, SVG - Max 5MB)
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
        <p style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)'
        }}>
          Your logo will replace Pocket Portfolio branding in the report preview
        </p>
      </div>

      {/* PDF Preview */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text)',
          marginBottom: 'var(--space-4)'
        }}>
          Report Preview
        </h2>
        <div style={{
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          background: 'var(--surface-elevated)',
          position: 'relative'
        }}>
          {/* Report Header */}
          <div style={{
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border)'
          }}>
            {logo ? (
              <img 
                src={logo} 
                alt="Firm Logo" 
                style={{
                  height: '48px',
                  width: 'auto',
                  marginBottom: 'var(--space-2)'
                }}
              />
            ) : (
              <div style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--signal)',
                marginBottom: 'var(--space-2)'
              }}>
                Pocket Portfolio
              </div>
            )}
            <h3 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-1)'
            }}>
              Portfolio Report
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)'
            }}>
              {portfolioData.clientName} • {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Portfolio Summary */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-3)'
            }}>
              Portfolio Summary
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-4)'
            }}>
              <div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Total Value
                </p>
                <p style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--text)'
                }}>
                  £{portfolioData.totalValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Positions
                </p>
                <p style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--text)'
                }}>
                  {portfolioData.positions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div>
            <h4 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-3)'
            }}>
              Holdings
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 'var(--font-size-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{
                      textAlign: 'left',
                      padding: 'var(--space-2) 0',
                      color: 'var(--text)',
                      fontWeight: 'var(--font-semibold)'
                    }}>
                      Ticker
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: 'var(--space-2) 0',
                      color: 'var(--text)',
                      fontWeight: 'var(--font-semibold)'
                    }}>
                      Shares
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: 'var(--space-2) 0',
                      color: 'var(--text)',
                      fontWeight: 'var(--font-semibold)'
                    }}>
                      Value
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: 'var(--space-2) 0',
                      color: 'var(--text)',
                      fontWeight: 'var(--font-semibold)'
                    }}>
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.positions.map((position, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{
                        padding: 'var(--space-2) 0',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text)'
                      }}>
                        {position.ticker}
                      </td>
                      <td style={{
                        padding: 'var(--space-2) 0',
                        textAlign: 'right',
                        color: 'var(--text)'
                      }}>
                        {position.shares}
                      </td>
                      <td style={{
                        padding: 'var(--space-2) 0',
                        textAlign: 'right',
                        color: 'var(--text)'
                      }}>
                        £{position.value.toLocaleString()}
                      </td>
                      <td style={{
                        padding: 'var(--space-2) 0',
                        textAlign: 'right',
                        color: 'var(--text)'
                      }}>
                        {position.allocation}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Watermark (for free preview) */}
          {!hasCorporateLicense && (
            <div style={{
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                Preview Only - Watermark removed with Corporate License
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleDownload}
          className={`brand-button ${hasCorporateLicense ? 'brand-button-primary' : 'brand-button-secondary'}`}
          style={{
            padding: 'var(--space-4) var(--space-8)',
            fontSize: 'var(--font-size-lg)',
            opacity: hasCorporateLicense ? 1 : 0.7
          }}
        >
          Download High-Res PDF
        </button>
        {!hasCorporateLicense && (
          <p style={{
            marginTop: 'var(--space-3)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)'
          }}>
            Requires Corporate License ($100/mo) •{' '}
            <Link 
              href="/sponsor?utm_source=advisor_tool&utm_medium=download_gate&utm_campaign=corporate"
              className="brand-link"
              style={{
                color: 'var(--signal)',
                fontWeight: 'var(--font-semibold)'
              }}
            >
              Get License →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
