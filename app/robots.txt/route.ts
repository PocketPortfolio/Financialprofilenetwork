import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `# Robots.txt for Pocket Portfolio
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: *.json
# Allow sitemap.xml but block other XML files
Disallow: /*.xml
Allow: /sitemap.xml

User-Agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

User-Agent: ChatGPT-User
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

User-Agent: CCBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

User-Agent: anthropic-ai
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

User-Agent: Claude-Web
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

Host: https://pocketportfolio.app
Sitemap: https://pocketportfolio.app/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
