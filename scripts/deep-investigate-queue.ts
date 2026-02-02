#!/usr/bin/env ts-node
/**
 * Deep CTO-level investigation of GitHub Actions queue issues
 * Tests multiple hypotheses with runtime evidence
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const LOG_ENDPOINT = 'http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8';

interface WorkflowRun {
  id: number;
  run_number: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'waiting';
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  event: string;
  head_branch: string;
  html_url: string;
  workflow_id: number;
  jobs_url?: string;
}

interface WorkflowJob {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting';
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  steps: Array<{
    name: string;
    status: string;
    conclusion: string | null;
  }>;
}

interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

// #region agent log
async function logDebug(data: any) {
  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'deep-investigate-queue.ts',
        message: data.message || 'Debug log',
        data: data.data || data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: data.runId || 'investigation',
        hypothesisId: data.hypothesisId || 'N/A'
      })
    }).catch(() => {});
  } catch (e) {}
}
// #endregion

async function deepInvestigateQueue() {
  let token = process.env.GITHUB_TOKEN;
  
  // Try reading from .env.local if not set in environment
  if (!token) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GITHUB_TOKEN=(.+)/);
        if (match) {
          token = match[1].trim();
        }
      }
    } catch (e) {
      // Ignore errors reading .env.local
    }
  }
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    console.error('💡 Set it with: export GITHUB_TOKEN=your_token');
    console.error('   Or add it to .env.local: GITHUB_TOKEN=your_token');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  // #region agent log
  await logDebug({
    hypothesisId: 'ALL',
    message: 'Investigation started',
    data: { repo: GITHUB_REPO, timestamp: new Date().toISOString() }
  });
  // #endregion

  console.log('🔍 DEEP CTO INVESTIGATION: GitHub Actions Queue Issue\n');
  console.log('='.repeat(80));
  console.log('');

  // HYPOTHESIS A: Workflows are actually running but API shows them as queued (API delay/caching)
  // HYPOTHESIS B: Other repositories in organization consuming all 20 runners
  // HYPOTHESIS C: Concurrency groups incorrectly configured, causing unnecessary waits
  // HYPOTHESIS D: GitHub Actions service degradation or rate limiting
  // HYPOTHESIS E: Workflows cancelled by concurrency before starting (cancellation loop)
  // HYPOTHESIS F: Job dependencies blocking execution (needs: other jobs)

  try {
    // ============================================================
    // HYPOTHESIS A: Check if API responses are delayed/cached
    // ============================================================
    console.log('📋 HYPOTHESIS A: API Response Delay/Caching\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'A',
      message: 'Testing API response timing',
      data: { test: 'multiple_requests' }
    });
    // #endregion

    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const startTime = Date.now();
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    const apiLatency = Date.now() - startTime;
    
    // #region agent log
    await logDebug({
      hypothesisId: 'A',
      message: 'API response received',
      data: { 
        status: workflowsResponse.status,
        latency_ms: apiLatency,
        cache_header: workflowsResponse.headers.get('cache-control'),
        etag: workflowsResponse.headers.get('etag')
      }
    });
    // #endregion

    if (!workflowsResponse.ok) {
      console.error(`   ❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      process.exit(1);
    }

    const workflowsData = await workflowsResponse.json();
    const workflows: Workflow[] = workflowsData.workflows || [];
    
    console.log(`   ✅ API Response Time: ${apiLatency}ms`);
    console.log(`   ✅ Cache Header: ${workflowsResponse.headers.get('cache-control') || 'none'}`);
    console.log(`   ✅ Found ${workflows.length} workflows\n`);

    // ============================================================
    // HYPOTHESIS B: Check organization-level runner usage
    // ============================================================
    console.log('📋 HYPOTHESIS B: Organization Runner Usage\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'B',
      message: 'Checking organization runner usage',
      data: { org: 'PocketPortfolio' }
    });
    // #endregion

    // Get organization info
    const orgUrl = `https://api.github.com/orgs/PocketPortfolio`;
    const orgResponse = await fetch(orgUrl, { headers });
    
    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      // #region agent log
      await logDebug({
        hypothesisId: 'B',
        message: 'Organization data retrieved',
        data: { 
          org: orgData.login,
          public_repos: orgData.public_repos,
          total_private_repos: orgData.total_private_repos
        }
      });
      // #endregion
      console.log(`   ✅ Organization: ${orgData.login}`);
      console.log(`   ✅ Public Repos: ${orgData.public_repos}`);
      console.log(`   ⚠️  Note: Cannot check runner usage across org via API (GitHub limitation)\n`);
    } else {
      // #region agent log
      await logDebug({
        hypothesisId: 'B',
        message: 'Organization API failed',
        data: { status: orgResponse.status }
      });
      // #endregion
      console.log(`   ⚠️  Cannot access organization data: ${orgResponse.status}\n`);
    }

    // ============================================================
    // HYPOTHESIS C: Check concurrency configuration conflicts
    // ============================================================
    console.log('📋 HYPOTHESIS C: Concurrency Configuration Analysis\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'C',
      message: 'Analyzing concurrency groups',
      data: { workflow_count: workflows.length }
    });
    // #endregion

    const concurrencyGroups = new Map<string, string[]>();
    let conflicts: Array<[string, string[]]> = []; // Declare in broader scope
    
    // Read workflow files to check concurrency groups
    const fs = require('fs');
    const path = require('path');
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    
    if (fs.existsSync(workflowsDir)) {
      const workflowFiles = fs.readdirSync(workflowsDir).filter((f: string) => f.endsWith('.yml') || f.endsWith('.yaml'));
      
      for (const file of workflowFiles) {
        const filePath = path.join(workflowsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract concurrency group
        const groupMatch = content.match(/concurrency:\s*\n\s*group:\s*(.+)/);
        if (groupMatch) {
          const group = groupMatch[1].trim().replace(/['"]/g, '');
          if (!concurrencyGroups.has(group)) {
            concurrencyGroups.set(group, []);
          }
          concurrencyGroups.get(group)!.push(file);
        }
      }
      
      // #region agent log
      await logDebug({
        hypothesisId: 'C',
        message: 'Concurrency groups analyzed',
        data: { 
          unique_groups: Array.from(concurrencyGroups.keys()),
          conflicts: Array.from(concurrencyGroups.entries()).filter(([_, files]) => files.length > 1)
        }
      });
      // #endregion

      console.log(`   ✅ Analyzed ${workflowFiles.length} workflow files`);
      console.log(`   ✅ Found ${concurrencyGroups.size} unique concurrency groups`);
      
      conflicts = Array.from(concurrencyGroups.entries()).filter(([_, files]) => files.length > 1);
      if (conflicts.length > 0) {
        console.log(`   ⚠️  Potential conflicts (same group, different workflows):`);
        conflicts.forEach(([group, files]) => {
          console.log(`      - Group "${group}": ${files.join(', ')}`);
        });
      } else {
        console.log(`   ✅ No concurrency group conflicts detected`);
      }
      console.log('');
    } else {
      console.log(`   ⚠️  Workflows directory not found\n`);
    }

    // ============================================================
    // HYPOTHESIS D: Check GitHub Actions service status and rate limits
    // ============================================================
    console.log('📋 HYPOTHESIS D: Service Status & Rate Limits\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'D',
      message: 'Checking rate limits',
      data: { endpoint: 'workflows' }
    });
    // #endregion

    const rateLimitUrl = `https://api.github.com/rate_limit`;
    const rateLimitResponse = await fetch(rateLimitUrl, { headers });
    
    if (rateLimitResponse.ok) {
      const rateLimitData = await rateLimitResponse.json();
      const core = rateLimitData.resources?.core || {};
      const actions = rateLimitData.resources?.actions || {};
      
      // #region agent log
      await logDebug({
        hypothesisId: 'D',
        message: 'Rate limit data retrieved',
        data: {
          core_remaining: core.remaining,
          core_limit: core.limit,
          core_reset: core.reset,
          actions_remaining: actions.remaining,
          actions_limit: actions.limit
        }
      });
      // #endregion

      console.log(`   ✅ Core API: ${core.remaining}/${core.limit} remaining`);
      console.log(`   ✅ Actions API: ${actions.remaining}/${actions.limit} remaining`);
      
      if (core.remaining < 100) {
        console.log(`   ⚠️  WARNING: Low core API rate limit remaining`);
      }
      if (actions.remaining < 100) {
        console.log(`   ⚠️  WARNING: Low Actions API rate limit remaining`);
      }
      console.log('');
    }

    // ============================================================
    // HYPOTHESIS E: Check for cancellation loops (concurrency cancelling runs)
    // ============================================================
    console.log('📋 HYPOTHESIS E: Cancellation Loop Detection\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'E',
      message: 'Checking for cancellation patterns',
      data: { repo: GITHUB_REPO }
    });
    // #endregion

    const recentCancelled: Array<{workflow: string, run: WorkflowRun}> = [];
    const recentQueued: Array<{workflow: string, run: WorkflowRun}> = [];
    
    for (const workflow of workflows.slice(0, 10)) { // Check first 10 workflows
      const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=20&status=all`;
      const runsResponse = await fetch(runsUrl, { headers });
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        const runs: WorkflowRun[] = runsData.workflow_runs || [];
        
        // Check last 20 runs for cancellation patterns
        const cancelled = runs.filter(r => r.status === 'cancelled' && 
          new Date(r.created_at).getTime() > Date.now() - 3600000); // Last hour
        const queued = runs.filter(r => r.status === 'queued');
        
        if (cancelled.length > 0) {
          cancelled.forEach(r => recentCancelled.push({workflow: workflow.name, run: r}));
        }
        if (queued.length > 0) {
          queued.forEach(r => recentQueued.push({workflow: workflow.name, run: r}));
        }
      }
    }
    
    // #region agent log
    await logDebug({
      hypothesisId: 'E',
      message: 'Cancellation pattern analysis',
      data: {
        cancelled_last_hour: recentCancelled.length,
        currently_queued: recentQueued.length,
        cancelled_by_workflow: recentCancelled.reduce((acc, {workflow}) => {
          acc[workflow] = (acc[workflow] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });
    // #endregion

    console.log(`   ✅ Cancelled in last hour: ${recentCancelled.length}`);
    console.log(`   ✅ Currently queued: ${recentQueued.length}`);
    
    if (recentCancelled.length > 5) {
      console.log(`   ⚠️  WARNING: High cancellation rate detected`);
      const byWorkflow = recentCancelled.reduce((acc, {workflow}) => {
        acc[workflow] = (acc[workflow] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`   ⚠️  Top cancelled workflows:`);
      Object.entries(byWorkflow).slice(0, 5).forEach(([wf, count]) => {
        console.log(`      - ${wf}: ${count} cancelled`);
      });
    }
    console.log('');

    // ============================================================
    // HYPOTHESIS F: Check job dependencies and waiting states
    // ============================================================
    console.log('📋 HYPOTHESIS F: Job Dependencies & Waiting States\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'F',
      message: 'Checking job dependencies',
      data: { queued_runs: recentQueued.length }
    });
    // #endregion

    // Get detailed job information for queued runs
    for (const {workflow, run} of recentQueued.slice(0, 5)) {
      if (run.jobs_url) {
        const jobsResponse = await fetch(run.jobs_url, { headers });
        
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const jobs: WorkflowJob[] = jobsData.jobs || [];
          
          // #region agent log
          await logDebug({
            hypothesisId: 'F',
            message: 'Job details retrieved',
            data: {
              workflow,
              run_number: run.run_number,
              job_count: jobs.length,
              job_statuses: jobs.map(j => ({ name: j.name, status: j.status, conclusion: j.conclusion }))
            }
          });
          // #endregion

          const waitingJobs = jobs.filter(j => j.status === 'waiting' || j.status === 'queued');
          if (waitingJobs.length > 0) {
            console.log(`   ⚠️  ${workflow} #${run.run_number}: ${waitingJobs.length} job(s) waiting/queued`);
            waitingJobs.forEach(job => {
              console.log(`      - ${job.name}: ${job.status}`);
            });
          }
        }
      }
    }
    
    if (recentQueued.length === 0) {
      console.log(`   ✅ No queued runs to analyze\n`);
    } else {
      console.log('');
    }

    // ============================================================
    // SUMMARY & EVIDENCE
    // ============================================================
    console.log('='.repeat(80));
    console.log('📊 INVESTIGATION SUMMARY\n');
    
    // #region agent log
    await logDebug({
      hypothesisId: 'ALL',
      message: 'Investigation complete',
      data: {
        api_latency_ms: apiLatency,
        workflows_analyzed: workflows.length,
        cancelled_last_hour: recentCancelled.length,
        currently_queued: recentQueued.length,
        concurrency_groups: concurrencyGroups.size
      }
    });
    // #endregion

    console.log('HYPOTHESIS EVALUATION:\n');
    console.log(`   A. API Delay/Caching: ${apiLatency < 1000 ? '✅ REJECTED' : '⚠️  INCONCLUSIVE'} (${apiLatency}ms latency)`);
    console.log(`   B. Org Runner Usage: ⚠️  INCONCLUSIVE (API limitation - cannot check)`);
    console.log(`   C. Concurrency Conflicts: ${conflicts.length === 0 ? '✅ REJECTED' : '⚠️  CONFIRMED'} (${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''})`);
    console.log(`   D. Rate Limiting: ${rateLimitResponse.ok ? '✅ REJECTED' : '⚠️  INCONCLUSIVE'}`);
    console.log(`   E. Cancellation Loop: ${recentCancelled.length > 5 ? '⚠️  CONFIRMED' : '✅ REJECTED'} (${recentCancelled.length} cancelled)`);
    console.log(`   F. Job Dependencies: ${recentQueued.length > 0 ? '⚠️  NEEDS_DETAILED_ANALYSIS' : '✅ REJECTED'}\n`);

    console.log('💡 RECOMMENDATIONS:\n');
    if (recentCancelled.length > 5) {
      console.log('   1. ⚠️  High cancellation rate - review concurrency groups');
      console.log('   2. Consider reducing scheduled workflow frequency');
    }
    if (recentQueued.length > 0) {
      console.log('   3. ⚠️  Queued workflows detected - check job dependencies');
      console.log('   4. Monitor runner availability across organization');
    }
    console.log('');

  } catch (error: any) {
    // #region agent log
    await logDebug({
      hypothesisId: 'ALL',
      message: 'Investigation error',
      data: { error: error.message, stack: error.stack }
    });
    // #endregion
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  deepInvestigateQueue().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { deepInvestigateQueue };
