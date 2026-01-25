/**
 * Generate Full Year 2026 "Research" calendar entries (Q1-Q4)
 * Creates calendar entries for daily research posts at 18:00 UTC
 * Total: 365 daily research posts (starting from Jan 9, 2026)
 */

import fs from 'fs';
import path from 'path';

interface ResearchPost {
  id: string;
  date: string;
  scheduledTime: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed'; // ✅ FIX: Allow all statuses
  category: 'research';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  keywords: string[];
  publishedAt?: string; // ✅ FIX: Add optional publishedAt
  videoId?: string; // ✅ FIX: Add optional videoId
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/research:\s*/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractKeywords(title: string): string[] {
  const researchTerms = [
    'benchmarks', 'performance', 'latency', 'architecture', 'trade-offs',
    'data sovereignty', 'local-first', 'cloud', 'privacy', 'security',
    'financial data', 'fintech', 'trading', 'portfolio', 'investments',
    'scalability', 'reliability', 'availability', 'consistency', 'distributed systems',
    'microservices', 'monolith', 'serverless', 'edge computing', 'CDN',
    'database', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'kubernetes', 'docker', 'containers', 'orchestration', 'deployment',
    'monitoring', 'observability', 'logging', 'tracing', 'metrics',
    'API', 'REST', 'GraphQL', 'gRPC', 'websockets', 'streaming',
    'authentication', 'authorization', 'OAuth', 'JWT', 'encryption',
    'GDPR', 'compliance', 'regulations', 'audit', 'governance',
    'cost optimization', 'resource management', 'efficiency', 'waste reduction',
    'machine learning', 'AI', 'ML models', 'inference', 'training',
    'blockchain', 'cryptocurrency', 'DeFi', 'smart contracts',
    'quantitative analysis', 'risk management', 'portfolio optimization',
    'market trends', 'financial markets', 'trading strategies', 'algorithms',
    'vendor lock-in', 'data ownership', 'sovereign sync', 'local storage',
    'indexeddb', 'localstorage', 'cookies', 'session storage',
    'pwa', 'offline-first', 'sync strategies', 'conflict resolution'
  ];

  const titleLower = title.toLowerCase();
  const foundKeywords: string[] = [];
  
  // Extract research terms from title
  for (const term of researchTerms) {
    if (titleLower.includes(term.toLowerCase())) {
      foundKeywords.push(term);
    }
  }
  
  // Extract other meaningful words (3-15 chars, not common stop words)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'research', 'vs', 'with', 'and'];
  const words = titleLower
    .split(/[^a-z0-9]+/)
    .filter(w => w.length >= 3 && w.length <= 15 && !stopWords.includes(w));
  
  foundKeywords.push(...words.slice(0, 3));
  
  // Ensure we have at least 3 keywords
  while (foundKeywords.length < 3) {
    foundKeywords.push('research', 'analysis', 'benchmarks');
  }
  
  return [...new Set(foundKeywords)].slice(0, 6);
}

function getPillar(title: string): 'philosophy' | 'technical' | 'market' | 'product' {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('data sovereignty') || titleLower.includes('privacy') || 
      titleLower.includes('vendor lock-in') || titleLower.includes('local-first') ||
      titleLower.includes('ownership') || titleLower.includes('sovereign')) {
    return 'philosophy';
  }
  
  if (titleLower.includes('market') || titleLower.includes('trading') || 
      titleLower.includes('investment') || titleLower.includes('financial markets') ||
      titleLower.includes('portfolio') || titleLower.includes('risk')) {
    return 'market';
  }
  
  if (titleLower.includes('product') || titleLower.includes('feature') || 
      titleLower.includes('pocket portfolio') || titleLower.includes('sovereign sync')) {
    return 'product';
  }
  
  return 'technical'; // Default to technical
}

