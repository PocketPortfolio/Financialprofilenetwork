/** Whether a cron test send is permitted for the given email (default deny in production). */
export function isCronTestEmailAllowed(email: string): boolean {
  if (process.env.ALLOW_CRON_TEST_EMAIL === 'true') return true;

  const allowlist = process.env.CRON_TEST_EMAIL_ALLOWLIST;
  if (!allowlist?.trim()) return false;

  const normalized = email.trim().toLowerCase();
  const domain = normalized.split('@')[1];
  if (!domain) return false;

  const domains = allowlist.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
  return domains.some((d) => domain === d || domain.endsWith(`.${d}`));
}

/**
 * Gate `?test=1` cron invocations. Auth must already have passed via verifyVercelCron.
 * Returns 403 when test mode is requested but the email is not allowlisted.
 */
export function verifyCronTestMode(
  searchParams: URLSearchParams,
  email?: string,
): { ok: true; isTestRun: boolean; testEmail?: string } | { ok: false; status: number; error: string } {
  if (searchParams.get('test') !== '1') {
    return { ok: true, isTestRun: false };
  }

  const testEmail = (email ?? searchParams.get('email') ?? '').trim().toLowerCase();
  if (!testEmail) {
    return { ok: false, status: 403, error: 'Test mode requires an email' };
  }

  if (!isCronTestEmailAllowed(testEmail)) {
    return { ok: false, status: 403, error: 'Test email not allowed' };
  }

  return { ok: true, isTestRun: true, testEmail };
}
