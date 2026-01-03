#!/usr/bin/env ts-node
/**
 * Check all workflows to see which ones have runs
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

async function checkAllWorkflows() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  // Get all workflows
  const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
  const workflowsResponse = await fetch(workflowsUrl, { headers });
  
  if (!workflowsResponse.ok) {
    console.error(`❌ Failed: ${workflowsResponse.status}`);
    process.exit(1);
  }

  const workflowsData = await workflowsResponse.json();
  const workflows = workflowsData.workflows || [];

  console.log(`📋 Found ${workflows.length} workflows:\n`);

  for (const workflow of workflows) {
    // Get runs for this workflow
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=1`;
    const runsResponse = await fetch(runsUrl, { headers });
    
    if (runsResponse.ok) {
      const runsData = await runsResponse.json();
      const runCount = runsData.total_count || 0;
      const status = runCount > 0 ? '✅' : '⚠️';
      console.log(`${status} ${workflow.name} (${workflow.path})`);
      console.log(`   Runs: ${runCount}`);
      if (runCount > 0 && runsData.workflow_runs?.[0]) {
        const latest = runsData.workflow_runs[0];
        console.log(`   Latest: ${latest.status} (${latest.conclusion || 'in_progress'}) - ${new Date(latest.created_at).toLocaleString()}`);
      }
      console.log('');
    }
  }
}

checkAllWorkflows().catch(console.error);
