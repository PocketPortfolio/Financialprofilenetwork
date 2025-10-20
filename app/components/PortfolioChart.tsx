'use client';

import React from 'react';

interface Position {
  ticker: string;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

interface PortfolioChartProps {
  positions: Position[];
  type: 'pie' | 'line';
}

export default function PortfolioChart({ positions, type }: PortfolioChartProps) {
  if (positions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '300px', 
        color: 'var(--muted)',
        fontSize: '16px'
      }}>
        Portfolio visualization will appear here once you have trades.
      </div>
    );
  }

  if (type === 'pie') {
    return <PieChart positions={positions} />;
  } else {
    return <LineChart positions={positions} />;
  }
}

function PieChart({ positions }: { positions: Position[] }) {
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  let cumulativePercentage = 0;
  const segments = positions.map((position, index) => {
    const percentage = (position.currentValue / totalValue) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    
    cumulativePercentage += percentage;
    
    // Calculate SVG path for pie slice
    const centerX = 150;
    const centerY = 150;
    const radius = 120;
    
    const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
    const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
    const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
    const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');
    
    return {
      pathData,
      color: colors[index % colors.length],
      percentage: percentage.toFixed(1),
      ticker: position.ticker,
      value: position.currentValue,
      pl: position.unrealizedPL,
      plPercent: position.unrealizedPLPercent
    };
  });

  return (
    <div className="portfolio-allocation" style={{ 
      display: 'flex', 
      gap: '16px', 
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Pie Chart */}
      <div className="portfolio-chart" style={{ 
        flex: '0 0 auto', 
        display: 'flex', 
        justifyContent: 'center',
        minWidth: '180px',
        maxWidth: '200px'
      }}>
        <svg width="200" height="200" viewBox="0 0 300 300" style={{ maxWidth: '100%', height: 'auto' }}>
          {segments.map((segment, index) => (
            <path
              key={segment.ticker}
              d={segment.pathData}
              fill={segment.color}
              stroke="var(--bg)"
              strokeWidth="3"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            />
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="portfolio-legend" style={{ 
        flex: '1', 
        minWidth: '200px',
        maxWidth: '280px',
        overflow: 'hidden'
      }}>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          color: 'var(--text)',
          textAlign: 'left'
        }}>
          Portfolio Allocation
        </h4>
        <div className="portfolio-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {segments.map((segment, index) => (
            <div key={segment.ticker} style={{ 
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '10px',
              alignItems: 'center',
              padding: '4px 0'
            }}>
              {/* Color indicator */}
              <div 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: segment.color, 
                  borderRadius: '4px',
                  flexShrink: 0
                }}
              />
              
              {/* Ticker and percentage */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                minWidth: 0
              }}>
                <span style={{ 
                  fontWeight: '600', 
                  color: 'var(--text)', 
                  fontSize: '14px'
                }}>
                  {segment.ticker}
                </span>
                <span style={{ 
                  color: 'var(--muted)', 
                  fontSize: '13px', 
                  fontWeight: '500'
                }}>
                  {segment.percentage}%
                </span>
              </div>
              
              {/* Value and P/L */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                textAlign: 'right'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: 'var(--text)'
                }}>
                  ${segment.value.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: segment.pl >= 0 ? 'var(--pos)' : 'var(--neg)',
                  fontWeight: '500'
                }}>
                  {segment.pl >= 0 ? '+' : ''}${segment.pl.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: segment.pl >= 0 ? 'var(--pos)' : 'var(--neg)',
                  fontWeight: '500'
                }}>
                  ({segment.pl >= 0 ? '+' : ''}{segment.plPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineChart({ positions }: { positions: Position[] }) {
  // Simple line chart showing portfolio value over time (mock data)
  const mockData = [
    { date: '2025-01-01', value: 5000 },
    { date: '2025-01-02', value: 5100 },
    { date: '2025-01-03', value: 4950 },
    { date: '2025-01-04', value: 5200 },
    { date: '2025-01-05', value: 5300 },
    { date: '2025-01-06', value: 5250 },
    { date: '2025-01-07', value: 5492 },
  ];
  
  const maxValue = Math.max(...mockData.map(d => d.value));
  const minValue = Math.min(...mockData.map(d => d.value));
  const range = maxValue - minValue;
  
  const width = 600;
  const height = 200;
  const padding = 40;
  
  const points = mockData.map((point, index) => {
    const x = padding + (index / (mockData.length - 1)) * (width - 2 * padding);
    const y = padding + ((maxValue - point.value) / range) * (height - 2 * padding);
    return { x, y, ...point };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  return (
    <div style={{ width: '100%' }}>
      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text)' }}>
        Portfolio Value Over Time
      </h4>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="20" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 20" fill="none" stroke="var(--card-border)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#ff6b35"
          strokeWidth="3"
        />
        
        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#ff6b35"
            stroke="var(--bg)"
            strokeWidth="2"
          />
        ))}
        
        {/* Labels */}
        <text x={padding} y={padding} fontSize="12" fill="var(--muted)">
          ${maxValue.toFixed(0)}
        </text>
        <text x={padding} y={height - padding} fontSize="12" fill="var(--muted)">
          ${minValue.toFixed(0)}
        </text>
        <text x={width / 2} y={height - 10} fontSize="12" fill="var(--muted)" textAnchor="middle">
          Time
        </text>
      </svg>
      
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        {positions.map((position, index) => (
          <div key={position.ticker} style={{ 
            background: 'var(--bg)', 
            border: '1px solid var(--card-border)', 
            borderRadius: '6px', 
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '500', color: 'var(--text)' }}>{position.ticker}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              ${position.currentValue.toFixed(2)}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: position.unrealizedPL >= 0 ? 'var(--pos)' : 'var(--neg)' 
            }}>
              {position.unrealizedPL >= 0 ? '+' : ''}${position.unrealizedPL.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
