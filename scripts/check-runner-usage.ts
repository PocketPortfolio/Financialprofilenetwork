#!/usr/bin/env ts-node
/**
 * Check GitHub Actions runner usage and identify what's blocking the queue
 * Shows currently running jobs and queued jobs waiting for runners
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

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
}

async function checkRunnerUsage() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    console.log('🔍 Checking GitHub Actions Runner Usage\n');
    console.log('='.repeat(60));
    console.log('');

    // Get all workflows
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    if (!workflowsResponse.ok) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      process.exit(1);
    }

    const workflowsData = await workflowsResponse.json();
    const workflows = workflowsData.workflows || [];

    console.log(`📋 Found ${workflows.length} workflows\n`);

    // Check for in-progress and queued runs
    const inProgressRuns: Array<{workflow: string, run: WorkflowRun}> = [];
    const queuedRuns: Array<{workflow: string, run: WorkflowRun}> = [];
    const waitingRuns: Array<{workflow: string, run: WorkflowRun}> = [];

    for (const workflow of workflows) {
      // Get recent runs (in_progress, queued, waiting)
      const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=10&status=all`;
      const runsResponse = await fetch(runsUrl, { headers });
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        const runs: WorkflowRun[] = runsData.workflow_runs || [];
        
        for (const run of runs) {
          if (run.status === 'in_progress') {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            inProgressRuns.push({workflow: workflow.name, run});
          } else if (run.status === 'queued') {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            queuedRuns.push({workflow: workflow.name, run});
          } else if (run.status === 'waiting') {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            waitingRuns.push({workflow: workflow.name, run});
          }
        }
      }
    }

    // Display results
    console.log('📊 CURRENT RUNNER USAGE\n');

    if (inProgressRuns.length > 0) {
      console.log(`🟢 ${inProgressRuns.length} workflow(s) currently RUNNING (using runners):\n`);
      inProgressRuns.forEach(({workflow, run}) => {
        const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
        const duration = Math.round((Date.now() - new Date(run.updated_at).getTime()) / 1000 / 60);
        console.log(`   🟢 ${workflow} - Run #${run.run_number}`);
        console.log(`      Event: ${run.event} | Branch: ${run.head_branch}`);
        console.log(`      Started: ${age}m ago | Running for: ${duration}m`);
        console.log(`      URL: ${run.html_url}`);
        console.log('');
      });
    } else {
      console.log('   ✅ No workflows currently running\n');
    }

    if (queuedRuns.length > 0) {
      console.log(`⏳ ${queuedRuns.length} workflow(s) QUEUED (waiting for runners):\n`);
      queuedRuns.forEach(({workflow, run}) => {
        const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
        console.log(`   ⏳ ${workflow} - Run #${run.run_number}`);
        console.log(`      Event: ${run.event} | Branch: ${run.head_branch}`);
        console.log(`      Queued: ${age}m ago`);
        if (age > 10) {
          console.log(`      ⚠️  STUCK: Queued for ${age} minutes (should start within 1-2 minutes)`);
        }
        console.log(`      URL: ${run.html_url}`);
        console.log('');
      });
    } else {
      console.log('   ✅ No workflows queued\n');
    }

    if (waitingRuns.length > 0) {
      console.log(`⏸️  ${waitingRuns.length} workflow(s) WAITING:\n`);
      waitingRuns.forEach(({workflow, run}) => {
        const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
        console.log(`   ⏸️  ${workflow} - Run #${run.run_number}`);
        console.log(`      Event: ${run.event} | Branch: ${run.head_branch}`);
        console.log(`      Waiting: ${age}m ago`);
        console.log(`      URL: ${run.html_url}`);
        console.log('');
      });
    } else {
      console.log('   ✅ No workflows waiting\n');
    }

    // Summary
    const totalUsingRunners = inProgressRuns.length;
    const totalWaiting = queuedRuns.length + waitingRuns.length;

    console.log('='.repeat(60));
    console.log('📊 SUMMARY\n');
    console.log(`   🟢 Currently Running: ${totalUsingRunners} workflow(s)`);
    console.log(`   ⏳ Queued/Waiting: ${totalWaiting} workflow(s)`);
    console.log(`   📈 Total Using/Waiting for Runners: ${totalUsingRunners + totalWaiting}\n`);

    if (totalUsingRunners >= 15) {
      console.log('   ⚠️  WARNING: High runner usage (15+ workflows running)');
      console.log('      GitHub Actions free tier has 20 concurrent runners max');
      console.log('      This may cause queuing for other workflows\n');
    }

    if (queuedRuns.some(({run}) => {
      const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
      return age > 10;
    })) {
      console.log('   ⚠️  WARNING: Some workflows have been queued for 10+ minutes');
      console.log('      These may be stuck and should be cancelled\n');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS\n');
    if (totalWaiting > 0 && totalUsingRunners >= 15) {
      console.log('   1. High runner usage detected - this is normal with multiple schedules');
      console.log('   2. Queued workflows will start when runners become available');
      console.log('   3. If queued for 10+ minutes, consider cancelling stuck runs\n');
    } else if (totalWaiting > 0) {
      console.log('   1. Some workflows are queued - waiting for runners');
      console.log('   2. This is normal if runners are busy');
      console.log('   3. They should start within 1-5 minutes\n');
    } else {
      console.log('   ✅ All workflows are running or completed - no queue issues\n');
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

checkRunnerUsage().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
