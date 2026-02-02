#!/usr/bin/env ts-node
/**
 * Comprehensive diagnostic script to check ALL GitHub Actions workflows
 * Identifies why workflows aren't executing (blog engine, revenue engine, deployments)
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';

interface Workflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'deleted';
}

interface WorkflowRun {
  id: number;
  run_number: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'waiting';
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  event: string;
  head_branch: string;
  html_url: string;
}

async function diagnoseAllWorkflows() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    console.error('💡 Set it with: export GITHUB_TOKEN=your_token');
    console.error('   Or add it to .env.local');
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    console.log('🔍 Comprehensive GitHub Actions Diagnostic\n');
    console.log(`Repository: ${GITHUB_REPO}\n`);
    console.log('='.repeat(60));
    console.log('');

    // 1. Check repository Actions settings
    console.log('📋 Step 1: Checking Repository Actions Settings...\n');
    const repoUrl = `https://api.github.com/repos/${GITHUB_REPO}`;
    const repoResponse = await fetch(repoUrl, { headers });
    
    if (repoResponse.ok) {
      const repoData = await repoResponse.json();
      console.log(`   Repository: ${repoData.full_name}`);
      console.log(`   Private: ${repoData.private}`);
      console.log(`   Default Branch: ${repoData.default_branch}`);
      console.log('');
    } else {
      console.log(`   ⚠️  Could not fetch repository info: ${repoResponse.status}\n`);
    }

    // 2. List all workflows
    console.log('📋 Step 2: Listing All Workflows...\n');
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    if (!workflowsResponse.ok) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      const error = await workflowsResponse.text();
      console.error(`   Error: ${error}\n`);
      process.exit(1);
    }

    const workflowsData = await workflowsResponse.json();
    const workflows: Workflow[] = workflowsData.workflows || [];

    console.log(`   Found ${workflows.length} workflows:\n`);
    
    // Key workflows to check
    const keyWorkflows = [
      'deploy.yml',
      'generate-blog.yml',
      'autonomous-revenue-engine.yml',
      'autonomous-revenue-engine-health-check.yml',
      'blog-health-check.yml'
    ];

    const workflowMap = new Map<string, Workflow>();
    
    workflows.forEach((wf: Workflow) => {
      const fileName = wf.path.split('/').pop() || '';
      console.log(`   - ${wf.name} (${fileName}) [${wf.state}]`);
      if (keyWorkflows.includes(fileName)) {
        workflowMap.set(fileName, wf);
      }
    });
    console.log('');

    // 3. Check each key workflow's recent runs
    console.log('📋 Step 3: Checking Recent Runs for Key Workflows...\n');
    
    for (const [fileName, workflow] of workflowMap.entries()) {
      console.log(`   🔍 ${workflow.name} (${fileName}):`);
      
      const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=5`;
      const runsResponse = await fetch(runsUrl, { headers });
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        const runs: WorkflowRun[] = runsData.workflow_runs || [];
        
        console.log(`      Total runs: ${runsData.total_count || 0}`);
        
        if (runs.length > 0) {
          console.log(`      Recent runs:`);
          runs.slice(0, 3).forEach(run => {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            const statusIcon = 
              run.status === 'queued' ? '⏳' :
              run.status === 'in_progress' ? '🔄' :
              run.status === 'completed' && run.conclusion === 'success' ? '✅' :
              run.status === 'completed' && run.conclusion === 'failure' ? '❌' :
              run.status === 'cancelled' ? '🚫' : '❓';
            
            console.log(`        ${statusIcon} Run #${run.run_number}: ${run.status} (${run.conclusion || 'in progress'}) - ${age}m ago`);
            console.log(`           Event: ${run.event} | Branch: ${run.head_branch}`);
          });
        } else {
          console.log(`      ⚠️  No runs found! This workflow may not be triggering.`);
        }
      } else {
        console.log(`      ❌ Failed to fetch runs: ${runsResponse.status}`);
      }
      console.log('');
    }

    // 4. Check for stuck/queued runs across all workflows
    console.log('📋 Step 4: Finding All Stuck/Queued Runs...\n');
    
    let totalStuck = 0;
    const stuckRuns: Array<{workflow: string, run: WorkflowRun}> = [];
    
    for (const [fileName, workflow] of workflowMap.entries()) {
      const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=10&status=all`;
      const runsResponse = await fetch(runsUrl, { headers });
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        const runs: WorkflowRun[] = runsData.workflow_runs || [];
        
        const stuck = runs.filter(run => 
          run.status === 'queued' || 
          (run.status === 'in_progress' && run.conclusion === null) ||
          (run.status === 'waiting' && run.conclusion === null)
        );
        
        if (stuck.length > 0) {
          console.log(`   ⚠️  ${workflow.name}: ${stuck.length} stuck run(s)`);
          stuck.forEach(run => {
            const age = Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000 / 60);
            console.log(`      - Run #${run.run_number}: ${run.status} (${age}m ago)`);
            stuckRuns.push({workflow: workflow.name, run});
          });
          totalStuck += stuck.length;
        }
      }
    }
    
    if (totalStuck === 0) {
      console.log('   ✅ No stuck runs found across all workflows\n');
    } else {
      console.log(`\n   ⚠️  Total stuck runs: ${totalStuck}\n`);
    }

    // 5. Check GitHub Actions usage/limits
    console.log('📋 Step 5: Checking GitHub Actions Usage...\n');
    const usageUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1`;
    const usageResponse = await fetch(usageUrl, { headers });
    
    if (usageResponse.ok) {
      const usageData = await usageResponse.json();
      console.log(`   Total workflow runs in repository: ${usageData.total_count || 'N/A'}`);
      
      // Check rate limit headers
      const remaining = usageResponse.headers.get('x-ratelimit-remaining');
      const limit = usageResponse.headers.get('x-ratelimit-limit');
      if (remaining && limit) {
        console.log(`   API Rate Limit: ${remaining}/${limit} remaining`);
      }
    }
    console.log('');

    // 6. Summary and recommendations
    console.log('='.repeat(60));
    console.log('📊 DIAGNOSTIC SUMMARY\n');
    
    if (totalStuck > 0) {
      console.log(`❌ ISSUE DETECTED: ${totalStuck} stuck run(s) found\n`);
      console.log('💡 Recommendations:');
      console.log('   1. Run: npm run cancel-stuck-deployments');
      console.log('   2. Check GitHub Actions billing/usage limits');
      console.log('   3. Verify repository Actions are enabled');
      console.log('   4. Check if workflows have syntax errors\n');
    } else {
      console.log('✅ No stuck runs detected\n');
    }

    // Check if scheduled workflows are running
    const scheduledWorkflows = ['generate-blog.yml', 'autonomous-revenue-engine.yml'];
    const missingRuns: string[] = [];
    
    for (const fileName of scheduledWorkflows) {
      const workflow = workflowMap.get(fileName);
      if (workflow) {
        const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=1`;
        const runsResponse = await fetch(runsUrl, { headers });
        if (runsResponse.ok) {
          const runsData = await runsResponse.json();
          if ((runsData.total_count || 0) === 0) {
            missingRuns.push(workflow.name);
          }
        }
      }
    }
    
    if (missingRuns.length > 0) {
      console.log(`⚠️  WORKFLOW DETECTION ISSUE: These scheduled workflows have 0 runs:`);
      missingRuns.forEach(name => console.log(`   - ${name}`));
      console.log('\n💡 This suggests workflows are not being detected or triggered.\n');
      console.log('   Possible causes:');
      console.log('   1. Workflow files not committed/pushed to GitHub');
      console.log('   2. GitHub Actions disabled in repository settings');
      console.log('   3. Workflow syntax errors preventing detection');
      console.log('   4. Repository Actions permissions issue\n');
    }

    // 7. Provide actionable next steps
    console.log('='.repeat(60));
    console.log('🚀 NEXT STEPS\n');
    
    if (totalStuck > 0) {
      console.log('1. Cancel stuck runs:');
      console.log('   npm run cancel-stuck-deployments\n');
    }
    
    console.log('2. Check repository Actions settings:');
    console.log(`   https://github.com/${GITHUB_REPO}/settings/actions\n`);
    
    console.log('3. Verify workflow files are committed:');
    console.log(`   https://github.com/${GITHUB_REPO}/tree/main/.github/workflows\n`);
    
    console.log('4. Check GitHub Actions billing:');
    console.log(`   https://github.com/${GITHUB_REPO}/settings/billing\n`);

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  diagnoseAllWorkflows().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { diagnoseAllWorkflows };
