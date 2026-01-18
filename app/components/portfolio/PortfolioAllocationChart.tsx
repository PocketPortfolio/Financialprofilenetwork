'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
} from 'recharts';
import { LayoutGrid, Thermometer, BarChart3, CircleDashed, PieChart as PieChartIcon } from 'lucide-react';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import type { ChartViewType } from '@/app/lib/portfolio/types';
import ChartTooltip from './ChartTooltip';
import { getSectorSync } from '@/app/lib/portfolio/sectorService';
import { GICSSector } from '@/app/lib/portfolio/sectorClassification';
import { formatCurrencyAxis } from '@/app/lib/utils/currencyFormatter';

// Helper to calculate color brightness for text contrast
function getColorBrightness(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  // Calculate relative luminance
  return (r * 299 + g * 587 + b * 114) / 1000;
}

interface PortfolioAllocationChartProps {
  positions: Position[];
  chartView?: ChartViewType;
  onChartViewChange?: (view: ChartViewType) => void;
  onSegmentClick?: (ticker: string) => void;
}

// Color palette - brand-aligned
const COLORS = [
  '#ff6b35', // signal orange
  '#0ea5e9', // info sky
  '#10b981', // success green
  '#f59e0b', // warning amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

// getSector is now imported from sectorService

/**
 * Main portfolio allocation chart with multiple view types
 */
export default function PortfolioAllocationChart({
  positions,
  chartView = 'treemap',
  onChartViewChange,
  onSegmentClick,
}: PortfolioAllocationChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = React.useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Make isMobile reactive to window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Update container dimensions on resize and log ResponsiveContainer sizing
  React.useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.offsetWidth;
        const height = chartContainerRef.current.offsetHeight;
        
        // Only update if we have valid dimensions
        if (width > 0 && height > 0) {
          setContainerDimensions({ width, height });
        }
        
      }
    };

    // Use ResizeObserver for better container size tracking
    let resizeObserver: ResizeObserver | null = null;
    
    if (chartContainerRef.current) {
      // Initial measurement with a small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        updateDimensions();
        
        // Set up ResizeObserver for container size changes
        if (typeof ResizeObserver !== 'undefined' && chartContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            updateDimensions();
          });
          resizeObserver.observe(chartContainerRef.current);
        }
      });
    }

    // Fallback to window resize listener
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver && chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
    };
  }, [isMobile, chartView]);
  
  // Calculate total value and filter valid positions
  const { totalValue, validPositions, chartData } = useMemo(() => {
    // Use currentValue if available, otherwise fallback to cost basis (avgCost * shares)
    const total = positions.reduce(
      (sum, pos) => sum + (pos.currentValue || (pos.avgCost * pos.shares) || 0),
      0
    );
    // Filter positions: allow positions with shares > 0 OR sector aggregates (shares === 0 but has currentValue)
    const valid = positions.filter((pos) => {
      // Allow positions with shares > 0
      if (pos.shares > 0) return true;
      // Allow sector aggregates (shares === 0 but has value)
      if (pos.shares === 0 && (pos.currentValue || 0) > 0) return true;
      return false;
    });

    const data = valid
      .map((pos) => {
        // For sector aggregates (shares === 0), use currentValue directly
        // For regular positions, use currentValue or fallback to cost basis
        const value = pos.shares === 0 
          ? (pos.currentValue || 0)
          : (pos.currentValue || pos.avgCost * pos.shares);
        // Ensure value is a valid number
        const numericValue = Number(value) || 0;
        return {
          ...pos,
          value: numericValue,
          percentage: total > 0 ? (numericValue / total) * 100 : 0,
          sector: getSectorSync(pos.ticker) as string,
          name: pos.ticker || 'Unknown',
        };
      })
      .filter((item) => item.value > 0) // Filter out zero values
      .sort((a, b) => b.value - a.value);

    return {
      totalValue: total,
      validPositions: valid,
      chartData: data,
    };
  }, [positions]);


  // Empty state
  if (validPositions.length === 0) {
    return (
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
        No positions to display
      </div>
    );
  }

  // Chart type configuration with icons
  const CHART_TYPES = [
    { id: 'treemap' as ChartViewType, icon: LayoutGrid, label: 'Map', tooltip: 'Market Map (Size = Value)' },
    { id: 'heatmap' as ChartViewType, icon: Thermometer, label: 'Heat', tooltip: 'Intensity Map (Color = Concentration)' },
    { id: 'bar' as ChartViewType, icon: BarChart3, label: 'Rank', tooltip: 'Ranked List (Top 10)' },
    { id: 'donut' as ChartViewType, icon: CircleDashed, label: 'Ring', tooltip: 'Summary Ring (Classic)' },
    { id: 'pie' as ChartViewType, icon: PieChartIcon, label: 'Legacy', tooltip: 'Legacy View (Simple)' },
  ];

  // Render chart based on view type
  const renderChart = () => {
    
    if (chartData.length === 0) {
      return (
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--muted)' }}>
          No data to display
        </div>
      );
    }
    
    // Validate data has valid values
    const hasValidValues = chartData.some((item) => item.value && item.value > 0);
    if (!hasValidValues) {
      return (
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--muted)' }}>
          All values are zero
        </div>
      );
    }

    // Get container dimensions with responsive fallbacks
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Ensure fallback always works - check dimensions in order of preference
    const currentOffsetWidth = chartContainerRef.current?.offsetWidth || 0;
    const containerWidth = containerDimensions.width > 0 
      ? containerDimensions.width 
      : currentOffsetWidth > 0
      ? currentOffsetWidth
      : (isMobile ? 320 : isTablet ? 600 : 800);
    
    const containerHeight = isMobile ? 300 : 400;
    
    switch (chartView) {
      case 'pie':
      case 'donut': {
        // Ensure data is valid
        if (chartData.length === 0 || !chartData.some(d => d.value > 0)) {
          return (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--muted)' }}>
              No valid data to display
            </div>
          );
        }
        
        // Calculate radius as numeric values based on container height
        const outerRadius = isMobile 
          ? Math.min(containerHeight * 0.3, 90) // 30% of 300px = 90px max
          : chartView === 'donut' 
            ? Math.min(containerHeight * 0.35, 140) // 35% of 400px = 140px max
            : Math.min(containerHeight * 0.4, 160); // 40% of 400px = 160px max
        
        const innerRadius = chartView === 'donut' 
          ? (isMobile ? Math.min(containerHeight * 0.15, 45) : Math.min(containerHeight * 0.2, 80))
          : 0;
        
        // Use measured container width - ResizeObserver ensures it's accurate and responsive
        // Fallback to parent's offsetWidth if containerDimensions not yet measured
        const measuredWidth = containerDimensions.width > 0 
          ? containerDimensions.width 
          : (chartContainerRef.current?.offsetWidth || 300);
        return (
          <ResponsiveContainer width={measuredWidth} height={containerHeight}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  isMobile ? `${(percent || 0).toFixed(0)}%` : `${name} ${(percent || 0).toFixed(1)}%`
                }
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => {
                  onSegmentClick?.(data.ticker || data.name);
                }}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'bar': {
        // Use measured container width - ResizeObserver ensures it's accurate and responsive
        const measuredWidth = containerDimensions.width > 0 
          ? containerDimensions.width 
          : (chartContainerRef.current?.offsetWidth || 300);
        return (
          <ResponsiveContainer width={measuredWidth} height={containerHeight}>
            <BarChart
              data={chartData.slice(0, 10)} // Top 10 positions
              margin={{ 
                top: 10, 
                right: isMobile ? 10 : 30, 
                left: isMobile ? 10 : 20, 
                bottom: isMobile ? 80 : 60 // More space for rotated labels on mobile
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                angle={isMobile ? -90 : -45}
                textAnchor="end"
                height={isMobile ? 80 : 60} // Reduced height on mobile
                stroke="var(--text-secondary)"
                style={{ fontSize: isMobile ? '10px' : 'var(--font-size-sm)' }}
                interval={0} // Show all labels
              />
              <YAxis
                width={isMobile ? 50 : 60} // Narrower Y-axis on mobile
                stroke="var(--text-secondary)"
                style={{ fontSize: isMobile ? '10px' : 'var(--font-size-sm)' }}
                tickFormatter={formatCurrencyAxis}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--surface-elevated)', opacity: 0.3 }}
              />
              <Bar
                dataKey="value"
                fill="var(--signal)"
                onClick={(data: any) => onSegmentClick?.(data.ticker)}
                style={{ cursor: 'pointer' }}
              >
                {chartData.slice(0, 10).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'treemap': {
        // Ensure data has required structure for Treemap
        const treemapData = chartData.map((item) => ({
          name: item.name || item.ticker || 'Unknown',
          value: item.value || 0,
          ticker: item.ticker,
          percentage: item.percentage || 0,
        }));
        
        if (treemapData.length === 0 || treemapData.every(d => d.value <= 0)) {
          return (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--muted)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No data to display
            </div>
          );
        }
        
        // Use measured container width for ResponsiveContainer (responsive via ResizeObserver)
        // Use measured container width - ResizeObserver ensures it's accurate and responsive
        const measuredWidth = containerDimensions.width > 0 
          ? containerDimensions.width 
          : (chartContainerRef.current?.offsetWidth || 300);
        return (
          <ResponsiveContainer width={measuredWidth} height={containerHeight}>
            <Treemap
              data={treemapData}
              dataKey="value"
              stroke="#fff"
              fill="#8884d8"
              isAnimationActive={false}
              content={(props: any) => {
                // Skip root node (depth 0) - only render leaf nodes (depth 1)
                if (!props || props.depth === 0) {
                  return <g />;
                }
                
                // Data is directly on props, not in payload
                const { x, y, width, height, name, ticker, percentage, depth } = props;
                
                // Only render leaf nodes (depth 1)
                if (depth !== 1 || typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
                  return <g />;
                }
                
                if (width <= 0 || height <= 0) {
                  return <g />;
                }
                
                // Find color based on ticker or name
                const dataIndex = treemapData.findIndex((d) => d.ticker === ticker || d.name === name);
                const fillColor = dataIndex >= 0 
                  ? COLORS[dataIndex % COLORS.length]
                  : COLORS[0];
                
                const displayPercentage = percentage || 0;
                const displayName = name || ticker || 'N/A';
                
                // Enhanced thresholds for text rendering
                const minWidthForText = isMobile ? 60 : 80;
                const minHeightForText = isMobile ? 30 : 40;
                const shouldShowText = width > minWidthForText && height > minHeightForText;
                
                // Calculate text color based on background brightness
                const colorBrightness = getColorBrightness(fillColor);
                const textColor = colorBrightness > 128 ? '#1a1a1a' : '#ffffff';
                const textStroke = colorBrightness > 128 
                  ? 'rgba(255, 255, 255, 0.8)' 
                  : 'rgba(0, 0, 0, 0.3)';
                
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fillColor}
                      stroke="var(--background)"
                      strokeWidth={isMobile ? 1.5 : 2}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        onSegmentClick?.(ticker || name);
                      }}
                    />
                    {shouldShowText && (
                      <>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - (isMobile ? 6 : 8)}
                          textAnchor="middle"
                          fill={textColor}
                          fontSize={isMobile ? '11' : '14'}
                          fontWeight="600"
                          stroke={textStroke}
                          strokeWidth="0.5"
                          paintOrder="stroke fill"
                        >
                          {displayName}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + (isMobile ? 6 : 8)}
                          textAnchor="middle"
                          fill={textColor}
                          fontSize={isMobile ? '9' : '11'}
                          stroke={textStroke}
                          strokeWidth="0.5"
                          paintOrder="stroke fill"
                        >
                          {displayPercentage.toFixed(1)}%
                        </text>
                      </>
                    )}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        );
      }

      case 'heatmap': {
        // Proper heatmap visualization using Treemap component
        // This shows allocation intensity - larger values get larger cells
        // Create heatmap data based on current values
        const heatmapData = chartData.map((item) => ({
          name: item.name || item.ticker || 'Unknown',
          value: item.value || 0,
          percentage: item.percentage || 0,
          ticker: item.ticker,
        }));
        
        if (heatmapData.length === 0 || heatmapData.every(d => d.value <= 0)) {
          return (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--muted)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No data to display
            </div>
          );
        }
        
        // Calculate min/max values for color intensity gradient
        const maxValue = Math.max(...heatmapData.map(d => d.value));
        const minValue = Math.min(...heatmapData.map(d => d.value));
        const valueRange = maxValue - minValue;
        
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ 
              marginBottom: isMobile ? 'var(--space-2)' : 'var(--space-2)', 
              textAlign: 'center', 
              fontSize: isMobile ? '10px' : 'var(--font-size-sm)', 
              color: 'var(--muted)',
              padding: isMobile ? '0 var(--space-1)' : '0',
              lineHeight: isMobile ? '1.3' : '1.5',
            }}>
              {isMobile ? 'Darker = higher weight' : 'Allocation intensity heatmap - darker colors indicate higher portfolio weight'}
            </div>
            <div style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              {(() => {
                // Use measured container width - ResizeObserver ensures it's accurate and responsive
                const measuredWidth = containerDimensions.width > 0 
                  ? containerDimensions.width 
                  : (chartContainerRef.current?.offsetWidth || 300);
                return (
                  <ResponsiveContainer width={measuredWidth} height={containerHeight}>
                    <Treemap
                      data={heatmapData}
                      dataKey="value"
                      stroke="var(--border)"
                      fill="var(--signal)"
                      isAnimationActive={false}
              content={(props: any) => {
                try {
                  // Skip root node (depth 0) - only render leaf nodes (depth 1)
                  if (!props || props.depth === 0) {
                    return <g />;
                  }
                  
                  // Data is directly on props, not in payload
                  const { x, y, width, height, name, ticker, percentage, value, depth } = props;
                  
                  // Only render leaf nodes (depth 1)
                  if (depth !== 1 || typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
                    return <g />;
                  }
                  
                  if (width <= 0 || height <= 0) return <g />;
                  
                  const displayPercentage = percentage || 0;
                  const displayValue = value || 0;
                  
                  // Calculate intensity as a percentage (0 to 1) based on value range
                  const intensity = valueRange > 0 ? (displayValue - minValue) / valueRange : 0.5;
                  
                  // Use a single-color gradient (blue) for heatmap - darker = higher value
                  // This makes it visually distinct from the multi-color treemap
                  const hue = 210; // Blue base color
                  const saturation = 70 + (intensity * 30); // 70% to 100% saturation
                  const lightness = 90 - (intensity * 50); // 90% to 40% lightness (darker = higher value)
                  
                  const heatmapColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                  
                  const displayName = name || ticker || 'N/A';
                  
                  // Determine text color based on background lightness for better contrast
                  // Use white for darker backgrounds, dark color for lighter backgrounds
                  const textColor = lightness < 60 ? '#ffffff' : '#1a1a1a';
                  
                  // Mobile-responsive thresholds and font sizes
                  const minWidthForText = isMobile ? 60 : 80;
                  const minHeightForText = isMobile ? 30 : 40;
                  const nameFontSize = isMobile ? '11' : '14';
                  const percentageFontSize = isMobile ? '10' : '12';
                  const valueFontSize = isMobile ? '9' : '10';
                  const nameYOffset = isMobile ? -8 : -10;
                  const percentageYOffset = isMobile ? 4 : 5;
                  const valueYOffset = isMobile ? 16 : 20;
                  
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={heatmapColor}
                        stroke="var(--border)"
                        strokeWidth={isMobile ? 1 : 2}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSegmentClick?.(ticker || name)}
                      />
                      {width > minWidthForText && height > minHeightForText && (
                        <>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + nameYOffset}
                            textAnchor="middle"
                            fill={textColor}
                            fontSize={nameFontSize}
                            fontWeight="600"
                            stroke={lightness < 60 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'}
                            strokeWidth="0.5"
                            paintOrder="stroke fill"
                          >
                            {displayName}
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + percentageYOffset}
                            textAnchor="middle"
                            fill={textColor}
                            fontSize={percentageFontSize}
                            stroke={lightness < 60 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'}
                            strokeWidth="0.5"
                            paintOrder="stroke fill"
                          >
                            {displayPercentage.toFixed(1)}%
                          </text>
                          {!isMobile && (
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + valueYOffset}
                              textAnchor="middle"
                              fill={textColor}
                              fontSize={valueFontSize}
                              stroke={lightness < 60 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'}
                              strokeWidth="0.5"
                              paintOrder="stroke fill"
                            >
                              ${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </text>
                          )}
                        </>
                      )}
                    </g>
                  );
                } catch (error) {
                  // Silently handle rendering errors
                  return <g />;
                }
              }}
                />
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        padding: isMobile ? '12px' : 'var(--space-4)',
        width: '100%',
        maxWidth: isMobile ? '100%' : '45%', // Reduce border length on desktop
        marginLeft: isMobile ? '0' : 'auto', // Center with equal spacing
        marginRight: isMobile ? '0' : 'auto',
        minHeight: isMobile ? 300 : 400,
        boxSizing: 'border-box',
        overflow: 'visible', // Allow content to be visible on mobile
      }}
    >
      {/* Header with chart type selector */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'flex-start', // Align left on desktop
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: 'var(--space-4)',
          gap: isMobile ? 'var(--space-3)' : 'var(--space-4)', // More gap on desktop for better spacing
          width: '100%',
          maxWidth: '100%',
          overflow: 'visible', // Ensure header doesn't clip
        }}
      >
        {/* Chart type selector - Icon-based with tooltips */}
        {onChartViewChange && (
          <div
            style={{
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : 'none',
              background: 'var(--surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              padding: isMobile ? '2px' : '4px',
              display: 'flex',
              gap: isMobile ? '2px' : '4px',
              flexWrap: 'wrap',
              border: '1px solid var(--border)',
              boxSizing: 'border-box',
              overflowX: isMobile ? 'auto' : 'visible', // Allow horizontal scroll on very small screens
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            }}
          >
            {CHART_TYPES.map(({ id, icon: Icon, label, tooltip }) => (
              <button
                key={id}
                onClick={() => onChartViewChange(id)}
                aria-label={`Switch to ${label} chart view`}
                aria-pressed={chartView === id}
                title={tooltip}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChartViewChange(id);
                  }
                }}
                style={{
                  padding: isMobile ? '4px 6px' : '8px 12px',
                  flex: isMobile ? '1 1 0' : '0 0 auto',
                  minWidth: isMobile ? '44px' : 'auto',
                  maxWidth: isMobile ? 'none' : 'auto',
                  minHeight: isMobile ? '44px' : '40px', // Better touch target (44px minimum)
                  boxSizing: 'border-box',
                  background:
                    chartView === id
                      ? 'var(--signal)'
                      : 'var(--surface-elevated)',
                  color:
                    chartView === id ? 'var(--bg)' : 'var(--text)',
                  border: `1px solid ${
                    chartView === id ? 'var(--signal)' : 'var(--border)'
                  }`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (chartView !== id) {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--signal)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (chartView !== id) {
                    e.currentTarget.style.background = 'var(--surface-elevated)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
              >
                <Icon 
                  size={isMobile ? 16 : 16} 
                  style={{ 
                    opacity: chartView === id ? 1 : 0.7,
                    transition: 'opacity 0.2s ease',
                    flexShrink: 0
                  }} 
                />
                <span style={{ 
                  fontSize: isMobile ? '9px' : '10px',
                  lineHeight: 1,
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div 
        ref={chartContainerRef}
        role="img" 
        aria-label="Portfolio allocation chart"
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0, // Allow shrinking below content size
          height: isMobile ? '300px' : '400px',
          minHeight: isMobile ? '300px' : '400px',
          position: 'relative',
          overflowX: isMobile ? 'auto' : 'hidden', // Allow horizontal scroll on mobile if needed
          overflowY: 'hidden', // Always constrain vertical overflow
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        {renderChart()}
      </div>

      {/* Legend for pie/donut - responsive grid: 2 columns on mobile, 3-4 on desktop */}
      {(chartView === 'pie' || chartView === 'donut') && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
            maxWidth: isMobile ? '100%' : '60%', // Reduce border length on desktop
            marginLeft: isMobile ? '0' : 'auto', // Center with equal spacing on both sides
            marginRight: isMobile ? '0' : 'auto',
          }}
        >
          {chartData.slice(0, 8).map((item, index) => (
            <div
              key={item.ticker}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2)',
                background: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
              onClick={() => onSegmentClick?.(item.ticker)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-elevated)';
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: COLORS[index % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.ticker}
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

