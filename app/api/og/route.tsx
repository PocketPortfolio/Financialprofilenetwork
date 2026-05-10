import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

/**
 * OG Image — brand-correct, thumbnail-resilient.
 *
 * Brand law (CLAUDE.md):
 *   - No generic fintech blue. Primary accent: #f59e0b (Amber, var(--accent-warm)).
 *   - Surfaces: var(--bg) #0b0d10 / var(--surface) #111418.
 *   - Aesthetic: Terminal / Pro Reference Manual — high density, clean borders.
 *
 * Composition is full-bleed, left-aligned, with edge-to-edge type so the brand
 * remains legible at iMessage / X / LinkedIn / WhatsApp thumbnail sizes
 * (where the previous tiny-card-on-white design read as "blank / corrupted").
 *
 * We buffer to a Node Buffer and set Content-Length explicitly — some social
 * scrapers (notably WhatsApp) reject chunked-encoded OG images.
 */

const BG = '#0b0d10';
const SURFACE = '#111418';
const SURFACE_ELEVATED = '#1a1e24';
const TEXT = '#e7eaf0';
const TEXT_SECONDARY = '#9aa3ae';
const BORDER_SUBTLE = '#1f242c';
const ACCENT_WARM = '#f59e0b';
const TEXT_WARM = '#fbbf24';

const SITE_HOST = 'pocketportfolio.app';
const TAGLINE = 'Sovereign · Local-First · Evidence-First';

function clamp(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function renderCard(title: string, description: string) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        backgroundImage: `radial-gradient(ellipse 1100px 600px at 90% -10%, ${SURFACE_ELEVATED} 0%, ${BG} 60%), radial-gradient(ellipse 800px 400px at -5% 110%, rgba(245,158,11,0.10) 0%, ${BG} 55%)`,
        color: TEXT,
        padding: '64px 72px',
        position: 'relative',
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${BORDER_SUBTLE} 1px, transparent 1px), linear-gradient(90deg, ${BORDER_SUBTLE} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.35,
          display: 'flex',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: ACCENT_WARM,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BG,
            fontWeight: 800,
            fontSize: '24px',
            letterSpacing: '-0.02em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          PP
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: TEXT,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Pocket Portfolio
          </div>
          <div
            style={{
              fontSize: '15px',
              color: TEXT_WARM,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              display: 'flex',
            }}
          >
            {TAGLINE}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginTop: '36px',
          marginBottom: '24px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '88px',
            height: '6px',
            background: ACCENT_WARM,
            borderRadius: '3px',
            marginBottom: '28px',
            display: 'flex',
          }}
        />
        <div
          style={{
            fontSize: title.length > 38 ? '84px' : '104px',
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: TEXT,
            maxWidth: '1020px',
            display: 'flex',
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              marginTop: '28px',
              fontSize: '36px',
              lineHeight: 1.25,
              color: TEXT_SECONDARY,
              maxWidth: '980px',
              fontWeight: 400,
              display: 'flex',
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '24px',
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: ACCENT_WARM,
              boxShadow: `0 0 16px ${ACCENT_WARM}`,
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: TEXT,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              display: 'flex',
            }}
          >
            {SITE_HOST}
          </div>
        </div>
        <div
          style={{
            fontSize: '20px',
            color: TEXT_WARM,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            display: 'flex',
          }}
        >
          ↳ Ready to import trades
        </div>
      </div>
    </div>
  );
}

async function renderImage(title: string, description: string): Promise<Buffer> {
  const ir = new ImageResponse(renderCard(title, description), {
    width: 1200,
    height: 630,
  });
  const arrayBuf = await ir.arrayBuffer();
  return Buffer.from(arrayBuf);
}

function imageHeaders(byteLength: number): HeadersInit {
  return {
    'Content-Type': 'image/png',
    'Content-Length': byteLength.toString(),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTitle = searchParams.get('title') || 'Pocket Portfolio';
    const rawDescription =
      searchParams.get('description') || 'Sovereign Local-First Wealth Tracker';

    const title = clamp(rawTitle, 80);
    const description = clamp(rawDescription, 140);

    const png = await renderImage(title, description);

    return new Response(new Uint8Array(png), {
      status: 200,
      headers: imageHeaders(png.byteLength),
    });
  } catch (error) {
    console.error('[og] primary render failed:', error);
    try {
      const png = await renderImage(
        'Pocket Portfolio',
        'Sovereign Local-First Wealth Tracker',
      );
      return new Response(new Uint8Array(png), {
        status: 200,
        headers: imageHeaders(png.byteLength),
      });
    } catch (fallbackError) {
      console.error('[og] fallback render failed:', fallbackError);
      return new Response('Failed to generate image', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
}

// Use nodejs runtime for compatibility with our deployment target.
// next/og works on both edge and nodejs; nodejs avoids edge-runtime quirks
// some Vercel regions have hit historically.
export const runtime = 'nodejs';
