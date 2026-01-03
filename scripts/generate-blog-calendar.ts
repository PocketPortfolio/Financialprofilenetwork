/**
 * Generate 104 blog post calendar entries
 * 2 posts per week for 52 weeks
 */

interface BlogPost {
  id: string;
  date: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  keywords: string[];
}

const pillars = {
  philosophy: [
    'The Death of the Cloud Portfolio: Why Vendor Lock-in Kills Financial Freedom',
    'The Case for Local-First Finance: Your Data, Your Rules',
    'Why Cloud Portfolios are Traps: The Hidden Cost of Convenience',
    'Data Sovereignty: The New Frontier of Financial Independence',
    'The Psychology of Vendor Lock-in: Why We Accept Digital Serfdom',
    'JSON Finance: The Open Standard That Breaks Wall Street\'s Grip',
    'From SaaS to Sovereignty: The Evolution of Personal Finance Tools',
    'The Local-First Manifesto: Why Your Portfolio Belongs on Your Drive',
    'Breaking Free: How JSON Unlocks True Financial Data Ownership',
    'The Cloud is Someone Else\'s Computer: Why Finance Should Stay Local',
    'Vendor Lock-in is Theft: The Economic Case for Data Sovereignty',
    'The Decentralized Portfolio: Beyond the Cloud',
    'Your Financial Data is Not a Product: The Ethics of Data Ownership',
    'The Open Source Advantage: Why Transparency Beats Trust',
    'From Prisoner to Sovereign: Escaping Financial Data Jails',
    'The JSON Revolution: How Raw Data Changes Everything',
    'Privacy is Profit: The Business Case for Local-First Finance',
    'The Cloud Portfolio Scam: What They Don\'t Tell You',
    'Data Portability: The Right They Don\'t Want You to Have',
    'The Sovereign Investor: Taking Control of Your Financial Future',
    'Beyond the API: Why Direct File Access Matters',
    'The Local-First Movement: Finance\'s Next Evolution',
    'JSON vs. Proprietary: The Format War for Your Data',
    'The Cost of Convenience: Hidden Fees in Cloud Portfolios',
    'The Developer\'s Portfolio: Code Your Way to Freedom',
    'The Open Standard Advantage: Why JSON Wins',
  ],
  technical: [
    'Parsing 1 Million Trades in JSON: Performance Benchmarks for Local-First Finance',
    'Schema Design for Financial Data: Building Robust JSON Structures',
    'Optimizing JSON Parsing: From 10s to 10ms',
    'Version Control for Portfolios: Git as a Financial Tool',
    'Building a Bidirectional Sync Engine: Technical Deep Dive',
    'JSON Schema Validation: Ensuring Data Integrity',
    'Handling Large Datasets: Streaming JSON Parsing Strategies',
    'The Architecture of Sovereign Sync: How It Really Works',
    'Performance Optimization: Making JSON Finance Fast',
    'Error Handling in Financial Data: Building Resilient Parsers',
    'Type Safety for Financial Data: TypeScript Meets JSON',
    'Caching Strategies for Local-First Applications',
    'The JSON API: Building Programmatic Access to Your Portfolio',
    'Data Migration Patterns: Moving from Cloud to Local',
    'Conflict Resolution in Bidirectional Sync',
    'Building a Financial Data Pipeline: From CSV to JSON',
    'The Power of Raw Data: Why JSON Beats Databases',
    'Streaming Large Financial Datasets: Techniques and Trade-offs',
    'Schema Evolution: Managing Changes in Financial Data Structures',
    'The Technical Debt of Cloud Portfolios',
    'Building a Local-First Financial App: Architecture Patterns',
    'JSON Compression: Reducing File Sizes Without Losing Data',
    'The Performance Cost of Cloud APIs',
    'Building Resilient Sync: Handling Network Failures',
    'The Developer Experience of JSON Finance',
    'From REST to Files: A New Paradigm for Financial APIs',
  ],
  market: [
    'The Psychology of Panic Selling: What Data Reveals',
    'Dollar Cost Averaging vs. Lump Sum: A Data-Driven Analysis',
    'Market Timing is Dead: What 10 Years of Data Shows',
    'The Behavioral Economics of Portfolio Management',
    'Why Most Investors Underperform: The Data Doesn\'t Lie',
    'The Rebalancing Myth: When to Actually Adjust Your Portfolio',
    'Tax-Loss Harvesting: The Strategy That Actually Works',
    'The Hidden Costs of Active Trading: A Data Analysis',
    'Market Volatility: Friend or Foe? The Numbers Tell the Story',
    'The Power of Compounding: Visualizing Long-Term Growth',
    'Sector Rotation Strategies: What the Data Reveals',
    'The Impact of Fees on Long-Term Returns',
    'Dividend Investing: The Strategy That Time Forgot',
    'The Psychology of FOMO: Data on Emotional Trading',
    'Market Crashes: Patterns and Predictions from History',
    'The Efficient Market Hypothesis: Still Relevant?',
    'Value vs. Growth: What 20 Years of Data Shows',
    'The Small-Cap Advantage: Myth or Reality?',
    'International Diversification: The Numbers Behind the Strategy',
    'The Bond-Equity Correlation: What Changes in Crisis',
    'The Impact of Inflation on Portfolio Returns',
    'Market Sentiment Indicators: What Actually Works',
    'The January Effect: Fact or Fiction?',
    'The Weekend Effect: Trading Patterns Revealed',
    'The Momentum Factor: Persistence or Persistence Bias?',
    'The Low-Volatility Anomaly: Why Safe Stocks Outperform',
  ],
  product: [
    'Sovereign Sync: The End of Vendor Lock-in',
    'Introducing JSON Portfolio Management: A New Era',
    'Why We Built Sovereign Sync: The Story Behind the Feature',
    'The Roadmap to Data Sovereignty: What\'s Next',
    'Sovereign Sync vs. Cloud Portfolios: A Feature Comparison',
    'How Sovereign Sync Works: A Technical Overview',
    'The Future of Portfolio Management: Local-First and Open',
    'Building the Developer-First Portfolio Tool',
    'Why JSON? The Design Decision That Changed Everything',
    'The Evolution of Pocket Portfolio: From Cloud to Sovereign',
    'Sovereign Sync: Early Adopter Stories',
    'The Security Model of Local-First Finance',
    'How to Migrate from Cloud to Sovereign: A Guide',
    'The Benefits of Bidirectional Sync: Real User Stories',
    'Sovereign Sync: Frequently Asked Questions',
    'The Philosophy Behind Pocket Portfolio\'s Design',
    'Why We Chose Google Drive: The Technical Rationale',
    'The Developer Tools: JSON Schema and Seed Files',
    'Sovereign Sync: Performance and Reliability',
    'The Community Behind Sovereign Sync',
    'What Makes Pocket Portfolio Different: The Sovereign Advantage',
    'The Road to 1.0: What We\'ve Learned',
    'Sovereign Sync: Security and Privacy Deep Dive',
    'The API-First Approach: Programmatic Portfolio Management',
    'Why Open Source Matters: The Pocket Portfolio Story',
    'The Future of Financial Data: Predictions and Trends',
  ],
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

function getKeywords(pillar: string, title: string): string[] {
  const baseKeywords = {
    philosophy: ['data sovereignty', 'local-first', 'vendor lock-in', 'financial freedom'],
    technical: ['json', 'performance', 'local-first', 'financial data', 'developer tools'],
    market: ['investment strategy', 'portfolio management', 'market analysis', 'data-driven'],
    product: ['sovereign sync', 'pocket portfolio', 'json finance', 'local-first finance'],
  };

  const pillarKeywords = baseKeywords[pillar as keyof typeof baseKeywords] || [];
  const titleKeywords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 3);

  return [...pillarKeywords, ...titleKeywords].slice(0, 5);
}

