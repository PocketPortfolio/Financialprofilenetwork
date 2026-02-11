import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BOOK_DIR = path.join(process.cwd(), 'docs', 'book');

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const flatSegments = pathSegments.flatMap((p) => (typeof p === 'string' && p.includes('/') ? p.split('/') : [p]));
  const safeSegments = flatSegments.filter((p) => p !== '..' && p !== '');
  const absolutePath = path.normalize(path.resolve(BOOK_DIR, ...safeSegments));
  const allowedDir = path.resolve(BOOK_DIR);
  const exists = fs.existsSync(absolutePath);
  const isFile = exists ? fs.statSync(absolutePath).isFile() : false;
  const withinAllowed = path.normalize(absolutePath).startsWith(path.normalize(allowedDir));
  if (!withinAllowed || !exists || !isFile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const content = fs.readFileSync(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const types: Record<string, string> = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  const contentType = types[ext] ?? 'application/octet-stream';
  return new NextResponse(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
