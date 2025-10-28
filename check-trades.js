// Console script to check what trades are in the database
// Run this in your browser's developer console while on the dashboard page

async function checkTrades() {
  try {
    // Get the current user from the auth context
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, collection, query, getDocs, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No user signed in');
      return;
    }
    
    console.log('🔍 Checking trades for user:', user.uid);
    
    const db = getFirestore();
    
    // Check trades with correct uid
    const tradesRef = collection(db, 'trades');
    const userTradesQuery = query(tradesRef, where('uid', '==', user.uid));
    const userTradesSnapshot = await getDocs(userTradesQuery);
    
    console.log(`📊 Trades with correct uid: ${userTradesSnapshot.size}`);
    userTradesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.ticker} (${data.type}) - uid: ${data.uid}`);
    });
    
    // Check all trades (including orphaned ones)
    const allTradesSnapshot = await getDocs(tradesRef);
    console.log(`📊 Total trades in database: ${allTradesSnapshot.size}`);
    
    let orphanedCount = 0;
    allTradesSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.uid || data.uid !== user.uid) {
        orphanedCount++;
        console.log(`  🚨 Orphaned trade: ${doc.id}: ${data.ticker} (${data.type}) - uid: ${data.uid || 'missing'}`);
      }
    });
    
    console.log(`🚨 Orphaned trades: ${orphanedCount}`);
    
    if (orphanedCount > 0) {
      console.log('💡 Run cleanup script to remove orphaned trades');
    }
    
  } catch (error) {
    console.error('❌ Error checking trades:', error);
  }
}

// Run the check
checkTrades();
