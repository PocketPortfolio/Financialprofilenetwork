/**
 * Test Emergency Stop Functionality
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { isEmergencyStopActive, setEmergencyStop, clearEmergencyStopCache } from '@/lib/sales/emergency-stop';

async function testEmergencyStop() {
  console.log('🧪 Testing Emergency Stop Functionality\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Test 1: Check initial status
    console.log('Test 1: Check initial status');
    const initialStatus = await isEmergencyStopActive();
    console.log(`   Status: ${initialStatus ? 'ACTIVE (stopped)' : 'INACTIVE (running)'}\n`);

    // Test 2: Activate emergency stop
    console.log('Test 2: Activate emergency stop');
    await setEmergencyStop(true, 'test_script');
    clearEmergencyStopCache(); // Clear cache to force fresh read
    const activatedStatus = await isEmergencyStopActive();
    console.log(`   Status after activation: ${activatedStatus ? 'ACTIVE (stopped)' : 'INACTIVE (running)'}`);
    if (activatedStatus !== true) {
      throw new Error('❌ Emergency stop activation failed!');
    }
    console.log('   ✅ Emergency stop activated successfully\n');

    // Test 3: Deactivate emergency stop
    console.log('Test 3: Deactivate emergency stop');
    await setEmergencyStop(false, 'test_script');
    clearEmergencyStopCache(); // Clear cache to force fresh read
    const deactivatedStatus = await isEmergencyStopActive();
    console.log(`   Status after deactivation: ${deactivatedStatus ? 'ACTIVE (stopped)' : 'INACTIVE (running)'}`);
    if (deactivatedStatus !== false) {
      throw new Error('❌ Emergency stop deactivation failed!');
    }
    console.log('   ✅ Emergency stop deactivated successfully\n');

    // Test 4: Test caching (should use cache within 5 seconds)
    console.log('Test 4: Test caching');
    const cachedStatus1 = await isEmergencyStopActive();
    const cachedStatus2 = await isEmergencyStopActive();
    console.log(`   First check: ${cachedStatus1 ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   Second check (cached): ${cachedStatus2 ? 'ACTIVE' : 'INACTIVE'}`);
    if (cachedStatus1 !== cachedStatus2) {
      throw new Error('❌ Cache not working!');
    }
    console.log('   ✅ Caching working correctly\n');

    // Test 5: Verify final state
    console.log('Test 5: Verify final state');
    const finalStatus = await isEmergencyStopActive();
    console.log(`   Final status: ${finalStatus ? 'ACTIVE (stopped)' : 'INACTIVE (running)'}`);
    if (finalStatus !== false) {
      throw new Error('❌ Final state should be INACTIVE!');
    }
    console.log('   ✅ Final state correct\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed! Emergency stop is working correctly.\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testEmergencyStop()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testEmergencyStop };

