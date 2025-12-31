'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { RecommendationFactor } from '@/app/lib/portfolio/recommendationEngine';
import type { MarketContext } from '@/app/lib/portfolio/marketContext';
import { GICS_SECTOR_INFO, type GICSSector } from '@/app/lib/portfolio/sectorClassification';
import { getDeviceInfo } from '@/app/lib/utils/device';

interface RecommendationScoreTooltipProps {
  score: number;
  factorType: RecommendationFactor['type'];
  severity: RecommendationFactor['severity'];
  message: string;
  thresholds?: {
    positionConcentration?: number;
    sectorConcentration?: number;
    correlationThreshold?: number;
  };
  marketContext?: MarketContext;
  ticker?: string;
  sector?: GICSSector | string;
  positionsCount?: number;
}

/**
 * Recommendation Score Tooltip Component
 * Provides detailed explanation of recommendation scores with calculations and risk interpretation
 */
export function RecommendationScoreTooltip({
  score,
  factorType,
  severity,
  message,
  thresholds,
  marketContext,
  ticker,
  sector,
  positionsCount,
}: RecommendationScoreTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure component is mounted (for portal) and detect mobile
  useEffect(() => {
    setMounted(true);
    const deviceInfo = getDeviceInfo();
    setIsMobile(deviceInfo.isMobile);
  }, []);

  // Calculate tooltip position with actual dimensions
  useEffect(() => {
    if (!isOpen || !mounted || !triggerRef.current) {
      setPosition(null);
      return;
    }

    const calculatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get actual tooltip dimensions if available, otherwise use estimates
      let tooltipWidth = Math.min(320, viewportWidth - 32);
      let tooltipHeight = 350; // Initial estimate

      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        if (tooltipRect.width > 0) {
          tooltipWidth = tooltipRect.width;
        }
        if (tooltipRect.height > 0) {
          tooltipHeight = tooltipRect.height;
        }
      }

      const spacing = 12;

      // Calculate available space (using viewport coordinates since we use position: fixed)
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      let top = 0;
      let left = 0;

      // Determine best position with actual dimensions
      // Priority: below > above > right > left > center
      // NOTE: position: fixed uses viewport coordinates, NOT document coordinates
      if (spaceBelow >= tooltipHeight + spacing) {
        // Position below - best option
        top = rect.bottom + spacing;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      } else if (spaceAbove >= tooltipHeight + spacing) {
        // Position above
        top = rect.top - tooltipHeight - spacing;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      } else if (spaceRight >= tooltipWidth + spacing) {
        // Position right
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + spacing;
      } else if (spaceLeft >= tooltipWidth + spacing) {
        // Position left
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - spacing;
      } else {
        // Fallback: center in viewport
        top = Math.max(16, (viewportHeight - tooltipHeight) / 2);
        left = Math.max(16, (viewportWidth - tooltipWidth) / 2);
      }

      // Ensure tooltip stays within viewport bounds (viewport coordinates for position: fixed)
      // Horizontal bounds
      left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
      // Vertical bounds - ensure tooltip is fully visible
      const minTop = 16;
      const maxTop = Math.max(viewportHeight - tooltipHeight - 16, minTop + 100);
      top = Math.max(minTop, Math.min(top, maxTop));

      // Only update position if it actually changed (prevent unnecessary re-renders)
      setPosition((prevPosition) => {
        if (prevPosition && Math.abs(prevPosition.top - top) < 1 && Math.abs(prevPosition.left - left) < 1) {
          return prevPosition; // No significant change, return previous position
        }
        return { top, left };
      });
    };

    // Debounced position calculation - only calculate once after a short delay
    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current);
    }
    
    // Calculate position after render with debounce
    positionUpdateTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }, 50);

    // Update on scroll/resize with debouncing
    const handleScroll = () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
      positionUpdateTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(calculatePosition);
      }, 100);
    };
    const handleResize = () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
      positionUpdateTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(calculatePosition);
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, mounted]);

  // Use ResizeObserver to track tooltip size changes (debounced to prevent loops)
  useEffect(() => {
    if (!isOpen || !tooltipRef.current || !position) return;

    let resizeTimeout: NodeJS.Timeout | null = null;
    let isUpdating = false;
    
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize updates to prevent infinite loops
      if (isUpdating || resizeTimeout) return;
      
      resizeTimeout = setTimeout(() => {
        if (!triggerRef.current || !tooltipRef.current) {
          resizeTimeout = null;
          return;
        }
        
        isUpdating = true;
        requestAnimationFrame(() => {
          if (!triggerRef.current || !tooltipRef.current) {
            isUpdating = false;
            resizeTimeout = null;
            return;
          }
          
          const rect = triggerRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          const tooltipWidth = tooltipRect.width;
          const tooltipHeight = tooltipRect.height;
          const spacing = 12;

          // Recalculate position with actual dimensions
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;

          let top = position.top;
          let left = position.left;

          // Adjust position if tooltip doesn't fit
          if (spaceBelow < tooltipHeight + spacing && spaceAbove >= tooltipHeight + spacing) {
            top = rect.top - tooltipHeight - spacing;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          }

          // Ensure within bounds
          left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
          const minTop = 16;
          const maxTop = Math.max(viewportHeight - tooltipHeight - 16, minTop + 100);
          top = Math.max(minTop, Math.min(top, maxTop));

          // Only update if position actually changed (prevent loops)
          setPosition((prevPosition) => {
            if (prevPosition && Math.abs(prevPosition.top - top) < 1 && Math.abs(prevPosition.left - left) < 1) {
              return prevPosition;
            }
            return { top, left };
          });
          
          isUpdating = false;
          resizeTimeout = null;
        });
      }, 150); // Debounce resize updates
    });

    resizeObserver.observe(tooltipRef.current);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();
    };
  }, [isOpen, position]);

  // Close tooltip on outside click (with mobile-aware distance checking)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        // On mobile, only close if click is far away from tooltip (prevents accidental closes)
        if (isMobile) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const clickX = 'clientX' in event ? event.clientX : (event.touches?.[0]?.clientX || 0);
          const clickY = 'clientY' in event ? event.clientY : (event.touches?.[0]?.clientY || 0);
          
          // Calculate distance from tooltip center
          const tooltipCenterX = tooltipRect.left + tooltipRect.width / 2;
          const tooltipCenterY = tooltipRect.top + tooltipRect.height / 2;
          const distance = Math.sqrt(
            Math.pow(clickX - tooltipCenterX, 2) + Math.pow(clickY - tooltipCenterY, 2)
          );
          
          // Only close if click is more than 150px away from tooltip
          if (distance > 150) {
            // Add delay on mobile to prevent accidental closes
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = setTimeout(() => {
              setIsOpen(false);
            }, 2000); // 2 second delay on mobile
          }
        } else {
          // Desktop: close immediately
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [isOpen, isMobile]);

  // Parse values from message for tooltip content
  const parseMessageValues = () => {
    const values: {
      allocation?: number;
      portfolioVolatility?: number;
      marketVolatility?: number;
      correlationPairs?: number;
      correlationThreshold?: number;
    } = {};

    const allocationMatch = message.match(/(\d+\.?\d*)% of your portfolio/);
    if (allocationMatch) {
      values.allocation = parseFloat(allocationMatch[1]);
    }

    const portfolioVolMatch = message.match(/Portfolio volatility \(([\d.]+)%\)/);
    if (portfolioVolMatch) {
      values.portfolioVolatility = parseFloat(portfolioVolMatch[1]);
    }

    const marketVolMatch = message.match(/market \(([\d.]+)%\)/);
    if (marketVolMatch) {
      values.marketVolatility = parseFloat(marketVolMatch[1]);
    }

    const correlationMatch = message.match(/(\d+) position pair/);
    if (correlationMatch) {
      values.correlationPairs = parseInt(correlationMatch[1], 10);
    }

    const thresholdMatch = message.match(/>([\d.]+)%/);
    if (thresholdMatch && factorType === 'correlation') {
      values.correlationThreshold = parseFloat(thresholdMatch[1]);
    }

    return values;
  };

  const values = parseMessageValues();

  // Generate tooltip content
  const getTooltipContent = () => {
    const riskLevels = {
      low: { label: 'Low Risk', description: 'Within acceptable range' },
      medium: { label: 'Medium Risk', description: 'Moderately above threshold' },
      high: { label: 'High Risk', description: 'Significantly above threshold' },
      critical: { label: 'Critical Risk', description: 'At maximum risk level' },
    };

    const riskInfo = riskLevels[severity];

    switch (factorType) {
      case 'concentration': {
        const threshold = thresholds?.positionConcentration || 20;
        const allocation = values.allocation || 0;
        const multiplier = allocation / threshold;
        const vixLevel = marketContext?.vixLevel;
        const volatility = marketContext?.volatility;

        return {
          title: 'Concentration Risk Score',
          explanation: 'This score shows how concentrated your portfolio is in a single position. Higher scores indicate higher risk.',
          formula: `Score = (Your Allocation ÷ Recommended Threshold) × 100`,
          calculation: (
            <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Your {ticker} allocation:</strong> {allocation.toFixed(1)}%
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Recommended threshold:</strong> {threshold.toFixed(1)}%
                {volatility && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    (adjusted for {volatility} volatility)
                  </span>
                )}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Score:</strong> ({allocation.toFixed(1)} ÷ {threshold.toFixed(1)}) × 100 = {score.toFixed(0)}
                {score >= 100 && ' (capped at maximum)'}
              </div>
              {multiplier > 1 && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--warning)' }}>
                  Portfolio is {multiplier.toFixed(1)}x over threshold
                </div>
              )}
            </div>
          ),
          riskLevel: riskInfo,
          marketContext: vixLevel && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              Market volatility: {volatility} (VIX {vixLevel.toFixed(1)})
            </div>
          ),
        };
      }

      case 'sector': {
        const threshold = thresholds?.sectorConcentration || 40;
        const allocation = values.allocation || 0;
        const multiplier = allocation / threshold;
        const sectorKey = sector as GICSSector;
        const sectorName = sector ? (GICS_SECTOR_INFO[sectorKey]?.name || String(sector)) : 'This sector';
        const sectorMomentum = sectorKey && marketContext?.sectorPerformance ? marketContext.sectorPerformance[sectorKey] : undefined;

        return {
          title: 'Sector Concentration Score',
          explanation: 'Measures how much of your portfolio is in a single sector. High concentration reduces diversification benefits.',
          formula: `Score = (Sector Allocation ÷ Recommended Threshold) × 100`,
          calculation: (
            <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Your {sectorName} allocation:</strong> {allocation.toFixed(1)}%
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Recommended threshold:</strong> {threshold.toFixed(1)}%
                {marketContext?.volatility && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    (adjusted for {marketContext.volatility} volatility)
                  </span>
                )}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Score:</strong> ({allocation.toFixed(1)} ÷ {threshold.toFixed(1)}) × 100 = {score.toFixed(0)}
                {score >= 100 && ' (capped at maximum)'}
              </div>
              {multiplier > 1 && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--warning)' }}>
                  Sector allocation is {multiplier.toFixed(1)}x over threshold
                </div>
              )}
              {sectorMomentum !== undefined && (
                <div style={{ marginTop: '4px', fontSize: '11px' }}>
                  Sector performance: {sectorMomentum > 0 ? '+' : ''}{sectorMomentum.toFixed(1)}% (30-day)
                </div>
              )}
            </div>
          ),
          riskLevel: riskInfo,
        };
      }

      case 'diversification': {
        const targetPositions = 5;
        const currentPositions = positionsCount || 0;

        return {
          title: 'Diversification Score',
          explanation: 'Measures portfolio breadth. More positions generally mean better risk distribution.',
          formula: `Score = (Current Positions ÷ Target Positions) × 100`,
          calculation: (
            <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Current positions:</strong> {currentPositions}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Target positions:</strong> {targetPositions}+
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Score:</strong> ({currentPositions} ÷ {targetPositions}) × 100 = {score.toFixed(0)}
              </div>
              {currentPositions < targetPositions && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--warning)' }}>
                  {targetPositions - currentPositions} more position{targetPositions - currentPositions !== 1 ? 's' : ''} needed
                </div>
              )}
            </div>
          ),
          riskLevel: riskInfo,
        };
      }

      case 'correlation': {
        const correlationPairs = values.correlationPairs || 0;
        const correlationThreshold = values.correlationThreshold || (thresholds?.correlationThreshold ? thresholds.correlationThreshold * 100 : 70);

        return {
          title: 'Correlation Risk Score',
          explanation: 'Measures how closely your positions move together. High correlation reduces diversification benefits.',
          formula: `Score = (High Correlation Pairs ÷ Total Possible Pairs) × 200`,
          calculation: (
            <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>High correlation pairs:</strong> {correlationPairs}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Correlation threshold:</strong> &gt;{correlationThreshold.toFixed(0)}%
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Positions with correlation above threshold reduce diversification
              </div>
            </div>
          ),
          riskLevel: riskInfo,
        };
      }

      case 'volatility': {
        const portfolioVol = values.portfolioVolatility || 0;
        const marketVol = values.marketVolatility || 0;
        const ratio = marketVol > 0 ? portfolioVol / marketVol : 0;

        return {
          title: 'Volatility Risk Score',
          explanation: 'Compares your portfolio\'s volatility to the market. Higher volatility means larger price swings.',
          formula: `Score = (Portfolio Volatility ÷ Market Volatility) × 50`,
          calculation: (
            <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Portfolio volatility:</strong> {portfolioVol.toFixed(1)}%
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Market volatility:</strong> {marketVol.toFixed(1)}%
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Score:</strong> ({portfolioVol.toFixed(1)} ÷ {marketVol.toFixed(1)}) × 50 = {score.toFixed(0)}
                {score >= 100 && ' (capped at maximum)'}
              </div>
              {ratio > 1 && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--warning)' }}>
                  Portfolio is {ratio.toFixed(1)}x more volatile than market
                </div>
              )}
            </div>
          ),
          riskLevel: riskInfo,
        };
      }

      case 'momentum': {
        const regime = marketContext?.regime || 'sideways';
        const volatility = marketContext?.volatility || 'normal';

        return {
          title: 'Market Regime Awareness Score',
          explanation: 'Assesses portfolio alignment with current market conditions. Defensive positioning may be needed in volatile or bear markets.',
          formula: `Score based on market regime and defensive sector exposure`,
          calculation: (
            <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Current market regime:</strong> {regime.charAt(0).toUpperCase() + regime.slice(1)}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Market volatility:</strong> {volatility.charAt(0).toUpperCase() + volatility.slice(1)}
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Consider defensive sectors (Utilities, Consumer Staples, Healthcare) in volatile markets
              </div>
            </div>
          ),
          riskLevel: riskInfo,
        };
      }

      default:
        return {
          title: 'Risk Score',
          explanation: 'This score indicates the level of risk in this area of your portfolio.',
          formula: `Score: 0-100`,
          calculation: null,
          riskLevel: riskInfo,
        };
    }
  };

  const content = getTooltipContent();
  const severityColors = {
    low: 'var(--info)',
    medium: 'var(--signal)',
    high: 'var(--warning)',
    critical: 'var(--warning)',
  };

  // Generate unique ID for this tooltip instance
  const tooltipId = `tooltip-${factorType}-${score}-${ticker || sector || 'default'}`;

  // Render tooltip immediately when open, even if position not calculated yet
  const shouldRenderTooltip = mounted && isOpen;
  
  // Use fallback position if not calculated yet - center screen
  const displayPosition = position || (typeof window !== 'undefined' 
    ? { top: window.innerHeight / 2, left: window.innerWidth / 2 }
    : { top: 0, left: 0 });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-label={`Score explanation: ${content.title}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={tooltipId}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px 4px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-xs)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          transition: 'background-color 0.2s',
            minWidth: '20px',
            minHeight: '20px',
            // iOS-specific touch handling
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={() => {
          if (!isMobile) {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            setIsOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            // Desktop: close after delay
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = setTimeout(() => {
              if (!tooltipRef.current?.matches(':hover')) {
                setIsOpen(false);
              }
            }, 300);
          }
        }}
        onTouchStart={(e) => {
          // On mobile, handle touch to open tooltip
          if (isMobile) {
            e.preventDefault();
            e.stopPropagation();
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
          setIsOpen(true);
        }}
        onBlur={(e) => {
          if (!tooltipRef.current?.contains(e.relatedTarget as Node)) {
            // Mobile: longer delay (3 seconds), Desktop: shorter delay (500ms)
            const timeout = isMobile ? 3000 : 500;
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = setTimeout(() => setIsOpen(false), timeout);
          }
        }}
      >
        <span
          role="img"
          aria-label="Information"
          style={{
            fontSize: '12px',
            lineHeight: '1',
            display: 'inline-block',
          }}
        >
          ℹ️
        </span>
      </button>

      {shouldRenderTooltip && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: `${displayPosition.top}px`,
            left: `${displayPosition.left}px`,
            transform: position ? 'none' : 'translate(-50%, -50%)',
            zIndex: 10000,
            width: 'min(90vw, 320px)',
            maxWidth: '320px',
            minWidth: '280px',
            padding: '12px',
            background: 'var(--surface-elevated)',
            border: `2px solid ${severityColors[severity]}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: '1.5',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxHeight: '85vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            opacity: 1,
            pointerEvents: 'auto',
          }}
          onMouseEnter={() => {
            if (!isMobile) {
              if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
              setIsOpen(true);
            }
          }}
          onMouseLeave={() => {
            if (!isMobile) {
              // Desktop: close after delay
              if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 300);
            }
          }}
          onTouchStart={(e) => {
            // On mobile, prevent closing when touching tooltip
            if (isMobile) {
              e.stopPropagation();
              if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            }
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'var(--font-semibold)',
              color: severityColors[severity],
              marginBottom: '8px',
              borderBottom: `1px solid var(--border)`,
              paddingBottom: '8px',
              wordBreak: 'break-word',
            }}
          >
            {content.title}: {Math.round(score)}/100
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: '8px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
            {content.explanation}
          </div>

          {/* Formula */}
          <div
            style={{
              marginBottom: '8px',
              padding: '8px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontFamily: 'monospace',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            <strong>Formula:</strong> {content.formula}
          </div>

          {/* Calculation */}
          {content.calculation && (
            <div
              style={{
                marginBottom: '8px',
                padding: '8px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <strong>Calculation:</strong>
              {content.calculation}
            </div>
          )}

          {/* Risk Level */}
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              background: severityColors[severity],
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              wordBreak: 'break-word',
            }}
          >
            <strong>Risk Level: {content.riskLevel.label.toUpperCase()}</strong>
            <div style={{ marginTop: '4px', opacity: 0.9 }}>
              {content.riskLevel.description}
            </div>
          </div>

          {/* Market Context */}
          {content.marketContext}

          {/* Close hint */}
          <div
            style={{
              marginTop: '8px',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}
          >
            Press ESC or tap outside to close
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
