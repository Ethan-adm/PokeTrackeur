// 1. Initialisation de la Decklist (Visuel temporaire)
const deckContainer = document.getElementById('deck-container');

for (let i = 0; i < 20; i++) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'aspect-[2.5/3.5] bg-gray-200 border border-gray-300 rounded shadow-sm flex items-center justify-center text-xs text-gray-500';
    cardDiv.innerText = 'Carte';
    deckContainer.appendChild(cardDiv);
}

// 2. Initialisation du Graphique des points (Chart.js)
const ctx = document.getElementById('ratingChart').getContext('2d');
const ratingChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5', 'Match 6'],
        datasets: [{
            label: 'Points de classement',
            data: [3450, 3465, 3455, 3465, 3480, 3493],
            borderColor: '#800080', // Violet correspondant à ton image
            backgroundColor: 'rgba(128, 0, 128, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#800080',
            fill: true,
            tension: 0.1 // Rend la ligne légèrement courbée
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 3440 // Ajuste l'échelle pour mieux voir les variations
            }
        }
    }
});