function generateCalendar(): BlogPost[] {
  const calendar: BlogPost[] = [];
  const startDate = new Date('2026-01-05'); // Start from Monday, Jan 5, 2026
  let postIndex = 0;

  // Generate 52 weeks (104 posts)
  for (let week = 0; week < 52; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + week * 7);

    // Post 1: Monday
    const monday = new Date(weekStart);
    const pillar1 = Object.keys(pillars)[week % 4] as keyof typeof pillars;
    const titles1 = pillars[pillar1];
    const title1 = titles1[postIndex % titles1.length];

    calendar.push({
      id: `week-${week + 1}-post-1`,
      date: monday.toISOString().split('T')[0],
      title: title1,
      slug: generateSlug(title1),
      status: 'pending',
      pillar: pillar1 as BlogPost['pillar'],
      keywords: getKeywords(pillar1, title1),
    });

    postIndex++;

    // Post 2: Thursday
    const thursday = new Date(weekStart);
    thursday.setDate(weekStart.getDate() + 3);
    const pillar2 = Object.keys(pillars)[(week + 2) % 4] as keyof typeof pillars;
    const titles2 = pillars[pillar2];
    const title2 = titles2[postIndex % titles2.length];

    calendar.push({
      id: `week-${week + 1}-post-2`,
      date: thursday.toISOString().split('T')[0],
      title: title2,
      slug: generateSlug(title2),
      status: 'pending',
      pillar: pillar2 as BlogPost['pillar'],
      keywords: getKeywords(pillar2, title2),
    });

    postIndex++;
  }

  return calendar;
}

// Generate and save calendar
import fs from 'fs';
import path from 'path';

const calendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');

// Preserve NYE post if it exists
let nyePost: BlogPost | null = null;
if (fs.existsSync(calendarPath)) {
  const existingCalendar = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
  nyePost = existingCalendar.find((post: BlogPost) => post.id === 'nye-2025-review') || null;
}

const calendar = generateCalendar();

// Prepend NYE post if it exists
const finalCalendar = nyePost ? [nyePost, ...calendar] : calendar;

fs.writeFileSync(calendarPath, JSON.stringify(finalCalendar, null, 2));

console.log(`✅ Generated ${calendar.length} blog post entries`);
if (nyePost) {
  console.log(`📅 Preserved NYE post: ${nyePost.title}`);
}
console.log(`📅 First regular post: ${calendar[0].date} - ${calendar[0].title}`);
console.log(`📅 Calendar saved to: ${calendarPath}`);

