/**
 * Video Fetcher for Research Posts
 * Searches YouTube Data API v3 for relevant videos matching the topic
 */

interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: number;
  description?: string;
}

/**
 * Fetch relevant YouTube video for a research topic
 * Uses YouTube Data API v3 search endpoint
 */
export async function fetchRelevantVideo(
  topic: string,
  keywords: string[]
): Promise<VideoResult | null> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️  YOUTUBE_API_KEY not set - skipping video fetch');
    return null;
  }

  try {
    // Build search query from topic and keywords
    const searchQuery = `${topic} ${keywords.slice(0, 3).join(' ')}`.trim();
    
    // YouTube Data API v3 search endpoint
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '5'); // Get top 5 results
    url.searchParams.set('order', 'relevance'); // Order by relevance
    url.searchParams.set('videoEmbeddable', 'true'); // Only embeddable videos
    url.searchParams.set('key', YOUTUBE_API_KEY);

    console.log(`🔍 Searching YouTube for: "${searchQuery}"`);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ YouTube API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️  No YouTube videos found for: "${searchQuery}"`);
      return null;
    }

    // Get video details (view count, etc.) for top result
    const topVideo = data.items[0];
    const videoId = topVideo.id.videoId;

    // Fetch video statistics
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('part', 'statistics,snippet');
    statsUrl.searchParams.set('id', videoId);
    statsUrl.searchParams.set('key', YOUTUBE_API_KEY);

    let viewCount: number | undefined;
    let description: string | undefined;

    try {
      const statsResponse = await fetch(statsUrl.toString());
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.items && statsData.items.length > 0) {
          viewCount = parseInt(statsData.items[0].statistics?.viewCount || '0', 10);
          description = statsData.items[0].snippet?.description;
        }
      }
    } catch (statsError) {
      console.warn('⚠️  Could not fetch video statistics, continuing without them');
    }

    const result: VideoResult = {
      videoId,
      title: topVideo.snippet.title,
      channelTitle: topVideo.snippet.channelTitle,
      publishedAt: topVideo.snippet.publishedAt,
      viewCount,
      description,
    };

    console.log(`✅ Found video: "${result.title}" by ${result.channelTitle} (${result.videoId})`);
    if (viewCount) {
      console.log(`   Views: ${viewCount.toLocaleString()}`);
    }

    return result;
  } catch (error: any) {
    console.error(`❌ Error fetching YouTube video:`, error.message);
    return null;
  }
}

