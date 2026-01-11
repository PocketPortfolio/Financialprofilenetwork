import { TwitterClient } from './twitter-client';
import { generateWarModeUpdate, generateResearchDrop } from './content-fetcher';

/**
 * Social Media Scheduler
 * OPERATION METRONOME - Automated Social Infrastructure
 * 
 * SAFETY LOCKS:
 * - Read-only for mentions (no automated replies)
 * - Only posts scheduled content
 * - All posts are logged
 */
export class SocialScheduler {
  private twitter: TwitterClient;

  constructor() {
    this.twitter = new TwitterClient();
  }

  /**
   * 09:00 UK "WAR MODE" Update
   * Posts real-time stats: Day of year, indexed pages, NPM downloads
   */
  async postWarModeUpdate(): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    try {
      console.log('[METRONOME] Generating 09:00 UK War Mode update...');
      
      const text = await generateWarModeUpdate();
      
      if (text.length > 280) {
        throw new Error(`Tweet too long: ${text.length} characters`);
      }

      const result = await this.twitter.postTweet(text);
      
      console.log(`[METRONOME] ✅ War Mode update posted: ${result.id}`);
      console.log(`[METRONOME] Text: ${text}`);

      return {
        success: true,
        tweetId: result.id,
      };
    } catch (error: any) {
      console.error('[METRONOME] ❌ War Mode update failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 18:00 UK "RESEARCH" Drop
   * Posts latest research pillar post
   */
  async postResearchDrop(): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    try {
      console.log('[METRONOME] Generating 18:00 UK Research drop...');
      
      const text = await generateResearchDrop();
      
      if (!text) {
        return {
          success: false,
          error: 'No research post available',
        };
      }

      if (text.length > 280) {
        // Truncate if needed (shouldn't happen, but safety check)
        const truncated = text.substring(0, 277) + '...';
        console.warn('[METRONOME] Tweet truncated to 280 chars');
        const result = await this.twitter.postTweet(truncated);
        return {
          success: true,
          tweetId: result.id,
        };
      }

      const result = await this.twitter.postTweet(text);
      
      console.log(`[METRONOME] ✅ Research drop posted: ${result.id}`);
      console.log(`[METRONOME] Text: ${text}`);

      return {
        success: true,
        tweetId: result.id,
      };
    } catch (error: any) {
      console.error('[METRONOME] ❌ Research drop failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return await this.twitter.verifyCredentials();
  }
}

