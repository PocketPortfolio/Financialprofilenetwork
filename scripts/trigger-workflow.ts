#!/usr/bin/env ts-node
/**
 * Script to manually trigger GitHub Actions workflow via API
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'deploy.yml';

async function triggerWorkflow() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN environment variable is not set');
    console.log('Set it with: $env:GITHUB_TOKEN="your_token"');
    process.exit(1);
  }

  // First, get the workflow ID
  const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
  const workflowsResponse = await fetch(workflowsUrl, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!workflowsResponse.ok) {
    const error = await workflowsResponse.text();
    console.error(`❌ Failed to list workflows: ${workflowsResponse.status}`);
    console.error(error);
    process.exit(1);
  }

  const workflowsData = await workflowsResponse.json();
  const deployWorkflow = workflowsData.workflows.find((wf: any) => 
    wf.path === `.github/workflows/${WORKFLOW_FILE}` || wf.name === 'Deploy to Vercel'
  );

  if (!deployWorkflow) {
    console.error(`❌ Workflow "${WORKFLOW_FILE}" not found`);
    process.exit(1);
  }

  console.log(`✅ Found workflow: ${deployWorkflow.name} (ID: ${deployWorkflow.id})`);

  // Trigger the workflow
  const triggerUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${deployWorkflow.id}/dispatches`;
  console.log(`\n🚀 Triggering workflow...`);

  const triggerResponse = await fetch(triggerUrl, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',
    }),
  });

  if (triggerResponse.ok) {
    console.log('✅ Workflow triggered successfully!');
    console.log(`\n📋 Check status at:`);
    console.log(`   https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`);
  } else {
    const error = await triggerResponse.text();
    console.error(`❌ Failed to trigger workflow: ${triggerResponse.status}`);
    console.error(error);
    process.exit(1);
  }
}

triggerWorkflow().catch(console.error);





