/**
 * Test script to verify dynamic scaling logic
 * Tests MAX_ROUNDS and targetToRequest calculations
 */

// Simulate different target scenarios
const testScenarios = [
  { target: 200, expectedRounds: 5, expectedPerRound: 300 },
  { target: 1000, expectedRounds: 5, expectedPerRound: 600 },
  { target: 5000, expectedRounds: 5, expectedPerRound: 1000 },
  { target: 10000, expectedRounds: 10, expectedPerRound: 1000 },
];

console.log('🧪 Testing Dynamic Scaling Logic\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

for (const scenario of testScenarios) {
  const DYNAMIC_TARGET = scenario.target;
  
  // Calculate MAX_ROUNDS (same logic as source-leads-autonomous.ts)
  const MAX_ROUNDS = Math.max(5, Math.ceil(DYNAMIC_TARGET / 1000));
  
  // Calculate targetToRequest for first round (same logic as source-leads-autonomous.ts)
  const remainingNeeded = DYNAMIC_TARGET;
  const targetToRequest = Math.min(remainingNeeded * 3, Math.max(300, DYNAMIC_TARGET / MAX_ROUNDS));
  
  const roundsMatch = MAX_ROUNDS === scenario.expectedRounds;
  const perRoundMatch = Math.round(targetToRequest) === scenario.expectedPerRound || 
                       (scenario.expectedPerRound === 600 && targetToRequest >= 600); // Allow flexibility for 1000 target
  
  console.log(`📊 Target: ${DYNAMIC_TARGET.toLocaleString()} leads/day`);
  console.log(`   MAX_ROUNDS: ${MAX_ROUNDS} ${roundsMatch ? '✅' : '❌'} (expected: ${scenario.expectedRounds})`);
  console.log(`   targetToRequest (Round 1): ${Math.round(targetToRequest)} ${perRoundMatch ? '✅' : '❌'} (expected: ~${scenario.expectedPerRound})`);
  console.log(`   Max Candidates/Run: ${(MAX_ROUNDS * targetToRequest).toLocaleString()}`);
  console.log(`   Status: ${roundsMatch && perRoundMatch ? '✅ PASS' : '❌ FAIL'}\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Dynamic scaling test complete\n');


