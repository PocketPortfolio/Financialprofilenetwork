// Firebase configuration - replace with your own project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const trades = [];

function renderTrades() {
  const tbody = document.querySelector('#trades-table tbody');
  tbody.innerHTML = '';
  trades.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.date}</td><td>${t.ticker}</td><td>${t.quantity}</td><td>${t.price}</td><td>${t.mock ? '✓' : ''}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('invested').textContent = trades.filter(t => !t.mock).reduce((s,t) => s + t.quantity * t.price, 0).toFixed(2);
  document.getElementById('trade-count').textContent = trades.length;
  const distinct = new Set(trades.map(t => t.ticker));
  document.getElementById('positions').textContent = distinct.size;
}

function addTrade(trade) {
  trades.push(trade);
  renderTrades();
  if (auth.currentUser) {
    db.collection('trades').add({ ...trade, uid: auth.currentUser.uid });
  }
}

document.getElementById('trade-form').addEventListener('submit', e => {
  e.preventDefault();
  const trade = {
    date: document.getElementById('date').value,
    ticker: document.getElementById('ticker').value,
    quantity: parseFloat(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value),
    mock: document.getElementById('mock').checked
  };
  addTrade(trade);
  e.target.reset();
});

// CSV Upload
const csvFile = document.getElementById('csv-file');
csvFile.addEventListener('change', () => {
  const file = csvFile.files[0];
  Papa.parse(file, {
    header: true,
    complete: results => {
      results.data.forEach(row => {
        if (!row.ticker) return;
        const trade = {
          date: row.date || row.Date,
          ticker: row.ticker || row.Ticker,
          quantity: parseFloat(row.quantity || row.Qty),
          price: parseFloat(row.price || row.Price),
          mock: row.mock === 'true' || row.Mock === 'true'
        };
        addTrade(trade);
      });
    }
  });
});

// Authentication
const signInBtn = document.getElementById('sign-in');
const signOutBtn = document.getElementById('sign-out');

signInBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

signOutBtn.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged(user => {
  if (user) {
    signInBtn.style.display = 'none';
    signOutBtn.style.display = 'inline';
    db.collection('trades').where('uid', '==', user.uid).get().then(snapshot => {
      snapshot.forEach(doc => trades.push(doc.data()));
      renderTrades();
    });
  } else {
    signInBtn.style.display = 'inline';
    signOutBtn.style.display = 'none';
  }
});

// PWA: register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
