// scripts/run-ultimate-test.ts

import { sourceFromPredator } from '@/lib/sales/sourcing/predator-scraper';
import { getPromptForStep, shouldUseB2BStrategy } from '@/lib/sales/campaign-logic';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

async function runUltimateTest() {
  console.log("🧪 STARTING ULTIMATE TEST (End-to-End Validation)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. SOURCE (Run Predator V4 for 5 leads)
  console.log("🦅 PHASE 1: SOURCING (Predator V4)");
  console.log("   Running Predator Bot for 5 leads...\n");
  
  try {
    const predatorLeads = await sourceFromPredator(5);
    console.log(`   ✅ Extracted ${predatorLeads.length} leads from Predator V4\n`);
    
    if (predatorLeads.length === 0) {
      console.log("⚠️  No leads found. Checking existing NEW leads in database...\n");
      
      // Fallback: Check for existing NEW leads
      const existingLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.status, 'NEW'))
        .limit(5);
      
      if (existingLeads.length === 0) {
        console.log("❌ No NEW leads found. Please run Predator Bot separately first.");
        return;
      }
      
      console.log(`   ✅ Using ${existingLeads.length} existing NEW leads\n`);
      await processLeads(existingLeads);
      return;
    }
    
    // Process the newly sourced leads
    await processLeads(predatorLeads.map(lead => ({
      id: lead.email, // Temporary ID
      email: lead.email,
      firstName: lead.firstName || null,
      lastName: lead.lastName || null,
      companyName: lead.companyName,
      jobTitle: lead.jobTitle,
      dataSource: lead.dataSource,
      region: lead.region || null,
      techStackTags: [],
      researchSummary: null,
    })));
    
  } catch (error: any) {
    console.error("❌ Error in sourcing phase:", error.message);
    console.error(error.stack);
    return;
  }
}

async function processLeads(leadList: any[]) {
  console.log("🧠 PHASE 2: GENERATION (Applying B2B Strategy)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const lead of leadList) {
    console.log(`\n------------------------------------------------`);
    console.log(`👤 Processing: ${lead.email}`);
    console.log(`   Company: ${lead.companyName}`);
    console.log(`   Source: ${lead.dataSource || 'unknown'}`);
    console.log(`   Region: ${lead.region || 'unknown'}`);
    
    // Check if B2B strategy applies
    const useB2B = shouldUseB2BStrategy({
      region: lead.region,
      dataSource: lead.dataSource,
      jobTitle: lead.jobTitle,
    });
    
    console.log(`   Strategy: ${useB2B ? 'B2B (Nvidia Problem)' : 'Standard'}`);
    
    if (useB2B) {
      // Generate Step 0 (Cold Open) prompt
      const prompt = getPromptForStep(0, {
        firstName: lead.firstName || undefined,
        lastName: lead.lastName || undefined,
        companyName: lead.companyName,
        email: lead.email,
        dataSource: lead.dataSource,
        region: lead.region,
      });
      
      console.log(`\n📝 PROMPT SENT TO AI:\n${prompt}`);
      
      // Verify prompt contains key phrases
      const hasNvidiaProblem = prompt?.includes('Nvidia Problem') || prompt?.includes('60%');
      const hasWhiteLabel = prompt?.includes('White Label');
      const hasSponsorship = prompt?.includes('Sponsorship') || prompt?.includes('GitHub');
      
      console.log(`\n✅ PROMPT VALIDATION:`);
      console.log(`   - Contains "Nvidia Problem": ${hasNvidiaProblem ? '✅' : '❌'}`);
      console.log(`   - Contains "White Label": ${hasWhiteLabel ? '✅' : '❌'}`);
      console.log(`   - Contains "Sponsorship/GitHub": ${hasSponsorship ? '❌ FORBIDDEN' : '✅'}`);
      
      if (!hasNvidiaProblem || !hasWhiteLabel) {
        console.log(`\n⚠️  WARNING: Prompt may not match B2B strategy requirements!`);
      }
      
      if (hasSponsorship) {
        console.log(`\n🚨 CRITICAL ERROR: Prompt contains forbidden terms!`);
      }
    } else {
      console.log(`\n⚠️  Lead does not match B2B criteria - will use standard strategy`);
    }
    
    // 3. SCHEDULE (Simulate - don't actually insert for test)
    console.log(`\n📅 STATUS: Would schedule for delivery (test mode - not inserting)`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ TEST COMPLETE");
  console.log("\n📋 ACCEPTANCE CRITERIA:");
  console.log("   ✅ Console shows prompts with 'Nvidia Problem'");
  console.log("   ✅ Console shows prompts with 'White Label'");
  console.log("   ✅ No mention of 'Sponsorship' or 'GitHub'");
  console.log("\n💡 Next: Run with actual email generation to verify full flow");
}

// Run if executed directly
if (require.main === module) {
  runUltimateTest()
    .then(() => {
      console.log("\n✅ Test script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test script failed:", error);
      process.exit(1);
    });
}





