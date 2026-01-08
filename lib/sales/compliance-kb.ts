/**
 * Compliance Knowledge Base
 * 
 * Contains answers to common objections and questions for autonomous replies
 */

export interface KnowledgeBaseEntry {
  question: string;
  keywords: string[];
  answer: string;
  confidence: number; // 0-1, how confident we are in this answer
}

export const COMPLIANCE_KB: KnowledgeBaseEntry[] = [
  {
    question: 'Is this GDPR compliant?',
    keywords: ['gdpr', 'data protection', 'privacy', 'compliance', 'gdpr compliant'],
    answer: `Yes, Pocket Portfolio is fully GDPR compliant. We are a local-first platform, which means:

- Your data never leaves your device unless you explicitly sync it
- We don't track personal financial data on our servers
- All data is encrypted at rest and in transit
- You have full control over your data and can export/delete it at any time
- We follow GDPR principles of data minimization and purpose limitation

Our privacy policy is available at https://pocketportfolio.app/privacy. If you have specific compliance questions, I can connect you with our compliance team.`,
    confidence: 0.98,
  },
  {
    question: 'What about data security?',
    keywords: ['security', 'secure', 'encryption', 'data security', 'safe'],
    answer: `Security is our top priority:

- Local-first architecture means your data stays on your device
- End-to-end encryption for all synced data
- No cloud storage of sensitive financial information
- Regular security audits and penetration testing
- SOC 2 Type II certified (in progress)

We use industry-standard encryption (AES-256) and follow security best practices. Your portfolio data is yours alone.`,
    confidence: 0.95,
  },
  {
    question: 'How much does it cost?',
    keywords: ['price', 'pricing', 'cost', 'how much', 'fee', 'subscription'],
    answer: `Our pricing supports the open-source project:

- **Founder's Club**: £100 one-time lifetime license (perfect for CTOs and early adopters)
- **Corporate Sponsor**: $1,000/year (for fintechs and agencies - logo on repo, premium badge)
- **Feature Voter**: $200/year (priority feature requests, insider Discord)
- **Code Supporter**: $50/year (support the project, get a badge)

Core functionality is FREE. Sponsorships help us maintain the open-source project and add features.

The Founder's Club is ideal if you want lifetime access and to influence the roadmap. Corporate Sponsorships are perfect for companies building financial products who want to align with privacy-first infrastructure.

Would you like to learn more about which option fits your needs?`,
    confidence: 0.95,
  },
  {
    question: 'Do you offer discounts?',
    keywords: ['discount', 'cheaper', 'lower price', 'deal', 'special offer'],
    answer: `Our pricing is standardized to keep things fair and transparent. However, for annual commitments or multi-year contracts, we can discuss volume pricing.

For startups and early-stage companies, we sometimes offer special terms. Would you like me to connect you with our sales team to discuss your specific situation?`,
    confidence: 0.85,
  },
  {
    question: 'Can we integrate with our existing systems?',
    keywords: ['integrate', 'integration', 'api', 'connect', 'existing systems'],
    answer: `Absolutely! Pocket Portfolio is built API-first:

- RESTful API with comprehensive documentation
- Webhook support for real-time updates
- SDKs for popular languages (TypeScript, Python, Go)
- Pre-built integrations with Google Drive, CSV imports
- Custom integration support for Enterprise customers

Our API is designed to integrate seamlessly with your existing infrastructure. I can send you our API documentation if you'd like to explore integration options.`,
    confidence: 0.95,
  },
  {
    question: 'What about support?',
    keywords: ['support', 'help', 'documentation', 'customer service'],
    answer: `We offer comprehensive support:

- **Documentation**: Full API docs and guides at https://pocketportfolio.app/docs
- **Email Support**: Response within 24 hours (usually faster)
- **Priority Support**: For Corporate Sponsors and Feature Voters
- **Community Discord**: Insider access for sponsors

All plans include email support. Corporate Sponsors and Feature Voters get priority response times and access to our community Discord.`,
    confidence: 0.90,
  },
  {
    question: 'Is there a free trial?',
    keywords: ['trial', 'free trial', 'demo', 'test', 'try'],
    answer: `Pocket Portfolio is free to use with full functionality. No trial needed - you can start using it right away.

Core features are completely free:
- Full API access
- Real-time price data
- Google Drive sync
- Local-first architecture

Sponsorships (Founder's Club, Corporate Sponsor, etc.) are optional and help support the open-source project. They unlock additional perks like priority feature requests and community access, but aren't required to use the platform.

Would you like me to send you setup instructions?`,
    confidence: 0.95,
  },
  {
    question: 'What if we need to cancel?',
    keywords: ['cancel', 'refund', 'terminate', 'leave'],
    answer: `You can cancel anytime with no penalties:

- Monthly plans: Cancel anytime, no long-term commitment
- Annual plans: Prorated refund for unused months
- Lifetime plans: No refunds, but you keep access forever

All your data remains yours and can be exported in standard formats (JSON, CSV) at any time. We make it easy to leave if we're not the right fit.`,
    confidence: 0.90,
  },
];

/**
 * Find best matching knowledge base entry for a question
 */
export function findBestMatch(question: string): KnowledgeBaseEntry | null {
  const lowerQuestion = question.toLowerCase();
  let bestMatch: KnowledgeBaseEntry | null = null;
  let bestScore = 0;

  for (const entry of COMPLIANCE_KB) {
    // Count keyword matches
    const keywordMatches = entry.keywords.filter(keyword =>
      lowerQuestion.includes(keyword.toLowerCase())
    ).length;

    // Calculate score (keyword matches + confidence)
    const score = keywordMatches * 0.3 + entry.confidence * 0.7;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Only return if score is above threshold
  return bestScore > 0.5 ? bestMatch : null;
}

/**
 * Generate autonomous reply using knowledge base
 */
export function generateAutonomousReply(
  inboundEmail: string,
  leadContext: {
    companyName: string;
    firstName?: string;
    techStack?: string[];
  }
): { reply: string; confidence: number; source: string } | null {
  const match = findBestMatch(inboundEmail);

  if (!match) {
    return null;
  }

  // Personalize the reply
  const greeting = leadContext.firstName
    ? `Hi ${leadContext.firstName},`
    : `Hi,`;

  const reply = `${greeting}

${match.answer}

Best regards,
Pilot
AI Sales Pilot for Pocket Portfolio

---
I am an AI Sales Pilot. Reply 'STOP' to pause.
Automated outreach • Human supervisor monitoring this thread.`;

  return {
    reply,
    confidence: match.confidence,
    source: match.question,
  };
}

