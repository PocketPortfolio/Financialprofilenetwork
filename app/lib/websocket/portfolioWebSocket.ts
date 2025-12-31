/**
 * Portfolio WebSocket Infrastructure
 * Handles real-time price updates with fallback to polling
 */

interface WebSocketMessage {
  type: 'price_update' | 'connection_status';
  data: Record<string, { price: number; change: number; changePercent: number }>;
}

type PriceUpdateCallback = (
  prices: Record<string, { price: number; change: number; changePercent: number }>
) => void;

class PortfolioWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private subscribers: Set<PriceUpdateCallback> = new Set();
  private subscribedTickers: Set<string> = new Set();
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private fallbackPollingInterval: NodeJS.Timeout | null = null;
  private useFallback = false;

  /**
   * Connect to WebSocket server
   */
  connect(wsUrl?: string): void {
    // If WebSocket URL not provided, use fallback polling
    if (!wsUrl) {
      console.log('WebSocket URL not provided, using polling fallback');
      this.useFallback = true;
      this.startFallbackPolling();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Resubscribe to all tickers
        if (this.subscribedTickers.size > 0) {
          this.subscribe(Array.from(this.subscribedTickers));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'price_update') {
            this.notifySubscribers(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect(wsUrl);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.useFallback = true;
      this.startFallbackPolling();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(wsUrl?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, using polling fallback');
      this.useFallback = true;
      this.startFallbackPolling();
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect(wsUrl);
    }, this.reconnectDelay);
  }

  /**
   * Start fallback polling if WebSocket unavailable
   */
  private startFallbackPolling(): void {
    if (this.fallbackPollingInterval) {
      return; // Already polling
    }

    console.log('Starting fallback polling for price updates');
    this.fallbackPollingInterval = setInterval(() => {
      if (this.subscribedTickers.size > 0) {
        this.fetchPrices(Array.from(this.subscribedTickers));
      }
    }, 30000); // Poll every 30 seconds (same as useQuotes hook)
  }

  /**
   * Fetch prices via API (fallback)
   */
  private async fetchPrices(tickers: string[]): Promise<void> {
    try {
      const symbolsParam = tickers.join(',');
      const response = await fetch(`/api/quote?symbols=${symbolsParam}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const quotes = await response.json();
      const prices: Record<string, { price: number; change: number; changePercent: number }> = {};

      quotes.forEach((quote: any) => {
        prices[quote.symbol] = {
          price: quote.price || 0,
          change: quote.change || 0,
          changePercent: quote.changePct || 0,
        };
      });

      this.notifySubscribers(prices);
    } catch (error) {
      console.error('Error fetching prices in fallback mode:', error);
    }
  }

  /**
   * Subscribe to price updates for tickers
   */
  subscribe(tickers: string[]): void {
    tickers.forEach((ticker) => this.subscribedTickers.add(ticker));

    if (this.useFallback) {
      // Start polling if not already
      if (!this.fallbackPollingInterval) {
        this.startFallbackPolling();
      }
      // Fetch immediately
      this.fetchPrices(tickers);
    } else if (this.isConnected && this.ws) {
      // Send subscription message to WebSocket
      this.ws.send(
        JSON.stringify({
          type: 'subscribe',
          tickers: tickers,
        })
      );
    }
  }

  /**
   * Unsubscribe from tickers
   */
  unsubscribe(tickers: string[]): void {
    tickers.forEach((ticker) => this.subscribedTickers.delete(ticker));

    if (this.isConnected && this.ws) {
      this.ws.send(
        JSON.stringify({
          type: 'unsubscribe',
          tickers: tickers,
        })
      );
    }
  }

  /**
   * Subscribe to price updates
   */
  onPriceUpdate(callback: PriceUpdateCallback): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of price updates
   */
  private notifySubscribers(
    prices: Record<string, { price: number; change: number; changePercent: number }>
  ): void {
    // Throttle updates to max 1 per second
    this.subscribers.forEach((callback) => {
      try {
        callback(prices);
      } catch (error) {
        console.error('Error in price update callback:', error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.fallbackPollingInterval) {
      clearInterval(this.fallbackPollingInterval);
      this.fallbackPollingInterval = null;
    }

    this.subscribers.clear();
    this.subscribedTickers.clear();
    this.isConnected = false;
  }
}

// Singleton instance
export const portfolioWebSocket = new PortfolioWebSocket();











