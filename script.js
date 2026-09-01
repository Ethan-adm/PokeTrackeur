// --- 1. BASE DE DONNÉES & DECK (Existant) ---
const cardDatabase = [
    { id: '1', name: 'Pikachu ex', type: 'Électrique', color: 'bg-yellow-400' },
    { id: '2', name: 'Dracaufeu ex', type: 'Feu', color: 'bg-red-500' },
    { id: '3', name: 'Mewtwo ex', type: 'Psy', color: 'bg-purple-500' },
    { id: '4', name: 'Artikodin ex', type: 'Eau', color: 'bg-blue-400' },
    { id: '5', name: 'Sablaireau', type: 'Combat', color: 'bg-orange-700' },
    { id: '6', name: 'Poké Ball', type: 'Objet', color: 'bg-gray-300' },
    { id: '7', name: 'Recherches Prof.', type: 'Supporter', color: 'bg-gray-400' },
    { id: '8', name: 'Ondine', type: 'Supporter', color: 'bg-blue-200' },
    { id: '9', name: 'Morgane', type: 'Supporter', color: 'bg-pink-300' },
    { id: '10', name: 'Potion', type: 'Objet', color: 'bg-gray-200' }
];

let currentDeck = [];
const maxDeckSize = 20;

function renderCatalog() {
    const catalogContainer = document.getElementById('card-catalog');
    catalogContainer.innerHTML = '';
    cardDatabase.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `aspect-[2.5/3.5] ${card.color} border-2 border-gray-800 rounded-lg shadow-md flex items-center justify-center text-center p-1 cursor-pointer hover:scale-105 transition font-bold text-xs text-white`;
        cardEl.innerText = card.name;
        cardEl.onclick = () => addToDeck(card);
        catalogContainer.appendChild(cardEl);
    });
}

function addToDeck(card) {
    if (currentDeck.length >= maxDeckSize) return alert("Deck plein (20 cartes) !");
    if (currentDeck.filter(c => c.id === card.id).length >= 2) return alert("2 exemplaires maximum !");
    currentDeck.push(card);
    updateDeckView();
}

function removeFromDeck(index) {
    currentDeck.splice(index, 1);
    updateDeckView();
}

function clearDeck() {
    currentDeck = [];
    updateDeckView();
}

function updateDeckView() {
    const deckContainer = document.getElementById('deck-container');
    document.getElementById('deck-count').innerText = `${currentDeck.length} / 20 Cartes`;
    deckContainer.innerHTML = '';
    currentDeck.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `aspect-[2.5/3.5] ${card.color} border border-gray-600 rounded flex items-center justify-center text-[10px] text-center p-1 cursor-pointer font-bold text-white`;
        cardEl.innerText = card.name;
        cardEl.onclick = () => removeFromDeck(index);
        deckContainer.appendChild(cardEl);
    });
}

// --- 2. LOGIQUE DU TRACKER DE MATCHS ---
let stats = {
    rating: 3493,
    wins: 4,
    losses: 1,
    matchHistory: [3400, 3420, 3390, 3450, 3493] // Points
};

// Initialisation du Graphique
const ctx = document.getElementById('ratingChart').getContext('2d');
let ratingChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['M1', 'M2', 'M3', 'M4', 'M5'], // M = Match
        datasets: [{
            label: 'Points',
            data: [...stats.matchHistory],
            borderColor: '#800080',
            backgroundColor: 'rgba(128, 0, 128, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#800080',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    }
});

// Fonction déclenchée par le bouton "Victoire"
function addWin() {
    stats.wins += 1;
    stats.rating += 20; // +20 points par victoire
    updateStats("Victoire", "text-green-600");
}

// Fonction déclenchée par le bouton "Défaite"
function addLoss() {
    stats.losses += 1;
    stats.rating -= 15; // -15 points par défaite
    updateStats("Défaite", "text-red-600");
}

// Met à jour l'interface, le graphique et l'historique
function updateStats(resultText, colorClass) {
    // 1. Mettre à jour l'historique de données
    stats.matchHistory.push(stats.rating);
    
    // 2. Calcul du Winrate
    const totalGames = stats.wins + stats.losses;
    const winrate = totalGames === 0 ? 0 : ((stats.wins / totalGames) * 100).toFixed(1);
    
    // 3. Mettre à jour les textes dans le HTML
    document.getElementById('current-rating').innerText = `${stats.rating} pt`;
    document.getElementById('wins-count').innerText = `${stats.wins}W`;
    document.getElementById('losses-count').innerText = `${stats.losses}L`;
    document.getElementById('winrate-pct').innerText = `${winrate}%`;

    // 4. Ajouter une ligne dans l'historique textuel
    const historyList = document.getElementById('history-list');
    const newEntry = document.createElement('li');
    newEntry.innerHTML = `<span class="font-bold ${colorClass}">${resultText}</span> - Nouveau Rating : ${stats.rating} pt`;
    historyList.prepend(newEntry); // Ajoute au début de la liste

    // 5. Mettre à jour le Graphique Chart.js
    const matchNumber = stats.matchHistory.length;
    ratingChart.data.labels.push(`M${matchNumber}`);
    ratingChart.data.datasets[0].data.push(stats.rating);
    ratingChart.update(); // Demande à Chart.js de se redessiner
}

// Lancement de l'affichage du deck
renderCatalog();
updateDeckView();
