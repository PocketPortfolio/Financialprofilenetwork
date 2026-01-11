import { TwitterApi } from 'twitter-api-v2';

/**
 * Twitter/X API Client
 * Read-only for mentions, write-only for scheduled posts
 * OPERATION METRONOME - Automated Social Infrastructure
 */
export class TwitterClient {
  private client: TwitterApi;

  constructor() {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error('Missing Twitter API credentials. Check environment variables.');
    }

    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
  }

  /**
   * Post a tweet (write-only operation)
   * SAFETY: Only called by scheduled cron jobs, never from user interactions
   */
  async postTweet(text: string): Promise<{ id: string; text: string }> {
    try {
      const tweet = await this.client.v2.tweet(text);
      return {
        id: tweet.data.id,
        text: tweet.data.text,
      };
    } catch (error: any) {
      console.error('Twitter API Error:', error);
      throw new Error(`Failed to post tweet: ${error.message}`);
    }
  }

  /**
   * Verify credentials (health check)
   */
  async verifyCredentials(): Promise<boolean> {
    try {
      const me = await this.client.v2.me();
      return !!me.data;
    } catch (error) {
      console.error('Twitter credentials verification failed:', error);
      return false;
    }
  }

  /**
   * Get account info (for testing)
   */
  async getAccountInfo(): Promise<{ username: string; name: string } | null> {
    try {
      const me = await this.client.v2.me();
      return {
        username: me.data.username,
        name: me.data.name,
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
      return null;
    }
  }
}

