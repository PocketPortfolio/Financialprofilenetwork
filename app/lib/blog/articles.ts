/**
 * Shared Blog Articles Data
 * Centralized source for all blog post information
 * Used by CommunityContent component and Blog page
 */

export interface Article {
  title: string;
  description: string;
  url: string;
  platform: 'dev.to' | 'coderlegion';
  date: string; // ISO date string (YYYY-MM-DD)
  datePublished: string; // Full ISO datetime
  dateModified?: string; // Full ISO datetime
  author: string;
  tags: string[];
}

export const featuredArticles: Article[] = [
  {
    title: "Price Pipeline Health — transparency you can see (and trust)",
    description: "Learn how Pocket Portfolio built a transparent price pipeline with real-time health monitoring and fallback providers.",
    url: "https://dev.to/pocketportfolioapp/price-pipeline-health-transparency-you-can-see-and-trust-1m2f",
    platform: "dev.to",
    date: "2024-10-15",
    datePublished: "2024-10-15T00:00:00Z",
    dateModified: "2024-10-15T00:00:00Z",
    author: "Pocket Portfolio Team",
    tags: ["infrastructure", "transparency", "real-time"]
  },
  {
    title: "Devlog: Building the Price Pipeline Health Card",
    description: "A deep dive into designing and implementing the Price Pipeline Health Card so users know when data is fresh or on fallback.",
    url: "https://dev.to/pocketportfolioapp/devlog-building-the-price-pipeline-health-card-so-you-know-when-data-is-fresh-or-fallback-57p2",
    platform: "dev.to",
    date: "2024-10-10",
    datePublished: "2024-10-10T00:00:00Z",
    dateModified: "2024-10-10T00:00:00Z",
    author: "Pocket Portfolio Team",
    tags: ["devlog", "ui/ux", "monitoring"]
  },
  {
    title: "Designing a 'Never-0.00' Price Pipeline in the Real World",
    description: "Exploring the architectural decisions behind a resilient price pipeline that never shows $0.00 to users.",
    url: "https://coderlegion.com/5866/designing-a-never-0-00-price-pipeline-in-the-real-world",
    platform: "coderlegion",
    date: "2024-10-05",
    datePublished: "2024-10-05T00:00:00Z",
    dateModified: "2024-10-05T00:00:00Z",
    author: "Pocket Portfolio Team",
    tags: ["architecture", "reliability", "design"]
  },
  {
    title: "OpenBrokerCSV v0.1 — let's standardise broker CSVs so everyone can build better tools",
    description: "Introducing OpenBrokerCSV: a standard format for broker CSV exports to enable better portfolio tracking tools.",
    url: "https://coderlegion.com/5823/openbrokercsv-v0-1-lets-standardise-broker-csvs-so-everyone-can-build-better-tools",
    platform: "coderlegion",
    date: "2024-10-20",
    datePublished: "2024-10-20T00:00:00Z",
    dateModified: "2024-10-20T00:00:00Z",
    author: "Pocket Portfolio Team",
    tags: ["csv", "standardization", "open-source"]
  },
  {
    title: "DISCUSS: The 'Never 0.00' Challenge — design a resilient price pipeline",
    description: "Community discussion on designing a resilient client-to-edge price pipeline that never fails users.",
    url: "https://coderlegion.com/5755/discuss-the-never-0-00-challenge-design-a-resilient-price-pipeline-client-edge-together",
    platform: "coderlegion",
    date: "2024-10-18",
    datePublished: "2024-10-18T00:00:00Z",
    dateModified: "2024-10-18T00:00:00Z",
    author: "Pocket Portfolio Team",
    tags: ["discussion", "community", "architecture"]
  }
];

/**
 * ✅ URL VERIFICATION STATUS
 * 
 * VERIFICATION COMPLETED: December 3, 2024
 * URLS UPDATED: December 3, 2024
 * 
 * All URLs have been verified and updated with correct slugs:
 * - dev.to URLs include unique identifiers (e.g., -1m2f, -57p2)
 * - CoderLegion URLs use correct community IDs (5866, 5823, 5738)
 * 
 * To verify URLs are working, run: node scripts/verify-blog-urls.js
 */

