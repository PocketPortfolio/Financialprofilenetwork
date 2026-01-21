'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import SEOPageTracker from '@/app/components/SEOPageTracker';

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    companyName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          firstName: formData.name.trim() || undefined,
          companyName: formData.companyName.trim(),
          source: 'waitlist_page',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsSuccess(true);
        setFormData({ email: '', name: '', companyName: '' });
      } else {
        setErrors({ general: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setErrors({ general: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <>
      <ProductionNavbar />
      <SEOPageTracker />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: 'clamp(32px, 5vw, 48px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '24px',
                color: 'var(--accent-warm)'
              }}>✓</div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 'bold',
                color: 'var(--text)',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                You're on the Priority Queue!
              </h1>
              <p style={{
                fontSize: 'clamp(16px, 2vw, 18px)',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '32px'
              }}>
                We'll notify you as soon as US brokerage connections are available. 
                You'll be among the first to access this feature.
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                Return to Home →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{
                  fontSize: 'clamp(32px, 5vw, 42px)',
                  fontWeight: 'bold',
                  color: 'var(--text)',
                  marginBottom: '16px',
                  lineHeight: '1.2'
                }}>
                  Join the <span style={{ color: 'var(--accent-warm)' }}>Priority Queue</span>
                </h1>
                <p style={{
                  fontSize: 'clamp(16px, 2vw, 18px)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  Due to high volume, US connections are currently waitlisted. 
                  Be among the first to access when we launch.
                </p>
              </div>

              {errors.general && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    margin: 0,
                    fontWeight: '500'
                  }}>{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Email Field */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'relative',
                    background: 'var(--card)',
                    borderRadius: '12px',
                    border: `2px solid ${errors.email ? '#ef4444' : 'transparent'}`,
                    transition: 'all 0.3s ease',
                    minHeight: '60px',
                    paddingTop: '20px'
                  }}>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      style={{
                        width: '100%',
                        padding: formData.email ? '20px 20px 8px 20px' : '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '16px',
                        fontWeight: '500',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder=" "
                      required
                      disabled={isSubmitting}
                    />
                    <label htmlFor="email" style={{
                      position: 'absolute',
                      left: '20px',
                      top: formData.email ? '8px' : '16px',
                      color: formData.email ? 'var(--brand)' : 'var(--muted)',
                      fontSize: formData.email ? '12px' : '16px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none',
                      background: formData.email ? 'var(--card)' : 'transparent',
                      padding: formData.email ? '0 8px' : '0',
                      zIndex: 10
                    }}>
                      Email Address *
                    </label>
                  </div>
                  {errors.email && (
                    <p style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#ef4444',
                      margin: '8px 0 0 0'
                    }}>{errors.email}</p>
                  )}
                </div>

                {/* Name Field */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'relative',
                    background: 'var(--card)',
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    minHeight: '60px',
                    paddingTop: '20px'
                  }}>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      style={{
                        width: '100%',
                        padding: formData.name ? '20px 20px 8px 20px' : '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '16px',
                        fontWeight: '500',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder=" "
                      disabled={isSubmitting}
                    />
                    <label htmlFor="name" style={{
                      position: 'absolute',
                      left: '20px',
                      top: formData.name ? '8px' : '16px',
                      color: formData.name ? 'var(--brand)' : 'var(--muted)',
                      fontSize: formData.name ? '12px' : '16px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none',
                      background: formData.name ? 'var(--card)' : 'transparent',
                      padding: formData.name ? '0 8px' : '0',
                      zIndex: 10
                    }}>
                      Name (optional)
                    </label>
                  </div>
                </div>

                {/* Company Name Field */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'relative',
                    background: 'var(--card)',
                    borderRadius: '12px',
                    border: `2px solid ${errors.companyName ? '#ef4444' : 'transparent'}`,
                    transition: 'all 0.3s ease',
                    minHeight: '60px',
                    paddingTop: '20px'
                  }}>
                    <input
                      type="text"
                      id="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange('companyName')}
                      style={{
                        width: '100%',
                        padding: formData.companyName ? '20px 20px 8px 20px' : '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '16px',
                        fontWeight: '500',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder=" "
                      required
                      disabled={isSubmitting}
                    />
                    <label htmlFor="companyName" style={{
                      position: 'absolute',
                      left: '20px',
                      top: formData.companyName ? '8px' : '16px',
                      color: formData.companyName ? 'var(--brand)' : 'var(--muted)',
                      fontSize: formData.companyName ? '12px' : '16px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none',
                      background: formData.companyName ? 'var(--card)' : 'transparent',
                      padding: formData.companyName ? '0 8px' : '0',
                      zIndex: 10
                    }}>
                      Company Name *
                    </label>
                  </div>
                  {errors.companyName && (
                    <p style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#ef4444',
                      margin: '8px 0 0 0'
                    }}>{errors.companyName}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: isSubmitting 
                      ? 'hsl(var(--muted))' 
                      : 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isSubmitting 
                      ? 'none' 
                      : '0 4px 12px rgba(245, 158, 11, 0.3)',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                    }
                  }}
                >
                  {isSubmitting ? 'Joining...' : 'Join Priority Queue'}
                </button>

                <p style={{
                  fontSize: '14px',
                  color: 'var(--muted)',
                  textAlign: 'center',
                  margin: '16px 0 0 0',
                  lineHeight: '1.5'
                }}>
                  We'll never spam you. Unsubscribe at any time.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

