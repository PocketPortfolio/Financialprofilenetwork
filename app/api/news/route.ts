import { NextRequest, NextResponse } from 'next/server';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers') || '';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    
    if (!tickers.trim()) {
      return NextResponse.json([]);
    }

    // Parse tickers
    const tickerList = [...new Set(tickers.split(/[,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 50);
    
    // Direct call to Google News RSS API
    const newsPromises = tickerList.map(async (ticker) => {
      try {
        const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(ticker)}&hl=en-GB&gl=GB&ceid=GB:en`;
        const response = await fetch(newsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (PocketPortfolio)',
            'Accept': 'application/rss+xml,text/xml,*/*',
          },
        });

        if (!response.ok) {
          return [];
        }

        const xml = await response.text();
        return parseRssFeed(xml, ticker);
      } catch (error) {
        console.error(`Error fetching news for ${ticker}:`, error);
        return [];
      }
    });

    const allNews = await Promise.all(newsPromises);
    
    // Smart News: Ensure balanced representation of each ticker
    const tickerNewsMap = new Map<string, any[]>();
    
    // Group news by ticker
    allNews.forEach((newsItems, index) => {
      const ticker = tickerList[index];
      if (newsItems && newsItems.length > 0) {
        tickerNewsMap.set(ticker, newsItems);
      }
    });
    
    // Ensure minimum 1 article per ticker for Smart News (reduced from 2 to be more flexible)
    const minArticlesPerTicker = 1;
    const totalMinArticles = tickerList.length * minArticlesPerTicker;
    
    // If requested limit is less than minimum needed, increase it
    const effectiveLimit = Math.max(limit, totalMinArticles);
    
    // Calculate how many articles per ticker (minimum 1, but distribute evenly if possible)
    const articlesPerTicker = Math.max(minArticlesPerTicker, Math.floor(effectiveLimit / tickerList.length));
    const smartNews: any[] = [];
    
    // FLEXIBLE: Ensure each ticker gets at least 1 article first
    const tickersWithEnoughNews = [];
    const tickersWithInsufficientNews = [];
    
    for (const ticker of tickerList) {
      const tickerNews = tickerNewsMap.get(ticker);
      if (tickerNews && tickerNews.length >= minArticlesPerTicker) {
        tickersWithEnoughNews.push(ticker);
        // Add exactly 1 article for this ticker (reduced from 2)
        for (let i = 0; i < minArticlesPerTicker; i++) {
          if (tickerNews[i]) {
            smartNews.push(tickerNews[i]);
          }
        }
      } else {
        tickersWithInsufficientNews.push(ticker);
        console.warn(`Ticker ${ticker} only has ${tickerNews?.length || 0} articles, need at least ${minArticlesPerTicker}`);
      }
    }
    
    // If we have tickers with insufficient news, try to get more articles for them
    if (tickersWithInsufficientNews.length > 0) {
      console.log(`Attempting to find more news for insufficient tickers: ${tickersWithInsufficientNews.join(', ')}`);
      
      // Try to get additional articles for insufficient tickers from other sources
      for (const ticker of tickersWithInsufficientNews) {
        const tickerNews = tickerNewsMap.get(ticker);
        if (tickerNews && tickerNews.length > 0) {
          // Add all available articles for this ticker
          for (let i = 0; i < tickerNews.length; i++) {
            smartNews.push(tickerNews[i]);
          }
        }
      }
    }
    
    // Then add additional articles if we have space and more news available
    const remainingSlots = effectiveLimit - smartNews.length;
    if (remainingSlots > 0) {
      for (const ticker of tickerList) {
        const tickerNews = tickerNewsMap.get(ticker);
        if (tickerNews && tickerNews.length > minArticlesPerTicker) {
          // Add additional articles for this ticker
          for (let i = minArticlesPerTicker; i < tickerNews.length && smartNews.length < effectiveLimit; i++) {
            smartNews.push(tickerNews[i]);
          }
        }
      }
    }
    
    // Fill remaining slots with latest news if we haven't reached the limit
    if (smartNews.length < limit) {
      const flatNews = allNews.flat().filter(item => 
        !smartNews.some(smart => smart.url === item.url)
      );
      const additionalNews = flatNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit - smartNews.length);
      smartNews.push(...additionalNews);
    }
    
    // Sort by published date and limit results
    const sortedNews = smartNews
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
    
    // VALIDATION: Ensure rule is followed - each ticker should have 1+ articles
    const tickerCounts = new Map<string, number>();
    sortedNews.forEach(article => {
      const count = tickerCounts.get(article.ticker) || 0;
      tickerCounts.set(article.ticker, count + 1);
    });
    
    // Check if rule is violated
    const ruleViolations = [];
    for (const ticker of tickerList) {
      const count = tickerCounts.get(ticker) || 0;
      if (count < minArticlesPerTicker) {
        ruleViolations.push(ticker);
        console.warn(`RULE VIOLATION: Ticker ${ticker} has only ${count} articles, need at least ${minArticlesPerTicker}`);
      } else {
        console.log(`✅ Ticker ${ticker} has ${count} articles (meets 1+ rule)`);
      }
    }
    
    // If we have rule violations, try to fix them by adding more articles
    if (ruleViolations.length > 0) {
      console.log(`🚨 RULE VIOLATIONS DETECTED for tickers: ${ruleViolations.join(', ')}`);
      console.log(`Attempting to fix by adding more articles...`);
      
      // Try to add more articles for violated tickers
      for (const ticker of ruleViolations) {
        const tickerNews = tickerNewsMap.get(ticker);
        if (tickerNews && tickerNews.length > 0) {
          const currentCount = tickerCounts.get(ticker) || 0;
          const needed = minArticlesPerTicker - currentCount;
          
          for (let i = currentCount; i < tickerNews.length && i < currentCount + needed; i++) {
            if (tickerNews[i] && !sortedNews.some(article => article.url === tickerNews[i].url)) {
              sortedNews.push(tickerNews[i]);
              tickerCounts.set(ticker, (tickerCounts.get(ticker) || 0) + 1);
            }
          }
        }
      }
    }
    
    return NextResponse.json(sortedNews, {
      headers: {
        'Cache-Control': 's-maxage=180, stale-while-revalidate=600',
        'X-Data-Source': 'google-news-rss-direct',
        'X-Data-Timestamp': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching news from Google RSS:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news from Google RSS' }, 
      { status: 500 }
    );
  }
}

function parseRssFeed(xml: string, ticker: string) {
  const items = [];
  const parts = xml.split(/<item>/i).slice(1).map((x) => x.split(/<\/item>/i)[0]);
  
  for (const item of parts) {
    const title = extractText(item, 'title');
    let link = extractText(item, 'link') || extractText(item, 'guid');
    
    if (!title || !link) continue;
    
    // Handle Google News redirect URLs
    if (link.includes('news.google.com/rss/articles/')) {
      try {
        const url = new URL(link);
        const direct = url.searchParams.get('url');
        if (direct) link = direct;
      } catch {}
    }
    
    const publishedAt = extractText(item, 'pubDate') || extractText(item, 'published');
    
    items.push({
      title,
      url: link,
      source: extractText(item, 'source') || extractDomain(link),
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      image: extractImage(item),
      ticker,
    });
  }
  
  return items;
}

function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

function extractImage(xml: string): string | null {
  const mediaContentMatch = xml.match(/<media:content[^>]*\burl="([^"]+)"[^>]*>/i);
  if (mediaContentMatch) return mediaContentMatch[1];
  
  const enclosureMatch = xml.match(/<enclosure[^>]*\burl="([^"]+)"[^>]*>/i);
  if (enclosureMatch) return enclosureMatch[1];
  
  return null;
}
