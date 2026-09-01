// --- 1. BASE DE DONNÉES DE CARTES (Miniature pour l'exemple) ---
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

// --- 2. LOGIQUE DU DECK ---
let currentDeck = []; // Tableau qui va contenir les cartes choisies
const maxDeckSize = 20;

// Fonction pour afficher les cartes disponibles au centre
function renderCatalog() {
    const catalogContainer = document.getElementById('card-catalog');
    catalogContainer.innerHTML = '';

    cardDatabase.forEach(card => {
        const cardEl = document.createElement('div');
        // On donne un style coloré basé sur le type de la carte
        cardEl.className = `aspect-[2.5/3.5] ${card.color} border-2 border-gray-800 rounded-lg shadow-md flex items-center justify-center text-center p-1 cursor-pointer hover:scale-105 transition font-bold text-xs text-white text-shadow`;
        cardEl.innerText = card.name;
        
        // Quand on clique, on ajoute au deck
        cardEl.onclick = () => addToDeck(card);
        catalogContainer.appendChild(cardEl);
    });
}

// Fonction pour ajouter une carte au deck
function addToDeck(card) {
    if (currentDeck.length >= maxDeckSize) {
        alert("Ton deck est plein (20 cartes) !");
        return;
    }

    // Vérifier s'il n'y a pas déjà 2 exemplaires de cette carte (règle TCG Pocket)
    const cardCount = currentDeck.filter(c => c.id === card.id).length;
    if (cardCount >= 2) {
        alert("Tu ne peux pas avoir plus de 2 fois la même carte dans un deck Pocket !");
        return;
    }

    currentDeck.push(card);
    updateDeckView();
}

// Fonction pour retirer une carte du deck en cliquant dessus
function removeFromDeck(index) {
    currentDeck.splice(index, 1);
    updateDeckView();
}

// Fonction pour vider tout le deck
function clearDeck() {
    currentDeck = [];
    updateDeckView();
}

// Mettre à jour l'affichage du deck à droite
function updateDeckView() {
    const deckContainer = document.getElementById('deck-container');
    const deckCount = document.getElementById('deck-count');
    
    deckContainer.innerHTML = '';
    deckCount.innerText = `${currentDeck.length} / 20 Cartes`;

    currentDeck.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `aspect-[2.5/3.5] ${card.color} border border-gray-600 rounded flex items-center justify-center text-[10px] text-center p-1 cursor-pointer font-bold text-white`;
        cardEl.innerText = card.name;
        cardEl.title = "Cliquez pour retirer";
        
        // Clic droit ou clic simple pour retirer la carte
        cardEl.onclick = () => removeFromDeck(index);
        deckContainer.appendChild(cardEl);
    });
}

// --- 3. INITIALISATION DU GRAPHIQUE (Chart.js) ---
const ctx = document.getElementById('ratingChart').getContext('2d');
const ratingChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Départ', 'Match 1', 'Match 2', 'Match 3'],
        datasets: [{
            label: 'Points',
            data: [3400, 3420, 3390, 3493],
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

// --- Lancement au chargement de la page ---
renderCatalog();
updateDeckView();
