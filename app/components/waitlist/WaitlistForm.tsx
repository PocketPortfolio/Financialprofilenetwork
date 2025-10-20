'use client';

import React, { useState, useEffect } from 'react';
import { WaitlistAnalytics } from '../../lib/waitlist/analytics';
import { saveToWaitlist } from '../../lib/waitlist/saveToFirestore';

interface WaitlistFormProps {
  source: 'web:join' | 'web:footer' | 'web:header';
  onSubmit?: (success: boolean, message: string) => void;
  className?: string;
  showOptionalFields?: boolean;
}

interface FormData {
  email: string;
  name: string;
  region: string;
  role: string;
}

interface FormErrors {
  email?: string;
  name?: string;
  region?: string;
  role?: string;
  general?: string;
}

export default function WaitlistForm({ 
  source, 
  onSubmit, 
  className = '',
  showOptionalFields = true 
}: WaitlistFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    region: '',
    role: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const analytics = WaitlistAnalytics.getInstance();
  
  useEffect(() => {
    analytics.trackFormView(source);
  }, [source, analytics]);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Optional field validation (if shown)
    if (showOptionalFields) {
      if (formData.name && formData.name.length > 100) {
        newErrors.name = 'Name must be less than 100 characters';
      }
      
      if (formData.region && formData.region.length > 50) {
        newErrors.region = 'Region must be less than 50 characters';
      }
      
      if (formData.role && formData.role.length > 50) {
        newErrors.role = 'Role must be less than 50 characters';
      }
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
      analytics.trackFormSubmit(source);
      
      const result = await saveToWaitlist({
        email: formData.email.trim(),
        name: formData.name.trim() || undefined,
        region: formData.region.trim() || undefined,
        role: formData.role.trim() || undefined,
        source,
        userAgent: navigator.userAgent
      });
      
      if (result.success) {
        setIsSuccess(true);
        setSuccessMessage(result.message);
        analytics.trackFormSuccess(source, result.duplicate);
        
        // Reset form
        setFormData({
          email: '',
          name: '',
          region: '',
          role: ''
        });
      } else {
        setErrors({ general: result.message });
        
        if (result.duplicate) {
          analytics.trackFormError(source, 'duplicate');
        } else {
          analytics.trackFormError(source, 'validation');
        }
      }
      
      onSubmit?.(result.success, result.message);
      
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setErrors({ general: 'Something went wrong. Please try again later.' });
      analytics.trackFormError(source, 'validation');
      onSubmit?.(false, 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  if (isSuccess) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '32px',
          color: 'var(--pos)',
          marginBottom: '16px'
        }}>✓</div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--pos)',
          marginBottom: '12px'
        }}>You're on the list!</h3>
        <p style={{
          color: 'var(--text)',
          fontSize: '14px',
          margin: 0
        }}>{successMessage}</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'clamp(16px, 3vw, 24px)',
      maxWidth: '100%',
      width: '100%'
    }}>
      {errors.general && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{
            color: 'var(--neg)',
            fontSize: '14px',
            margin: 0,
            fontWeight: '500'
          }}>{errors.general}</p>
        </div>
      )}
      
      {/* Modern Email Field */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'relative',
            background: 'var(--card)',
            borderRadius: '16px',
            border: `2px solid ${errors.email ? 'var(--neg)' : 'transparent'}`,
            transition: 'all 0.3s ease',
            overflow: 'visible',
            minHeight: 'clamp(60px, 8vw, 70px)',
            paddingTop: '20px'
          }}>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            style={{
              width: '100%',
              padding: formData.email ? 'clamp(20px, 4vw, 24px) clamp(16px, 3vw, 20px) clamp(8px, 2vw, 12px) clamp(16px, 3vw, 20px)' : 'clamp(16px, 3vw, 20px) clamp(16px, 3vw, 20px)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '16px',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            placeholder=" "
            required
            disabled={isSubmitting}
            aria-describedby={errors.email ? 'email-error' : undefined}
            onFocus={(e) => {
              if (!errors.email && e.target.parentElement) {
                e.target.parentElement.style.borderColor = 'var(--signal)';
                e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              }
            }}
            onBlur={(e) => {
              if (!errors.email && e.target.parentElement) {
                e.target.parentElement.style.borderColor = 'transparent';
                e.target.parentElement.style.boxShadow = 'none';
              }
            }}
          />
              <label htmlFor="email" style={{
                position: 'absolute',
                left: 'clamp(16px, 3vw, 20px)',
                top: formData.email ? 'clamp(6px, 2vw, 8px)' : 'clamp(16px, 3vw, 20px)',
                color: formData.email ? 'var(--brand)' : 'var(--muted)',
                fontSize: formData.email ? '12px' : '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                pointerEvents: 'none',
                background: formData.email ? 'var(--card)' : 'transparent',
                padding: formData.email ? '0 8px' : '0',
                zIndex: 10,
                lineHeight: '1.2',
                height: formData.email ? '16px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}>
                Email Address *
              </label>
        </div>
        {errors.email && (
          <p id="email-error" style={{
            marginTop: '8px',
            fontSize: '14px',
            color: 'var(--neg)',
            margin: '8px 0 0 0',
            fontWeight: '500'
          }}>{errors.email}</p>
        )}
      </div>
      
      {/* Optional Fields */}
      {showOptionalFields && (
        <>
          {/* Modern Name Field */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                background: 'var(--card)',
                borderRadius: '16px',
                border: `2px solid ${errors.name ? 'var(--neg)' : 'transparent'}`,
                transition: 'all 0.3s ease',
                overflow: 'visible',
                minHeight: 'clamp(60px, 8vw, 70px)',
                paddingTop: '20px'
              }}>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange('name')}
                style={{
                  width: '100%',
                  padding: formData.name ? 'clamp(20px, 4vw, 24px) clamp(16px, 3vw, 20px) clamp(8px, 2vw, 12px) clamp(16px, 3vw, 20px)' : 'clamp(16px, 3vw, 20px) clamp(16px, 3vw, 20px)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '16px',
                  fontWeight: '500',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                placeholder=" "
                disabled={isSubmitting}
                maxLength={100}
                onFocus={(e) => {
                  if (!errors.name && e.target.parentElement) {
                    e.target.parentElement.style.borderColor = 'var(--signal)';
                    e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name && e.target.parentElement) {
                    e.target.parentElement.style.borderColor = 'transparent';
                    e.target.parentElement.style.boxShadow = 'none';
                  }
                }}
              />
              <label htmlFor="name" style={{
                position: 'absolute',
                left: 'clamp(16px, 3vw, 20px)',
                top: formData.name ? 'clamp(6px, 2vw, 8px)' : 'clamp(16px, 3vw, 20px)',
                color: formData.name ? 'var(--brand)' : 'var(--muted)',
                fontSize: formData.name ? '12px' : '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                pointerEvents: 'none',
                background: formData.name ? 'var(--card)' : 'transparent',
                padding: formData.name ? '0 8px' : '0',
                zIndex: 10,
                lineHeight: '1.2',
                height: formData.name ? '16px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}>
                Name (optional)
              </label>
            </div>
            {errors.name && (
              <p style={{
                marginTop: '8px',
                fontSize: '14px',
                color: 'var(--neg)',
                margin: '8px 0 0 0',
                fontWeight: '500'
              }}>{errors.name}</p>
            )}
          </div>
          
          {/* Modern Region Field */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                background: 'var(--card)',
                borderRadius: '16px',
                border: `2px solid ${errors.region ? 'var(--neg)' : 'transparent'}`,
                transition: 'all 0.3s ease',
                overflow: 'visible',
                minHeight: 'clamp(60px, 8vw, 70px)',
                paddingTop: '20px'
              }}>
              <input
                type="text"
                id="region"
                value={formData.region}
                onChange={handleInputChange('region')}
                style={{
                  width: '100%',
                  padding: formData.region ? 'clamp(20px, 4vw, 24px) clamp(16px, 3vw, 20px) clamp(8px, 2vw, 12px) clamp(16px, 3vw, 20px)' : 'clamp(16px, 3vw, 20px) clamp(16px, 3vw, 20px)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '16px',
                  fontWeight: '500',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                placeholder=" "
                disabled={isSubmitting}
                maxLength={50}
                onFocus={(e) => {
                  if (!errors.region && e.target.parentElement) {
                    e.target.parentElement.style.borderColor = 'var(--signal)';
                    e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.region && e.target.parentElement) {
                    e.target.parentElement.style.borderColor = 'transparent';
                    e.target.parentElement.style.boxShadow = 'none';
                  }
                }}
              />
              <label htmlFor="region" style={{
                position: 'absolute',
                left: 'clamp(16px, 3vw, 20px)',
                top: formData.region ? 'clamp(6px, 2vw, 8px)' : 'clamp(16px, 3vw, 20px)',
                color: formData.region ? 'var(--brand)' : 'var(--muted)',
                fontSize: formData.region ? '12px' : '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                pointerEvents: 'none',
                background: formData.region ? 'var(--card)' : 'transparent',
                padding: formData.region ? '0 8px' : '0',
                zIndex: 10,
                lineHeight: '1.2',
                height: formData.region ? '16px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}>
                Region (optional)
              </label>
            </div>
            {errors.region && (
              <p style={{
                marginTop: '8px',
                fontSize: '14px',
                color: 'var(--neg)',
                margin: '8px 0 0 0',
                fontWeight: '500'
              }}>{errors.region}</p>
            )}
          </div>
          
          {/* Modern Role Select */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                background: 'var(--card)',
                borderRadius: '16px',
                border: `2px solid ${errors.role ? 'var(--neg)' : 'transparent'}`,
                transition: 'all 0.3s ease',
                overflow: 'visible',
                minHeight: 'clamp(60px, 8vw, 70px)',
                paddingTop: '20px',
                zIndex: 1
              }}>
              <select
                id="role"
                value={formData.role}
                onChange={handleInputChange('role')}
                style={{
                  width: '100%',
                  padding: formData.role ? 'clamp(20px, 4vw, 24px) clamp(16px, 3vw, 20px) clamp(8px, 2vw, 12px) clamp(16px, 3vw, 20px)' : 'clamp(16px, 3vw, 20px) clamp(16px, 3vw, 20px)',
                  background: 'transparent',
                  border: 'none',
                  color: formData.role ? 'var(--text)' : 'transparent',
                  fontSize: '16px',
                  fontWeight: '500',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
                disabled={isSubmitting}
                onFocus={(e) => {
                  if (!errors.role && e.target.parentElement) {
                    e.target.parentElement.style.borderColor = 'var(--signal)';
                    e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.role && e.target.parentElement) {
                    e.target.parentElement.style.borderColor = 'transparent';
                    e.target.parentElement.style.boxShadow = 'none';
                  }
                }}
              >
                <option value="" style={{ color: 'var(--muted)', background: 'var(--card)' }}>Select your role</option>
                <option value="investor" style={{ color: 'var(--text)', background: 'var(--card)' }}>Investor</option>
                <option value="engineer" style={{ color: 'var(--text)', background: 'var(--card)' }}>Engineer</option>
                <option value="student" style={{ color: 'var(--text)', background: 'var(--card)' }}>Student</option>
                <option value="trader" style={{ color: 'var(--text)', background: 'var(--card)' }}>Trader</option>
                <option value="other" style={{ color: 'var(--text)', background: 'var(--card)' }}>Other</option>
              </select>
              <label htmlFor="role" style={{
                position: 'absolute',
                left: 'clamp(16px, 3vw, 20px)',
                top: formData.role ? 'clamp(6px, 2vw, 8px)' : 'clamp(16px, 3vw, 20px)',
                color: formData.role ? 'var(--brand)' : 'var(--muted)',
                fontSize: formData.role ? '12px' : '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                pointerEvents: 'none',
                background: formData.role ? 'var(--card)' : 'transparent',
                padding: formData.role ? '0 8px' : '0',
                zIndex: 10,
                lineHeight: '1.2',
                height: formData.role ? '16px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}>
                Role (optional)
              </label>
              <div style={{
                position: 'absolute',
                right: 'clamp(16px, 3vw, 20px)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                pointerEvents: 'none'
              }}>
                ▼
              </div>
            </div>
            {errors.role && (
              <p style={{
                marginTop: '8px',
                fontSize: '14px',
                color: 'var(--neg)',
                margin: '8px 0 0 0',
                fontWeight: '500'
              }}>{errors.role}</p>
            )}
          </div>
        </>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          padding: 'clamp(14px, 3vw, 18px) clamp(20px, 4vw, 24px)',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
          opacity: isSubmitting ? 0.6 : 1,
          outline: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isSubmitting ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <svg 
              style={{ 
                width: '20px', 
                height: '20px', 
                animation: 'spin 1s linear infinite'
              }} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Joining...
          </span>
        ) : (
          'Join Waitlist'
        )}
      </button>
      
      <p style={{
        fontSize: '14px',
        color: 'var(--muted)',
        textAlign: 'center',
        margin: '16px 0 0 0',
        lineHeight: '1.5',
        fontWeight: '400'
      }}>
        We'll never spam you. Unsubscribe at any time.
      </p>
    </form>
  );
}
