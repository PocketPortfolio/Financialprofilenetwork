import type { FeedbackTemplate } from './types';

export const FEEDBACK_TEMPLATES: FeedbackTemplate[] = [
  {
    id: 'signal_local_first_speed',
    kind: 'signal',
    label: 'Local-first feels instant',
    draft:
      'Dashboard is responsive and the local-first flow feels instant. Import → insights was smooth.',
  },
  {
    id: 'signal_clean_import_first_pass',
    kind: 'signal',
    label: 'CSV import worked first pass',
    draft:
      'My broker export imported cleanly on the first pass. Column mapping didn’t need manual edits.',
  },
  {
    id: 'signal_trust_boundary_clear',
    kind: 'signal',
    label: 'Boundary is clear',
    draft:
      'The sovereignty boundary is clear: I understand what stays local vs what crosses the wire.',
  },
  {
    id: 'signal_admin_ready_export',
    kind: 'signal',
    label: 'Export is audit-friendly',
    draft: 'The export and reporting surfaces feel audit-friendly and easy to validate.',
  },
  {
    id: 'friction_mapping_confusing',
    kind: 'friction',
    label: 'Mapping needed work',
    draft:
      'I had to adjust column mapping manually. The UI could better explain what it inferred and why.',
  },
  {
    id: 'friction_dashboard_navigation',
    kind: 'friction',
    label: 'Dashboard navigation friction',
    draft:
      'Finding key actions in the dashboard took too long. I had to click around to locate imports/insights.',
  },
  {
    id: 'friction_context_explanation',
    kind: 'friction',
    label: 'Context explanation unclear',
    draft:
      'I’m not fully sure what the context engine included/excluded. I want a clearer preview of the aggregate.',
  },
  {
    id: 'friction_performance_jank',
    kind: 'friction',
    label: 'Performance jank',
    draft: 'Scrolling or switching tabs felt janky on my machine. I saw noticeable UI lag.',
  },
  {
    id: 'break_parser_failure',
    kind: 'break',
    label: 'Parser failed on export',
    draft:
      'The parser failed on my broker export. Import didn’t complete and I couldn’t recover without retrying.',
  },
  {
    id: 'break_context_missed_data',
    kind: 'break',
    label: 'Context missed data',
    draft:
      'The context engine missed positions/trades I expected to see reflected in the summary.',
  },
  {
    id: 'break_quotes_or_market_data',
    kind: 'break',
    label: 'Market data broke',
    draft: 'Quotes/market data failed to load or showed stale values. It blocked verification.',
  },
  {
    id: 'break_auth_or_sync',
    kind: 'break',
    label: 'Auth/sync broke',
    draft:
      'Sign-in or sync behavior broke (loop, stale state, or unexpected logout). It prevented normal use.',
  },
];

export const FEEDBACK_TEMPLATE_IDS = new Set(FEEDBACK_TEMPLATES.map((t) => t.id));

