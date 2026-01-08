/**
 * Test Script for Humanity Audit (Sprint 4 Features)
 * Tests: Culture, Timezone, Tone, Links
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { enrichLead } from '@/app/agent/researcher';
import { generateEmail } from '@/app/agent/outreach';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

const leadId = process.argv[2];

if (!leadId) {
  console.error('❌ Usage: ts-node test-enrich.ts [LEAD_ID]');
  process.exit(1);
}

async function testEnrichment() {
  console.log(`🔍 Testing enrichment for lead: ${leadId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // Enrich
    console.log('📊 Step 1: Enriching lead...');
    const researchData = await enrichLead(leadId);
    // Get updated lead (score is stored in lead, not researchData)
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    
    console.log('\n✅ Enrichment Complete:');
    console.log(`   - Detected Language: ${researchData.detectedLanguage || 'N/A'}`);
    console.log(`   - Detected Region: ${researchData.detectedRegion || 'N/A'}`);
    console.log(`   - Timezone: ${researchData.timezone || 'N/A'}`);
    console.log(`   - News Signals: ${researchData.newsSignals?.length || 0}`);
    console.log(`   - Score: ${lead?.score || 'N/A'}`);
    
    if (!lead) {
      throw new Error('Lead not found after enrichment');
    }
    
    // Generate email
    console.log('\n📧 Step 2: Generating email...');
    const { email, reasoning } = await generateEmail(
      leadId,
      {
        firstName: lead.firstName || undefined,
        companyName: lead.companyName,
        techStack: lead.techStackTags || [],
        researchSummary: lead.researchSummary || undefined,
        culturalContext: lead.detectedLanguage && lead.detectedRegion ? {
          detectedLanguage: lead.detectedLanguage,
          detectedRegion: lead.detectedRegion,
          confidence: 85,
          culturalPrompt: '',
          greeting: '',
        } : undefined,
        newsSignals: lead.newsSignals as any,
        selectedProduct: { id: 'corporateSponsor', name: 'Corporate Sponsor' },
        employeeCount: (lead.researchData as any)?.employeeCount,
      },
      'initial'
    );
    
    console.log('\n✅ Email Generated:');
    console.log(`   Subject: ${email.subject}`);
    console.log(`   Body Length: ${email.body.length} chars`);
    console.log(`   Reasoning: ${reasoning.substring(0, 200)}...`);
    
    // Check for Sprint 4 features
    console.log('\n🔍 Step 3: Sprint 4 Feature Checks:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Cultural Context
    const hasCulturalContext = lead.detectedLanguage && lead.detectedRegion;
    console.log(`   ${hasCulturalContext ? '✅' : '❌'} Cultural Context: ${hasCulturalContext ? `YES (${lead.detectedLanguage}/${lead.detectedRegion})` : 'NO'}`);
    
    // 2. Timezone
    const hasTimezone = lead.timezone;
    console.log(`   ${hasTimezone ? '✅' : '❌'} Timezone: ${hasTimezone ? `YES (${lead.timezone})` : 'NO'}`);
    
    // 3. Tone Check (Humble, Peer-to-Peer)
    const bodyLower = email.body.toLowerCase();
    const isHumble = bodyLower.includes('mostly reaching out') || 
                     bodyLower.includes('fellow engineer') ||
                     bodyLower.includes('tell me to get lost');
    const isPushy = bodyLower.includes('limited time') ||
                    bodyLower.includes('act now') ||
                    bodyLower.includes('transform your business');
    console.log(`   ${isHumble ? '✅' : '❌'} Tone (Humble): ${isHumble ? 'YES' : 'NO'}`);
    console.log(`   ${!isPushy ? '✅' : '❌'} Tone (Pushy): ${isPushy ? 'YES (FAIL)' : 'NO (PASS)'}`);
    
    // 4. Smart Link Check
    const linkMatches = email.body.match(/https?:\/\/[^\s]+utm_source=ai_pilot/g);
    const linkCount = linkMatches ? linkMatches.length : 0;
    const hasOneLink = linkCount === 1;
    console.log(`   ${hasOneLink ? '✅' : '❌'} Smart Link: ${hasOneLink ? 'YES (Exactly 1)' : `NO (Found ${linkCount})`}`);
    if (linkMatches) {
      console.log(`      Link: ${linkMatches[0].substring(0, 80)}...`);
    }
    
    // 5. News Signal Check
    const hasNewsSignal = lead.newsSignals && (lead.newsSignals as any[]).length > 0;
    console.log(`   ${hasNewsSignal ? '✅' : '⚠️ '} News Signal: ${hasNewsSignal ? 'YES' : 'NO (Optional)'}`);
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allPassed = hasCulturalContext && hasTimezone && isHumble && !isPushy && hasOneLink;
    if (allPassed) {
      console.log('✅ TEST 2 PASSED: All Sprint 4 features working correctly!');
    } else {
      console.log('⚠️  TEST 2 PARTIAL: Some features may need attention');
    }
    
    process.exit(allPassed ? 0 : 1);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testEnrichment();

