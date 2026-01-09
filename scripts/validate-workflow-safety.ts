/**
 * Workflow Safety Validation
 * 
 * Ensures all critical workflows have proper error handling
 * Prevents blocking issues from stopping the revenue engine
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const WORKFLOW_DIR = '.github/workflows';
const CRITICAL_WORKFLOWS = [
  'autonomous-revenue-engine.yml',
];

interface ValidationResult {
  file: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function validateWorkflow(filePath: string): ValidationResult {
  const content = readFileSync(filePath, 'utf-8');
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for blocking exit codes in non-critical steps
  if (content.includes('exit 1') && !content.includes('continue-on-error: true')) {
    // Check if it's in a verification step (should be non-blocking)
    if (content.includes('db:verify') || content.includes('Verify Database Schema')) {
      errors.push('❌ CRITICAL: db:verify step has exit 1 without continue-on-error - this will block the workflow!');
    }
  }

  // Check for blocking error handling in main execution steps
  const mainSteps = [
    'source-leads-autonomous',
    'process-leads-autonomous',
    'process-inbound-autonomous',
  ];

  for (const step of mainSteps) {
    if (content.includes(step)) {
      // Check if the step has continue-on-error
      const stepRegex = new RegExp(`- name:.*${step}.*?\\n(?:[^\\n]*\\n)*?.*run:`, 's');
      const match = content.match(stepRegex);
      if (match && !match[0].includes('continue-on-error: true')) {
        warnings.push(`⚠️ Main execution step "${step}" should have continue-on-error: true`);
      }
    }
  }

  // Check for proper error handling
  if (!content.includes('continue-on-error: true') && content.includes('||')) {
    warnings.push('⚠️ Error handling present but no continue-on-error - verify this is intentional');
  }

  return {
    file: filePath,
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

function main() {
  console.log('🔍 Validating Workflow Safety');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results: ValidationResult[] = [];

  for (const workflow of CRITICAL_WORKFLOWS) {
    const filePath = join(process.cwd(), WORKFLOW_DIR, workflow);
    try {
      const result = validateWorkflow(filePath);
      results.push(result);
    } catch (error: any) {
      results.push({
        file: workflow,
        passed: false,
        errors: [`Failed to read file: ${error.message}`],
        warnings: [],
      });
    }
  }

  // Report results
  let allPassed = true;
  for (const result of results) {
    console.log(`📄 ${result.file}`);
    if (result.errors.length > 0) {
      allPassed = false;
      result.errors.forEach(err => console.log(`  ${err}`));
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => console.log(`  ${warn}`));
    }
    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('  ✅ Passed');
    }
    console.log('');
  }

  if (!allPassed) {
    console.log('❌ Validation FAILED - Fix errors before committing!');
    process.exit(1);
  }

  console.log('✅ All workflows validated - safe to commit');
}

if (require.main === module) {
  main();
}

export { validateWorkflow };

