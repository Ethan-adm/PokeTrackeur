// --- 1. ETAT GLOBAL ET SAUVEGARDE ---
let cardDatabase = []; 
let currentDeck = JSON.parse(localStorage.getItem('tcgDeck')) || [];
let stats = JSON.parse(localStorage.getItem('tcgStats')) || {
    rating: 1500,
    wins: 0,
    losses: 0,
    matchHistory: [1500]
};
const maxDeckSize = 20;

function saveData() {
    localStorage.setItem('tcgDeck', JSON.stringify(currentDeck));
    localStorage.setItem('tcgStats', JSON.stringify(stats));
}

// --- 2. RECUPERATION DES CARTES (API) ---
// On limite à 100 cartes pour l'instant pour que le chargement soit rapide
async function fetchCardsFromAPI() {
    const catalog = document.getElementById('builder-catalog');
    if (!catalog) return; // Si on n'est pas sur la page Deck, on ne fait rien

    try {
        const response = await fetch('https://api.pokemontcg.io/v2/cards?pageSize=100');
        const data = await response.json();
        
        cardDatabase = data.data.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.images.small 
        }));

        renderCatalog();
    } catch (error) {
        console.error("Erreur API :", error);
        catalog.innerHTML = `<div class="col-span-full text-center text-red-400 font-bold bg-red-900/20 p-4 rounded-xl border border-red-500/30">Erreur de chargement. Veuillez rafraîchir la page.</div>`;
    }
}

function renderCatalog() {
    const catalogContainer = document.getElementById('builder-catalog');
    catalogContainer.innerHTML = ''; // Enlève le logo de chargement

    cardDatabase.forEach(card => {
        const img = document.createElement('img');
        img.src = card.imageUrl;
        img.loading = "lazy";
        // Effet de survol gaming (bordure lumineuse)
        img.className = 'w-full rounded-xl shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] border-2 border-transparent hover:border-fuchsia-400';
        img.onclick = () => addToDeck(card);
        catalogContainer.appendChild(img);
    });
}

// --- 3. GESTION DU DECK ---
function addToDeck(card) {
    if (currentDeck.length >= maxDeckSize) return alert("Deck plein (20 cartes) !");
    if (currentDeck.filter(c => c.id === card.id).length >= 2) return alert("2 exemplaires max !");
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

// Met à jour l'affichage des images du deck sur la page active
function updateBuilderViews() {
    const builderContainer = document.getElementById('builder-deck-container');
    const dashboardContainer = document.getElementById('dashboard-deck-container');

    if (builderContainer) {
        builderContainer.innerHTML = '';
        document.getElementById('builder-deck-count').innerText = `${currentDeck.length} / 20`;
        currentDeck.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.className = 'w-full rounded-lg shadow-sm cursor-pointer hover:scale-105 transition hover:opacity-50 hover:border-red-500 border-2 border-transparent';
            img.title = "Cliquez pour retirer";
            img.onclick = () => removeFromDeck(index);
            builderContainer.appendChild(img);
        });
    }

    if (dashboardContainer) {
        dashboardContainer.innerHTML = '';
        currentDeck.forEach(card => {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.className = 'w-full rounded-lg shadow-md border border-white/10';
            dashboardContainer.appendChild(img);
        });
    }
}

// --- 4. GESTION DU TRACKER (Dashboard) ---
let ratingChart;

function initTracker() {
    const ctxElement = document.getElementById('ratingChart');
    if (!ctxElement) return;

    const ctx = ctxElement.getContext('2d');
    
    // Configuration avancée de Chart.js pour correspondre au design sombre
    ratingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stats.matchHistory.map((_, i) => i === 0 ? 'Start' : `M${i}`),
            datasets: [{
                label: 'Points',
                data: [...stats.matchHistory],
                borderColor: '#d946ef', // Fuchsia-500
                backgroundColor: 'rgba(217, 70, 239, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#d946ef',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.3 // Courbe fluide
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    ticks: { color: '#94a3b8', font: { family: 'sans-serif', size: 10 } }, 
                    grid: { color: 'rgba(255,255,255,0.05)' } 
                },
                x: { 
                    ticks: { color: '#94a3b8', font: { family: 'sans-serif', size: 10 } }, 
                    grid: { display: false } 
                }
            }
        }
    });

    refreshStatsUI();
    rebuildHistoryLog();
}

function addWin() {
    stats.wins += 1;
    stats.rating += 20;
    updateStats("VICTOIRE", "text-emerald-400 bg-emerald-900/30 border-emerald-500/30");
}

function addLoss() {
    stats.losses += 1;
    stats.rating -= 15;
    updateStats("DÉFAITE", "text-rose-400 bg-rose-900/30 border-rose-500/30");
}

function updateStats(resultText, badgeClass) {
    stats.matchHistory.push(stats.rating);
    saveData();
    refreshStatsUI();
    
    addHistoryEntry(resultText, badgeClass, stats.rating);

    ratingChart.data.labels.push(`M${stats.matchHistory.length - 1}`);
    ratingChart.data.datasets[0].data.push(stats.rating);
    ratingChart.update();
}

function addHistoryEntry(resultText, badgeClass, currentRating) {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    const newEntry = document.createElement('li');
    newEntry.className = "flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5";
    newEntry.innerHTML = `
        <span class="${badgeClass} border px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">${resultText}</span>
        <span class="text-sm font-bold text-slate-300">${currentRating} pt</span>
    `;
    historyList.prepend(newEntry);
}

function rebuildHistoryLog() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    historyList.innerHTML = '';
    // On recrée un faux historique visuel basé sur les stats actuelles si la page est rafraîchie
    if (stats.matchHistory.length > 1) {
        addHistoryEntry("Dernier Match", "text-slate-400 bg-slate-800 border-slate-600", stats.rating);
    }
}

function refreshStatsUI() {
    const totalGames = stats.wins + stats.losses;
    const winrate = totalGames === 0 ? 0 : ((stats.wins / totalGames) * 100).toFixed(1);
    
    document.getElementById('current-rating').innerText = stats.rating;
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

// --- LANCEMENT AU CHARGEMENT DE LA PAGE ---
// On s'assure que le HTML est bien lu avant de lancer les scripts
document.addEventListener('DOMContentLoaded', () => {
    updateBuilderViews(); // Affiche le deck sauvegardé tout de suite
    initTracker();        // Initialise le graph
    fetchCardsFromAPI();  // Lance le téléchargement des images de cartes
});
