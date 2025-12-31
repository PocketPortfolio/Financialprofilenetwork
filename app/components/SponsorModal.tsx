'use client';

import React, { useState, useEffect } from 'react';

// Determine if tier is premium
const isPremiumTier = (tierName: string): boolean => {
  return tierName.includes('Corporate Sponsor') || tierName.includes("Founder's Club");
};

// Get tier-specific configuration
const getTierConfig = (tierName: string) => {
  const isPremium = isPremiumTier(tierName);
  
  if (isPremium) {
    // Premium tier styling (Corporate Sponsor, UK Founder's Club)
    return {
      modalBg: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      borderWidth: '2px',
      headerIcon: '👑',
      headerSize: '24px',
      subtext: tierName.includes("Founder's Club") 
        ? "Join an exclusive community. Enter your email to receive your <b>Lifetime API Key</b>, <b>Founder's Badge</b>, and priority Discord access."
        : "Thank you for your corporate support! Enter your email to receive your <b>API Key</b>, <b>Corporate Badge</b>, and priority support details.",
      buttonGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      buttonShadow: '0 6px 16px -1px rgba(245, 158, 11, 0.5)',
      maxWidth: '480px',
      padding: '40px',
      inputBorderColor: '#F59E0B',
      boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.25)'
    };
  } else {
    // Standard tier styling (Code Supporter, Feature Voter)
    const isCodeSupporter = tierName.includes('Code Supporter');
    return {
      modalBg: '#FFFFFF',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: '1px',
      headerIcon: isCodeSupporter ? '☕' : '🗳️',
      headerSize: '20px',
      subtext: isCodeSupporter
        ? "Thanks for the coffee! Enter your email to receive your <b>API Key</b> and supporter details."
        : "Great choice! Enter your email to receive your <b>API Key</b> and roadmap access details.",
      buttonGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      buttonShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
      maxWidth: '420px',
      padding: '32px',
      inputBorderColor: '#6366F1',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    };
  }
};

// Base styles
const baseStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#666',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '16px',
    marginBottom: '20px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  },
};

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, priceId?: string) => void;
  tierName: string;
  billingInterval?: 'monthly' | 'annual';
  priceIds?: { monthly: string; annual: string };
}

export default function SponsorModal({ isOpen, onClose, onSubmit, tierName, billingInterval: initialBillingInterval, priceIds }: SponsorModalProps) {
  const [email, setEmail] = useState('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>(
    initialBillingInterval || 'annual' // Default to annual for Code Supporter and Feature Voter
  );
  const tierConfig = getTierConfig(tierName);
  const isPremium = isPremiumTier(tierName);
  const supportsBillingToggle = !!priceIds;

  // Reset email and billing interval when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setBillingInterval(initialBillingInterval || 'annual');
    }
  }, [isOpen, initialBillingInterval]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get the selected price ID based on billing interval
  const getSelectedPriceId = (): string | undefined => {
    if (priceIds) {
      return billingInterval === 'annual' ? priceIds.annual : priceIds.monthly;
    }
    return undefined;
  };

  // Calculate savings for annual billing
  const getSavingsMessage = (): string => {
    if (tierName === 'Code Supporter') {
      return 'Save $10/year (2 months free!)';
    } else if (tierName === 'Feature Voter') {
      return 'Save $40/year (2 months free!)';
    } else if (tierName === 'Corporate Sponsor') {
      return 'Save $200/year (2 months free!)';
    }
    return '';
  };

  const handleSubmit = () => {
    const selectedPriceId = getSelectedPriceId();
    onSubmit(email, selectedPriceId);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={baseStyles.overlay} onClick={handleOverlayClick}>
        <div 
          style={{
            background: tierConfig.modalBg,
            borderRadius: isPremium ? '20px' : '16px',
            padding: tierConfig.padding,
            width: '100%',
            maxWidth: tierConfig.maxWidth,
            boxShadow: tierConfig.boxShadow,
            border: `${tierConfig.borderWidth} solid ${tierConfig.borderColor}`,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            animation: isPremium ? 'slideUp 0.3s ease-out' : 'fadeIn 0.2s ease-out',
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Tier-Specific Icon */}
          <div style={{
            fontSize: tierConfig.headerSize,
            fontWeight: '700',
            color: isPremium ? '#1a1a1a' : '#1a1a1a',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: isPremium ? '28px' : '24px' }}>{tierConfig.headerIcon}</span>
            <span>Claim {tierName}</span>
          </div>
          
          {/* Tier-Specific Subtext */}
          <p 
            style={{
              fontSize: isPremium ? '15px' : '14px',
              color: isPremium ? '#4B5563' : '#666',
              marginBottom: supportsBillingToggle ? '16px' : '24px',
              lineHeight: '1.6',
              fontWeight: isPremium ? '400' : '400'
            }}
            dangerouslySetInnerHTML={{ __html: tierConfig.subtext }}
          />

          {/* Billing Interval Toggle for Code Supporter and Feature Voter */}
          {supportsBillingToggle && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: billingInterval === 'annual' ? 'rgba(245, 158, 11, 0.1)' : '#F9FAFB',
              borderRadius: '8px',
              border: `2px solid ${billingInterval === 'annual' ? '#F59E0B' : '#E5E7EB'}`,
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                  Billing Period
                </span>
                {billingInterval === 'annual' && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#F59E0B',
                    background: 'rgba(245, 158, 11, 0.15)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    💰 {getSavingsMessage()}
                  </span>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setBillingInterval('monthly')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: billingInterval === 'monthly' ? '#6366F1' : 'transparent',
                    color: billingInterval === 'monthly' ? 'white' : '#6B7280',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('annual')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: billingInterval === 'annual' ? '#F59E0B' : 'transparent',
                    color: billingInterval === 'annual' ? 'white' : '#6B7280',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Annual ⭐
                </button>
              </div>
            </div>
          )}

          {/* Input Field */}
          <input 
            type="email" 
            placeholder="name@example.com"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email.trim()) {
                handleSubmit();
              }
            }}
            style={{
              ...baseStyles.input, 
              borderColor: email ? tierConfig.inputBorderColor : '#E5E7EB',
              borderWidth: email ? '2px' : '1px',
              backgroundColor: isPremium ? '#FFFFFF' : '#FFFFFF'
            }}
          />

          {/* Actions */}
          <div style={baseStyles.buttonRow}>
            <button 
              style={baseStyles.cancelBtn}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666';
              }}
            >
              Cancel
            </button>
            <button 
              style={{
                padding: isPremium ? '12px 28px' : '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: tierConfig.buttonGradient,
                color: 'white',
                fontWeight: isPremium ? '700' : '600',
                cursor: email.trim() ? 'pointer' : 'not-allowed',
                fontSize: isPremium ? '15px' : '14px',
                boxShadow: email.trim() ? tierConfig.buttonShadow : 'none',
                transition: 'all 0.2s ease',
                opacity: email.trim() ? 1 : 0.6,
                textTransform: isPremium ? 'uppercase' : 'none',
                letterSpacing: isPremium ? '0.5px' : 'normal'
              }}
              onClick={handleSubmit}
              disabled={!email.trim()}
              onMouseEnter={(e) => {
                if (email.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isPremium 
                    ? '0 8px 20px -1px rgba(245, 158, 11, 0.6)' 
                    : '0 6px 12px -1px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = email.trim() ? tierConfig.buttonShadow : 'none';
              }}
            >
              Continue to Payment →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
