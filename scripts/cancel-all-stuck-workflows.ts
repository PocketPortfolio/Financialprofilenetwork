#!/usr/bin/env ts-node
/**
 * Cancel ALL stuck workflow runs across all workflows
 * This is a comprehensive solution for the GitHub Actions queue issue
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

interface WorkflowRun {
  id: number;
  run_number: number;
  status: 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'waiting';
  conclusion: string | null;
  created_at: string;
  head_sha: string;
  html_url: string;
  name: string;
  workflow_id: number;
}

async function cancelAllStuckWorkflows() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    console.error('💡 Set it with: export GITHUB_TOKEN=your_token');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    console.log('🔍 Finding ALL stuck workflow runs across all workflows...\n');

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

    // Key workflows to check
    const keyWorkflowNames = [
      'Deploy to Vercel',
      'Generate Blog Posts',
      'Autonomous Revenue Engine',
      'Autonomous Revenue Engine - Health Check',
      'Blog Health Check'
    ];

    const allStuckRuns: Array<{workflow: string, run: WorkflowRun}> = [];

    // Check each key workflow
    for (const workflow of workflows) {
      if (!keyWorkflowNames.includes(workflow.name)) {
        continue;
      }

      console.log(`🔍 Checking ${workflow.name}...`);
      
      const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=10&status=all`;
      const runsResponse = await fetch(runsUrl, { headers });
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        const runs: WorkflowRun[] = runsData.workflow_runs || [];
        
        // Find queued runs
        const queuedRuns = runs.filter(run => run.status === 'queued');
        
        if (queuedRuns.length > 0) {
          console.log(`   ⚠️  Found ${queuedRuns.length} queued run(s)`);
          queuedRuns.forEach(run => {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            console.log(`      - Run #${run.run_number}: queued (${age}m ago)`);
            allStuckRuns.push({workflow: workflow.name, run});
          });
        } else {
          console.log(`   ✅ No queued runs`);
        }
      }
      console.log('');
    }

    if (allStuckRuns.length === 0) {
      console.log('✅ No stuck runs found across all workflows!\n');
      return;
    }

    console.log(`\n⚠️  Found ${allStuckRuns.length} total stuck run(s) to cancel\n`);
    console.log('🛑 Cancelling stuck runs...\n');

    let cancelledCount = 0;
    let failedCount = 0;

    for (const {workflow, run} of allStuckRuns) {
      try {
        const cancelUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}/cancel`;
        const cancelResponse = await fetch(cancelUrl, {
          method: 'POST',
          headers,
        });

        if (cancelResponse.ok || cancelResponse.status === 409) {
          // 409 means already cancelled/completed
          console.log(`  ✅ ${workflow} - Run #${run.run_number} cancelled`);
          cancelledCount++;
        } else {
          const errorText = await cancelResponse.text();
          console.log(`  ⚠️  ${workflow} - Run #${run.run_number} failed: ${cancelResponse.status}`);
          failedCount++;
        }
      } catch (error: any) {
        console.log(`  ❌ ${workflow} - Run #${run.run_number} error: ${error.message}`);
        failedCount++;
      }
    }

    console.log(`\n✅ Cancelled ${cancelledCount} of ${allStuckRuns.length} stuck run(s)`);
    if (failedCount > 0) {
      console.log(`⚠️  ${failedCount} run(s) could not be cancelled\n`);
    }

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  cancelAllStuckWorkflows().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { cancelAllStuckWorkflows };
