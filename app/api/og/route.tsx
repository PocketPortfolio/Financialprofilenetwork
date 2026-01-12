import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Pocket Portfolio';
    const description = searchParams.get('description') || 'Track your investments with real-time portfolio analytics';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'linear-gradient(45deg, #f1f5f9 0%, #e2e8f0 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              padding: '60px',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '800px',
              margin: '40px',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '32px',
                color: '#64748b',
                textAlign: 'center',
                lineHeight: '1.4',
                maxWidth: '600px',
              }}
            >
              {description}
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                marginTop: '32px',
                textAlign: 'center',
              }}
            >
              pocketportfolio.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Error generating OG image:', error);
    // Return a fallback image instead of error to ensure social platforms always get an image
    try {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0b1220',
              color: '#ff6b35',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                marginBottom: '24px',
              }}
            >
              Pocket Portfolio
            </div>
            <div
              style={{
                fontSize: '32px',
                color: '#94a3b8',
              }}
            >
              Track your investments
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    } catch (fallbackError) {
      console.error('Fallback image generation also failed:', fallbackError);
      return new Response('Failed to generate image', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  }
}

// Use nodejs runtime for better compatibility with ImageResponse
// Edge runtime can have issues with ImageResponse on some platforms
export const runtime = 'nodejs';

