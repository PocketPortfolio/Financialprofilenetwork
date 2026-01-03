#!/usr/bin/env ts-node
/**
 * Script to manually trigger the blog generation workflow
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'generate-blog.yml';

async function triggerBlogWorkflow() {
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
  const blogWorkflow = workflowsData.workflows.find((wf: any) => 
    wf.path === `.github/workflows/${WORKFLOW_FILE}` || wf.name === 'Generate Blog Posts'
  );

  if (!blogWorkflow) {
    console.error(`❌ Workflow "${WORKFLOW_FILE}" not found`);
    process.exit(1);
  }

  console.log(`✅ Found workflow: ${blogWorkflow.name} (ID: ${blogWorkflow.id})`);

  // Trigger the workflow
  const triggerUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${blogWorkflow.id}/dispatches`;
  console.log(`\n🚀 Triggering blog generation workflow...`);

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

  if (triggerResponse.ok || triggerResponse.status === 204) {
    console.log('✅ Blog generation workflow triggered successfully!');
    console.log(`\n📋 Check status at:`);
    console.log(`   https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`);
    console.log(`\n⏱️  The workflow will:`);
    console.log(`   1. Generate the blog post using OpenAI`);
    console.log(`   2. Create and save the image using DALL-E`);
    console.log(`   3. Commit changes to main branch`);
    console.log(`   4. Trigger automatic deployment to Vercel`);
  } else {
    const error = await triggerResponse.text();
    console.error(`❌ Failed to trigger workflow: ${triggerResponse.status}`);
    console.error(error);
    process.exit(1);
  }
}

triggerBlogWorkflow().catch(console.error);


