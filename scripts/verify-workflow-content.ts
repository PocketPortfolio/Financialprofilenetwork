#!/usr/bin/env ts-node
/**
 * Verify the workflow file content on GitHub matches local
 */

const GITHUB_REPO = 'PocketPortfolio/Financialprofilenetwork';
const WORKFLOW_FILE = 'deploy.yml';
const fs = require('fs');
const path = require('path');

async function verifyWorkflowContent() {
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
    // Get workflow file from GitHub
    const fileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/.github/workflows/${WORKFLOW_FILE}`;
    const response = await fetch(fileUrl, { headers });

    if (!response.ok) {
      console.error(`❌ Failed to fetch file: ${response.status}`);
      return;
    }

    const fileData = await response.json();
    const githubContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    
    // Read local file
    const localPath = path.join(__dirname, '..', '.github', 'workflows', WORKFLOW_FILE);
    const localContent = fs.readFileSync(localPath, 'utf-8');

    console.log('📋 Comparing workflow files:\n');
    console.log(`   GitHub SHA: ${fileData.sha}`);
    console.log(`   GitHub Size: ${fileData.size} bytes`);
    console.log(`   Local Size: ${localContent.length} bytes\n`);

    // Normalize line endings for comparison
    const normalize = (text: string) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const githubNormalized = normalize(githubContent);
    const localNormalized = normalize(localContent);

    if (githubNormalized === localNormalized) {
      console.log('✅ Files match exactly!\n');
    } else {
      console.log('❌ Files DO NOT match!\n');
      
      // Show differences
      const githubLines = githubNormalized.split('\n');
      const localLines = localNormalized.split('\n');
      
      console.log('📊 Line count comparison:');
      console.log(`   GitHub: ${githubLines.length} lines`);
      console.log(`   Local: ${localLines.length} lines\n`);

      // Find first difference
      const maxLines = Math.max(githubLines.length, localLines.length);
      for (let i = 0; i < maxLines; i++) {
        if (githubLines[i] !== localLines[i]) {
          console.log(`⚠️  First difference at line ${i + 1}:`);
          console.log(`   GitHub: ${githubLines[i] || '(missing)'}`);
          console.log(`   Local:  ${localLines[i] || '(missing)'}`);
          break;
        }
      }
    }

    // Check if timestamp comment is in GitHub version
    if (githubContent.includes('2025-12-30')) {
      console.log('\n✅ GitHub version contains today\'s timestamp update');
    } else {
      console.log('\n⚠️  GitHub version does NOT contain today\'s timestamp');
      console.log('   This means GitHub hasn\'t recognized the latest changes');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

verifyWorkflowContent();

