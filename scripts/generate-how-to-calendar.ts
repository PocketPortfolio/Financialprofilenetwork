/**
 * Generate Full Year 2026 "How to in Tech" calendar entries (Q1-Q4)
 * Creates calendar entries for daily posts at 14:00 UTC
 * Total: 365 daily posts
 */

interface HowToPost {
  id: string;
  date: string;
  scheduledTime: string;
  title: string;
  slug: string;
  status: 'pending';
  category: 'how-to-in-tech';
  pillar: 'technical';
  keywords: string[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractKeywords(title: string): string[] {
  const commonTechTerms = [
    'github', 'api', 'json', 'javascript', 'typescript', 'react', 'next.js',
    'node.js', 'security', 'privacy', 'performance', 'optimization', 'testing',
    'devops', 'docker', 'kubernetes', 'database', 'sql', 'nosql', 'redis',
    'vercel', 'deployment', 'ci/cd', 'git', 'terminal', 'command-line',
    'webpack', 'bundling', 'caching', 'cdn', 'http', 'https', 'ssl', 'tls',
    'authentication', 'authorization', 'oauth', 'jwt', 'cors', 'rate-limiting',
    'monitoring', 'logging', 'analytics', 'seo', 'schema.org', 'robots.txt',
    'environment variables', 'secrets', 'encryption', 'local-first', 'offline',
    'pwa', 'service workers', 'indexeddb', 'localstorage', 'cookies',
    'dark mode', 'responsive', 'accessibility', 'a11y', 'semantic html',
    'css', 'tailwind', 'styled-components', 'sass', 'less', 'postcss',
    'typescript', 'eslint', 'prettier', 'husky', 'lint-staged', 'jest',
    'testing', 'unit tests', 'integration tests', 'e2e', 'cypress', 'playwright',
    'graphql', 'rest', 'grpc', 'websockets', 'server-sent events', 'streaming',
    'microservices', 'monolith', 'serverless', 'edge computing', 'cloudflare',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ansible',
    'linux', 'unix', 'bash', 'shell', 'zsh', 'fish', 'powershell',
    'vim', 'emacs', 'vscode', 'intellij', 'sublime', 'atom',
    'git', 'github', 'gitlab', 'bitbucket', 'mercurial', 'svn',
    'npm', 'yarn', 'pnpm', 'package.json', 'dependencies', 'devdependencies',
    'webpack', 'rollup', 'vite', 'esbuild', 'swc', 'babel', 'typescript',
    'react', 'vue', 'angular', 'svelte', 'solid', 'preact', 'lit',
    'next.js', 'nuxt', 'gatsby', 'remix', 'astro', 'sveltekit',
    'node.js', 'deno', 'bun', 'express', 'fastify', 'koa', 'hapi',
    'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
    'prisma', 'typeorm', 'sequelize', 'mongoose', 'drizzle', 'kysely',
    'tailwind', 'bootstrap', 'material-ui', 'chakra', 'antd', 'mantine',
    'jest', 'vitest', 'mocha', 'chai', 'sinon', 'nock', 'supertest',
    'cypress', 'playwright', 'puppeteer', 'selenium', 'webdriverio',
    'eslint', 'prettier', 'biome', 'rome', 'dprint', 'prettier-eslint',
    'husky', 'lint-staged', 'commitlint', 'conventional-commits',
    'github actions', 'gitlab ci', 'jenkins', 'circleci', 'travis',
    'vercel', 'netlify', 'cloudflare pages', 'aws amplify', 'firebase',
    'docker', 'docker-compose', 'kubernetes', 'helm', 'kustomize',
    'terraform', 'pulumi', 'ansible', 'chef', 'puppet', 'salt',
    'prometheus', 'grafana', 'datadog', 'new relic', 'sentry',
    'logrocket', 'mixpanel', 'amplitude', 'segment', 'posthog',
    'stripe', 'paypal', 'square', 'braintree', 'adyen',
    'sendgrid', 'mailgun', 'postmark', 'ses', 'twilio',
    'auth0', 'firebase auth', 'cognito', 'okta', 'passport',
    'stripe', 'plaid', 'yodlee', 'teller', 'finicity',
    'openai', 'anthropic', 'cohere', 'huggingface', 'replicate',
    'vercel kv', 'upstash', 'redis cloud', 'memcached', 'dragonfly',
    's3', 'cloudfront', 'cloudflare r2', 'bunnycdn', 'backblaze',
    'postgres', 'mysql', 'mariadb', 'cockroachdb', 'yugabyte',
    'mongodb', 'dynamodb', 'couchdb', 'fauna', 'supabase',
    'elasticsearch', 'opensearch', 'meilisearch', 'typesense', 'algolia',
    'kafka', 'rabbitmq', 'nats', 'redis streams', 'pulsar',
    'graphql', 'apollo', 'relay', 'urql', 'graphql-request',
    'tRPC', 'zod', 'yup', 'joi', 'ajv', 'class-validator',
    'react query', 'swr', 'apollo client', 'relay', 'urql',
    'zustand', 'jotai', 'recoil', 'mobx', 'redux', 'valtio',
    'framer motion', 'react-spring', 'gsap', 'lottie', 'react-three-fiber',
    'd3', 'chart.js', 'recharts', 'victory', 'nivo', 'plotly',
    'leaflet', 'mapbox', 'google maps', 'mapzen', 'carto',
    'puppeteer', 'playwright', 'cypress', 'selenium', 'webdriverio',
    'jest', 'vitest', 'mocha', 'ava', 'tap', 'tape',
    'storybook', 'chromatic', 'ladle', 'histoire', 'docz',
    'docusaurus', 'gatsby', 'nextra', 'vitepress', 'mkdocs',
    'mdx', 'remark', 'rehype', 'unified', 'micromark',
    'sharp', 'jimp', 'canvas', 'fabric', 'konva',
    'ffmpeg', 'fluent-ffmpeg', 'node-ffmpeg', 'gifencoder',
    'pdfkit', 'pdfmake', 'jsPDF', 'puppeteer pdf', 'playwright pdf',
    'exceljs', 'xlsx', 'csv-parse', 'csv-stringify', 'papaparse',
    'axios', 'fetch', 'node-fetch', 'undici', 'got', 'ky',
    'ws', 'socket.io', 'sockjs', 'faye', 'pusher', 'ably',
    'ioredis', 'node-redis', 'redis', 'memcached', 'dragonfly',
    'pg', 'mysql2', 'sqlite3', 'tedious', 'oracledb',
    'mongoose', 'typeorm', 'sequelize', 'prisma', 'drizzle',
    'passport', 'next-auth', 'auth0', 'firebase auth', 'cognito',
    'stripe', 'paypal', 'square', 'braintree', 'adyen',
    'sendgrid', 'mailgun', 'postmark', 'ses', 'twilio',
    'aws-sdk', 'gcp', 'azure', 'cloudflare', 'digitalocean',
    'terraform', 'pulumi', 'ansible', 'chef', 'puppet',
    'docker', 'kubernetes', 'helm', 'kustomize', 'skaffold',
    'github actions', 'gitlab ci', 'jenkins', 'circleci', 'travis',
    'vercel', 'netlify', 'cloudflare pages', 'aws amplify', 'firebase',
    'prometheus', 'grafana', 'datadog', 'new relic', 'sentry',
    'logrocket', 'mixpanel', 'amplitude', 'segment', 'posthog',
    'openai', 'anthropic', 'cohere', 'huggingface', 'replicate',
    'stripe', 'plaid', 'yodlee', 'teller', 'finicity'
  ];

  const titleLower = title.toLowerCase();
  const foundKeywords: string[] = [];
  
  // Extract tech terms from title
  for (const term of commonTechTerms) {
    if (titleLower.includes(term.toLowerCase())) {
      foundKeywords.push(term);
    }
  }
  
  // Extract other meaningful words (3-15 chars, not common stop words)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'how', 'to', 'in', 'tech'];
  const words = titleLower
    .split(/[^a-z0-9]+/)
    .filter(w => w.length >= 3 && w.length <= 15 && !stopWords.includes(w));
  
  foundKeywords.push(...words.slice(0, 3));
  
  // Ensure we have at least 3 keywords
  while (foundKeywords.length < 3) {
    foundKeywords.push('technical', 'tutorial', 'guide');
  }
  
  return [...new Set(foundKeywords)].slice(0, 5);
}

const q1Titles = {
  january: [
    { date: 7, title: 'How to Audit Your GitHub Repo for Leaked Secrets' },
    { date: 8, title: 'The 3-Minute Guide to robots.txt for AI Agents' },
    { date: 9, title: 'How to Use curl to Test JSON Endpoints like a Pro' },
    { date: 10, title: 'Understanding "Stale-While-Revalidate" in Next.js' },
    { date: 11, title: 'How to Self-Host Your Own Analytics (Privacy First)' },
    { date: 12, title: 'The Absolute Basics of Local-First Data Architecture' },
    { date: 13, title: 'How to Mock API Responses for Faster Testing' },
    { date: 14, title: 'Stopping the Crawlers: How to Block GPTBot in 2026' },
    { date: 15, title: 'JSON vs. CSV: When to Use Which for Financial Data' },
    { date: 16, title: 'How to Rotate API Keys Without Breaking Production' },
    { date: 17, title: 'The "Unix Philosophy" Applied to Modern Web Apps' },
    { date: 18, title: 'How to Securely Share Environment Variables with Your Team' },
    { date: 19, title: 'Why "Sovereign Sync" is Safer than Cloud Databases' },
    { date: 20, title: 'How to Parse Large JSON Files in Node.js (Streams)' },
    { date: 21, title: 'The Developer\'s Guide to Vercel KV (Redis)' },
    { date: 22, title: 'How to Implement Rate Limiting in 10 Lines of Code' },
    { date: 23, title: 'Understanding CORS Errors (and How to Fix Them)' },
    { date: 24, title: 'How to Use llms.txt to Control AI Context' },
    { date: 25, title: 'The Best Privacy-Focused Open Source Fonts for 2026' },
    { date: 26, title: 'How to structure a Clean JSON API Response' },
    { date: 27, title: 'Automating SEO: How to Inject Schema.org Dynamically' },
    { date: 28, title: 'How to Use "Just-in-Time" Static Generation' },
    { date: 29, title: 'Protecting Your API from DDoS: A Quick Primer' },
    { date: 30, title: 'How to Write a "Robot Resume" for Your Website' },
    { date: 31, title: 'The Tech Stack of a "Zero-Data" Application' },
  ],
  february: [
    { date: 1, title: 'How to Format Currency Correctly in JavaScript (Intl API)' },
    { date: 2, title: 'How to calculate CAGR Programmatically' },
    { date: 3, title: 'Visualizing JSON Data in the Terminal' },
    { date: 4, title: 'How to Build a "Dark Mode" that Actually Respects System Prefs' },
    { date: 5, title: 'Sanitizing User Input: The First Line of Defense' },
    { date: 6, title: 'How to Cache API Calls in LocalStorage' },
    { date: 7, title: 'Building a Simple "Health Check" Endpoint' },
    { date: 8, title: 'How to Use "jq" to Slice JSON Data in the Command Line' },
    { date: 9, title: 'Why You Should Version Your API (v1 vs v2)' },
    { date: 10, title: 'How to Handle Timezones in Financial Apps (UTC Only!)' },
    { date: 11, title: 'Compressing JSON Payloads for Faster Sync' },
    { date: 12, title: 'How to Validate JSON Schema at Runtime' },
    { date: 13, title: 'The Difference Between PUT and PATCH (Explained Simply)' },
    { date: 14, title: 'Valentine\'s Special: How to Fall in Love with TypeScript Enums' },
    { date: 15, title: 'How to Scrape Data Respectfully (Headers & Rates)' },
    { date: 16, title: 'Building a "Retry" Logic for Flaky APIs' },
    { date: 17, title: 'How to Encrypt Data Before Saving to Disk' },
    { date: 18, title: 'Monitoring Vercel Serverless Function Usage' },
    { date: 19, title: 'How to Debounce Search Inputs for Performance' },
    { date: 20, title: 'Understanding HTTP Status Codes: 401 vs 403' },
    { date: 21, title: 'How to Use GitHub Actions for Automated Linting' },
    { date: 22, title: 'The Basics of IndexedDB for Local Storage' },
    { date: 23, title: 'How to Export Data to CSV from JSON' },
    { date: 24, title: 'Lazy Loading Components in React for Speed' },
    { date: 25, title: 'How to Detect "Offline" State in React' },
    { date: 26, title: 'The Power of "Middleware" in Next.js' },
    { date: 27, title: 'How to structure a "Monorepo" for Side Projects' },
    { date: 28, title: 'February Retro: 3 Tools We Deprecated This Month' },
  ],
  march: [
    { date: 1, title: 'How to Optimize Images for the Modern Web (AVIF/WebP)' },
    { date: 2, title: 'Reducing Bundle Size: Finding the Heavy Dependencies' },
    { date: 3, title: 'How to Use "Prefetching" to Make Links Feel Instant' },
    { date: 4, title: 'Understanding Core Web Vitals (LCP, CLS, INP)' },
    { date: 5, title: 'How to Profile React Performance with DevTools' },
    { date: 6, title: 'Server-Side Rendering vs. Static Site Generation: The 2026 Verdict' },
    { date: 7, title: 'How to Implement "Virtual Scrolling" for Long Lists' },
    { date: 8, title: 'Speeding Up Your CI/CD Pipeline' },
    { date: 9, title: 'How to Use CDNs Effectively for Static Assets' },
    { date: 10, title: 'Memoization in React: When (and When Not) to Use It' },
    { date: 11, title: 'How to Optimize Font Loading (No Flash of Invisible Text)' },
    { date: 12, title: 'Tree Shaking: Removing Dead Code Automatically' },
    { date: 13, title: 'How to Use Web Workers for Heavy Calculations' },
    { date: 14, title: 'Pi Day: Calculating Portfolio Mathematics Efficiently' },
    { date: 15, title: 'How to Analyze Your Network Waterfall' },
    { date: 16, title: 'Reducing TTFB (Time to First Byte) on Serverless' },
    { date: 17, title: 'How to Use "Edge Caching" for Dynamic Content' },
    { date: 18, title: 'Optimizing SQL Queries (Even if You Use an ORM)' },
    { date: 19, title: 'How to Lazy Load Third-Party Scripts' },
    { date: 20, title: 'Understanding the "Critical Rendering Path"' },
    { date: 21, title: 'How to Use dns-prefetch for External APIs' },
    { date: 22, title: 'CSS Containment: Improving Rendering Performance' },
    { date: 23, title: 'How to Compress Text Responses (Brotli vs Gzip)' },
    { date: 24, title: 'Optimizing SVG Icons for the Web' },
    { date: 25, title: 'How to Use the Performance API in JavaScript' },
    { date: 26, title: 'Reducing Layout Thrashing in DOM Manipulations' },
    { date: 27, title: 'How to optimize your package.json dependencies' },
    { date: 28, title: 'Service Workers: Caching Assets for Offline Use' },
    { date: 29, title: 'How to Use "Skeleton Screens" to Improve Perceived Performance' },
    { date: 30, title: 'Minimizing Main Thread Work' },
    { date: 31, title: 'March Retro: The Fastest Stack Wins' },
  ]
};

function generateCalendar(): HowToPost[] {
  const calendar: HowToPost[] = [];
  
  // January 2026
  for (const item of q1Titles.january) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-jan-${item.date}`,
      date: `2026-01-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // February 2026
  for (const item of q1Titles.february) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-feb-${item.date}`,
      date: `2026-02-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // March 2026
  for (const item of q1Titles.march) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-mar-${item.date}`,
      date: `2026-03-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // April 2026 (Q2)
  for (const item of q2Titles.april) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-apr-${item.date}`,
      date: `2026-04-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // May 2026 (Q2)
  for (const item of q2Titles.may) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-may-${item.date}`,
      date: `2026-05-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // June 2026 (Q2)
  for (const item of q2Titles.june) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-jun-${item.date}`,
      date: `2026-06-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // July 2026 (Q3)
  for (const item of q3Titles.july) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-jul-${item.date}`,
      date: `2026-07-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // August 2026 (Q3)
  for (const item of q3Titles.august) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-aug-${item.date}`,
      date: `2026-08-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // September 2026 (Q3)
  for (const item of q3Titles.september) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-sep-${item.date}`,
      date: `2026-09-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // October 2026 (Q4)
  for (const item of q4Titles.october) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-oct-${item.date}`,
      date: `2026-10-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // November 2026 (Q4)
  for (const item of q4Titles.november) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-nov-${item.date}`,
      date: `2026-11-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  // December 2026 (Q4)
  for (const item of q4Titles.december) {
    calendar.push({
      id: `how-to-${generateSlug(item.title)}-dec-${item.date}`,
      date: `2026-12-${String(item.date).padStart(2, '0')}`,
      scheduledTime: '14:00',
      title: item.title,
      slug: generateSlug(item.title),
      status: 'pending',
      category: 'how-to-in-tech',
      pillar: 'technical',
      keywords: extractKeywords(item.title)
    });
  }
  
  return calendar;
}

// Q2 Titles (April, May, June)
const q2Titles = {
  april: [
    { date: 1, title: 'How to Build a GraphQL API with TypeScript and Node.js' },
    { date: 2, title: 'Understanding WebSockets: Real-Time Communication in 2026' },
    { date: 3, title: 'How to Implement JWT Authentication from Scratch' },
    { date: 4, title: 'The Complete Guide to Docker Compose for Development' },
    { date: 5, title: 'How to Use Zod for Runtime Type Validation' },
    { date: 6, title: 'Building a RESTful API with Express and TypeScript' },
    { date: 7, title: 'How to Set Up CI/CD with GitHub Actions' },
    { date: 8, title: 'Understanding Microservices Architecture Patterns' },
    { date: 9, title: 'How to Deploy a Next.js App to Vercel' },
    { date: 10, title: 'The Developer\'s Guide to PostgreSQL Indexes' },
    { date: 11, title: 'How to Use Redis for Caching in Node.js' },
    { date: 12, title: 'Building a CLI Tool with Node.js and Commander' },
    { date: 13, title: 'How to Implement OAuth 2.0 in Your Application' },
    { date: 14, title: 'Understanding Event-Driven Architecture' },
    { date: 15, title: 'How to Write Unit Tests with Jest' },
    { date: 16, title: 'The Complete Guide to Error Handling in TypeScript' },
    { date: 17, title: 'How to Use Prisma ORM with Next.js' },
    { date: 18, title: 'Building a Real-Time Chat Application' },
    { date: 19, title: 'How to Optimize Database Queries' },
    { date: 20, title: 'Understanding Serverless Functions' },
    { date: 21, title: 'How to Implement Rate Limiting with Redis' },
    { date: 22, title: 'The Guide to API Versioning Best Practices' },
    { date: 23, title: 'How to Use Webhooks for Event Notifications' },
    { date: 24, title: 'Building a File Upload System with Multer' },
    { date: 25, title: 'How to Implement Search Functionality with Elasticsearch' },
    { date: 26, title: 'Understanding Message Queues: RabbitMQ vs Kafka' },
    { date: 27, title: 'How to Set Up Monitoring with Prometheus' },
    { date: 28, title: 'The Complete Guide to Environment Variables' },
    { date: 29, title: 'How to Build a GraphQL Subscription Server' },
    { date: 30, title: 'April Retro: API Design Patterns We Learned' },
  ],
  may: [
    { date: 1, title: 'How to Implement Pagination in REST APIs' },
    { date: 2, title: 'Understanding Database Transactions' },
    { date: 3, title: 'How to Use Docker for Local Development' },
    { date: 4, title: 'Building a Microservices Gateway with Kong' },
    { date: 5, title: 'How to Implement File Compression in Node.js' },
    { date: 6, title: 'The Guide to API Documentation with OpenAPI' },
    { date: 7, title: 'How to Use Message Brokers for Async Processing' },
    { date: 8, title: 'Understanding CQRS Pattern' },
    { date: 9, title: 'How to Implement Background Jobs with Bull' },
    { date: 10, title: 'Building a Multi-Tenant Application' },
    { date: 11, title: 'How to Use TypeScript Generics Effectively' },
    { date: 12, title: 'The Complete Guide to API Security' },
    { date: 13, title: 'How to Implement Caching Strategies' },
    { date: 14, title: 'Understanding Domain-Driven Design' },
    { date: 15, title: 'How to Build a GraphQL Resolver' },
    { date: 16, title: 'The Developer\'s Guide to API Testing' },
    { date: 17, title: 'How to Use Docker Swarm for Orchestration' },
    { date: 18, title: 'Building a Notification System' },
    { date: 19, title: 'How to Implement Data Validation with Yup' },
    { date: 20, title: 'Understanding API Gateway Patterns' },
    { date: 21, title: 'How to Use Kubernetes for Container Orchestration' },
    { date: 22, title: 'The Guide to Database Migrations' },
    { date: 23, title: 'How to Implement API Throttling' },
    { date: 24, title: 'Building a Task Queue System' },
    { date: 25, title: 'How to Use gRPC for High-Performance APIs' },
    { date: 26, title: 'Understanding Event Sourcing' },
    { date: 27, title: 'How to Implement API Authentication with Passport' },
    { date: 28, title: 'The Complete Guide to API Error Responses' },
    { date: 29, title: 'How to Build a GraphQL DataLoader' },
    { date: 30, title: 'May Retro: Backend Architecture Insights' },
    { date: 31, title: 'How to Optimize API Response Times' },
  ],
  june: [
    { date: 1, title: 'How to Implement API Rate Limiting per User' },
    { date: 2, title: 'Understanding Database Connection Pooling' },
    { date: 3, title: 'How to Use Nginx as a Reverse Proxy' },
    { date: 4, title: 'Building a REST API with Fastify' },
    { date: 5, title: 'How to Implement API Request Logging' },
    { date: 6, title: 'The Guide to API Design Principles' },
    { date: 7, title: 'How to Use MongoDB with Mongoose' },
    { date: 8, title: 'Understanding API Gateway vs Service Mesh' },
    { date: 9, title: 'How to Implement API Health Checks' },
    { date: 10, title: 'Building a GraphQL Federation Server' },
    { date: 11, title: 'How to Use PostgreSQL Full-Text Search' },
    { date: 12, title: 'The Complete Guide to API Pagination Strategies' },
    { date: 13, title: 'How to Implement API Request Validation' },
    { date: 14, title: 'Understanding API Gateway Authentication' },
    { date: 15, title: 'How to Build a Microservices Communication Layer' },
    { date: 16, title: 'The Developer\'s Guide to API Mocking' },
    { date: 17, title: 'How to Use Redis Pub/Sub for Real-Time Updates' },
    { date: 18, title: 'Building an API Gateway with Express' },
    { date: 19, title: 'How to Implement API Request Batching' },
    { date: 20, title: 'Understanding API Circuit Breaker Pattern' },
    { date: 21, title: 'How to Use Docker Networking' },
    { date: 22, title: 'The Guide to API Response Compression' },
    { date: 23, title: 'How to Implement API Request Queuing' },
    { date: 24, title: 'Building a GraphQL API with Apollo Server' },
    { date: 25, title: 'How to Use PostgreSQL JSONB for Flexible Data' },
    { date: 26, title: 'Understanding API Load Balancing' },
    { date: 27, title: 'How to Implement API Request Deduplication' },
    { date: 28, title: 'The Complete Guide to API Monitoring' },
    { date: 29, title: 'How to Build a Microservices Registry' },
    { date: 30, title: 'June Retro: Scaling APIs for Growth' },
  ]
};

// Q3 Titles (July, August, September)
const q3Titles = {
  july: [
    { date: 1, title: 'How to Implement API Request Transformation' },
    { date: 2, title: 'Understanding API Gateway Routing' },
    { date: 3, title: 'How to Use Docker Volumes for Data Persistence' },
    { date: 4, title: 'Building a REST API with Koa.js' },
    { date: 5, title: 'How to Implement API Request Enrichment' },
    { date: 6, title: 'The Guide to API Response Transformation' },
    { date: 7, title: 'How to Use PostgreSQL Views for Complex Queries' },
    { date: 8, title: 'Understanding API Gateway Rate Limiting' },
    { date: 9, title: 'How to Implement API Request Aggregation' },
    { date: 10, title: 'Building a GraphQL API with GraphQL Yoga' },
    { date: 11, title: 'How to Use Redis for Session Management' },
    { date: 12, title: 'The Complete Guide to API Security Headers' },
    { date: 13, title: 'How to Implement API Request Filtering' },
    { date: 14, title: 'Understanding API Gateway Caching' },
    { date: 15, title: 'How to Build a Microservices Discovery Service' },
    { date: 16, title: 'The Developer\'s Guide to API Contract Testing' },
    { date: 17, title: 'How to Use Docker Compose for Multi-Container Apps' },
    { date: 18, title: 'Building an API Gateway with Kong' },
    { date: 19, title: 'How to Implement API Request Routing' },
    { date: 20, title: 'Understanding API Gateway Load Balancing' },
    { date: 21, title: 'How to Use PostgreSQL Triggers' },
    { date: 22, title: 'The Guide to API Response Caching' },
    { date: 23, title: 'How to Implement API Request Batching' },
    { date: 24, title: 'Building a GraphQL API with GraphQL Tools' },
    { date: 25, title: 'How to Use Redis for Distributed Locking' },
    { date: 26, title: 'Understanding API Gateway Authentication' },
    { date: 27, title: 'How to Implement API Request Validation Middleware' },
    { date: 28, title: 'The Complete Guide to API Error Handling' },
    { date: 29, title: 'How to Build a Microservices Config Service' },
    { date: 30, title: 'July Retro: API Gateway Patterns' },
    { date: 31, title: 'How to Optimize API Database Queries' },
  ],
  august: [
    { date: 1, title: 'How to Implement API Request Logging Middleware' },
    { date: 2, title: 'Understanding API Gateway Service Discovery' },
    { date: 3, title: 'How to Use Docker Secrets for Sensitive Data' },
    { date: 4, title: 'Building a REST API with Hapi.js' },
    { date: 5, title: 'How to Implement API Request Rate Limiting' },
    { date: 6, title: 'The Guide to API Response Serialization' },
    { date: 7, title: 'How to Use PostgreSQL Stored Procedures' },
    { date: 8, title: 'Understanding API Gateway Request Transformation' },
    { date: 9, title: 'How to Implement API Request Compression' },
    { date: 10, title: 'Building a GraphQL API with GraphQL Helix' },
    { date: 11, title: 'How to Use Redis for Rate Limiting' },
    { date: 12, title: 'The Complete Guide to API Authentication Methods' },
    { date: 13, title: 'How to Implement API Request Sanitization' },
    { date: 14, title: 'Understanding API Gateway Response Transformation' },
    { date: 15, title: 'How to Build a Microservices Tracing Service' },
    { date: 16, title: 'The Developer\'s Guide to API Performance Testing' },
    { date: 17, title: 'How to Use Docker Networks for Service Communication' },
    { date: 18, title: 'Building an API Gateway with Traefik' },
    { date: 19, title: 'How to Implement API Request Validation Rules' },
    { date: 20, title: 'Understanding API Gateway Request Aggregation' },
    { date: 21, title: 'How to Use PostgreSQL Materialized Views' },
    { date: 22, title: 'The Guide to API Response Formatting' },
    { date: 23, title: 'How to Implement API Request Throttling' },
    { date: 24, title: 'Building a GraphQL API with Mercurius' },
    { date: 25, title: 'How to Use Redis for Caching API Responses' },
    { date: 26, title: 'Understanding API Gateway Request Routing' },
    { date: 27, title: 'How to Implement API Request Enrichment Middleware' },
    { date: 28, title: 'The Complete Guide to API Response Validation' },
    { date: 29, title: 'How to Build a Microservices Health Check Service' },
    { date: 30, title: 'August Retro: Advanced API Patterns' },
    { date: 31, title: 'How to Optimize API Response Payloads' },
  ],
  september: [
    { date: 1, title: 'How to Implement API Request Authentication Middleware' },
    { date: 2, title: 'Understanding API Gateway Request Filtering' },
    { date: 3, title: 'How to Use Docker Health Checks' },
    { date: 4, title: 'Building a REST API with NestJS' },
    { date: 5, title: 'How to Implement API Request Authorization' },
    { date: 6, title: 'The Guide to API Response Pagination' },
    { date: 7, title: 'How to Use PostgreSQL Partitioning' },
    { date: 8, title: 'Understanding API Gateway Request Enrichment' },
    { date: 9, title: 'How to Implement API Request Transformation Middleware' },
    { date: 10, title: 'Building a GraphQL API with Pothos' },
    { date: 11, title: 'How to Use Redis for API Session Storage' },
    { date: 12, title: 'The Complete Guide to API Response Compression' },
    { date: 13, title: 'How to Implement API Request Validation Schemas' },
    { date: 14, title: 'Understanding API Gateway Request Aggregation Patterns' },
    { date: 15, title: 'How to Build a Microservices Logging Service' },
    { date: 16, title: 'The Developer\'s Guide to API Load Testing' },
    { date: 17, title: 'How to Use Docker Compose Overrides' },
    { date: 18, title: 'Building an API Gateway with Ambassador' },
    { date: 19, title: 'How to Implement API Request Rate Limiting Strategies' },
    { date: 20, title: 'Understanding API Gateway Request Routing Rules' },
    { date: 21, title: 'How to Use PostgreSQL Replication' },
    { date: 22, title: 'The Guide to API Response Caching Strategies' },
    { date: 23, title: 'How to Implement API Request Batching Middleware' },
    { date: 24, title: 'Building a GraphQL API with TypeGraphQL' },
    { date: 25, title: 'How to Use Redis for API Request Queuing' },
    { date: 26, title: 'Understanding API Gateway Request Transformation Rules' },
    { date: 27, title: 'How to Implement API Request Validation Middleware Chain' },
    { date: 28, title: 'The Complete Guide to API Response Serialization' },
    { date: 29, title: 'How to Build a Microservices Metrics Service' },
    { date: 30, title: 'September Retro: Production-Ready APIs' },
  ]
};

// Q4 Titles (October, November, December)
const q4Titles = {
  october: [
    { date: 1, title: 'How to Implement API Request Authentication Strategies' },
    { date: 2, title: 'Understanding API Gateway Request Filtering Rules' },
    { date: 3, title: 'How to Use Docker Multi-Stage Builds' },
    { date: 4, title: 'Building a REST API with AdonisJS' },
    { date: 5, title: 'How to Implement API Request Authorization Policies' },
    { date: 6, title: 'The Guide to API Response Formatting Standards' },
    { date: 7, title: 'How to Use PostgreSQL Full-Text Search with tsvector' },
    { date: 8, title: 'Understanding API Gateway Request Enrichment Patterns' },
    { date: 9, title: 'How to Implement API Request Transformation Pipelines' },
    { date: 10, title: 'Building a GraphQL API with Nexus' },
    { date: 11, title: 'How to Use Redis for API Response Caching' },
    { date: 12, title: 'The Complete Guide to API Response Compression Algorithms' },
    { date: 13, title: 'How to Implement API Request Validation Pipelines' },
    { date: 14, title: 'Understanding API Gateway Request Aggregation Strategies' },
    { date: 15, title: 'How to Build a Microservices Monitoring Service' },
    { date: 16, title: 'The Developer\'s Guide to API Stress Testing' },
    { date: 17, title: 'How to Use Docker BuildKit for Faster Builds' },
    { date: 18, title: 'Building an API Gateway with Gloo' },
    { date: 19, title: 'How to Implement API Request Rate Limiting Algorithms' },
    { date: 20, title: 'Understanding API Gateway Request Routing Strategies' },
    { date: 21, title: 'How to Use PostgreSQL JSON Functions' },
    { date: 22, title: 'The Guide to API Response Caching Headers' },
    { date: 23, title: 'How to Implement API Request Batching Strategies' },
    { date: 24, title: 'Building a GraphQL API with GraphQL Code Generator' },
    { date: 25, title: 'How to Use Redis for API Request Deduplication' },
    { date: 26, title: 'Understanding API Gateway Request Transformation Pipelines' },
    { date: 27, title: 'How to Implement API Request Validation Pipelines' },
    { date: 28, title: 'The Complete Guide to API Response Serialization Formats' },
    { date: 29, title: 'How to Build a Microservices Alerting Service' },
    { date: 30, title: 'October Retro: API Architecture Evolution' },
    { date: 31, title: 'How to Optimize API Database Connection Pools' },
  ],
  november: [
    { date: 1, title: 'How to Implement API Request Authentication Flows' },
    { date: 2, title: 'Understanding API Gateway Request Filtering Pipelines' },
    { date: 3, title: 'How to Use Docker Compose Profiles' },
    { date: 4, title: 'Building a REST API with FeathersJS' },
    { date: 5, title: 'How to Implement API Request Authorization Flows' },
    { date: 6, title: 'The Guide to API Response Formatting Pipelines' },
    { date: 7, title: 'How to Use PostgreSQL Array Functions' },
    { date: 8, title: 'Understanding API Gateway Request Enrichment Pipelines' },
    { date: 9, title: 'How to Implement API Request Transformation Strategies' },
    { date: 10, title: 'Building a GraphQL API with GraphQL Shield' },
    { date: 11, title: 'How to Use Redis for API Request Rate Limiting' },
    { date: 12, title: 'The Complete Guide to API Response Compression Strategies' },
    { date: 13, title: 'How to Implement API Request Validation Strategies' },
    { date: 14, title: 'Understanding API Gateway Request Aggregation Pipelines' },
    { date: 15, title: 'How to Build a Microservices Configuration Service' },
    { date: 16, title: 'The Developer\'s Guide to API Endurance Testing' },
    { date: 17, title: 'How to Use Docker Compose Extensions' },
    { date: 18, title: 'Building an API Gateway with Zuul' },
    { date: 19, title: 'How to Implement API Request Rate Limiting Policies' },
    { date: 20, title: 'Understanding API Gateway Request Routing Pipelines' },
    { date: 21, title: 'How to Use PostgreSQL Window Functions' },
    { date: 22, title: 'The Guide to API Response Caching Policies' },
    { date: 23, title: 'How to Implement API Request Batching Policies' },
    { date: 24, title: 'Building a GraphQL API with GraphQL Modules' },
    { date: 25, title: 'How to Use Redis for API Request Queuing Strategies' },
    { date: 26, title: 'Understanding API Gateway Request Transformation Strategies' },
    { date: 27, title: 'How to Implement API Request Validation Policies' },
    { date: 28, title: 'The Complete Guide to API Response Serialization Strategies' },
    { date: 29, title: 'How to Build a Microservices Service Mesh' },
    { date: 30, title: 'November Retro: Enterprise API Patterns' },
  ],
  december: [
    { date: 1, title: 'How to Implement API Request Authentication Policies' },
    { date: 2, title: 'Understanding API Gateway Request Filtering Strategies' },
    { date: 3, title: 'How to Use Docker Compose Watch Mode' },
    { date: 4, title: 'Building a REST API with LoopBack' },
    { date: 5, title: 'How to Implement API Request Authorization Policies' },
    { date: 6, title: 'The Guide to API Response Formatting Strategies' },
    { date: 7, title: 'How to Use PostgreSQL Common Table Expressions' },
    { date: 8, title: 'Understanding API Gateway Request Enrichment Strategies' },
    { date: 9, title: 'How to Implement API Request Transformation Policies' },
    { date: 10, title: 'Building a GraphQL API with GraphQL Scalars' },
    { date: 11, title: 'How to Use Redis for API Request Deduplication Strategies' },
    { date: 12, title: 'The Complete Guide to API Response Compression Policies' },
    { date: 13, title: 'How to Implement API Request Validation Policies' },
    { date: 14, title: 'Understanding API Gateway Request Aggregation Policies' },
    { date: 15, title: 'How to Build a Microservices Event Bus' },
    { date: 16, title: 'The Developer\'s Guide to API Chaos Testing' },
    { date: 17, title: 'How to Use Docker Compose Dependencies' },
    { date: 18, title: 'Building an API Gateway with Tyk' },
    { date: 19, title: 'How to Implement API Request Rate Limiting Policies' },
    { date: 20, title: 'Understanding API Gateway Request Routing Policies' },
    { date: 21, title: 'How to Use PostgreSQL Recursive Queries' },
    { date: 22, title: 'The Guide to API Response Caching Strategies' },
    { date: 23, title: 'How to Implement API Request Batching Policies' },
    { date: 24, title: 'Building a GraphQL API with GraphQL Directives' },
    { date: 25, title: 'Christmas Special: How to Build a Holiday API' },
    { date: 26, title: 'How to Use Redis for API Request Queuing Policies' },
    { date: 27, title: 'Understanding API Gateway Request Transformation Policies' },
    { date: 28, title: 'How to Implement API Request Validation Policies' },
    { date: 29, title: 'The Complete Guide to API Response Serialization Policies' },
    { date: 30, title: 'How to Build a Microservices API Gateway' },
    { date: 31, title: 'December Retro: Year in Review - API Best Practices 2026' },
  ]
};

// Generate and save calendar
import fs from 'fs';
import path from 'path';

const calendar = generateCalendar();
const calendarPath = path.join(process.cwd(), 'content', 'how-to-tech-calendar.json');

fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
console.log(`✅ Generated ${calendar.length} "How to in Tech" calendar entries`);
console.log(`📁 Saved to: ${calendarPath}`);

