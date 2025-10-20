/**
 * Firestore Security Rules Tests
 * Run with: firebase emulators:exec --only firestore "npx vitest run tests/firestore-rules.spec.ts"
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'pocket-portfolio-test',
    firestore: {
      rules: await import('fs').then(fs => 
        fs.promises.readFile('firebase/firestore.rules', 'utf8')
      ),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Provider Health Rules', () => {
  it('allows anyone to read provider health', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(unauthedDb, 'providerHealth/test')));
  });

  it('denies writes from authenticated users', async () => {
    const userDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(
      setDoc(doc(userDb, 'providerHealth/test'), { provider: 'yahoo', lastSuccess: Date.now() })
    );
  });
});

describe('Portfolio Rules', () => {
  const userId = 'user123';

  it('allows users to read their own portfolios', async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    await setDoc(doc(adminDb, `users/${userId}/portfolios/p1`), {
      name: 'My Portfolio',
      createdAt: new Date(),
    });

    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertSucceeds(getDoc(doc(userDb, `users/${userId}/portfolios/p1`)));
  });

  it('denies users from reading other users portfolios', async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    await setDoc(doc(adminDb, `users/${userId}/portfolios/p1`), {
      name: 'My Portfolio',
      createdAt: new Date(),
    });

    const otherUserDb = testEnv.authenticatedContext('other-user').firestore();
    await assertFails(getDoc(doc(otherUserDb, `users/${userId}/portfolios/p1`)));
  });

  it('allows users to create portfolios with valid data', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertSucceeds(
      setDoc(doc(userDb, `users/${userId}/portfolios/new`), {
        name: 'New Portfolio',
        createdAt: new Date(),
      })
    );
  });

  it('denies portfolio creation without required fields', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertFails(
      setDoc(doc(userDb, `users/${userId}/portfolios/new`), {
        name: 'Incomplete',
        // missing createdAt
      })
    );
  });
});

describe('Trade Rules', () => {
  const userId = 'user123';
  const portfolioId = 'portfolio1';

  beforeEach(async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    await setDoc(doc(adminDb, `users/${userId}/portfolios/${portfolioId}`), {
      name: 'Test Portfolio',
      createdAt: new Date(),
    });
  });

  it('allows users to create trades with valid data', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertSucceeds(
      setDoc(doc(userDb, `users/${userId}/portfolios/${portfolioId}/trades/t1`), {
        symbol: 'AAPL',
        quantity: 10,
        price: 150.25,
        timestamp: new Date(),
      })
    );
  });

  it('denies trade creation without required fields', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertFails(
      setDoc(doc(userDb, `users/${userId}/portfolios/${portfolioId}/trades/t1`), {
        symbol: 'AAPL',
        quantity: 10,
        // missing price and timestamp
      })
    );
  });
});

describe('Watchlist Rules', () => {
  const userId = 'user123';

  it('allows users to create watchlists with up to 50 symbols', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertSucceeds(
      setDoc(doc(userDb, `users/${userId}/watchlists/w1`), {
        symbols: ['AAPL', 'GOOGL', 'MSFT'],
      })
    );
  });

  it('denies watchlists with more than 50 symbols', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    const tooManySymbols = Array.from({ length: 51 }, (_, i) => `SYM${i}`);
    await assertFails(
      setDoc(doc(userDb, `users/${userId}/watchlists/w1`), {
        symbols: tooManySymbols,
      })
    );
  });
});

describe('Telemetry Rules', () => {
  const userId = 'user123';

  it('allows authenticated users to create telemetry events', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertSucceeds(
      addDoc(collection(userDb, 'telemetry'), {
        userId,
        eventType: 'csv_import_success',
        timestamp: new Date(),
        metadata: { rowCount: 100 },
      })
    );
  });

  it('denies telemetry creation with wrong userId', async () => {
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertFails(
      addDoc(collection(userDb, 'telemetry'), {
        userId: 'different-user',
        eventType: 'csv_import_success',
        timestamp: new Date(),
      })
    );
  });

  it('denies telemetry updates (immutable)', async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    const docRef = await addDoc(collection(adminDb, 'telemetry'), {
      userId,
      eventType: 'test_event',
      timestamp: new Date(),
    });

    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertFails(updateDoc(doc(userDb, 'telemetry', docRef.id), { eventType: 'modified' }));
  });
});

