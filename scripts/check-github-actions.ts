#!/usr/bin/env ts-node
/**
 * Diagnostic script to check GitHub Actions workflow runs via API
 * This helps debug why workflow runs aren't appearing in the UI
 */

// #region agent log
fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:start',message:'Starting GitHub Actions diagnostic',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'deploy.yml';

async function checkGitHubActions() {
  console.log('🔍 GitHub Actions Diagnostic Tool\n');
  console.log(`Repository: ${GITHUB_REPO}`);
  console.log(`Workflow: ${WORKFLOW_FILE}\n`);

  // Check if GITHUB_TOKEN is set
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️  GITHUB_TOKEN not set. Using unauthenticated API (rate limited).');
    console.log('   Set GITHUB_TOKEN for better results.\n');
  }

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // First, list all workflows to find the correct workflow ID
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    console.log(`📡 Fetching workflows: ${workflowsUrl}\n`);
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:list-workflows',message:'Listing all workflows',data:{repo:GITHUB_REPO,url:workflowsUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:workflows-response',message:'Workflows list response',data:{status:workflowsResponse.status,ok:workflowsResponse.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!workflowsResponse.ok) {
      const errorText = await workflowsResponse.text();
      console.error(`❌ Failed to list workflows: ${workflowsResponse.status} ${workflowsResponse.statusText}`);
      console.error(`   Response: ${errorText}\n`);
      
      // #region agent log
      fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:workflows-error',message:'Failed to list workflows',data:{status:workflowsResponse.status,error:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (workflowsResponse.status === 404) {
        console.log('💡 Hypothesis: Repository may be private or Actions API requires authentication');
        console.log('   - Repository might be private (requires GITHUB_TOKEN)');
        console.log('   - GitHub Actions might be disabled for this repository');
        console.log('   - Repository name might be incorrect\n');
        console.log('   Try:');
        console.log('   1. Set GITHUB_TOKEN environment variable');
        console.log('   2. Check repository settings: https://github.com/PocketPortfolio/Financialprofilenetwork/settings/actions');
        console.log('   3. Verify repository name matches: PocketPortfolio/Financialprofilenetwork\n');
      }
      
      return;
    }

    const workflowsData = await workflowsResponse.json();
    const workflows = workflowsData.workflows || [];
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:workflows-found',message:'Workflows found',data:{total:workflows.length,workflows:workflows.map((w:any)=>({id:w.id,name:w.name,path:w.path}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    console.log(`📋 Found ${workflows.length} workflows:\n`);
    workflows.forEach((wf: any) => {
      console.log(`   - ${wf.name} (${wf.path})`);
    });
    console.log('');

    // Find the deploy.yml workflow
    const deployWorkflow = workflows.find((wf: any) => 
      wf.path === `.github/workflows/${WORKFLOW_FILE}` || wf.name === 'Deploy to Vercel'
    );

    if (!deployWorkflow) {
      console.log(`❌ Workflow "${WORKFLOW_FILE}" not found in repository.\n`);
      console.log('💡 Hypothesis: Workflow file may not be committed or pushed to GitHub');
      console.log(`   Check: https://github.com/${GITHUB_REPO}/tree/main/.github/workflows\n`);
      
      // #region agent log
      fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:workflow-not-found',message:'Deploy workflow not found in workflows list',data:{searchedFor:WORKFLOW_FILE,availableWorkflows:workflows.map((w:any)=>w.path)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      return;
    }

    console.log(`✅ Found workflow: ${deployWorkflow.name} (ID: ${deployWorkflow.id})\n`);

    // Get workflow runs using the workflow ID
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${deployWorkflow.id}/runs?per_page=5`;
    console.log(`📡 Fetching workflow runs: ${runsUrl}\n`);
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:fetch-runs',message:'Fetching workflow runs',data:{workflowId:deployWorkflow.id,url:runsUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(runsUrl, { headers });
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:api-response',message:'API response received',data:{status:response.status,statusText:response.statusText,headers:Object.fromEntries(response.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${errorText}\n`);
      
      // #region agent log
      fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:api-error',message:'API call failed',data:{status:response.status,error:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (response.status === 404) {
        console.log('💡 Hypothesis: Workflow file not found on GitHub');
        console.log('   Check: https://github.com/PocketPortfolio/Financialprofilenetwork/blob/main/.github/workflows/deploy.yml\n');
      } else if (response.status === 403) {
        console.log('💡 Hypothesis: Rate limit or permissions issue');
        console.log('   - Set GITHUB_TOKEN for authenticated requests');
        console.log('   - Check repository permissions\n');
      }
      return;
    }

    const data = await response.json();
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:api-success',message:'Workflow runs data received',data:{totalCount:data.total_count,workflowRuns:data.workflow_runs?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    console.log(`✅ Found ${data.total_count} total workflow runs\n`);

    if (data.workflow_runs && data.workflow_runs.length > 0) {
      console.log('📋 Recent Workflow Runs:\n');
      data.workflow_runs.forEach((run: any, index: number) => {
        const status = run.status === 'completed' 
          ? (run.conclusion === 'success' ? '✅' : run.conclusion === 'failure' ? '❌' : '⚠️')
          : '🔄';
        
        console.log(`${status} Run #${run.run_number}: ${run.display_title || run.head_branch}`);
        console.log(`   Status: ${run.status} (${run.conclusion || 'in_progress'})`);
        console.log(`   Commit: ${run.head_sha.substring(0, 7)}`);
        console.log(`   Branch: ${run.head_branch}`);
        console.log(`   Created: ${new Date(run.created_at).toLocaleString()}`);
        console.log(`   URL: ${run.html_url}\n`);
        
        // #region agent log
        fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:run-details',message:'Workflow run details',data:{runNumber:run.run_number,status:run.status,conclusion:run.conclusion,commit:run.head_sha.substring(0,7),branch:run.head_branch},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      });

      // Check for latest commit
      const latestCommit = 'afb1b57';
      const hasLatestCommit = data.workflow_runs.some((run: any) => 
        run.head_sha.startsWith(latestCommit)
      );
      
      // #region agent log
      fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:commit-check',message:'Checking if latest commit has workflow run',data:{latestCommit,hasRun:hasLatestCommit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      if (!hasLatestCommit) {
        console.log(`⚠️  Latest commit (${latestCommit}) does NOT have a workflow run yet.\n`);
        console.log('💡 Hypothesis: Workflow may not have triggered for this commit');
        console.log('   - Check if workflow file exists on GitHub');
        console.log('   - Verify push event was received');
        console.log('   - Check repository Actions settings\n');
      } else {
        console.log(`✅ Latest commit (${latestCommit}) has a workflow run.\n`);
      }
    } else {
      console.log('⚠️  No workflow runs found.\n');
      console.log('💡 Hypothesis: Workflow may not be triggering');
      console.log('   - Check workflow file syntax');
      console.log('   - Verify triggers are configured correctly');
      console.log('   - Check repository Actions settings\n');
    }

    // Check workflow file exists
    const workflowUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/.github/workflows/${WORKFLOW_FILE}`;
    const workflowResponse = await fetch(workflowUrl, { headers });
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:workflow-file-check',message:'Checking if workflow file exists on GitHub',data:{status:workflowResponse.status,exists:workflowResponse.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    if (workflowResponse.ok) {
      console.log('✅ Workflow file exists on GitHub\n');
    } else {
      console.log('❌ Workflow file NOT found on GitHub\n');
      console.log('💡 Hypothesis: Workflow file not committed/pushed');
      console.log(`   Check: https://github.com/${GITHUB_REPO}/blob/main/.github/workflows/${WORKFLOW_FILE}\n`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/87205442-1c0d-4d69-a7c4-537ada6e56bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'check-github-actions.ts:error',message:'Script error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
  }
}

checkGitHubActions();

