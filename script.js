// --- 1. DATA POCKET TCG (Meta Limitless / Assets Serebii via Proxy) ---
// Utilisation d'un Proxy (wsrv.nl) pour contourner le blocage anti-hotlink de Serebii et supprimer le lag
const proxy = "https://wsrv.nl/?url=";

const pocketCards = {
    mewtwo: { id: 'mewtwo', name: 'Mewtwo ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/129.jpg' },
    gardevoir: { id: 'gardevoir', name: 'Gardevoir', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/127.jpg' },
    pikachu: { id: 'pikachu', name: 'Pikachu ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/096.jpg' },
    electhor: { id: 'electhor', name: 'Électhor ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/104.jpg' },
    dracaufeu: { id: 'dracaufeu', name: 'Dracaufeu ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/036.jpg' },
    sulfura: { id: 'sulfura', name: 'Sulfura ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/035.jpg' },
    stari: { id: 'stari', name: 'Staross ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/053.jpg' },
    artikodin: { id: 'artikodin', name: 'Artikodin ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/052.jpg' },
    florizarre: { id: 'florizarre', name: 'Florizarre ex', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/004.jpg' },
    sabrina: { id: 'sabrina', name: 'Sabrina', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/279.jpg' },
    ondine: { id: 'ondine', name: 'Ondine', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/277.jpg' },
    morgane: { id: 'morgane', name: 'Morgane', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/274.jpg' },
    pokeball: { id: 'pokeball', name: 'Poké Ball', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/265.jpg' },
    recherches: { id: 'recherches', name: 'Recherches Professorales', img: proxy + 'serebii.net/pokemontcgpocket/cards/geneticapex/278.jpg' },
};

const metaArchetypes = [
    { id: 'meta-mewtwo', name: 'Mewtwo / Gardevoir', icon: pocketCards.mewtwo.img },
    { id: 'meta-pika', name: 'Pikachu / Zapdos', icon: pocketCards.pikachu.img },
    { id: 'meta-zard', name: 'Charizard / Moltres', icon: pocketCards.dracaufeu.img },
    { id: 'meta-starmie', name: 'Starmie / Articuno', icon: pocketCards.stari.img },
    { id: 'meta-venusaur', name: 'Venusaur / Exeggutor', icon: pocketCards.florizarre.img }
];

// --- 2. GESTION D'ÉTAT & LOCALSTORAGE ---
let currentDeck = JSON.parse(localStorage.getItem('tcgp_deck')) || [];
let stats = JSON.parse(localStorage.getItem('tcgp_stats')) || {
    rating: 1500, 
    wins: 0,
    losses: 0,
    streak: 0,    
    matchHistory: [1500]
};
let selectedOpponent = null;

function saveData() {
    localStorage.setItem('tcgp_deck', JSON.stringify(currentDeck));
    localStorage.setItem('tcgp_stats', JSON.stringify(stats));
}

// --- 3. LOGIQUE MASTER BALL RANKED ---
function calculateWinPoints(currentStreak) {
    switch(currentStreak) {
        case 0: return 10;
        case 1: return 13;
        case 2: return 16;
        case 3: return 19;
        default: return 22; 
    }
}

function resolveMatch(result) {
    let pointsChange = 0;
    let badgeClass = "";
    let resultText = "";

    if (result === 'win') {
        pointsChange = calculateWinPoints(stats.streak);
        stats.rating += pointsChange;
        stats.wins += 1;
        stats.streak += 1;
        resultText = `VICTOIRE (+${pointsChange})`;
        badgeClass = "text-emerald-400 bg-emerald-900/30 border-emerald-500/30";
    } else {
        pointsChange = -10;
        stats.rating += pointsChange;
        stats.losses += 1;
        stats.streak = 0;
        resultText = `DÉFAITE (${pointsChange})`;
        badgeClass = "text-rose-400 bg-rose-900/30 border-rose-500/30";
    }

    updateTrackerUI(resultText, badgeClass);
}

// --- 4. FONCTIONS DE L'ÉDITEUR DE DECK ---
function initBuilder() {
    const catalogContainer = document.getElementById('builder-catalog');
    if (!catalogContainer) return;

    // Pour éviter le lag, on affiche les images de manière optimisée
    Object.values(pocketCards).forEach(card => {
        const img = document.createElement('img');
        img.src = card.img;
        img.loading = "lazy"; // Force le navigateur à ne pas tout charger d'un coup
        img.className = 'w-full rounded-xl shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 border-2 border-transparent hover:border-indigo-400 bg-slate-800 min-h-[140px]';
        img.onclick = () => addToDeck(card);
        
        // Gestion visuelle si l'image casse quand même
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/150x210/1e293b/94a3b8?text=Carte+Non+Trouvée';
        };
        
        catalogContainer.appendChild(img);
    });
    
    updateBuilderViews();
}

function addToDeck(card) {
    if (currentDeck.length >= 20) return alert("Deck plein (20 cartes) !");
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
    const builderContainer = document.getElementById('builder-deck-container');
    if (builderContainer) {
        builderContainer.innerHTML = '';
        document.getElementById('builder-deck-count').innerText = `${currentDeck.length} / 20`;
        currentDeck.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.img;
            img.className = 'w-full rounded-lg shadow-sm cursor-pointer hover:scale-105 border-2 border-transparent hover:border-rose-500 bg-slate-800 min-h-[140px]';
            img.onclick = () => removeFromDeck(index);
            builderContainer.appendChild(img);
        });
    }
    renderDashboardDeck();
}

// --- 5. INTERFACE GRAPHIQUE DU TRACKER ---
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
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129, 140, 248, 0.15)',
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { display: false }
            }
        }
    });

    const opponentSelector = document.getElementById('opponent-selector');
    metaArchetypes.forEach(archetype => {
        const btn = document.createElement('div');
        btn.className = "cursor-pointer rounded-xl border-2 border-transparent hover:border-indigo-400 opacity-60 hover:opacity-100 transition-all text-center";
        btn.innerHTML = `<img src="${archetype.icon}" class="w-full rounded-lg shadow-md mb-1 bg-slate-800"><span class="text-[10px] font-bold text-slate-300 leading-tight block">${archetype.name}</span>`;
        btn.onclick = () => {
            Array.from(opponentSelector.children).forEach(c => { c.classList.remove('border-indigo-400', 'opacity-100'); c.classList.add('border-transparent', 'opacity-60'); });
            btn.classList.remove('border-transparent', 'opacity-60');
            btn.classList.add('border-indigo-400', 'opacity-100');
            selectedOpponent = archetype.name;
        };
        opponentSelector.appendChild(btn);
    });

    refreshStatsUI();
    rebuildHistoryLog();
}

