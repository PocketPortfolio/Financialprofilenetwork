#!/usr/bin/env ts-node
/**
 * Check the blog generation workflow status
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'generate-blog.yml';

async function checkBlogWorkflow() {
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
  const blogWorkflow = workflowsData.workflows.find((wf: any) => 
    wf.path === `.github/workflows/${WORKFLOW_FILE}` || wf.name === 'Generate Blog Posts'
  );

  if (!blogWorkflow) {
    console.error('❌ Workflow not found');
    process.exit(1);
  }

  console.log(`✅ Found workflow: ${blogWorkflow.name} (ID: ${blogWorkflow.id})\n`);

  // Get recent runs
  const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${blogWorkflow.id}/runs?per_page=5&status=all`;
  console.log(`📡 Fetching workflow runs...\n`);
  
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
    console.log('📋 Recent Workflow Runs:\n');
    data.workflow_runs.forEach((run: any, index: number) => {
      const date = new Date(run.created_at);
      const status = run.status === 'completed' 
        ? (run.conclusion === 'success' ? '✅' : run.conclusion === 'failure' ? '❌' : run.conclusion === 'cancelled' ? '⚠️' : '❓')
        : run.status === 'in_progress' ? '🔄' 
        : run.status === 'queued' ? '⏳'
        : '❓';
      
      console.log(`${index + 1}. ${status} ${run.name || 'Generate Blog Posts'}`);
      console.log(`   Status: ${run.status} | Conclusion: ${run.conclusion || 'N/A'}`);
      console.log(`   Triggered: ${date.toLocaleString()}`);
      console.log(`   Event: ${run.event} | Branch: ${run.head_branch}`);
      console.log(`   Commit: ${run.head_sha.substring(0, 7)}`);
      console.log(`   URL: ${run.html_url}\n`);
    });

    const latest = data.workflow_runs[0];
    if (latest.status === 'in_progress' || latest.status === 'queued') {
      console.log('🔄 Workflow is currently running or queued!');
      console.log(`   Check progress at: ${latest.html_url}\n`);
    } else if (latest.status === 'completed' && latest.conclusion === 'success') {
      console.log('✅ Latest run completed successfully!');
      console.log(`   Check details at: ${latest.html_url}\n`);
    } else if (latest.status === 'completed' && latest.conclusion === 'failure') {
      console.log('❌ Latest run failed');
      console.log(`   Check error logs at: ${latest.html_url}\n`);
    }
  } else {
    console.log('⚠️  No workflow runs found.\n');
    console.log('💡 If you just triggered it, wait a few seconds and check again.');
    console.log('   Or check directly at:');
    console.log(`   https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}\n`);
  }
}

checkBlogWorkflow().catch(console.error);


