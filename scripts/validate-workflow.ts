import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PocketPortfolio';
const REPO_NAME = 'Financialprofilenetwork';
const REPO = `${REPO_OWNER}/${REPO_NAME}`;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
};

async function validateWorkflow(workflowPath: string) {
  const workflowName = path.basename(workflowPath);
  console.log(`\n🔍 Validating: ${workflowName}`);
  
  try {
    // Read the workflow file
    const content = fs.readFileSync(workflowPath, 'utf-8');
    
    // Check if file exists in GitHub
    try {
      const fileUrl = `https://api.github.com/repos/${REPO}/contents/.github/workflows/${workflowName}`;
      const fileResponse = await fetch(fileUrl, { headers });
      
      if (fileResponse.ok) {
        const data: any = await fileResponse.json();
        if (data.content) {
          const githubContent = Buffer.from(data.content, 'base64').toString('utf-8');
          if (githubContent === content) {
            console.log(`  ✅ File matches GitHub`);
          } else {
            console.log(`  ⚠️  File content differs from GitHub`);
          }
        }
      } else if (fileResponse.status === 404) {
        console.log(`  ❌ File not found in GitHub repository`);
      } else {
        console.log(`  ⚠️  Could not verify file: ${fileResponse.status}`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  Could not verify file in GitHub: ${error.message}`);
    }
    
    // Get workflow runs
    try {
      const workflowsUrl = `https://api.github.com/repos/${REPO}/actions/workflows`;
      const workflowsResponse = await fetch(workflowsUrl, { headers });
      
      if (workflowsResponse.ok) {
        const workflowsData: any = await workflowsResponse.json();
        const workflow = workflowsData.workflows.find((w: any) => w.path.includes(workflowName));
        
        if (workflow) {
          console.log(`  ✅ Workflow found in GitHub (ID: ${workflow.id})`);
          console.log(`  📊 State: ${workflow.state}`);
          
          // Get runs for this workflow
          const runsUrl = `https://api.github.com/repos/${REPO}/actions/workflows/${workflow.id}/runs?per_page=5`;
          const runsResponse = await fetch(runsUrl, { headers });
          
          if (runsResponse.ok) {
            const runsData: any = await runsResponse.json();
            console.log(`  📈 Total runs: ${runsData.total_count}`);
            if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
              const latest = runsData.workflow_runs[0];
              console.log(`  🕐 Latest run: ${latest.status} (${latest.conclusion || 'in progress'})`);
              console.log(`     Created: ${latest.created_at}`);
              console.log(`     URL: ${latest.html_url}`);
            } else {
              console.log(`  ⚠️  No runs found (this is the problem!)`);
            }
          } else {
            console.log(`  ⚠️  Could not fetch runs: ${runsResponse.status}`);
          }
        } else {
          console.log(`  ❌ Workflow not found in GitHub Actions`);
          console.log(`     Available workflows: ${workflowsData.workflows.map((w: any) => w.name).join(', ')}`);
        }
      } else {
        console.log(`  ⚠️  Could not fetch workflows: ${workflowsResponse.status}`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  Could not check workflow status: ${error.message}`);
    }
    
  } catch (error: any) {
    console.log(`  ❌ Error reading file: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 Validating GitHub Actions Workflows\n');
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}\n`);
  
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  
  for (const file of files) {
    await validateWorkflow(path.join(workflowsDir, file));
  }
  
  console.log('\n✅ Validation complete');
}

main().catch(console.error);