function updateTrackerUI(resultText, badgeClass) {
    stats.matchHistory.push(stats.rating);
    saveData();
    refreshStatsUI();
    
    const historyList = document.getElementById('history-list');
    const newEntry = document.createElement('li');
    newEntry.className = "flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5 text-xs";
    const matchUpText = selectedOpponent ? `<span class="text-slate-500 ml-2">vs ${selectedOpponent}</span>` : '';
    newEntry.innerHTML = `
        <div><span class="${badgeClass} border px-2 py-1 rounded font-black uppercase">${resultText}</span> ${matchUpText}</div>
        <span class="font-bold text-slate-300">${stats.rating} pt</span>
    `;
    historyList.prepend(newEntry);

    ratingChart.data.labels.push(`M${stats.matchHistory.length - 1}`);
    ratingChart.data.datasets[0].data.push(stats.rating);
    ratingChart.update();
}

function refreshStatsUI() {
    const totalGames = stats.wins + stats.losses;
    const winrate = totalGames === 0 ? 0 : ((stats.wins / totalGames) * 100).toFixed(1);
    
    document.getElementById('current-rating').innerText = stats.rating;
    document.getElementById('wins-count').innerText = `${stats.wins}W`;
    document.getElementById('losses-count').innerText = `${stats.losses}L`;
    document.getElementById('winrate-pct').innerText = `${winrate}%`;

    const streakCounter = document.getElementById('streak-counter');
    if (streakCounter) {
        streakCounter.innerText = stats.streak;
        document.getElementById('next-win-points').innerText = `Prochaine victoire : +${calculateWinPoints(stats.streak)} pt`;
    }
}

function renderDashboardDeck() {
    const container = document.getElementById('dashboard-deck-container');
    if (!container) return;
    container.innerHTML = '';
    
    if(currentDeck.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-500 col-span-4 text-center mt-4">Aucun deck importé.<br>Allez dans "Mes Decks".</p>';
        return;
    }

    currentDeck.forEach(card => {
        const img = document.createElement('img');
        img.src = card.img;
        img.className = 'w-full rounded shadow-sm border border-white/10 bg-slate-800';
        container.appendChild(img);
    });
}

function rebuildHistoryLog() {
    const historyList = document.getElementById('history-list');
    if (historyList && stats.matchHistory.length > 1) {
        historyList.innerHTML = `<li class="text-center text-xs text-slate-500 italic">Historique précédent masqué.</li>`;
    }
}

function resetStats() {
    if(confirm("Remettre les statistiques Ranked à zéro ?")) {
        stats = { rating: 1500, wins: 0, losses: 0, streak: 0, matchHistory: [1500] };
        saveData();
        location.reload();
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    initBuilder();
    initTracker();
    updateBuilderViews();
});
