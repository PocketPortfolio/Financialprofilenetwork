#!/usr/bin/env ts-node
/**
 * Continuous monitoring script to catch queue events WHEN they happen
 * Runs checks every 30 seconds and logs queue state changes
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const LOG_ENDPOINT = 'http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8';
const CHECK_INTERVAL = 30000; // 30 seconds

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
}

interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

interface QueueSnapshot {
  timestamp: number;
  in_progress: number;
  queued: number;
  waiting: number;
  cancelled_last_5min: number;
  workflows_triggered_last_5min: number;
  details: {
    queued_runs: Array<{workflow: string, run_number: number, age_minutes: number, event: string}>;
    in_progress_runs: Array<{workflow: string, run_number: number, duration_minutes: number}>;
  };
}

// #region agent log
async function logDebug(data: any) {
  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'monitor-queue-events.ts',
        message: data.message || 'Queue monitoring',
        data: data.data || data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: data.runId || 'monitoring',
        hypothesisId: data.hypothesisId || 'G-J'
      })
    }).catch(() => {});
  } catch (e) {}
}
// #endregion

async function getQueueSnapshot(headers: any): Promise<QueueSnapshot> {
  const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
  const workflowsResponse = await fetch(workflowsUrl, { headers });
  
  if (!workflowsResponse.ok) {
    throw new Error(`Failed to fetch workflows: ${workflowsResponse.status}`);
  }

  const workflowsData = await workflowsResponse.json();
  const workflows: Workflow[] = workflowsData.workflows || [];

  const inProgressRuns: Array<{workflow: string, run: WorkflowRun}> = [];
  const queuedRuns: Array<{workflow: string, run: WorkflowRun}> = [];
  const waitingRuns: Array<{workflow: string, run: WorkflowRun}> = [];
  const recentCancelled: Array<{workflow: string, run: WorkflowRun}> = [];
  const recentTriggered: Array<{workflow: string, run: WorkflowRun}> = [];

  const fiveMinutesAgo = Date.now() - 300000;

  for (const workflow of workflows) {
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=20&status=all`;
    const runsResponse = await fetch(runsUrl, { headers });
    
    if (runsResponse.ok) {
      const runsData = await runsResponse.json();
      const runs: WorkflowRun[] = runsData.workflow_runs || [];
      
      for (const run of runs) {
        const createdTime = new Date(run.created_at).getTime();
        const isRecent = createdTime > fiveMinutesAgo;

        if (run.status === 'in_progress') {
          inProgressRuns.push({workflow: workflow.name, run});
        } else if (run.status === 'queued') {
          queuedRuns.push({workflow: workflow.name, run});
        } else if (run.status === 'waiting') {
          waitingRuns.push({workflow: workflow.name, run});
        } else if (run.status === 'cancelled' && isRecent) {
          recentCancelled.push({workflow: workflow.name, run});
        }
        
        if (isRecent) {
          recentTriggered.push({workflow: workflow.name, run});
        }
      }
    }
  }

  return {
    timestamp: Date.now(),
    in_progress: inProgressRuns.length,
    queued: queuedRuns.length,
    waiting: waitingRuns.length,
    cancelled_last_5min: recentCancelled.length,
    workflows_triggered_last_5min: recentTriggered.length,
    details: {
      queued_runs: queuedRuns.map(({workflow, run}) => ({
        workflow,
        run_number: run.run_number,
        age_minutes: Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60),
        event: run.event
      })),
      in_progress_runs: inProgressRuns.map(({workflow, run}) => ({
        workflow,
        run_number: run.run_number,
        duration_minutes: Math.round((Date.now() - new Date(run.updated_at).getTime()) / 1000 / 60)
      }))
    }
  };
}

async function monitorQueue() {
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
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  console.log('🔍 Continuous Queue Monitoring Started\n');
  console.log('Monitoring for queue events every 30 seconds...');
  console.log('Press Ctrl+C to stop\n');
  console.log('='.repeat(80));

  let previousSnapshot: QueueSnapshot | null = null;

  // #region agent log
  await logDebug({
    hypothesisId: 'G-J',
    message: 'Monitoring started',
    data: { repo: GITHUB_REPO, interval_ms: CHECK_INTERVAL }
  });
  // #endregion

  while (true) {
    try {
      const snapshot = await getQueueSnapshot(headers);
      
      // #region agent log
      await logDebug({
        hypothesisId: 'G',
        message: 'Queue snapshot',
        data: {
          in_progress: snapshot.in_progress,
          queued: snapshot.queued,
          waiting: snapshot.waiting,
          cancelled_last_5min: snapshot.cancelled_last_5min,
          triggered_last_5min: snapshot.workflows_triggered_last_5min,
          queued_details: snapshot.details.queued_runs
        }
      });
      // #endregion

      // Detect queue events
      if (snapshot.queued > 0) {
        console.log(`\n⚠️  QUEUE EVENT DETECTED at ${new Date().toISOString()}`);
        console.log(`   Queued: ${snapshot.queued} | In Progress: ${snapshot.in_progress} | Waiting: ${snapshot.waiting}`);
        console.log(`   Cancelled (last 5min): ${snapshot.cancelled_last_5min}`);
        console.log(`   Triggered (last 5min): ${snapshot.workflows_triggered_last_5min}`);
        
        if (snapshot.details.queued_runs.length > 0) {
          console.log(`   Queued workflows:`);
          snapshot.details.queued_runs.forEach(q => {
            console.log(`      - ${q.workflow} #${q.run_number} (${q.age_minutes}m old, ${q.event})`);
          });
        }

        // #region agent log
        await logDebug({
          hypothesisId: 'G',
          message: 'Queue event detected',
          data: {
            snapshot,
            previous: previousSnapshot,
            delta: previousSnapshot ? {
              queued_delta: snapshot.queued - previousSnapshot.queued,
              in_progress_delta: snapshot.in_progress - previousSnapshot.in_progress,
              triggered_delta: snapshot.workflows_triggered_last_5min - previousSnapshot.workflows_triggered_last_5min
            } : null
          }
        });
        // #endregion
      }

      // Detect sudden increase in queued runs
      if (previousSnapshot && snapshot.queued > previousSnapshot.queued) {
        const delta = snapshot.queued - previousSnapshot.queued;
        console.log(`\n📈 Queue increased by ${delta} (${previousSnapshot.queued} → ${snapshot.queued})`);
        
        // #region agent log
        await logDebug({
          hypothesisId: 'H',
          message: 'Queue spike detected',
          data: {
            delta,
            triggered_last_5min: snapshot.workflows_triggered_last_5min,
            in_progress: snapshot.in_progress
          }
        });
        // #endregion
      }

      // Detect high cancellation rate
      if (snapshot.cancelled_last_5min > 3) {
        console.log(`\n⚠️  High cancellation rate: ${snapshot.cancelled_last_5min} in last 5 minutes`);
        
        // #region agent log
        await logDebug({
          hypothesisId: 'I',
          message: 'High cancellation rate',
          data: {
            cancelled_count: snapshot.cancelled_last_5min,
            queued: snapshot.queued,
            in_progress: snapshot.in_progress
          }
        });
        // #endregion
      }

      // Detect simultaneous trigger storm
      if (snapshot.workflows_triggered_last_5min > 5) {
        console.log(`\n⚡ Trigger storm: ${snapshot.workflows_triggered_last_5min} workflows triggered in last 5 minutes`);
        
        // #region agent log
        await logDebug({
          hypothesisId: 'G',
          message: 'Trigger storm detected',
          data: {
            triggered_count: snapshot.workflows_triggered_last_5min,
            queued: snapshot.queued,
            in_progress: snapshot.in_progress
          }
        });
        // #endregion
      }

      previousSnapshot = snapshot;

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));

    } catch (error: any) {
      // #region agent log
      await logDebug({
        hypothesisId: 'ALL',
        message: 'Monitoring error',
        data: { error: error.message }
      });
      // #endregion
      console.error(`\n❌ Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }
}

if (require.main === module) {
  monitorQueue().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { monitorQueue };
