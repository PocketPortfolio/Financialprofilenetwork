'use client';

import React, { useState, useEffect } from 'react';
import { generateReferralCode, getReferralLink, trackReferralClick } from '@/app/lib/viral/referral';
import { copyToClipboard } from '@/app/lib/viral/sharing';
import { trackInviteSent } from '@/app/lib/analytics/viral';

interface ReferralProgramProps {
  userId?: string;
  className?: string;
}

export default function ReferralProgram({ userId, className = '' }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate or retrieve referral code
    const code = generateReferralCode(userId);
    setReferralCode(code);
    setReferralLink(getReferralLink(code, 'dashboard'));
  }, [userId]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(referralLink, 'referral');
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackInviteSent('link');
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const shareText = `Check out Pocket Portfolio - Free, open-source portfolio tracker! ${referralLink}`;
    const shareUrl = platform === 'twitter'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
      : platform === 'linkedin'
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
      : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    trackInviteSent('social');
  };

  return (
    <div className={`referral-program brand-card brand-spine ${className}`} style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px'
    }}>
      <h3 style={{ 
        fontSize: 'var(--font-size-lg)', 
        fontWeight: '600', 
        marginBottom: '12px',
        color: 'var(--text)'
      }}>
        Invite Friends & Earn Rewards
      </h3>
      <p style={{ 
        fontSize: 'var(--font-size-sm)', 
        color: 'var(--text-secondary)', 
        marginBottom: '20px',
        lineHeight: 'var(--line-snug)'
      }}>
        Share Pocket Portfolio with your friends and help grow the community. Every referral helps!
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: 'var(--font-size-xs)', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Your Referral Link
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button
            onClick={handleCopyLink}
            className="brand-button brand-button-primary"
            style={{
              padding: '10px 20px',
              background: copied 
                ? 'var(--pos)' 
                : 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              color: 'white',
              border: copied ? 'none' : '2px solid var(--border-warm)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: 'var(--font-size-sm)',
              transition: 'all 0.2s ease',
              boxShadow: copied ? 'none' : '0 2px 4px rgba(245, 158, 11, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
              }
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: 'var(--font-size-xs)', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Your Referral Code
        </label>
        <div style={{
          padding: '12px',
          background: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          color: 'var(--signal)',
          textAlign: 'center',
          letterSpacing: '0.1em'
        }}>
          {referralCode}
        </div>
      </div>

      <div>
        <p style={{ 
          fontSize: 'var(--font-size-xs)', 
          fontWeight: '600', 
          marginBottom: '12px', 
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Share via:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleShare('twitter')}
            className="brand-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text)',
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--signal)';
              e.currentTarget.style.color = 'var(--signal)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
            Twitter
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="brand-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text)',
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--signal)';
              e.currentTarget.style.color = 'var(--signal)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="brand-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text)',
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--signal)';
              e.currentTarget.style.color = 'var(--signal)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

