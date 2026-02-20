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
  let content: Buffer | Uint8Array = fs.readFileSync(absolutePath);
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const ext = path.extname(absolutePath).toLowerCase();

  // Strip invalid XML control chars (0x00-0x1F except tab, LF, CR) from SVG so parsers never see PCDATA errors
  let didSanitize = false;
  if (ext === '.svg') {
    let sanitized: Buffer | null = null;
    for (let i = 0; i < buf.length; i++) {
      const b = buf[i];
      if (b < 32 && b !== 9 && b !== 10 && b !== 13) {
        if (sanitized === null) sanitized = Buffer.from(buf);
        sanitized[i] = 0x20;
        didSanitize = true;
      }
    }
    if (sanitized !== null) content = sanitized;
  }

  const types: Record<string, string> = {
    '.svg': 'image/svg+xml; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  const contentType = types[ext] ?? 'application/octet-stream';
  const cacheControl = ext === '.svg' ? 'public, max-age=3600' : 'public, max-age=86400';
  return new NextResponse(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
  });
}
