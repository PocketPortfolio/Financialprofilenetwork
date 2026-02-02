#!/usr/bin/env ts-node
/**
 * Delete a very old stuck run that can't be cancelled normally
 * This handles edge cases where old runs are in a weird state
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

async function deleteStuckRun(workflowName: string, runNumber: number) {
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
    // Get workflow
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    const workflowsData = await workflowsResponse.json();
    const workflows = workflowsData.workflows || [];
    const workflow = workflows.find((wf: any) => wf.name === workflowName);
    
    if (!workflow) {
      console.error(`❌ Workflow "${workflowName}" not found`);
      process.exit(1);
    }

    // Get ALL runs (including very old ones) - use a large page size
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=100&page=1`;
    let run: any = null;
    let page = 1;
    
    // Search through multiple pages if needed
    while (page <= 5) { // Check up to 5 pages (500 runs)
      const response = await fetch(`${runsUrl}&page=${page}`, { headers });
      if (!response.ok) break;
      
      const data = await response.json();
      const runs = data.workflow_runs || [];
      run = runs.find((r: any) => r.run_number === runNumber);
      
      if (run) break;
      if (runs.length === 0) break;
      page++;
    }

    if (!run) {
      console.error(`❌ Run #${runNumber} not found (searched ${page} pages)`);
      process.exit(1);
    }

    console.log(`📋 Run Details:`);
    console.log(`   ID: ${run.id}`);
    console.log(`   Run #${run.run_number}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Conclusion: ${run.conclusion || 'in progress'}`);
    console.log(`   Event: ${run.event}`);
    console.log(`   Created: ${run.created_at}`);
    console.log(`   URL: ${run.html_url}\n`);

    // Try to delete it (for very old runs, deletion might work when cancel doesn't)
    console.log(`🗑️  Attempting to delete run #${runNumber}...\n`);
    
    const deleteUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${run.id}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers,
    });

    if (deleteResponse.ok || deleteResponse.status === 204) {
      console.log(`✅ Run #${runNumber} deleted successfully`);
      console.log(`\n💡 Note: GitHub UI may take a few minutes to refresh.`);
      console.log(`   The run should disappear from the queue soon.`);
    } else {
      const errorText = await deleteResponse.text();
      console.error(`❌ Failed to delete run #${runNumber}: ${deleteResponse.status} ${deleteResponse.statusText}`);
      console.error(`   Response: ${errorText}`);
      console.log(`\n💡 This run may be too old or in a protected state.`);
      console.log(`   You may need to contact GitHub support or wait for it to expire.`);
      process.exit(1);
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

const workflowName = process.argv[2] || 'Generate Blog Posts';
const runNumber = parseInt(process.argv[3] || '1', 10);

deleteStuckRun(workflowName, runNumber).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
