'use client';

import React from 'react';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import type { PortfolioAnalytics, PortfolioSnapshot } from '@/app/lib/portfolio/types';
import type { RecommendationFactor } from '@/app/lib/portfolio/recommendationEngine';
import { useDynamicRecommendations } from '@/app/hooks/useDynamicRecommendations';
import { GICS_SECTOR_INFO } from '@/app/lib/portfolio/sectorClassification';
import { RecommendationScoreTooltip } from './RecommendationScoreTooltip';
import Accordion from '../Accordion';

interface AllocationRecommendationsProps {
  positions: Position[];
  totalValue: number;
  portfolioAnalytics?: PortfolioAnalytics | null;
  historicalSnapshots?: PortfolioSnapshot[];
}

/**
 * Allocation Recommendations Component
 * Provides dynamic, market-aware portfolio recommendations
 */
export default function AllocationRecommendations({
  positions,
  totalValue,
  portfolioAnalytics = null,
  historicalSnapshots = [],
}: AllocationRecommendationsProps) {
  const { recommendations, isLoading, error, lastUpdated } = useDynamicRecommendations(
    positions,
    portfolioAnalytics,
    historicalSnapshots
  );

  // Convert enhanced recommendations to display format
  const displayRecommendations = React.useMemo(() => {
    if (!recommendations || recommendations.factors.length === 0) {
      return [];
    }

    return recommendations.factors.map((factor) => {
      // Map severity to type
      const type: 'warning' | 'info' | 'suggestion' =
        factor.severity === 'critical' || factor.severity === 'high'
          ? 'warning'
          : factor.severity === 'medium'
          ? 'suggestion'
          : 'info';

      // Map factor type to title
      const titleMap: Record<RecommendationFactor['type'], string> = {
        concentration: 'High Concentration Risk',
        sector: 'Sector Concentration',
        correlation: 'Correlation Risk',
        volatility: 'High Volatility',
        momentum: 'Market Regime Awareness',
        diversification: 'Low Diversification',
      };

      return {
        type,
        title: titleMap[factor.type] || 'Portfolio Recommendation',
        message: factor.message,
        action: factor.action,
        severity: factor.severity,
        score: factor.score,
        ticker: factor.ticker,
        sector: factor.sector,
        factorType: factor.type, // Include original factor type for tooltip
      };
    });
  }, [recommendations]);

  if (isLoading) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        Loading recommendations...
      </div>
    );
  }

  if (error) {
    console.error('Error loading recommendations:', error);
  }

  if (displayRecommendations.length === 0) {
    return null;
  }

  // Get market context info
  const marketContext = recommendations?.marketContext;
  const marketInfo = marketContext
    ? `${marketContext.regime.charAt(0).toUpperCase() + marketContext.regime.slice(1)} market • ${marketContext.volatility.charAt(0).toUpperCase() + marketContext.volatility.slice(1)} volatility${marketContext.vixLevel ? ` (VIX ${marketContext.vixLevel.toFixed(1)})` : ''}`
    : null;

  return (
    <Accordion
      title="Portfolio Recommendations"
      defaultExpanded={true}
      persistState={true}
      storageKey="portfolio-recommendations"
      headerContent={
        recommendations && (
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              textAlign: 'right',
            }}
          >
            <div>Priority: {recommendations.priority.toUpperCase()}</div>
            {lastUpdated && (
              <div>
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        )
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {/* Market Context Banner */}
        {marketInfo && (
          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            📊 {marketInfo}
          </div>
        )}

        {/* Recommendations sorted by severity */}
        {displayRecommendations
        .sort((a, b) => {
          const severityOrder: Record<string, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .map((rec, index) => {
          const borderColor =
            rec.severity === 'critical' || rec.severity === 'high'
              ? 'var(--warning)'
              : rec.severity === 'medium'
              ? 'var(--signal)'
              : 'var(--info)';

          return (
            <div
              key={index}
              style={{
                padding: 'var(--space-3)',
                background: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${borderColor}`,
                borderLeftWidth: '4px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--space-1)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: borderColor,
                  }}
                >
                  {rec.title}
                  {rec.ticker && (
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                      {' '}— {rec.ticker}
                    </span>
                  )}
                </div>
                {rec.score !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                        background: 'var(--surface)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {Math.round(rec.score)}/100
                    </div>
                    <RecommendationScoreTooltip
                      score={rec.score}
                      factorType={rec.factorType}
                      severity={rec.severity}
                      message={rec.message}
                      thresholds={{
                        positionConcentration: recommendations?.thresholds?.positionConcentration,
                        sectorConcentration: recommendations?.thresholds?.sectorConcentration,
                        correlationThreshold: recommendations?.thresholds?.correlationThreshold,
                      }}
                      marketContext={recommendations?.marketContext}
                      ticker={rec.ticker}
                      sector={rec.sector}
                      positionsCount={positions.length}
                    />
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: rec.action ? 'var(--space-2)' : 0,
                }}
              >
                {rec.message}
              </div>
              {rec.action && (
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: borderColor,
                    fontWeight: 'var(--font-medium)',
                  }}
                >
                  💡 {rec.action}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Accordion>
  );
}

