export type FeedbackSurface = 'pocket' | 'open';

export type FeedbackFriction = 'frictionless' | 'broken';

export type FeedbackSeverityClass = 'P0' | 'P1' | 'P2';

export type FeedbackTierBand = 'free' | 'foundersClub' | 'corporateSponsor' | 'unknown';

export type FeedbackCategory =
  | 'signal_local_first_speed'
  | 'signal_clean_import_first_pass'
  | 'signal_trust_boundary_clear'
  | 'signal_admin_ready_export'
  | 'friction_mapping_confusing'
  | 'friction_dashboard_navigation'
  | 'friction_context_explanation'
  | 'friction_performance_jank'
  | 'break_parser_failure'
  | 'break_context_missed_data'
  | 'break_quotes_or_market_data'
  | 'break_auth_or_sync'
  | 'other';

export type FeedbackTemplateKind = 'signal' | 'friction' | 'break';

export type FeedbackTemplate = {
  id: FeedbackCategory;
  kind: FeedbackTemplateKind;
  label: string;
  draft: string;
};

export type ScrubRedactionKind =
  | 'EMAIL'
  | 'PHONE'
  | 'IBAN'
  | 'CARD'
  | 'ACCOUNT_ID'
  | 'ADDRESS_LINE'
  | 'LEDGER_ROW'
  | 'LONG_ID'
  | 'AMOUNT'
  | 'TRUNCATED';

export type ScrubbedTextMeta = {
  redactions: Array<{ kind: ScrubRedactionKind; count: number }>;
  truncated: boolean;
  originalLength: number;
  finalLength: number;
};

export type ScrubbedText = {
  text: string;
  meta: ScrubbedTextMeta;
};

export type FeedbackSubmissionDraft = {
  surface: FeedbackSurface;
  rating: number; // 1..5
  friction: FeedbackFriction;
  category: FeedbackCategory;
  comment: string;
};

