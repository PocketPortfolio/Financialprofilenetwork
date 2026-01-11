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

      // CRITICAL: Validate tweet length and link integrity before posting
      if (text.length > 280) {
        console.error('[METRONOME] ❌ CRITICAL: Tweet exceeds 280 characters! This should never happen.');
        console.error(`[METRONOME] Tweet length: ${text.length}, content: ${text.substring(0, 100)}...`);
        return {
          success: false,
          error: 'Tweet exceeds 280 characters - link truncation protection failed',
        };
      }
      
      // CRITICAL: Verify link is present and not truncated
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';
      
      // Extract link from tweet - look for the full URL pattern
      const linkMatch = text.match(new RegExp(`${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/blog/[a-z0-9-]+`, 'g'));
      
      if (!linkMatch || linkMatch.length === 0) {
        console.error('[METRONOME] ❌ CRITICAL: Link not found in tweet!');
        console.error(`[METRONOME] Tweet ends with: ${text.substring(Math.max(0, text.length - 100))}`);
        return {
          success: false,
          error: 'Link validation failed - link not found',
        };
      }
      
      // Get the last match (in case there are multiple)
      const extractedLink = linkMatch[linkMatch.length - 1];
      
      // CRITICAL: Verify link is complete - check it doesn't end with a hyphen (truncation indicator)
      if (extractedLink.endsWith('-')) {
        console.error('[METRONOME] ❌ CRITICAL: Link ends with hyphen - likely truncated!');
        console.error(`[METRONOME] Extracted link: ${extractedLink}`);
        console.error(`[METRONOME] Tweet ends with: ${text.substring(Math.max(0, text.length - 100))}`);
        return {
          success: false,
          error: 'Link appears truncated (ends with hyphen)',
        };
      }
      
      // Verify link ends tweet (not truncated)
      if (!text.endsWith(extractedLink)) {
        console.error('[METRONOME] ❌ CRITICAL: Link is not at the end of tweet - may be truncated!');
        console.error(`[METRONOME] Extracted link: ${extractedLink}`);
        console.error(`[METRONOME] Tweet ends with: ${text.substring(Math.max(0, text.length - 50))}`);
        return {
          success: false,
          error: 'Link is not at end of tweet - truncation detected',
        };
      }
      
      // Additional validation: Check link length is reasonable (should be ~96 chars for full URL)
      const expectedMinLength = baseUrl.length + '/blog/'.length + 20; // At least 20 chars for slug
      if (extractedLink.length < expectedMinLength) {
        console.error('[METRONOME] ❌ CRITICAL: Link is suspiciously short - may be truncated!');
        console.error(`[METRONOME] Link length: ${extractedLink.length}, expected at least: ${expectedMinLength}`);
        console.error(`[METRONOME] Link: ${extractedLink}`);
        return {
          success: false,
          error: `Link is too short (${extractedLink.length} chars) - likely truncated`,
        };
      }
      
      console.log(`[METRONOME] ✅ Link validated: ${extractedLink} (${extractedLink.length} chars)`);

      const result = await this.twitter.postTweet(text);
      
      console.log(`[METRONOME] ✅ Research drop posted: ${result.id}`);
      console.log(`[METRONOME] Text length: ${text.length} chars`);
      console.log(`[METRONOME] Link: ${extractedLink}`);
      console.log(`[METRONOME] View at: https://x.com/P0cketP0rtf0li0/status/${result.id}`);

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

