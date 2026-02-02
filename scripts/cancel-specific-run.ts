#!/usr/bin/env ts-node
/**
 * Cancel a specific workflow run by run number
 * Usage: GITHUB_TOKEN=token ts-node scripts/cancel-specific-run.ts <workflow-name> <run-number>
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

async function cancelSpecificRun(workflowName: string, runNumber: number) {
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
    console.log(`🔍 Finding workflow: ${workflowName}...\n`);

    // Get all workflows
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    if (!workflowsResponse.ok) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      process.exit(1);
    }

    const workflowsData = await workflowsResponse.json();
    const workflows = workflowsData.workflows || [];
    
    const workflow = workflows.find((wf: any) => wf.name === workflowName);
    
    if (!workflow) {
      console.error(`❌ Workflow "${workflowName}" not found`);
      console.log('Available workflows:');
      workflows.forEach((wf: any) => console.log(`  - ${wf.name}`));
      process.exit(1);
    }

    console.log(`✅ Found workflow: ${workflow.name} (ID: ${workflow.id})\n`);

    // Get the specific run
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=100`;
    const runsResponse = await fetch(runsUrl, { headers });
    
    if (!runsResponse.ok) {
      console.error(`❌ Failed to fetch runs: ${runsResponse.status}`);
      process.exit(1);
    }

    const runsData = await runsResponse.json();
    const runs = runsData.workflow_runs || [];
    
    const run = runs.find((r: any) => r.run_number === runNumber);
    
    if (!run) {
      console.error(`❌ Run #${runNumber} not found for workflow "${workflowName}"`);
      console.log(`Available runs (first 10):`);
      runs.slice(0, 10).forEach((r: any) => {
        const age = Math.round((Date.now() - new Date(r.created_at).getTime()) / 1000 / 60);
        console.log(`  - Run #${r.run_number}: ${r.status} (${r.conclusion || 'in progress'}) - ${age}m ago`);
      });
      process.exit(1);
    }

    console.log(`📋 Run Details:`);
    console.log(`   Run #${run.run_number}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Conclusion: ${run.conclusion || 'in progress'}`);
    console.log(`   Event: ${run.event}`);
    console.log(`   Created: ${run.created_at}`);
    console.log(`   URL: ${run.html_url}\n`);

    if (run.status === 'completed' || run.status === 'cancelled') {
      console.log(`ℹ️  Run #${runNumber} is already ${run.status}`);
      return;
    }

    console.log(`🛑 Cancelling run #${runNumber}...\n`);

    const cancelUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}/cancel`;
    const cancelResponse = await fetch(cancelUrl, {
      method: 'POST',
      headers,
    });

    if (cancelResponse.ok) {
      console.log(`✅ Run #${runNumber} cancelled successfully`);
    } else if (cancelResponse.status === 409) {
      console.log(`ℹ️  Run #${runNumber} is already cancelled or completed`);
    } else {
      const errorText = await cancelResponse.text();
      console.error(`❌ Failed to cancel run #${runNumber}: ${cancelResponse.status} ${cancelResponse.statusText}`);
      console.error(`   Response: ${errorText}`);
      process.exit(1);
    }

    // Wait and verify
    console.log(`\n⏳ Waiting 3 seconds, then verifying...\n`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const verifyResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}`, { headers });
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log(`📊 Current Status: ${verifyData.status} (${verifyData.conclusion || 'in progress'})`);
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

const workflowName = process.argv[2];
const runNumber = parseInt(process.argv[3], 10);

if (!workflowName || !runNumber) {
  console.error('Usage: GITHUB_TOKEN=token ts-node scripts/cancel-specific-run.ts <workflow-name> <run-number>');
  console.error('Example: GITHUB_TOKEN=token ts-node scripts/cancel-specific-run.ts "Generate Blog Posts" 1');
  process.exit(1);
}

cancelSpecificRun(workflowName, runNumber).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
