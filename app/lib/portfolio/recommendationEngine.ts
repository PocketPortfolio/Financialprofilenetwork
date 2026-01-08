/**
 * Dynamic Recommendation Engine
 * Generates market-aware portfolio recommendations with multi-factor analysis
 */

import type { Position } from '@/app/lib/utils/portfolioCalculations';
import type { PortfolioAnalytics, PortfolioSnapshot } from './types';
import { GICSSector, GICS_SECTOR_INFO } from './sectorClassification';
import { getSectorSync } from './sectorService';
import type { MarketContext, VolatilityLevel } from './marketContext';

export type RecommendationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RecommendationFactor {
  type: 'concentration' | 'correlation' | 'sector' | 'volatility' | 'momentum' | 'diversification' | 'blog';
  severity: RecommendationSeverity;
  score: number; // 0-100
  message: string;
  action: string;
  ticker?: string; // For position-specific recommendations
  sector?: GICSSector; // For sector-specific recommendations
  blogPost?: { // For blog-based recommendations
    slug: string;
    title: string;
    url: string;
    relevanceScore: number;
  };
}

export interface DynamicThresholds {
  positionConcentration: number;
  sectorConcentration: number;
  correlationThreshold: number;
  volatilityMultiplier: number;
}

export interface EnhancedRecommendation {
  factors: RecommendationFactor[];
  overallScore: number;
  priority: RecommendationPriority;
  marketContext: MarketContext;
  thresholds: DynamicThresholds;
  lastUpdated: Date;
  blogRecommendations?: Array<{ // AEO blog recommendations
    slug: string;
    title: string;
    description: string;
    url: string;
    relevanceScore: number;
    matchingKeywords: string[];
  }>;
}

/**
 * Calculate dynamic thresholds based on market volatility
 */
export function calculateDynamicThresholds(
  marketContext: MarketContext
): DynamicThresholds {
  const basePositionThreshold = 20;
  const baseSectorThreshold = 40;
  
  // Adjust thresholds based on volatility
  // In high volatility, be more conservative (lower thresholds)
  const volatilityMultiplier: Record<VolatilityLevel, number> = {
    extreme: 0.7,  // 30% reduction
    high: 0.85,    // 15% reduction
    normal: 1.0,   // No change
    low: 1.1,      // 10% increase (can be more concentrated in low vol)
  };
  
  const multiplier = volatilityMultiplier[marketContext.volatility];
  
  return {
    positionConcentration: basePositionThreshold * multiplier,
    sectorConcentration: baseSectorThreshold * multiplier,
    correlationThreshold: 0.7, // Max 70% correlation
    volatilityMultiplier: multiplier,
  };
}

/**
 * Calculate position allocation percentage
 */
function calculateAllocation(
  position: Position,
  allPositions: Position[]
): number {
  const positionValue = position.currentValue || position.avgCost * position.shares;
  const totalValue = allPositions.reduce(
    (sum, pos) => sum + (pos.currentValue || pos.avgCost * pos.shares),
    0
  );
  
  if (totalValue === 0) return 0;
  return (positionValue / totalValue) * 100;
}

/**
 * Calculate sector allocations
 */
function calculateSectorAllocations(
  positions: Position[]
): Record<GICSSector, number> {
  const sectorAllocations: Record<GICSSector, number> = {} as Record<GICSSector, number>;
  const totalValue = positions.reduce(
    (sum, pos) => sum + (pos.currentValue || pos.avgCost * pos.shares),
    0
  );

  // Initialize all sectors to 0
  Object.values(GICSSector).forEach((sector) => {
    sectorAllocations[sector] = 0;
  });

  positions.forEach((pos) => {
    const sector = getSectorSync(pos.ticker);
    const value = pos.currentValue || pos.avgCost * pos.shares;
    sectorAllocations[sector] = (sectorAllocations[sector] || 0) + value;
  });

  // Convert to percentages
  Object.keys(sectorAllocations).forEach((sector) => {
    if (totalValue > 0) {
      sectorAllocations[sector as GICSSector] = (sectorAllocations[sector as GICSSector] / totalValue) * 100;
    }
  });

  return sectorAllocations;
}

