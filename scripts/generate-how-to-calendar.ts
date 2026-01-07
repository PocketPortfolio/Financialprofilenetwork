/**
 * Generate Q1 2026 "How to in Tech" calendar entries
 * Creates calendar entries for daily posts at 14:00 UTC
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
  
  return calendar;
}

// Generate and save calendar
import fs from 'fs';
import path from 'path';

const calendar = generateCalendar();
const calendarPath = path.join(process.cwd(), 'content', 'how-to-tech-calendar.json');

fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
console.log(`✅ Generated ${calendar.length} "How to in Tech" calendar entries`);
console.log(`📁 Saved to: ${calendarPath}`);

