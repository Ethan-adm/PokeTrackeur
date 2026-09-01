// --- 1. BASE DE DONNÉES DYNAMIQUE (API) ---
let cardDatabase = []; // Sera rempli automatiquement par l'API

// Fonction pour récupérer les cartes depuis internet
async function fetchCardsFromAPI() {
    try {
        // On cible ici l'API publique (exemple avec les 100 premières cartes pour charger vite)
        // Plus tard, tu pourras remplacer ce lien par une API spécifique à TCG Pocket
        const response = await fetch('https://api.pokemontcg.io/v2/cards?pageSize=100');
        const data = await response.json();
        
        // On formate les données reçues pour notre application
        cardDatabase = data.data.map(card => ({
            id: card.id,
            name: card.name,
            imageUrl: card.images.small // L'API fournit l'URL directe de l'image
        }));

        // Une fois les cartes téléchargées, on affiche le catalogue
        initBuilder();
    } catch (error) {
        console.error("Erreur lors du chargement des cartes :", error);
        document.getElementById('builder-catalog').innerHTML = "<p class='text-red-500 col-span-full'>Erreur de chargement des cartes. Vérifie ta connexion.</p>";
    }
}

// --- 2. GESTION DU LOCALSTORAGE (Mémoire du navigateur) ---
let currentDeck = JSON.parse(localStorage.getItem('tcgDeck')) || [];
let stats = JSON.parse(localStorage.getItem('tcgStats')) || {
    rating: 1500,
    wins: 0,
    losses: 0,
    matchHistory: [1500]
};

function saveData() {
    localStorage.setItem('tcgDeck', JSON.stringify(currentDeck));
    localStorage.setItem('tcgStats', JSON.stringify(stats));
}

// --- 3. FONCTIONS DU DECK BUILDER (Page deck.html) ---
const maxDeckSize = 20;

function addToDeck(card) {
    if (currentDeck.length >= maxDeckSize) return alert("Deck plein (20 cartes) !");
    if (currentDeck.filter(c => c.id === card.id).length >= 2) return alert("2 exemplaires max par carte !");
    currentDeck.push(card);
    saveData();
    updateBuilderViews();
}

function removeFromDeck(index) {
    currentDeck.splice(index, 1);
    saveData();
    updateBuilderViews();
}

function clearDeck() {
    currentDeck = [];
    saveData();
    updateBuilderViews();
}

function updateBuilderViews() {
    // Vue du deck en construction (deck.html)
    const builderContainer = document.getElementById('builder-deck-container');
    if (builderContainer) {
        builderContainer.innerHTML = '';
        document.getElementById('builder-deck-count').innerText = `${currentDeck.length} / 20`;
        currentDeck.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.className = 'w-full rounded-md shadow-sm cursor-pointer hover:scale-105 transition border-2 border-transparent hover:border-red-500';
            img.onclick = () => removeFromDeck(index);
            builderContainer.appendChild(img);
        });
    }

    // Vue du deck sur le dashboard (index.html)
    const dashboardContainer = document.getElementById('dashboard-deck-container');
    if (dashboardContainer) {
        dashboardContainer.innerHTML = '';
        currentDeck.forEach(card => {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.className = 'w-full rounded shadow-sm border border-slate-600';
            dashboardContainer.appendChild(img);
        });
    }
}

// Initialiser le catalogue sur la page Deck
function initBuilder() {
    const catalogContainer = document.getElementById('builder-catalog');
    if (!catalogContainer) return; 

    catalogContainer.innerHTML = ''; // On vide le conteneur avant d'injecter

    cardDatabase.forEach(card => {
        const img = document.createElement('img');
        img.src = card.imageUrl;
        img.loading = "lazy"; // Optimisation : charge l'image uniquement quand on scrolle dessus
        img.className = 'w-full rounded-lg shadow-md cursor-pointer hover:scale-105 transition hover:shadow-purple-500/50';
        img.onclick = () => addToDeck(card);
        catalogContainer.appendChild(img);
    });
}

// --- 4. FONCTIONS DU TRACKER (Page index.html) ---
let ratingChart;

function initTracker() {
    const ctxElement = document.getElementById('ratingChart');
    if (!ctxElement) return;

    const ctx = ctxElement.getContext('2d');
    ratingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stats.matchHistory.map((_, i) => i === 0 ? 'Start' : `M${i}`),
            datasets: [{
                label: 'Points',
                data: [...stats.matchHistory],
                borderColor: '#c084fc', 
                backgroundColor: 'rgba(192, 132, 252, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#a855f7',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } },
                x: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } }
            }
        }
    });

    refreshStatsUI();
}

function addWin() {
    stats.wins += 1;
    stats.rating += 20;
    updateStats("Victoire", "text-green-400");
}

function addLoss() {
    stats.losses += 1;
    stats.rating -= 15;
    updateStats("Défaite", "text-red-400");
}

function updateStats(resultText, colorClass) {
    stats.matchHistory.push(stats.rating);
    saveData();
    refreshStatsUI();
    
    const historyList = document.getElementById('history-list');
    const newEntry = document.createElement('li');
    newEntry.innerHTML = `<span class="${colorClass} font-bold">${resultText}</span> • ${stats.rating} pt`;
    historyList.prepend(newEntry);

    ratingChart.data.labels.push(`M${stats.matchHistory.length - 1}`);
    ratingChart.data.datasets[0].data.push(stats.rating);
    ratingChart.update();
}

function refreshStatsUI() {
    const totalGames = stats.wins + stats.losses;
    const winrate = totalGames === 0 ? 0 : ((stats.wins / totalGames) * 100).toFixed(1);
    
    document.getElementById('current-rating').innerText = `${stats.rating} pt`;
    document.getElementById('wins-count').innerText = `${stats.wins}W`;
    document.getElementById('losses-count').innerText = `${stats.losses}L`;
    document.getElementById('winrate-pct').innerText = `${winrate}%`;
}

function resetStats() {
    if(confirm("Veux-tu vraiment remettre tes statistiques à zéro ?")) {
        stats = { rating: 1500, wins: 0, losses: 0, matchHistory: [1500] };
        saveData();
        location.reload();
    }
}

// --- INITIALISATION GLOBALE ---
// On lance la récupération de l'API en premier
fetchCardsFromAPI();
updateBuilderViews();
initTracker();
