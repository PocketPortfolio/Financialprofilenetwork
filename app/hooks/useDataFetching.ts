'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface Quote {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  currency: string;
  source: string;
}

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  image?: string;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Hook for fetching quotes from real Yahoo Finance API
export function useQuotes(symbols: string[], refreshInterval: number = 120000): ApiResponse<Record<string, Quote>> {
  const [data, setData] = useState<Record<string, Quote> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);
  
  // Create a stable symbols string to prevent infinite loops
  const symbolsKey = useMemo(() => symbols?.join(',') || '', [symbols]);

  const fetchQuotes = useCallback(async () => {
    if (!mountedRef.current) return;

    // If no symbols, clear data and return
    if (!symbols || symbols.length === 0) {
      setData({});
      setLoading(false);
      setError(null);
      return;
    }

    // Check if we have cached data and it's recent enough (less than 10 minutes old)
    const now = Date.now();
    const cacheKey = `quotes_${symbolsKey}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData && (now - lastFetchRef.current) < 600000) { // 10 minutes cache
      try {
        const parsedData = JSON.parse(cachedData);
        if (mountedRef.current) {
          setData(parsedData);
          return;
        }
      } catch (e) {
        // Invalid cache, continue with fetch
      }
    }

    setLoading(true);
    setError(null);

    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`/api/quote?symbols=${symbolsParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: Quote[] = await response.json();
      
      if (mountedRef.current) {
        // Convert array to object for easier access
        const quotesObj: Record<string, Quote> = {};
        result.forEach(quote => {
          quotesObj[quote.symbol] = quote;
        });
        setData(quotesObj);
        
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(quotesObj));
        lastFetchRef.current = now;
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
        console.error('Error fetching quotes:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [symbolsKey]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Fetch quotes when symbols change
    fetchQuotes();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbolsKey]); // Use symbolsKey instead of fetchQuotes to prevent infinite loops

  return {
    data,
    loading,
    error,
    refetch: fetchQuotes
  };
}

// Hook for fetching news from real Google News RSS API
export function useNews(tickers: string[] = [], limit: number = 5): ApiResponse<NewsArticle[]> {
  const [data, setData] = useState<NewsArticle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  // Create stable keys to prevent infinite loops
  const tickersKey = useMemo(() => tickers.join(','), [tickers]);

  const fetchNews = useCallback(async () => {
    if (!mountedRef.current) return;

    console.log('🔍 Fetching news for tickers:', tickers, 'limit:', limit);

    // Check if we have cached data and it's recent enough (less than 15 minutes old for better balance)
    const now = Date.now();
    const cacheKey = `news_${tickersKey}_${limit}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData && (now - lastFetchRef.current) < 900000) { // 15 minutes cache for fresher news
      try {
        const parsedData = JSON.parse(cachedData);
        console.log('📰 Using cached news:', parsedData.length, 'articles');
        if (mountedRef.current) {
          setData(parsedData);
          return;
        }
      } catch (e) {
        console.log('🗑️ Invalid cache, fetching fresh news');
        // Invalid cache, continue with fetch
      }
    } else {
      console.log('⏰ Cache expired or no cache, fetching fresh news');
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (tickers.length > 0) {
        params.append('tickers', tickersKey);
      }
      params.append('limit', limit.toString());

      const response = await fetch(`/api/news?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NewsArticle[] = await response.json();
      
      if (mountedRef.current) {
        console.log('✅ News fetched successfully:', result.length, 'articles');
        setData(result);
        
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(result));
        lastFetchRef.current = now;
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching news:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [tickersKey, limit]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Fetch news when tickers or limit changes
    fetchNews();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tickersKey, limit]); // Use tickersKey and limit instead of fetchNews to prevent infinite loops

  return {
    data,
    loading,
    error,
    refetch: fetchNews
  };
}

// Hook for fetching most traded stocks from real Yahoo Finance screener API
export function useMarketData(): ApiResponse<any[]> {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  const fetchMarketData = useCallback(async () => {
    if (!mountedRef.current) return;

    // Check if we have cached data and it's recent enough (less than 15 minutes old)
    const now = Date.now();
    const cacheKey = 'market_data_most_traded';
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData && (now - lastFetchRef.current) < 900000) { // 15 minutes cache
      try {
        const parsedData = JSON.parse(cachedData);
        if (mountedRef.current) {
          setData(parsedData);
          return;
        }
      } catch (e) {
        // Invalid cache, continue with fetch
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/most-traded?count=10&region=US'); // Reduced count from 15 to 10
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (mountedRef.current) {
        setData(result);
        
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(result));
        lastFetchRef.current = now;
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        console.error('Error fetching market data:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch only - no intervals for now to stop infinite loops
    fetchMarketData();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    data,
    loading,
    error,
    refetch: fetchMarketData
  };
}