// Research topics pool - will be rotated throughout the year
const researchTopics = [
  // Performance & Architecture
  'Cloud vs Local-First Architecture Performance Benchmarks',
  'Database Query Performance - Indexing Strategies Analysis',
  'API Response Time Optimization - Best Practices 2026',
  'Container Runtime Performance - Docker vs Podman vs Containerd',
  'Edge Computing Latency - Global Distribution Analysis',
  'Authentication Token Performance - JWT vs PASETO vs Branca',
  'Message Queue Throughput - Kafka vs RabbitMQ vs NATS',
  'Search Engine Scalability - Elasticsearch Cluster Performance',
  'CDN Cache Hit Rates - Optimization Strategies',
  'Database Connection Pooling - Performance Impact Analysis',
  'GraphQL Query Complexity - Performance vs Flexibility',
  'Serverless Function Cold Starts - Mitigation Strategies',
  'WebSocket Connection Scaling - Load Testing Results',
  'Encryption Algorithm Performance - AES vs ChaCha20',
  'Load Balancer Health Check Overhead - Analysis',
  'Distributed Tracing Overhead - OpenTelemetry Performance',
  'File Upload Performance - Multipart vs Streaming',
  'Database Migration Performance - Zero-Downtime Strategies',
  'API Rate Limiting Algorithms - Token Bucket vs Sliding Window',
  'Monitoring Agent Overhead - Data Collection Impact',
  'CI/CD Pipeline Duration - Optimization Techniques',
  'Container Image Size Impact - Build Optimization',
  'Database Replication Lag - Consistency vs Performance',
  'Cache Invalidation Strategies - Performance Analysis',
  'API Gateway Routing Performance - Path Matching Overhead',
  'WebSocket Frame Compression - Bandwidth Savings',
  'Database Index Maintenance - Performance Impact',
  'Message Serialization Performance - JSON vs Protobuf vs Avro',
  'API Authentication Overhead - OAuth 2.0 vs API Keys',
  'Container Networking Performance - Bridge vs Host Mode',
  
  // Data Sovereignty & Privacy
  'Data Sovereignty in Finance - 2026 Trends and Benchmarks',
  'The True Cost of Vendor Lock-in in Financial Technology',
  'Local-First Architecture - Performance vs Control Trade-offs',
  'GDPR Compliance Overhead - Performance Impact Analysis',
  'Encryption at Rest vs Transit - Performance Comparison',
  'Data Ownership Models - Centralized vs Decentralized',
  'Privacy-Preserving Analytics - Performance Benchmarks',
  'Zero-Knowledge Proofs - Computational Overhead Analysis',
  'Federated Learning - Privacy vs Performance',
  'Homomorphic Encryption - Practical Performance Analysis',
  
  // Financial Technology
  'Real-Time Trading System Latency - Microsecond Analysis',
  'Portfolio Rebalancing Algorithms - Performance Comparison',
  'Risk Calculation Performance - Monte Carlo vs Analytical',
  'Market Data Processing - Throughput Benchmarks',
  'Order Matching Engine Performance - Exchange Comparison',
  'Blockchain Transaction Throughput - Layer 2 Solutions',
  'Cryptocurrency Exchange Latency - Centralized vs DEX',
  'Financial Data Aggregation - API Rate Limits Analysis',
  'Backtesting Performance - Historical Data Processing',
  'Algorithmic Trading Latency - Execution Speed Analysis',
  
  // Infrastructure & DevOps
  'Kubernetes Cluster Autoscaling - Response Time Analysis',
  'Service Mesh Overhead - Istio vs Linkerd Performance',
  'Container Registry Performance - Docker Hub vs GHCR vs ECR',
  'Infrastructure as Code - Terraform vs Pulumi Performance',
  'Secret Management Performance - Vault vs AWS Secrets Manager',
  'Configuration Management - Performance Overhead Analysis',
  'Disaster Recovery Strategies - RTO vs RPO Trade-offs',
  'Multi-Region Deployment - Latency vs Cost Analysis',
  'Blue-Green Deployment Overhead - Performance Impact',
  'Canary Release Performance - Traffic Splitting Analysis',
  
  // Storage & Databases
  'Time-Series Database Performance - InfluxDB vs TimescaleDB',
  'Object Storage Performance - S3 vs R2 vs Backblaze',
  'Database Sharding Strategies - Performance Analysis',
  'Read Replica Performance - Consistency vs Latency',
  'Database Backup Strategies - Performance Impact',
  'Data Archival Performance - Hot vs Cold Storage',
  'Database Connection Limits - Scaling Strategies',
  'Query Optimization Techniques - Execution Plan Analysis',
  'Database Lock Contention - Performance Impact',
  'Full-Text Search Performance - PostgreSQL vs Elasticsearch',
  
  // Security & Compliance
  'DDoS Mitigation Performance - Cloudflare vs AWS Shield',
  'WAF Performance Overhead - Security vs Speed',
  'SSL/TLS Handshake Performance - Protocol Comparison',
  'Certificate Rotation - Zero-Downtime Strategies',
  'Security Scanning Performance - SAST vs DAST Overhead',
  'Penetration Testing - Performance Impact Analysis',
  'Compliance Audit Overhead - GDPR vs SOC 2',
  'Identity Provider Performance - Auth0 vs Okta vs Cognito',
  'Multi-Factor Authentication - UX vs Security Trade-offs',
  'Security Logging Performance - SIEM Overhead',
  
  // AI & Machine Learning
  'ML Model Inference Performance - CPU vs GPU vs Edge',
  'Model Serving Latency - REST vs gRPC vs WebSocket',
  'Training Data Processing - Performance Optimization',
  'Feature Store Performance - Real-Time vs Batch',
  'Model Versioning - Performance Overhead Analysis',
  'A/B Testing Infrastructure - Performance Impact',
  'Recommendation System Latency - Real-Time vs Batch',
  'NLP Processing Performance - Transformer Models',
  'Computer Vision Inference - Edge vs Cloud',
  'Model Compression Techniques - Performance vs Accuracy',
  
  // Frontend & User Experience
  'Client-Side Rendering Performance - React vs Vue vs Svelte',
  'Server-Side Rendering Overhead - Next.js vs Remix',
  'Static Site Generation - Build Time vs Runtime',
  'Progressive Web App Performance - Offline Capabilities',
  'Image Optimization Performance - WebP vs AVIF vs JPEG XL',
  'Font Loading Strategies - Performance Impact',
  'JavaScript Bundle Size - Code Splitting Analysis',
  'CSS-in-JS Performance - Runtime vs Build-Time',
  'State Management Overhead - Redux vs Zustand vs Jotai',
  'Virtual Scrolling Performance - Large List Rendering',
  
  // Networking & Protocols
  'HTTP/2 vs HTTP/3 Performance - Real-World Benchmarks',
  'QUIC Protocol Performance - Connection Establishment',
  'WebRTC Latency - Peer-to-Peer Communication',
  'gRPC vs REST Performance - Serialization Overhead',
  'GraphQL Query Performance - N+1 Problem Analysis',
  'WebSocket Reconnection Strategies - Performance Impact',
  'DNS Resolution Performance - Caching Strategies',
  'TCP vs UDP - Application Performance Comparison',
  'Network Partitioning - CAP Theorem in Practice',
  'Content Delivery Optimization - Multi-CDN Strategies',
  
  // Monitoring & Observability
  'APM Tool Overhead - New Relic vs Datadog vs Dynatrace',
  'Log Aggregation Performance - ELK vs Loki vs Splunk',
  'Distributed Tracing - Sampling Strategies',
  'Metrics Collection Overhead - Prometheus vs StatsD',
  'Alert Fatigue - Threshold Optimization',
  'Dashboard Rendering Performance - Real-Time Updates',
  'Synthetic Monitoring - Performance Impact',
  'Error Tracking Overhead - Sentry vs Rollbar',
  'Performance Budget Enforcement - CI/CD Integration',
  'User Experience Monitoring - RUM vs Synthetic',
  
  // Cost & Resource Optimization
  'Cloud Cost Optimization - Reserved vs On-Demand',
  'Resource Right-Sizing - CPU vs Memory Analysis',
  'Auto-Scaling Policies - Cost vs Performance',
  'Spot Instance Performance - Interruption Analysis',
  'Data Transfer Costs - CDN vs Direct',
  'Storage Tier Optimization - Hot vs Cold vs Archive',
  'Compute Optimization - ARM vs x86 Performance',
  'Energy Efficiency - Performance per Watt',
  'Carbon Footprint - Cloud vs On-Premise',
  'Total Cost of Ownership - Cloud Migration Analysis',
  
  // Emerging Technologies
  'WebAssembly Performance - JavaScript vs WASM',
  'Edge Computing - Latency vs Consistency',
  'Serverless Cold Starts - Optimization Techniques',
  'Blockchain Scalability - Layer 1 vs Layer 2',
  'Quantum Computing Readiness - Algorithm Analysis',
  '5G Network Performance - Mobile App Optimization',
  'IoT Device Communication - Protocol Comparison',
  'AR/VR Rendering Performance - Real-Time Constraints',
  'Voice Interface Latency - Speech Recognition',
  'Biometric Authentication - Performance vs Security',
];

