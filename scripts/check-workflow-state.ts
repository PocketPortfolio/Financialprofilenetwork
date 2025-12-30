#!/usr/bin/env ts-node
/**
 * Check the detailed state of a workflow to see if it's active
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'deploy.yml';

async function checkWorkflowState() {
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
    // Get workflow details
    const workflowUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`;
    const response = await fetch(workflowUrl, { headers });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed: ${response.status}`);
      console.error(error);
      return;
    }

    const workflow = await response.json();
    
    console.log('📋 Workflow Details:\n');
    console.log(`   Name: ${workflow.name}`);
    console.log(`   ID: ${workflow.id}`);
    console.log(`   Path: ${workflow.path}`);
    console.log(`   State: ${workflow.state}`);
    console.log(`   Created: ${new Date(workflow.created_at).toLocaleString()}`);
    console.log(`   Updated: ${new Date(workflow.updated_at).toLocaleString()}`);
    console.log(`   URL: ${workflow.html_url}\n`);

    if (workflow.state === 'active') {
      console.log('✅ Workflow is ACTIVE\n');
    } else {
      console.log(`⚠️  Workflow state: ${workflow.state}\n`);
      console.log('💡 If state is not "active", the workflow may be disabled or have issues.\n');
    }

    // Check for recent runs
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=1`;
    const runsResponse = await fetch(runsUrl, { headers });
    
    if (runsResponse.ok) {
      const runsData = await runsResponse.json();
      console.log(`📊 Total runs: ${runsData.total_count}`);
      
      if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
        const latestRun = runsData.workflow_runs[0];
        console.log(`\n📋 Latest run:`);
        console.log(`   Status: ${latestRun.status}`);
        console.log(`   Conclusion: ${latestRun.conclusion || 'N/A'}`);
        console.log(`   Created: ${new Date(latestRun.created_at).toLocaleString()}`);
        console.log(`   URL: ${latestRun.html_url}`);
      } else {
        console.log('\n⚠️  No runs found for this workflow');
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkWorkflowState();

