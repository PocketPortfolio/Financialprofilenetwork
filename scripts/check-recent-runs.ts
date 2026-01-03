#!/usr/bin/env ts-node
/**
 * Check recent workflow runs including all statuses
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'deploy.yml';

async function checkRecentRuns() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  // Get workflow ID
  const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
  const workflowsResponse = await fetch(workflowsUrl, { headers });
  
  if (!workflowsResponse.ok) {
    console.error(`❌ Failed: ${workflowsResponse.status}`);
    process.exit(1);
  }

  const workflowsData = await workflowsResponse.json();
  const deployWorkflow = workflowsData.workflows.find((wf: any) => 
    wf.path === `.github/workflows/${WORKFLOW_FILE}` || wf.name === 'Deploy to Vercel'
  );

  if (!deployWorkflow) {
    console.error('❌ Workflow not found');
    process.exit(1);
  }

  console.log(`✅ Found workflow: ${deployWorkflow.name} (ID: ${deployWorkflow.id})\n`);

  // Get ALL runs (not just recent)
  const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${deployWorkflow.id}/runs?per_page=100&status=all`;
  console.log(`📡 Fetching all workflow runs...\n`);
  
  const response = await fetch(runsUrl, { headers });
  
  if (!response.ok) {
    console.error(`❌ API Error: ${response.status}`);
    const error = await response.text();
    console.error(error);
    process.exit(1);
  }

  const data = await response.json();
  
  console.log(`📊 Total runs: ${data.total_count}\n`);

  if (data.workflow_runs && data.workflow_runs.length > 0) {
    console.log('📋 All Workflow Runs (most recent first):\n');
    data.workflow_runs.forEach((run: any, index: number) => {
      const date = new Date(run.created_at);
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      const status = run.status === 'completed' 
        ? (run.conclusion === 'success' ? '✅' : run.conclusion === 'failure' ? '❌' : '⚠️')
        : run.status === 'in_progress' ? '🔄' 
        : run.status === 'queued' ? '⏳'
        : '❓';
      
      console.log(`${index + 1}. ${status} ${run.name || 'Deploy to Vercel'}`);
      console.log(`   Status: ${run.status} | Conclusion: ${run.conclusion || 'N/A'}`);
      console.log(`   Triggered: ${date.toLocaleString()} (${daysAgo} days ago)`);
      console.log(`   Event: ${run.event} | Branch: ${run.head_branch}`);
      console.log(`   Commit: ${run.head_sha.substring(0, 7)} - ${run.head_commit?.message || 'N/A'}`);
      console.log(`   URL: ${run.html_url}\n`);
    });

    // Check for recent runs (last 7 days)
    const recentRuns = data.workflow_runs.filter((run: any) => {
      const date = new Date(run.created_at);
      const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    console.log(`\n📅 Recent runs (last 7 days): ${recentRuns.length}`);
    if (recentRuns.length === 0) {
      console.log('⚠️  No runs in the last 7 days - workflow may not be triggering!\n');
    }
  } else {
    console.log('⚠️  No workflow runs found at all.\n');
  }
}

checkRecentRuns().catch(console.error);