/**
 * Calculate correlation between two positions (simplified)
 * In production, this would use historical price data
 */
function calculatePositionCorrelation(
  pos1: Position,
  pos2: Position
): number {
  // Simplified: Use sector correlation as proxy
  // Positions in same sector have higher correlation
  const sector1 = getSectorSync(pos1.ticker);
  const sector2 = getSectorSync(pos2.ticker);
  
  if (sector1 === sector2 && sector1 !== GICSSector.UNCLASSIFIED) {
    return 0.75; // High correlation within sector
  }
  
  // Cross-sector correlations (simplified)
  // Tech and Communication Services: 0.6
  // Financials and Real Estate: 0.5
  // Others: 0.3
  
  return 0.3; // Default low correlation
}

/**
 * Find high correlation pairs
 */
function findHighCorrelationPairs(
  positions: Position[],
  threshold: number
): Array<{ ticker1: string; ticker2: string; correlation: number }> {
  const pairs: Array<{ ticker1: string; ticker2: string; correlation: number }> = [];
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const correlation = calculatePositionCorrelation(positions[i], positions[j]);
      if (correlation > threshold) {
        pairs.push({
          ticker1: positions[i].ticker,
          ticker2: positions[j].ticker,
          correlation,
        });
      }
    }
  }
  
  return pairs;
}

/**
 * Calculate portfolio volatility from historical snapshots
 */
function calculatePortfolioVolatility(
  snapshots: PortfolioSnapshot[]
): number {
  if (snapshots.length < 2) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1].totalValue;
    const curr = snapshots[i].totalValue;
    if (prev > 0) {
      returns.push((curr - prev) / prev);
    }
  }
  
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualize (assuming daily data)
  return stdDev * Math.sqrt(252) * 100; // Return as percentage
}

/**
 * Generate blog recommendations based on portfolio context
 */
async function generateBlogRecommendations(
  positions: Position[],
  marketContext: MarketContext,
  portfolioAnalytics: PortfolioAnalytics,
  sectorAllocations: Record<string, number>
): Promise<Array<{
  slug: string;
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  matchingKeywords: string[];
}>> {
  try {
    // Build query from portfolio context
    const queries: string[] = [];
    
    // Add queries based on portfolio characteristics
    if (positions.length < 5) {
      queries.push('portfolio diversification');
    }
    
    if (portfolioAnalytics.volatility && portfolioAnalytics.volatility > 20) {
      queries.push('portfolio volatility risk management');
    }
    
    // Add sector-based queries
    const topSectors = Object.entries(sectorAllocations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([sector]) => GICS_SECTOR_INFO[sector as GICSSector]?.name)
      .filter(Boolean);
    
    topSectors.forEach(sector => {
      queries.push(`${sector} investment strategy`);
    });
    
    // Add market regime queries
    if (marketContext.regime === 'bear' || marketContext.regime === 'volatile') {
      queries.push('bear market strategy defensive investing');
    }
    
    // Fetch blog recommendations via API (server-side only, avoids fs in client bundle)
    const allMatches = new Map<string, {
      slug: string;
      title: string;
      description: string;
      url: string;
      relevanceScore: number;
      matchingKeywords: string[];
    }>();
    
    // Search for each query via API endpoint (works in both server and client contexts)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app';
      
      for (const query of queries) {
        try {
          const response = await fetch(`${baseUrl}/api/aeo/blog?q=${encodeURIComponent(query)}&limit=3`, {
            next: { revalidate: 3600 } // Cache for 1 hour
          });
          
          if (response.ok) {
            const results = await response.json();
            if (results.matches) {
              results.matches.forEach((match: any) => {
                const existing = allMatches.get(match.slug);
                if (!existing || match.relevanceScore > existing.relevanceScore) {
                  allMatches.set(match.slug, {
                    slug: match.slug,
                    title: match.title,
                    description: match.description,
                    url: match.url,
                    relevanceScore: match.relevanceScore,
                    matchingKeywords: match.matchingKeywords || [],
                  });
                }
              });
            }
          }
        } catch (fetchError) {
          // Silently skip failed queries, continue with others
          console.warn(`[Recommendation Engine] Failed to fetch blog recommendations for query "${query}":`, fetchError);
        }
      }
    } catch (error) {
      // If all queries fail, return empty array
      console.warn('[Recommendation Engine] Blog recommendation fetch failed:', error);
    }
    
    return Array.from(allMatches.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Top 5 blog recommendations
  } catch (error) {
    console.error('[Recommendation Engine] Error fetching blog recommendations:', error);
    return [];
  }
}

