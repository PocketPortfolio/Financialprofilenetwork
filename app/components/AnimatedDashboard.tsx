'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedDashboardProps {
  totalValue: number;
  totalInvested: number;
  positions: Array<{
    ticker: string;
    value: number;
    change: number;
    changePercent: number;
    allocation: number;
  }>;
  isLoading?: boolean;
}

export default function AnimatedDashboard({ 
  totalValue, 
  totalInvested, 
  positions, 
  isLoading = false 
}: AnimatedDashboardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedInvested, setAnimatedInvested] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation values
  const totalPL = totalValue - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate numbers when visible
  useEffect(() => {
    if (isVisible && !isLoading) {
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 FPS
      const stepDuration = duration / steps;

      // Animate total value
      const valueStep = totalValue / steps;
      const investedStep = totalInvested / steps;

      let step = 0;
      const valueInterval = setInterval(() => {
        step++;
        setAnimatedValue(Math.min(valueStep * step, totalValue));
        setAnimatedInvested(Math.min(investedStep * step, totalInvested));
        
        if (step >= steps) {
          clearInterval(valueInterval);
          setAnimatedValue(totalValue);
          setAnimatedInvested(totalInvested);
        }
      }, stepDuration);

      return () => clearInterval(valueInterval);
    }
  }, [isVisible, totalValue, totalInvested, isLoading]);

  // Generate animated pie chart data
  const pieData = positions.map((pos, index) => ({
    ...pos,
    startAngle: index === 0 ? 0 : positions.slice(0, index).reduce((sum, p) => sum + (p.allocation * 360 / 100), 0),
    endAngle: positions.slice(0, index + 1).reduce((sum, p) => sum + (p.allocation * 360 / 100), 0)
  }));

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div 
      ref={containerRef}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minHeight: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }} />

      {/* Header */}
      <div style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, var(--brand), #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Dashboard Preview
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
          Live portfolio performance
        </p>
      </div>

      {/* Main metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px',
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Total Value */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Value
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: 'var(--text)',
            marginBottom: '4px'
          }}>
            ${animatedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          {totalPL !== 0 && (
            <div style={{ 
              fontSize: '14px', 
              color: totalPL >= 0 ? 'var(--pos)' : 'var(--neg)',
              fontWeight: '600'
            }}>
              {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              ({totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%)
            </div>
          )}
        </div>

        {/* Portfolio Allocation */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Allocation
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>
            {positions.length} Assets
          </div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {positions.reduce((sum, pos) => sum + pos.allocation, 0).toFixed(1)}% Allocated
          </div>
        </div>
      </div>

      {/* Animated Portfolio Chart */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Pie Chart */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
            Portfolio Allocation
          </h3>
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
            <svg width="200" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                {pieData.map((_, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity="1" />
                  </linearGradient>
                ))}
              </defs>
              {pieData.map((segment, index) => {
                const radius = 80;
                const centerX = 100;
                const centerY = 100;
                
                const startAngleRad = (segment.startAngle * Math.PI) / 180;
                const endAngleRad = (segment.endAngle * Math.PI) / 180;
                
                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);
                
                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={`url(#gradient-${index})`}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0)',
                      transformOrigin: 'center',
                      transition: `opacity 0.5s ease-in-out ${index * 0.1}s, transform 0.5s ease-in-out ${index * 0.1}s`
                    }}
                  />
                );
              })}
            </svg>
            
            {/* Center text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                {positions.length} Assets
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                ${animatedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Legend */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
            Holdings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {positions.map((position, index) => (
              <div 
                key={position.ticker}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease-in-out ${index * 0.1}s, transform 0.5s ease-in-out ${index * 0.1}s`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: colors[index % colors.length] 
                    }} 
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                      {position.ticker}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {position.allocation.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                    ${position.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: position.change >= 0 ? 'var(--pos)' : 'var(--neg)',
                    fontWeight: '500'
                  }}>
                    {position.change >= 0 ? '+' : ''}${position.change.toFixed(2)} ({position.changePercent >= 0 ? '+' : ''}{position.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--card-border)',
            borderTop: '4px solid var(--brand)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
    </div>
  );
}
