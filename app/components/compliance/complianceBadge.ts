export type ComplianceBadge = {
  title: string;
  text: string;
  pill: string;
};

export function complianceBadgeForCountry(countryCode: string): ComplianceBadge {
  const code = countryCode.toUpperCase();

  if (code === 'GB') {
    return {
      title: 'UK Operational Resilience',
      text: 'Aligned with FCA operational resilience frameworks and UK GDPR data boundaries.',
      pill: 'UK FCA / GDPR',
    };
  }

  if (['DE', 'FR', 'NL', 'ES', 'IT', 'IE', 'BE', 'AT', 'PL', 'SE', 'DK', 'FI'].includes(code)) {
    return {
      title: 'EU Financial Resilience',
      text: 'Architecture shaped for DORA and EU AI Act diligence — inspectable processor scope, not a compliance guarantee.',
      pill: 'EU DORA / AI Act',
    };
  }

  if (['US', 'CA', 'AU'].includes(code)) {
    return {
      title: 'Sovereign Data Perimeter',
      text: 'Inspectable BYOC boundary — buyer keeps IdP and approved storage; inference runs over bounded aggregate context.',
      pill: 'BYOC / Inspectable',
    };
  }

  return {
    title: 'Sovereign Data Perimeter',
    text: 'Local-first ingestion with stateless inference — raw ledgers stay at the edge.',
    pill: 'Sovereign / BYOC',
  };
}
