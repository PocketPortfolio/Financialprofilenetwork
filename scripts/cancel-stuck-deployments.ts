#!/usr/bin/env ts-node
/**
 * Cancel stuck GitHub Actions deployment runs
 * 
 * This script automatically cancels workflow runs that are stuck in "queued" or "in_progress" state
 * for the deploy.yml workflow.
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token npm run cancel-stuck-deployments
 *   or
 *   ts-node --project scripts/tsconfig.json scripts/cancel-stuck-deployments.ts
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'deploy.yml';

interface WorkflowRun {
  id: number;
  run_number: number;
  status: 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'waiting';
  conclusion: string | null;
  created_at: string;
  head_sha: string;
  html_url: string;
}

async function cancelStuckDeployments() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    console.error('💡 Set it with: export GITHUB_TOKEN=your_token');
    console.error('   Or add it to .env.local');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    console.log('🔍 Finding deploy workflow...\n');
    
    // Get workflow ID
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    if (!workflowsResponse.ok) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      const error = await workflowsResponse.text();
      console.error(error);
      process.exit(1);
    }

    const workflowsData = await workflowsResponse.json();
    const deployWorkflow = workflowsData.workflows.find((wf: any) => 
      wf.path === `.github/workflows/${WORKFLOW_FILE}` || wf.name === 'Deploy to Vercel'
    );

    if (!deployWorkflow) {
      console.error('❌ Deploy workflow not found');
      process.exit(1);
    }

    console.log(`✅ Found workflow: ${deployWorkflow.name} (ID: ${deployWorkflow.id})\n`);

    // Get recent runs - try multiple approaches
    console.log('📡 Fetching recent workflow runs...\n');
    
    // Approach 1: Get all runs (no status filter)
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${deployWorkflow.id}/runs?per_page=20`;
    
    const runsResponse = await fetch(runsUrl, { headers });
    
    if (!runsResponse.ok) {
      console.error(`❌ Failed to fetch runs: ${runsResponse.status}`);
      const error = await runsResponse.text();
      console.error(error);
      process.exit(1);
    }

    const runsData = await runsResponse.json();
    let runs: WorkflowRun[] = runsData.workflow_runs || [];

    console.log(`📊 Total runs found: ${runs.length}`);
    console.log(`📊 API Response total_count: ${runsData.total_count || 'N/A'}`);
    
    // If no runs found, try with explicit status filters
    if (runs.length === 0) {
      console.log('⚠️  No runs found with default query. Trying with status=queued...\n');
      const queuedUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${deployWorkflow.id}/runs?per_page=20&status=queued`;
      const queuedResponse = await fetch(queuedUrl, { headers });
      if (queuedResponse.ok) {
        const queuedData = await queuedResponse.json();
        const queuedRuns: WorkflowRun[] = queuedData.workflow_runs || [];
        if (queuedRuns.length > 0) {
          console.log(`✅ Found ${queuedRuns.length} queued runs\n`);
          runs = queuedRuns;
        }
      }
    }
    
    console.log('');

    // Filter for stuck runs (queued, in_progress, or waiting)
    // Also check if conclusion is null (meaning not completed/cancelled)
    const stuckRuns = runs.filter(run => 
      (run.status === 'queued' || run.status === 'in_progress' || run.status === 'waiting') &&
      run.conclusion === null
    );
    
    // Debug: Show all runs and their status
    console.log('📋 Recent runs status:\n');
    runs.slice(0, 5).forEach(run => {
      const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
      console.log(`  Run #${run.run_number}: ${run.status} (${run.conclusion || 'in progress'}) - ${age}m ago`);
    });
    console.log('');

    if (stuckRuns.length === 0) {
      console.log('✅ No stuck runs found. All deployments are either completed or cancelled.\n');
      return;
    }

    console.log(`⚠️  Found ${stuckRuns.length} stuck run(s):\n`);
    
    for (const run of stuckRuns) {
      const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
      console.log(`  Run #${run.run_number}:`);
      console.log(`    Status: ${run.status}`);
      console.log(`    Age: ${age} minutes`);
      console.log(`    URL: ${run.html_url}`);
      console.log(`    SHA: ${run.head_sha.substring(0, 7)}\n`);
    }

    // Cancel each stuck run
    console.log('🛑 Cancelling stuck runs...\n');
    
    let cancelledCount = 0;
    for (const run of stuckRuns) {
      try {
        const cancelUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}/cancel`;
        const cancelResponse = await fetch(cancelUrl, {
          method: 'POST',
          headers,
        });

        if (cancelResponse.ok || cancelResponse.status === 409) {
          // 409 means already cancelled/completed, which is fine
          console.log(`  ✅ Run #${run.run_number} cancelled (or already finished)`);
          cancelledCount++;
        } else {
          const errorText = await cancelResponse.text();
          console.log(`  ⚠️  Run #${run.run_number} failed to cancel: ${cancelResponse.status}`);
          console.log(`     ${errorText.substring(0, 100)}`);
        }
      } catch (error: any) {
        console.log(`  ❌ Error cancelling run #${run.run_number}: ${error.message}`);
      }
    }

    console.log(`\n✅ Cancelled ${cancelledCount} of ${stuckRuns.length} stuck run(s)\n`);

    // Wait a moment and check status
    console.log('⏳ Waiting 3 seconds, then checking status...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Re-fetch to verify
    const verifyResponse = await fetch(runsUrl, { headers });
    const verifyData = await verifyResponse.json();
    const verifyRuns: WorkflowRun[] = verifyData.workflow_runs || [];
    const stillStuck = verifyRuns.filter(run => 
      (run.status === 'queued' || run.status === 'in_progress') &&
      stuckRuns.some(sr => sr.id === run.id)
    );

    if (stillStuck.length > 0) {
      console.log(`⚠️  ${stillStuck.length} run(s) still stuck. They may be in a state that cannot be cancelled.`);
      console.log('   You may need to wait for them to timeout or cancel manually.\n');
    } else {
      console.log('✅ All stuck runs have been cancelled or completed.\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cancelStuckDeployments().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { cancelStuckDeployments };
