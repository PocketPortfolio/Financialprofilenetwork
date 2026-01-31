'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getCompanyLogoFallbacks } from '../lib/utils/companyLogo';

interface CompanyLogoProps {
  symbol: string;
  metadata?: any;
  name?: string;
  size?: number;
}

export default function CompanyLogo({ 
  symbol, 
  metadata, 
  name,
  size = 64 
}: CompanyLogoProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const prevSymbolRef = useRef<string>('');
  
  const fallbacks = getCompanyLogoFallbacks(symbol, metadata);
  const currentUrl = fallbacks[currentSourceIndex] || fallbacks[0];
  
  // Reset everything when symbol changes
  useEffect(() => {
    if (prevSymbolRef.current !== symbol) {
      console.log(`🔄 Symbol changed from ${prevSymbolRef.current} to ${symbol}, resetting logo state`);
      prevSymbolRef.current = symbol;
      setCurrentSourceIndex(0);
      setHasError(false);
      setImgKey(prev => prev + 1); // Force new image load
    }
  }, [symbol]);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    console.log(`❌ Logo failed: ${symbol} - Source ${currentSourceIndex + 1}/${fallbacks.length}: ${img.src}`);
    
    if (currentSourceIndex < fallbacks.length - 1) {
      // Try next fallback
      console.log(`🔄 Trying next source for ${symbol}...`);
      setCurrentSourceIndex(currentSourceIndex + 1);
      setImgKey(imgKey + 1); // Force re-render
    } else {
      // All sources failed
      console.log(`⚠️ All logo sources exhausted for ${symbol}, showing fallback`);
      setHasError(true);
    }
  };
  
  if (hasError) {
    // Final fallback: Show ticker symbol in styled container
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: `${size * 0.4}px`,
        fontWeight: '600',
        color: 'var(--accent-warm)',
        textTransform: 'uppercase'
      }}>
        {symbol.replace(/-USD$/, '').substring(0, 4)}
      </div>
    );
  }
  
  // Only use crossOrigin for sources that support it (Clearbit, etc.)
  const useCrossOrigin = currentUrl.includes('clearbit.com') || currentUrl.includes('logo.dev');
  
  // Add cache-busting parameter to force browser to reload image when symbol changes
  // Only add cache-bust on first load (imgKey === 0 or 1) to avoid unnecessary reloads during fallback
  const imageUrlWithCacheBust = imgKey <= 1 
    ? `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
    : currentUrl;
  
  return (
    <img
      key={`${symbol}-${imgKey}`} // Force re-render when symbol or source changes
      src={imageUrlWithCacheBust}
      alt={`${name || symbol} logo`}
      onError={handleError}
      onLoad={() => {
        console.log(`✅ Logo loaded successfully for ${symbol} from: ${currentUrl}`);
      }}
      {...(useCrossOrigin ? { crossOrigin: 'anonymous' } : {})}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        objectFit: 'contain',
        background: 'var(--surface)',
        padding: '8px',
        border: '1px solid var(--border)',
        flexShrink: 0
      }}
      loading="lazy"
    />
  );
}

