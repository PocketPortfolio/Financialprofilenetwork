#!/usr/bin/env ts-node
/**
 * Check if the blog generation workflow executed at a specific time
 * and whether it should have generated posts
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'generate-blog.yml';

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  event: string;
  head_branch: string;
  html_url: string;
  run_number: number;
}

async function checkWorkflowExecution(targetDate?: string, targetHour?: number) {
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
    // Get workflow ID
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows`;
    const workflowsResponse = await fetch(workflowsUrl, { headers });
    
    if (!workflowsResponse.ok) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      const error = await workflowsResponse.text();
      console.error(error);
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

    // Get recent runs (last 20 to find the specific time)
    const runsUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${blogWorkflow.id}/runs?per_page=20&status=all`;
    console.log(`📡 Fetching recent workflow runs...\n`);
    
    const response = await fetch(runsUrl, { headers });
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`);
      const error = await response.text();
      console.error(error);
      process.exit(1);
    }

    const data = await response.json();
    const runs: WorkflowRun[] = data.workflow_runs || [];

    console.log(`📊 Total runs found: ${runs.length}\n`);

    // If target date/hour specified, filter for that
    let relevantRuns = runs;
    if (targetDate && targetHour !== undefined) {
      relevantRuns = runs.filter(run => {
        const runDate = new Date(run.created_at);
        const runDateStr = runDate.toISOString().split('T')[0];
        const runHour = runDate.getUTCHours();
        return runDateStr === targetDate && runHour === targetHour;
      });
      
      if (relevantRuns.length === 0) {
        console.log(`❌ NO WORKFLOW RUN FOUND for ${targetDate} at ${targetHour}:00 UTC\n`);
        console.log('📋 Checking nearby runs...\n');
        // Show runs within 2 hours
        const nearbyRuns = runs.filter(run => {
          const runDate = new Date(run.created_at);
          const runDateStr = runDate.toISOString().split('T')[0];
          const runHour = runDate.getUTCHours();
          const targetDateObj = new Date(`${targetDate}T${targetHour}:00:00Z`);
          const runDateObj = new Date(run.created_at);
          const diffHours = Math.abs((runDateObj.getTime() - targetDateObj.getTime()) / (1000 * 60 * 60));
          return diffHours <= 2;
        });
        
        if (nearbyRuns.length > 0) {
          console.log('Nearby runs (within 2 hours):\n');
          nearbyRuns.forEach(run => {
            const runDate = new Date(run.created_at);
            console.log(`  - ${runDate.toISOString()} (${run.status}/${run.conclusion || 'N/A'})`);
            console.log(`    URL: ${run.html_url}\n`);
          });
        } else {
          console.log('⚠️  No runs found within 2 hours of target time\n');
        }
      }
    }

    // Display relevant runs
    if (relevantRuns.length > 0) {
      console.log(`📋 ${targetDate && targetHour !== undefined ? 'Target' : 'Recent'} Workflow Runs:\n`);
      relevantRuns.forEach((run, index) => {
        const runDate = new Date(run.created_at);
        const status = run.status === 'completed' 
          ? (run.conclusion === 'success' ? '✅' : run.conclusion === 'failure' ? '❌' : run.conclusion === 'cancelled' ? '⚠️' : '❓')
          : run.status === 'in_progress' ? '🔄' 
          : run.status === 'queued' ? '⏳'
          : '❓';
        
        console.log(`${index + 1}. ${status} Run #${run.run_number}`);
        console.log(`   Status: ${run.status}`);
        console.log(`   Conclusion: ${run.conclusion || 'N/A'}`);
        console.log(`   Triggered: ${runDate.toISOString()} (${runDate.toLocaleString()})`);
        console.log(`   Event: ${run.event}`);
        console.log(`   Branch: ${run.head_branch}`);
        console.log(`   URL: ${run.html_url}`);
        
        if (run.status === 'completed' && run.conclusion === 'success') {
          console.log(`   ✅ Run completed successfully`);
        } else if (run.status === 'completed' && run.conclusion === 'failure') {
          console.log(`   ❌ Run FAILED - check logs at URL above`);
        } else if (run.status === 'in_progress') {
          console.log(`   🔄 Run is still in progress`);
        }
        console.log('');
      });

      // Check if posts should have been generated
      const fs = require('fs');
      const path = require('path');
      const calendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
      
      if (fs.existsSync(calendarPath)) {
        const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
        const today = targetDate || new Date().toISOString().split('T')[0];
        const expectedPosts = calendar.filter((p: any) => p.date === today && p.status === 'pending');
        
        if (expectedPosts.length > 0) {
          console.log(`\n⚠️  EXPECTED POSTS NOT GENERATED:\n`);
          expectedPosts.forEach((post: any) => {
            console.log(`   - ${post.title} (${post.date})`);
            console.log(`     ID: ${post.id}`);
            console.log(`     Status: ${post.status}`);
            console.log(`     Should have been generated: YES\n`);
          });
        } else {
          console.log(`\n✅ No posts expected for ${today} (all already generated or none scheduled)\n`);
        }
      }
    } else if (!targetDate || targetHour === undefined) {
      console.log('⚠️  No workflow runs found.\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let targetDate: string | undefined;
let targetHour: number | undefined;

if (args.length > 0) {
  // Format: YYYY-MM-DD or YYYY-MM-DD HH
  const dateMatch = args[0].match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}))?$/);
  if (dateMatch) {
    targetDate = dateMatch[1];
    targetHour = dateMatch[2] ? parseInt(dateMatch[2]) : undefined;
  } else {
    console.error('❌ Invalid date format. Use: YYYY-MM-DD or YYYY-MM-DD HH');
    console.error('   Example: 2026-01-06 9');
    process.exit(1);
  }
}

checkWorkflowExecution(targetDate, targetHour).catch(console.error);

