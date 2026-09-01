// --- 1. DATA POCKET TCG (Meta Limitless / Assets Serebii) ---
// Cartes principales pour générer les decks méta
const pocketCards = {
    mewtwo: { id: 'mewtwo', name: 'Mewtwo ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/129.jpg' },
    gardevoir: { id: 'gardevoir', name: 'Gardevoir', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/127.jpg' },
    pikachu: { id: 'pikachu', name: 'Pikachu ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/096.jpg' },
    electhor: { id: 'electhor', name: 'Électhor ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/104.jpg' },
    dracaufeu: { id: 'dracaufeu', name: 'Dracaufeu ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/036.jpg' },
    sulfura: { id: 'sulfura', name: 'Sulfura ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/035.jpg' },
    stari: { id: 'stari', name: 'Staross ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/053.jpg' },
    artikodin: { id: 'artikodin', name: 'Artikodin ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/052.jpg' },
    florizarre: { id: 'florizarre', name: 'Florizarre ex', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/004.jpg' },
    sabrina: { id: 'sabrina', name: 'Sabrina', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/279.jpg' },
    ondine: { id: 'ondine', name: 'Ondine', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/277.jpg' },
    morgane: { id: 'morgane', name: 'Morgane', img: 'https://serebii.net/pokemontcgpocket/cards/geneticapex/274.jpg' },
};

// Archétypes méta pour la sélection du matchup adverse
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
    rating: 1500, // Points de base Master Ball
    wins: 0,
    losses: 0,
    streak: 0,    // Série de victoires en cours
    matchHistory: [1500]
};
let selectedOpponent = null;

function saveData() {
    localStorage.setItem('tcgp_deck', JSON.stringify(currentDeck));
    localStorage.setItem('tcgp_stats', JSON.stringify(stats));
}

// --- 3. LOGIQUE MASTER BALL RANKED (Le cœur du calcul) ---
function calculateWinPoints(currentStreak) {
    // Calcul exact des points de série TCG Pocket Master Ball
    // Victoire 1 = +10, V2 = +13, V3 = +16, V4 = +19, V5+ = +22
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
        pointsChange = -10; // Défaite Master Ball = toujours -10
        stats.rating += pointsChange; // rating - 10
        stats.losses += 1;
        stats.streak = 0; // Bris de série
        resultText = `DÉFAITE (${pointsChange})`;
        badgeClass = "text-rose-400 bg-rose-900/30 border-rose-500/30";
    }

    updateTrackerUI(resultText, badgeClass);
}

// --- 4. INTERFACE GRAPHIQUE DU TRACKER ---
let ratingChart;

function initTracker() {
    const ctxElement = document.getElementById('ratingChart');
    if (!ctxElement) return;

    // Initialisation Chart.js
    const ctx = ctxElement.getContext('2d');
    ratingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stats.matchHistory.map((_, i) => i === 0 ? 'Start' : `M${i}`),
            datasets: [{
                label: 'Points',
                data: [...stats.matchHistory],
                borderColor: '#818cf8', // Indigo-400
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

    // Génération du sélecteur de Matchup (Adversaires Meta)
    const opponentSelector = document.getElementById('opponent-selector');
    metaArchetypes.forEach(archetype => {
        const btn = document.createElement('div');
        btn.className = "cursor-pointer rounded-xl border-2 border-transparent hover:border-indigo-400 opacity-60 hover:opacity-100 transition-all text-center";
        btn.innerHTML = `<img src="${archetype.icon}" class="w-full rounded-lg shadow-md mb-1"><span class="text-[10px] font-bold text-slate-300 leading-tight block">${archetype.name}</span>`;
        btn.onclick = () => {
            // Logique visuelle de sélection
            Array.from(opponentSelector.children).forEach(c => { c.classList.remove('border-indigo-400', 'opacity-100'); c.classList.add('border-transparent', 'opacity-60'); });
            btn.classList.remove('border-transparent', 'opacity-60');
            btn.classList.add('border-indigo-400', 'opacity-100');
            selectedOpponent = archetype.name;
        };
        opponentSelector.appendChild(btn);
    });

    refreshStatsUI();
    renderDashboardDeck();
    rebuildHistoryLog();
}

function updateTrackerUI(resultText, badgeClass) {
    stats.matchHistory.push(stats.rating);
    saveData();
    refreshStatsUI();
    
    // Ajout Historique avec mention du matchup si sélectionné
    const historyList = document.getElementById('history-list');
    const newEntry = document.createElement('li');
    newEntry.className = "flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5 text-xs";
    const matchUpText = selectedOpponent ? `<span class="text-slate-500 ml-2">vs ${selectedOpponent}</span>` : '';
    newEntry.innerHTML = `
        <div><span class="${badgeClass} border px-2 py-1 rounded font-black uppercase">${resultText}</span> ${matchUpText}</div>
        <span class="font-bold text-slate-300">${stats.rating} pt</span>
    `;
    historyList.prepend(newEntry);

    // MàJ Graphique
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

    // Màj visuelle de la Win Streak
    document.getElementById('streak-counter').innerText = stats.streak;
    const nextPoints = calculateWinPoints(stats.streak);
    document.getElementById('next-win-points').innerText = `Prochaine victoire : +${nextPoints} pt`;
}

function renderDashboardDeck() {
    const container = document.getElementById('dashboard-deck-container');
    if (!container) return;
    container.innerHTML = '';
    
    if(currentDeck.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-500 col-span-4 text-center">Aucun deck importé. Allez dans "Mes Decks".</p>';
        return;
    }

    currentDeck.forEach(card => {
        const img = document.createElement('img');
        img.src = card.img;
        img.className = 'w-full rounded shadow-sm border border-white/10';
        container.appendChild(img);
    });
}

function rebuildHistoryLog() {
    // Restaure un visuel basique de l'historique au rafraîchissement
    const historyList = document.getElementById('history-list');
    if (historyList && stats.matchHistory.length > 1) {
        historyList.innerHTML = `<li class="text-center text-xs text-slate-500 italic">Historique des matchs précédents masqué.</li>`;
    }
}

function resetStats() {
    if(confirm("Remettre les statistiques Ranked à zéro ?")) {
        stats = { rating: 1500, wins: 0, losses: 0, streak: 0, matchHistory: [1500] };
        saveData();
        location.reload();
    }
}

// Initialisation de la page actuelle
document.addEventListener('DOMContentLoaded', () => {
    initTracker();
});
