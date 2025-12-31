'use client';

import React, { useState } from 'react';
import { ShareOptions } from '@/app/lib/viral/types';
import { shareToPlatform, copyToClipboard, shareViaEmail } from '@/app/lib/viral/sharing';

interface SocialShareProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
  context?: string;
  className?: string;
  showLabel?: boolean;
  platforms?: ('twitter' | 'linkedin' | 'facebook' | 'reddit' | 'copy' | 'email')[];
}

export default function SocialShare({
  title,
  description,
  url,
  image,
  hashtags = ['PocketPortfolio', 'PortfolioTracker', 'OpenSource'],
  context = 'unknown',
  className = '',
  showLabel = false,
  platforms = ['twitter', 'linkedin', 'facebook', 'reddit', 'copy', 'email']
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions: ShareOptions = {
    title,
    description,
    url,
    image,
    hashtags
  };

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'reddit' | 'copy' | 'email') => {
    if (platform === 'copy') {
      const success = await copyToClipboard(url, context);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (platform === 'email') {
      shareViaEmail(shareOptions, context);
    } else {
      shareToPlatform(platform, shareOptions, context);
    }
  };

  const platformIcons = {
    twitter: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
      </svg>
    ),
    linkedin: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    facebook: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    reddit: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.911 3.519.911 1.034 0 2.677-.069 3.52-.91a.33.33 0 0 0-.002-.463.326.326 0 0 0-.232-.095c-.084 0-.168.028-.232.094-.521.522-1.82.685-3.054.685-1.235 0-2.533-.163-3.054-.685a.31.31 0 0 0-.234-.09z"/>
      </svg>
    ),
    copy: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    ),
    email: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    )
  };

  const platformLabels = {
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    reddit: 'Reddit',
    copy: copied ? 'Copied!' : 'Copy Link',
    email: 'Email'
  };

  return (
    <div className={`social-share brand-card ${className}`} style={{ 
      display: 'flex', 
      gap: '8px', 
      flexWrap: 'wrap', 
      alignItems: 'center' 
    }}>
      {showLabel && (
        <span style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--text-secondary)', 
          marginRight: '8px',
          fontWeight: '500'
        }}>
          Share:
        </span>
      )}
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className="brand-button"
          aria-label={`Share on ${platformLabels[platform]}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: 'var(--font-size-sm)',
            gap: '6px',
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
          {platformIcons[platform]}
          {showLabel && <span>{platformLabels[platform]}</span>}
        </button>
      ))}
    </div>
  );
}

