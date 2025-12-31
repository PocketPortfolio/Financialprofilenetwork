'use client';

import React from 'react';
import { GICSSector, GICS_SECTOR_INFO, getAllGICSSectors, normalizeSector } from '@/app/lib/portfolio/sectorClassification';
import { getSectorSync } from '@/app/lib/portfolio/sectorService';
import { useBatchSectorClassification } from '@/app/hooks/useSectorClassification';
import type { Position } from '@/app/lib/utils/portfolioCalculations';

interface SectorFilterProps {
  positions: Position[];
  selectedSectors: string[];
  onSectorChange: (sectors: string[]) => void;
  comparisonMode?: 'growth' | 'dividend' | null;
  onComparisonModeChange?: (mode: 'growth' | 'dividend' | null) => void;
}

/**
 * Sector Filter Component
 * Allows filtering portfolio by sector with multi-select
 * Uses new GICS sector classification system
 */
export default function SectorFilter({
  positions,
  selectedSectors,
  onSectorChange,
  comparisonMode = null,
  onComparisonModeChange,
}: SectorFilterProps) {
  // Get tickers from positions - use stable comparison to prevent excessive re-renders
  const tickersKey = React.useMemo(() => {
    return positions.map(p => p.ticker).sort().join(',');
  }, [positions]);
  
  const tickers = React.useMemo(() => {
    const tickerArray = positions.map(pos => pos.ticker);
    // Sort and deduplicate for stable reference
    return Array.from(new Set(tickerArray)).sort();
  }, [tickersKey]);

  // Fetch sector classifications (with API refresh)
  const { sectors } = useBatchSectorClassification(tickers, { useApi: true });

  // Get available sectors from positions (excluding Unclassified)
  const availableSectors = React.useMemo(() => {
    const sectorSet = new Set<GICSSector>();
    positions.forEach((pos) => {
      const sector = sectors.get(pos.ticker) || getSectorSync(pos.ticker);
      if (sector !== GICSSector.UNCLASSIFIED) {
        sectorSet.add(sector);
      }
    });
    return Array.from(sectorSet).sort((a, b) => 
      GICS_SECTOR_INFO[a].name.localeCompare(GICS_SECTOR_INFO[b].name)
    );
  }, [positions, sectors]);

  // Count unclassified positions
  const unclassifiedCount = React.useMemo(() => {
    return positions.filter(pos => {
      const sector = sectors.get(pos.ticker) || getSectorSync(pos.ticker);
      return sector === GICSSector.UNCLASSIFIED;
    }).length;
  }, [positions, sectors]);

  const handleSectorToggle = (sector: GICSSector) => {
    const sectorStr = sector as string;
    if (selectedSectors.includes(sectorStr)) {
      onSectorChange(selectedSectors.filter((s) => s !== sectorStr));
    } else {
      onSectorChange([...selectedSectors, sectorStr]);
    }
  };

  const handleSelectAll = () => {
    const sectorStrings = availableSectors.map(s => s as string);
    if (selectedSectors.length === availableSectors.length) {
      onSectorChange([]);
    } else {
      onSectorChange(sectorStrings);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
          }}
        >
          Filter by Sector
        </h3>
        <button
          onClick={handleSelectAll}
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
          {selectedSectors.length === availableSectors.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Sector checkboxes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {availableSectors.map((sector) => {
          const isSelected = selectedSectors.includes(sector as string);
          const sectorInfo = GICS_SECTOR_INFO[sector];
          const positionCount = positions.filter((pos) => {
            const posSector = sectors.get(pos.ticker) || getSectorSync(pos.ticker);
            return posSector === sector;
          }).length;

          return (
            <label
              key={sector}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2)',
                background: isSelected
                  ? 'var(--surface-elevated)'
                  : 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
                border: `1px solid ${isSelected ? 'var(--signal)' : 'transparent'}`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--surface-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSectorToggle(sector)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--signal)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isSelected
                      ? 'var(--font-semibold)'
                      : 'var(--font-medium)',
                    color: isSelected ? 'var(--text)' : 'var(--text-secondary)',
                  }}
                >
                  {sectorInfo.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {positionCount} position{positionCount !== 1 ? 's' : ''}
                </div>
              </div>
            </label>
          );
        })}

        {/* Show Unclassified separately if there are any */}
        {unclassifiedCount > 0 && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: selectedSectors.includes(GICSSector.UNCLASSIFIED as string)
                ? 'var(--surface-elevated)'
                : 'transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition-base)',
              border: `1px solid ${
                selectedSectors.includes(GICSSector.UNCLASSIFIED as string) ? 'var(--signal)' : 'transparent'
              }`,
              opacity: 0.7, // Dimmed to indicate it's not a real sector
            }}
          >
            <input
              type="checkbox"
              checked={selectedSectors.includes(GICSSector.UNCLASSIFIED as string)}
              onChange={() => handleSectorToggle(GICSSector.UNCLASSIFIED)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: 'var(--signal)',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: selectedSectors.includes(GICSSector.UNCLASSIFIED as string)
                    ? 'var(--font-semibold)'
                    : 'var(--font-medium)',
                  color: selectedSectors.includes(GICSSector.UNCLASSIFIED as string) 
                    ? 'var(--text)' 
                    : 'var(--text-secondary)',
                }}
              >
                Unclassified
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                {unclassifiedCount} position{unclassifiedCount !== 1 ? 's' : ''}
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Comparison mode selector */}
      {onComparisonModeChange && (
        <div
          style={{
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Comparison Mode
          </div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
            }}
          >
            <button
              onClick={() =>
                onComparisonModeChange(
                  comparisonMode === 'growth' ? null : 'growth'
                )
              }
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background:
                  comparisonMode === 'growth'
                    ? 'var(--signal)'
                    : 'var(--surface-elevated)',
                color:
                  comparisonMode === 'growth' ? 'var(--bg)' : 'var(--text)',
                border: `1px solid ${
                  comparisonMode === 'growth' ? 'var(--signal)' : 'var(--border)'
                }`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
            >
              High Growth
            </button>
            <button
              onClick={() =>
                onComparisonModeChange(
                  comparisonMode === 'dividend' ? null : 'dividend'
                )
              }
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background:
                  comparisonMode === 'dividend'
                    ? 'var(--signal)'
                    : 'var(--surface-elevated)',
                color:
                  comparisonMode === 'dividend' ? 'var(--bg)' : 'var(--text)',
                border: `1px solid ${
                  comparisonMode === 'dividend'
                    ? 'var(--signal)'
                    : 'var(--border)'
                }`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
            >
              Dividend
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

