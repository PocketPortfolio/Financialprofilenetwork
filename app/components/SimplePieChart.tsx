'use client';

import React from 'react';

interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

interface SimplePieChartProps {
  positions: Position[];
}

export default function SimplePieChart({ positions }: SimplePieChartProps) {
  // Calculate total portfolio value
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  
  // Filter out positions with zero value
  const validPositions = positions.filter(pos => pos.shares > 0 && pos.currentValue > 0);
  
  if (validPositions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '200px',
        background: 'var(--bg)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        fontSize: '14px'
      }}>
        No positions to display
      </div>
    );
  }

  // Sort positions by value (largest first)
  const sortedPositions = validPositions
    .map(pos => ({
      ...pos,
      value: pos.currentValue,
      percentage: (pos.currentValue / totalValue) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Generate colors for each position
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // Simple circle for single position (100%)
  if (sortedPositions.length === 1) {
    const pos = sortedPositions[0];
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '16px',
        padding: '16px'
      }}>
        {/* Simple Circle Chart */}
        <div style={{ position: 'relative' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill={colors[0]}
              stroke="white"
              strokeWidth="4"
              style={{ 
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}
            />
          </svg>
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--surface-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            borderRadius: '50%', 
            background: colors[0],
            flexShrink: 0
          }} />
          <div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--text)'
            }}>
              {pos.ticker}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--muted)' 
            }}>
              {pos.percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%',
          padding: '12px',
          background: 'var(--surface-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Total Value</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Positions</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
              {validPositions.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For multiple positions, use the complex pie chart
  const createPieSlice = (startAngle: number, endAngle: number, radius: number, centerX: number, centerY: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const centerX = 100;
  const centerY = 100;
  const radius = 80;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '16px',
      padding: '16px'
    }}>
      {/* 3D Pie Chart */}
      <div style={{ position: 'relative' }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
          {/* 3D Effect - Bottom shadow */}
          <g transform="translate(2, 2)">
            {(() => {
              let currentAngle = 0;
              return sortedPositions.map((pos, index) => {
                const sliceAngle = (pos.percentage / 100) * 360;
                const endAngle = currentAngle + sliceAngle;
                const pathData = createPieSlice(currentAngle, endAngle, radius, centerX, centerY);
                currentAngle = endAngle;
                
                return (
                  <path
                    key={`shadow-${pos.ticker}`}
                    d={pathData}
                    fill="rgba(0,0,0,0.1)"
                    stroke="none"
                  />
                );
              });
            })()}
          </g>
          
          {/* Main pie slices */}
          <g>
            {(() => {
              let currentAngle = 0;
              return sortedPositions.map((pos, index) => {
                const sliceAngle = (pos.percentage / 100) * 360;
                const endAngle = currentAngle + sliceAngle;
                const pathData = createPieSlice(currentAngle, endAngle, radius, centerX, centerY);
                currentAngle = endAngle;
              
                return (
                  <path
                    key={pos.ticker}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transition: 'all 0.2s ease'
                    }}
                  />
                );
              });
            })()}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '8px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {sortedPositions.slice(0, 6).map((pos, index) => (
          <div key={pos.ticker} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '4px 8px',
            background: 'var(--surface-elevated)',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: colors[index % colors.length],
              flexShrink: 0
            }} />
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              minWidth: 0
            }}>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {pos.ticker}
              </span>
              <span style={{ 
                fontSize: '10px', 
                color: 'var(--muted)' 
              }}>
                {pos.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%',
        padding: '12px',
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Total Value</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Positions</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
            {validPositions.length}
          </div>
        </div>
      </div>
    </div>
  );
}

























