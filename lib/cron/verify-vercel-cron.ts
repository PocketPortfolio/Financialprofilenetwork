/** Shared auth guard for Vercel Cron → App Router handlers. */
export function verifyVercelCron(request: Request): { ok: true } | { ok: false; status: number; error: string } {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured');
    return { ok: false, status: 500, error: 'Cron not configured' };
  }

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1';

  if (!isAuthorized) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}