/**
 * Generate dynamic recommendations with multi-factor analysis
 * Note: Currently synchronous, but structured as async for future API calls
 */
export async function generateDynamicRecommendations(
  positions: Position[],
  marketContext: MarketContext,
  portfolioAnalytics: PortfolioAnalytics,
  historicalSnapshots: PortfolioSnapshot[]
): Promise<EnhancedRecommendation> {
  const factors: RecommendationFactor[] = [];
  const thresholds = calculateDynamicThresholds(marketContext);
  
  const totalValue = positions.reduce(
    (sum, pos) => sum + (pos.currentValue || pos.avgCost * pos.shares),
    0
  );

  // Calculate sector allocations (needed for blog recommendations)
  const sectorAllocations = calculateSectorAllocations(positions);

  // Generate blog recommendations (async)
  const blogRecommendations = await generateBlogRecommendations(
    positions,
    marketContext,
    portfolioAnalytics,
    sectorAllocations
  );
  
  // Add blog recommendations as factors
  blogRecommendations.slice(0, 2).forEach(blog => {
    if (blog.relevanceScore > 30) { // Only include highly relevant posts
      factors.push({
        type: 'blog',
        severity: 'low',
        score: blog.relevanceScore,
        message: `Relevant article: "${blog.title}"`,
        action: `Read more about ${blog.matchingKeywords.join(', ')}`,
        blogPost: {
          slug: blog.slug,
          title: blog.title,
          url: blog.url,
          relevanceScore: blog.relevanceScore,
        },
      });
    }
  });

  if (positions.length === 0 || totalValue === 0) {
    return {
      factors: [],
      overallScore: 0,
      priority: 'low',
      marketContext,
      thresholds,
      lastUpdated: new Date(),
      blogRecommendations: blogRecommendations.length > 0 ? blogRecommendations : undefined,
    };
  }

  // Factor 1: Position Concentration (volatility-adjusted)
  positions.forEach((pos) => {
    const allocation = calculateAllocation(pos, positions);
    if (allocation > thresholds.positionConcentration) {
      const severity: RecommendationSeverity =
        allocation > 30 ? 'critical' :
        allocation > 25 ? 'high' :
        allocation > 22 ? 'medium' : 'low';
      
      const vixNote = marketContext.vixLevel 
        ? ` Market volatility is ${marketContext.volatility} (VIX ${marketContext.vixLevel.toFixed(1)}).`
        : '';
      
      factors.push({
        type: 'concentration',
        severity,
        score: Math.min(100, (allocation / thresholds.positionConcentration) * 100),
        message: `${pos.ticker} represents ${allocation.toFixed(1)}% of your portfolio.${vixNote}`,
        action: `Consider reducing position size to <${thresholds.positionConcentration.toFixed(1)}% in current market conditions`,
        ticker: pos.ticker,
      });
    }
  });

  // Factor 2: Sector Concentration (with sector momentum)
  // (sectorAllocations already calculated above)
  Object.entries(sectorAllocations).forEach(([sectorEnum, allocation]) => {
    const sector = sectorEnum as GICSSector;
    if (sector === GICSSector.UNCLASSIFIED) return;
    
    if (allocation > thresholds.sectorConcentration) {
      const sectorMomentum = marketContext.sectorPerformance[sector] || 0;
      const isOverweightUnderperforming = sectorMomentum < -5; // Sector down 5%+
      const isOverweightOutperforming = sectorMomentum > 5; // Sector up 5%+
      
      const severity: RecommendationSeverity =
        isOverweightUnderperforming ? 'high' :
        allocation > 50 ? 'high' :
        'medium';
      
      const momentumNote = isOverweightUnderperforming
        ? ` Sector is underperforming (down ${Math.abs(sectorMomentum).toFixed(1)}% this month).`
        : isOverweightOutperforming
        ? ` Sector is outperforming (up ${sectorMomentum.toFixed(1)}% this month).`
        : '';
      
      const sectorName = GICS_SECTOR_INFO[sector].name;
      factors.push({
        type: 'sector',
        severity,
        score: Math.min(100, (allocation / thresholds.sectorConcentration) * 100),
        message: `${sectorName} represents ${allocation.toFixed(1)}% of your portfolio.${momentumNote}`,
        action: isOverweightUnderperforming
          ? 'Consider reducing exposure to underperforming sector'
          : 'Explore other sectors for better diversification',
        sector,
      });
    }
  });

  // Factor 3: Correlation Risk
  const highCorrelationPairs = findHighCorrelationPairs(positions, thresholds.correlationThreshold);
  if (highCorrelationPairs.length > 0) {
    const correlationRatio = highCorrelationPairs.length / (positions.length * (positions.length - 1) / 2);
    
    factors.push({
      type: 'correlation',
      severity: correlationRatio > 0.3 ? 'high' : 'medium',
      score: Math.min(100, correlationRatio * 200),
      message: `${highCorrelationPairs.length} position pair${highCorrelationPairs.length > 1 ? 's' : ''} have high correlation (>${(thresholds.correlationThreshold * 100).toFixed(0)}%), reducing diversification benefit.`,
      action: 'Consider adding uncorrelated assets (bonds, REITs, commodities, international stocks)',
    });
  }

  // Factor 4: Portfolio Volatility vs Market
  const portfolioVolatility = portfolioAnalytics.volatility || calculatePortfolioVolatility(historicalSnapshots);
  const marketVolatility = marketContext.volatility === 'extreme' ? 30 :
                          marketContext.volatility === 'high' ? 25 :
                          marketContext.volatility === 'normal' ? 15 : 10;
  
  if (portfolioVolatility > marketVolatility * 1.5) {
    factors.push({
      type: 'volatility',
      severity: portfolioVolatility > marketVolatility * 2 ? 'high' : 'medium',
      score: Math.min(100, (portfolioVolatility / marketVolatility) * 50),
      message: `Portfolio volatility (${portfolioVolatility.toFixed(1)}%) is significantly higher than market (${marketVolatility.toFixed(1)}%).`,
      action: 'Consider reducing high-volatility positions or adding defensive assets',
    });
  }

  // Factor 5: Low Diversification
  if (positions.length < 5) {
    factors.push({
      type: 'diversification',
      severity: positions.length < 3 ? 'high' : 'medium',
      score: (positions.length / 5) * 100,
      message: `Only ${positions.length} position${positions.length !== 1 ? 's' : ''}.`,
      action: 'Add more positions to diversify risk (target: 10+ positions)',
    });
  }

  // Factor 6: Market Regime Awareness
  if (marketContext.regime === 'bear' || marketContext.regime === 'volatile') {
    const defensiveSectors = [GICSSector.UTILITIES, GICSSector.CONSUMER_STAPLES, GICSSector.HEALTH_CARE];
    const hasDefensiveExposure = defensiveSectors.some(
      sector => sectorAllocations[sector] > 10
    );
    
    if (!hasDefensiveExposure && positions.length > 3) {
      factors.push({
        type: 'momentum',
        severity: 'medium',
        score: 60,
        message: `Market is in ${marketContext.regime} regime. Limited exposure to defensive sectors.`,
        action: 'Consider adding defensive positions (Utilities, Consumer Staples, Healthcare)',
      });
    }
  }

  // Calculate overall score and priority
  const overallScore = factors.length > 0
    ? factors.reduce((sum, f) => sum + f.score, 0) / factors.length
    : 0;
  
  const priority: RecommendationPriority =
    overallScore > 80 ? 'urgent' :
    overallScore > 60 ? 'high' :
    overallScore > 40 ? 'medium' : 'low';

  return {
    factors,
    overallScore,
    priority,
    marketContext,
    thresholds,
    lastUpdated: new Date(),
    blogRecommendations: blogRecommendations.length > 0 ? blogRecommendations : undefined,
  };
}

