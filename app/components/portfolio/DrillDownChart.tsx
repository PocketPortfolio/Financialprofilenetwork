'use client';

import React, { useMemo } from 'react';
import PortfolioAllocationChart from './PortfolioAllocationChart';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import type { ChartViewType } from '@/app/lib/portfolio/types';
import { GICSSector, GICS_SECTOR_INFO } from '@/app/lib/portfolio/sectorClassification';
import { getSectorSync } from '@/app/lib/portfolio/sectorService';
import Accordion from '../Accordion';

interface DrillDownChartProps {
  positions: Position[];
  chartView?: ChartViewType;
  onChartViewChange?: (view: ChartViewType) => void;
  drillDownPath: string[];
  onDrillDown: (segment: string) => void;
  onDrillUp: () => void;
  onReset: () => void;
}

/**
 * Group positions by sector
 */
function groupBySector(positions: Position[]): Record<string, Position[]> {
  const grouped: Record<string, Position[]> = {};
  positions.forEach((pos) => {
    const sector = getSectorSync(pos.ticker);
    const sectorName = sector as string;
    if (!grouped[sectorName]) {
      grouped[sectorName] = [];
    }
    grouped[sectorName].push(pos);
  });
  return grouped;
}

/**
 * Interactive drill-down chart component
 * Supports navigation: Portfolio → Sectors → Holdings
 */
export default function DrillDownChart({
  positions,
  chartView = 'treemap',
  onChartViewChange,
  drillDownPath,
  onDrillDown,
  onDrillUp,
  onReset,
}: DrillDownChartProps) {
  // Calculate current level data based on drill-down path
  const { currentData, currentLevel, title } = useMemo(() => {
    if (drillDownPath.length === 0) {
      // Level 0: Portfolio → Show all individual positions (whole portfolio)
      return {
        currentData: positions.sort((a, b) => {
          const aValue = a.currentValue || a.avgCost * a.shares;
          const bValue = b.currentValue || b.avgCost * b.shares;
          return bValue - aValue;
        }),
        currentLevel: 0,
        title: 'Portfolio Allocation',
      };
    } else if (drillDownPath.length === 1) {
      // Level 1: Sector or Position → Show filtered view
      const segment = drillDownPath[0];
      const sectorGroups = groupBySector(positions);
      
      // Check if it's a sector name (try both GICS enum and display name)
      const sectorKey = Object.values(GICSSector).find(s => {
        const info = GICS_SECTOR_INFO[s];
        return s === segment || info.name === segment;
      });
      
      if (sectorKey && sectorGroups[sectorKey as string]) {
        // It's a sector - show holdings in that sector
        const sectorInfo = GICS_SECTOR_INFO[sectorKey];
        return {
          currentData: sectorGroups[sectorKey as string],
          currentLevel: 1,
          title: `${sectorInfo.name} Holdings`,
        };
      } else if (sectorGroups[segment]) {
        // Fallback: direct match
        return {
          currentData: sectorGroups[segment],
          currentLevel: 1,
          title: `${segment} Holdings`,
        };
      } else {
        // It's a ticker - show just that position (or could show sector)
        const position = positions.find(p => p.ticker === segment);
        if (position) {
          const sector = getSectorSync(segment);
          const sectorName = sector as string;
          const sectorPositions = sectorGroups[sectorName] || [];
          const sectorInfo = GICS_SECTOR_INFO[sector];
          return {
            currentData: sectorPositions,
            currentLevel: 1,
            title: `${sectorInfo.name} Holdings`,
          };
        }
      }
      
      return {
        currentData: [],
        currentLevel: 1,
        title: 'Holdings',
      };
    } else {
      // Level 2+: Individual holding details
      return {
        currentData: [],
        currentLevel: 2,
        title: 'Position Details',
      };
    }
  }, [positions, drillDownPath]);

  const handleSegmentClick = (ticker: string) => {
    if (currentLevel === 0) {
      // Clicking a position at root level drills down to show its sector holdings
      const sector = getSectorSync(ticker);
      const sectorInfo = GICS_SECTOR_INFO[sector];
      onDrillDown(sectorInfo.name);
    } else if (currentLevel === 1) {
      // Clicking a position at sector level could drill down further (optional)
      // For now, clicking again resets or does nothing
      // Could implement position details view here if needed
    }
  };

  return (
    <Accordion
      title={title}
      defaultExpanded={true}
      persistState={true}
      storageKey="portfolio-allocation"
      headerContent={
        drillDownPath.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.borderColor = 'var(--signal)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            Reset
          </button>
        )
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Breadcrumb Navigation */}
        {drillDownPath.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onReset}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Portfolio
            </button>

            {drillDownPath.map((segment, index) => (
              <React.Fragment key={index}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <button
                  onClick={() => {
                    // Navigate to this level
                    const newPath = drillDownPath.slice(0, index + 1);
                    // Reset and navigate to new path
                    onReset();
                    newPath.forEach((seg) => onDrillDown(seg));
                  }}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background:
                      index === drillDownPath.length - 1
                        ? 'var(--signal)'
                        : 'var(--surface-elevated)',
                    color:
                      index === drillDownPath.length - 1
                        ? 'var(--bg)'
                        : 'var(--text)',
                    border: `1px solid ${
                      index === drillDownPath.length - 1
                        ? 'var(--signal)'
                        : 'var(--border)'
                    }`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    if (index !== drillDownPath.length - 1) {
                      e.currentTarget.style.background = 'var(--surface)';
                      e.currentTarget.style.borderColor = 'var(--signal)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== drillDownPath.length - 1) {
                      e.currentTarget.style.background = 'var(--surface-elevated)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                  }}
                >
                  {segment}
                </button>
              </React.Fragment>
            ))}

            {/* Back button */}
            <span style={{ color: 'var(--text-secondary)', marginLeft: 'var(--space-2)' }}>
              |
            </span>
            <button
              onClick={onDrillUp}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Chart */}
        {currentData.length > 0 ? (
          <PortfolioAllocationChart
            positions={currentData}
            chartView={chartView}
            onChartViewChange={onChartViewChange}
            onSegmentClick={handleSegmentClick}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              fontSize: 'var(--font-size-base)',
            }}
          >
            No data available for this level
          </div>
        )}
      </div>
    </Accordion>
  );
}

