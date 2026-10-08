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
      title: 'You keep the store',
      text: 'You keep login and approved storage. AI only sees a small approved summary — not a copy of the client ledger.',
      pill: 'You keep the store',
    };
  }

  return {
    title: 'You keep the store',
    text: 'Import stays close to the user. The model sees an approved summary — not the raw ledger as a vendor warehouse.',
    pill: 'Summary, not the ledger',
  };
}
