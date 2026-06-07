/** Routes wrapped by `DashboardClientLayout` (desktop rail shell). */
const DASHBOARD_SHELL_PREFIXES = [
  '/dashboard',
  '/positions',
  '/watchlist',
  '/settings',
  '/import',
  '/live',
] as const;

export function isDashboardShellPath(pathname: string | null | undefined): boolean {
  const p = pathname ?? '';
  return DASHBOARD_SHELL_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`)
  );
}