function generateCalendar(): ResearchPost[] {
  const calendar: ResearchPost[] = [];
  const startDate = new Date('2026-01-09'); // Start from Jan 9 (first research post)
  const endDate = new Date('2026-12-31');
  const currentDate = new Date(startDate);
  
  let topicIndex = 0;
  let dayCounter = 0;
  
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Get topic from pool (rotate through)
    const topic = researchTopics[topicIndex % researchTopics.length];
    const title = `Research: ${topic}`;
    
    // ✅ FIX: Include date in slug for research posts to prevent overwrites
    // Research posts with same title but different dates need unique slugs
    const baseSlug = `research-${generateSlug(title)}`;
    const slugWithDate = `${baseSlug}-${dateStr.replace(/-/g, '-')}`;
    
    calendar.push({
      id: `research-${generateSlug(title)}-${dateStr.replace(/-/g, '-')}`,
      date: dateStr,
      scheduledTime: '18:00',
      title,
      slug: slugWithDate, // ✅ Include date to make slugs unique
      status: 'pending' as const, // Default to pending, will be preserved if already published
      category: 'research' as const,
      pillar: getPillar(title),
      keywords: extractKeywords(title)
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
    topicIndex++;
    dayCounter++;
  }
  
  return calendar;
}

// Main execution
// ✅ SAFETY CHECK: Prevent accidental regeneration unless explicitly forced
const outputPath = path.join(process.cwd(), 'content', 'research-calendar.json');
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === 'true';

if (!FORCE_REGENERATE && fs.existsSync(outputPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    if (existing.length > 0) {
      console.error('❌ ERROR: Research calendar already exists and contains posts.');
      console.error('   To prevent accidental data loss, this script will not overwrite the calendar.');
      console.error('   If you need to regenerate, set FORCE_REGENERATE=true environment variable.');
      console.error(`   Current calendar has ${existing.length} posts.`);
      process.exit(1);
    }
  } catch (error) {
    // If file exists but is corrupted, allow regeneration
    console.warn(`⚠️  Existing calendar file is corrupted, will regenerate`);
  }
}

const calendar = generateCalendar();

// ✅ PRESERVE: Load existing calendar to preserve published posts' status and publishedAt
let existingCalendar: any[] = [];
if (fs.existsSync(outputPath)) {
  try {
    existingCalendar = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    console.log(`📋 Loaded ${existingCalendar.length} existing posts from calendar`);
  } catch (error) {
    console.warn(`⚠️  Could not parse existing calendar, will create new one`);
  }
}

// Create a map of existing published posts by ID to preserve their status
const publishedPostsMap = new Map<string, any>();
for (const existingPost of existingCalendar) {
  if (existingPost.status === 'published' && existingPost.id) {
    publishedPostsMap.set(existingPost.id, {
      status: existingPost.status,
      publishedAt: existingPost.publishedAt,
      videoId: existingPost.videoId, // Preserve video ID if exists
    });
  }
}

// ✅ PRESERVE: Restore published status and publishedAt for already published posts
let preservedCount = 0;
for (const post of calendar) {
  const existingData = publishedPostsMap.get(post.id);
  if (existingData) {
    post.status = existingData.status; // ✅ FIX: Remove incorrect type cast
    post.publishedAt = existingData.publishedAt;
    if (existingData.videoId) {
      post.videoId = existingData.videoId;
    }
    preservedCount++;
  }
}

fs.writeFileSync(outputPath, JSON.stringify(calendar, null, 2));

console.log(`✅ Generated ${calendar.length} research posts`);
console.log(`📅 Date range: ${calendar[0].date} to ${calendar[calendar.length - 1].date}`);
console.log(`🕐 All posts scheduled at 18:00 UTC`);
console.log(`💾 Saved to: ${outputPath}`);
console.log(`✅ Preserved ${preservedCount} published post(s) with their status and publishedAt`);
console.log(`\n📊 Pillar distribution:`);
const pillarCounts = calendar.reduce((acc, post) => {
  acc[post.pillar] = (acc[post.pillar] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
Object.entries(pillarCounts).forEach(([pillar, count]) => {
  console.log(`   ${pillar}: ${count} posts`);
});

