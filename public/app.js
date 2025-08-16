// Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.apiKey) {
  console.warn('Firebase config missing. Set VITE_FIREBASE_* variables in .env');
}

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const trades = [];

function renderTrades() {
  const tbody = document.querySelector('#trades-table tbody');
  tbody.innerHTML = '';
  trades.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="px-2 py-1">${t.date}</td><td class="px-2 py-1">${t.ticker}</td><td class="px-2 py-1">${t.quantity}</td><td class="px-2 py-1">${t.price}</td><td class="px-2 py-1">${t.mock ? '✓' : ''}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('invested').textContent = trades
    .filter((t) => !t.mock)
    .reduce((s, t) => s + t.quantity * t.price, 0)
    .toFixed(2);
  document.getElementById('trade-count').textContent = trades.length;
  const distinct = new Set(trades.map((t) => t.ticker));
  document.getElementById('positions').textContent = distinct.size;
}

function addTrade(trade) {
  trades.push(trade);
  renderTrades();
  if (auth.currentUser) {
    db.collection('trades').add({ ...trade, uid: auth.currentUser.uid });
  }
}

document.getElementById('trade-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const trade = {
    date: document.getElementById('date').value,
    ticker: document.getElementById('ticker').value,
    quantity: parseFloat(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value),
    mock: document.getElementById('mock').checked,
  };
  addTrade(trade);
  e.target.reset();
});

// CSV Upload
const csvFile = document.getElementById('csv-file');
csvFile.addEventListener('change', () => {
  const file = csvFile.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      results.data.forEach((row) => {
        if (!row.ticker && !row.Ticker) return;
        const trade = {
          date: row.date || row.Date,
          ticker: row.ticker || row.Ticker,
          quantity: parseFloat(row.quantity || row.Qty),
          price: parseFloat(row.price || row.Price),
          mock: row.mock === 'true' || row.Mock === 'true',
        };
        addTrade(trade);
      });
    },
  });
});

// JSON export/import
const exportBtn = document.getElementById('export-json');
const importInput = document.getElementById('import-json');

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(trades, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trades.json';
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      parsed.forEach(addTrade);
    } catch (err) {
      alert('Invalid JSON file');
    }
    importInput.value = '';
  };
  reader.readAsText(file);
});

// Authentication
const signInBtn = document.getElementById('sign-in');
const signOutBtn = document.getElementById('sign-out');

signInBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

signOutBtn.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged((user) => {
  if (user) {
    signInBtn.style.display = 'none';
    signOutBtn.style.display = 'inline-block';
    db.collection('trades')
      .where('uid', '==', user.uid)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => trades.push(doc.data()));
        renderTrades();
      });
  } else {
    signInBtn.style.display = 'inline-block';
    signOutBtn.style.display = 'none';
  }
});

// PWA: register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

