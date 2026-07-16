/**
 * Local/dev-only feedback prompt overrides (power-user testing without visit gates).
 * Set NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS=hakmeh2020@gmail.com in .env.local
 */
export function getFeedbackDevForceEmails(): Set<string> {
  const raw =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS) ||
    '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isFeedbackDevForceEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  // Client bundle only gets NEXT_PUBLIC_* — restrict to non-production builds.
  if (process.env.NODE_ENV === 'production') return false;
  return getFeedbackDevForceEmails().has(email.trim().toLowerCase());
}
