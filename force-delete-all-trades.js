// Console script to force delete ALL trades from the database
// Run this in your browser's developer console while on the dashboard page

async function forceDeleteAllTrades() {
  try {
    // Get the current user from the auth context
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, collection, query, getDocs, deleteDoc, doc, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No user signed in');
      return;
    }
    
    console.log('🗑️ Force deleting ALL trades for user:', user.uid);
    
    const db = getFirestore();
    const tradesRef = collection(db, 'trades');
    
    // Get ALL trades in the database
    const allTradesSnapshot = await getDocs(tradesRef);
    console.log(`📊 Found ${allTradesSnapshot.size} total trades in database`);
    
    if (allTradesSnapshot.size === 0) {
      console.log('✅ No trades to delete');
      return;
    }
    
    // Delete all trades in batches
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    allTradesSnapshot.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref);
      deletedCount++;
      console.log(`🗑️ Queued for deletion: ${docSnapshot.id} - ${docSnapshot.data().ticker}`);
    });
    
    // Commit the batch deletion
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${deletedCount} trades`);
    
    // Refresh the page to see the changes
    console.log('🔄 Refreshing page...');
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error force deleting trades:', error);
  }
}

// Run the force deletion
forceDeleteAllTrades();
