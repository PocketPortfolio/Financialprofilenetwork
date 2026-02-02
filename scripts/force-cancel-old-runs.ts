#!/usr/bin/env ts-node
/**
 * Force cancel very old queued runs that might be stuck
 * This handles edge cases where old runs are in a weird state
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

async function forceCancelOldRuns() {
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
    console.log('🔍 Finding ALL queued runs (including very old ones)...\n');

    // Get all workflows
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    if (!workflowsResponse.ok) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      process.exit(1);
    }

    const workflowsData = await workflowsResponse.json();
    const workflows = workflowsData.workflows || [];

    const allQueuedRuns: Array<{workflow: string, run: any}> = [];

    // Check each workflow for queued runs
    for (const workflow of workflows) {
      // Get ALL queued runs (not just recent ones)
      const queuedUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?status=queued&per_page=100`;
      const queuedResponse = await fetch(queuedUrl, { headers });
      
      if (queuedResponse.ok) {
        const queuedData = await queuedResponse.json();
        const queuedRuns = queuedData.workflow_runs || [];
        
        if (queuedRuns.length > 0) {
          console.log(`⚠️  ${workflow.name}: Found ${queuedRuns.length} queued run(s)`);
          queuedRuns.forEach((run: any) => {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            const ageDays = Math.round(age / 60 / 24);
            console.log(`      - Run #${run.run_number}: queued (${ageDays}d ${Math.round((age % (60*24)) / 60)}h ago) - ${run.event}`);
            allQueuedRuns.push({workflow: workflow.name, run});
          });
        }
      }
    }

    if (allQueuedRuns.length === 0) {
      console.log('\n✅ No queued runs found across all workflows!\n');
      return;
    }

    console.log(`\n⚠️  Found ${allQueuedRuns.length} queued run(s) to cancel\n`);
    console.log('🛑 Force cancelling all queued runs...\n');

    let cancelledCount = 0;
    let failedCount = 0;

    for (const {workflow, run} of allQueuedRuns) {
      try {
        // Try cancel endpoint
        const cancelUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}/cancel`;
        const cancelResponse = await fetch(cancelUrl, {
          method: 'POST',
          headers,
        });

        if (cancelResponse.ok) {
          console.log(`  ✅ ${workflow} - Run #${run.run_number} cancelled`);
          cancelledCount++;
        } else if (cancelResponse.status === 409) {
          console.log(`  ℹ️  ${workflow} - Run #${run.run_number} already cancelled/completed`);
          cancelledCount++;
        } else {
          // Try delete endpoint for very old runs
          const deleteUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}`;
          const deleteResponse = await fetch(deleteUrl, {
            method: 'DELETE',
            headers,
          });

          if (deleteResponse.ok || deleteResponse.status === 204) {
            console.log(`  ✅ ${workflow} - Run #${run.run_number} deleted (very old run)`);
            cancelledCount++;
          } else {
            const errorText = await cancelResponse.text();
            console.log(`  ⚠️  ${workflow} - Run #${run.run_number} failed: ${cancelResponse.status}`);
            console.log(`      Cancel error: ${errorText}`);
            failedCount++;
          }
        }
      } catch (error: any) {
        console.log(`  ❌ ${workflow} - Run #${run.run_number} error: ${error.message}`);
        failedCount++;
      }
    }

    console.log(`\n✅ Cancelled/deleted ${cancelledCount} of ${allQueuedRuns.length} queued run(s)`);
    if (failedCount > 0) {
      console.log(`⚠️  ${failedCount} run(s) could not be cancelled\n`);
    }

    // Final check
    console.log('\n⏳ Waiting 5 seconds, then final check...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    let finalQueuedCount = 0;
    for (const workflow of workflows) {
      const queuedUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?status=queued&per_page=10`;
      const queuedResponse = await fetch(queuedUrl, { headers });
      if (queuedResponse.ok) {
        const queuedData = await queuedResponse.json();
        finalQueuedCount += (queuedData.workflow_runs || []).length;
      }
    }

    if (finalQueuedCount === 0) {
      console.log('✅ All queued runs cleared!\n');
    } else {
      console.log(`⚠️  ${finalQueuedCount} queued run(s) still remain (may need manual intervention)\n`);
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

forceCancelOldRuns().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
