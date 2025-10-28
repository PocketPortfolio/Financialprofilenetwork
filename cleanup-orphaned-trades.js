// Console script to cleanup orphaned trades
// Run this in your browser's developer console while on the dashboard page

async function cleanupOrphanedTrades() {
  try {
    // Get the current user from the auth context
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, collection, query, getDocs, deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No user signed in');
      return;
    }
    
    console.log('🧹 Starting cleanup for user:', user.uid);
    
    const db = getFirestore();
    const tradesRef = collection(db, 'trades');
    const querySnapshot = await getDocs(tradesRef);
    
    let cleanedCount = 0;
    let totalTrades = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      totalTrades++;
      const tradeData = docSnapshot.data();
      
      if (!tradeData.uid || tradeData.uid !== user.uid) {
        console.log('🗑️ Deleting orphaned trade:', docSnapshot.id, 'uid:', tradeData.uid);
        await deleteDoc(docSnapshot.ref);
        cleanedCount++;
      }
    }
    
    console.log(`✅ Cleanup complete! Removed ${cleanedCount} orphaned trades out of ${totalTrades} total trades`);
    
    // Refresh the page to see the changes
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupOrphanedTrades();
