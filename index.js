// index.js (Multiplayer Setup & Category Selection)

const numPlayersSelect = document.getElementById('numPlayers');
const playerInputsContainer = document.getElementById('playerInputs');
const startGameBtn = document.getElementById('startGameBtn');

// Function to generate player name inputs
function updatePlayerInputs() {
    const num = parseInt(numPlayersSelect.value);
    playerInputsContainer.innerHTML = ''; // Clear existing

    for (let i = 1; i <= num; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `ชื่อผู้เล่น ${i}`;
        input.value = `Player ${i}`;
        input.style.marginTop = '10px';
        playerInputsContainer.appendChild(input);
    }
}

// Event Listeners
const categoriesContainer = document.querySelector('.checkbox-group');

// Function to generate category checkboxes
function renderCategoryOptions() {
    categoriesContainer.innerHTML = ''; // Clear hardcoded

    if (typeof GAME_DATA === 'undefined') {
        categoriesContainer.textContent = 'Error: Data not loaded.';
        return;
    }

    Object.keys(GAME_DATA).forEach(key => {
        const catData = GAME_DATA[key];
        const labelText = catData.label || key;

        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.cursor = 'pointer';
        label.style.marginBottom = '5px';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = key;
        input.checked = true; // Default to checked
        input.style.marginRight = '10px';
        input.classList.add('category-checkbox'); // For easier selection

        label.appendChild(input);
        label.appendChild(document.createTextNode(labelText));
        categoriesContainer.appendChild(label);
    });
}


// Start Game Logic
startGameBtn.addEventListener('click', () => {
    // 1. Get Players
    const numPlayers = parseInt(numPlayersSelect.value);
    const players = [];
    for (let i = 1; i <= numPlayers; i++) {
        const name = document.getElementById(`player${i}`).value.trim() || `Player ${i}`;
        players.push({ name: name, score: 0 });
    }

    // 2. Get Categories & Images
    // 2. Get Categories & Images
    const checkboxes = document.querySelectorAll('.category-checkbox:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value); // ['animals', 'food']


    if (selectedCategories.length === 0) {
        alert('กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวด!');
        return;
    }

    let gameImages = [];
    selectedCategories.forEach(cat => {
        if (typeof GAME_DATA !== 'undefined' && GAME_DATA[cat]) {
            // New structure: GAME_DATA[cat] is { label: "...", items: [...] }
            if (GAME_DATA[cat].items) {
                gameImages = gameImages.concat(GAME_DATA[cat].items);
            }
        }
    });

    if (gameImages.length === 0) {
        alert('ไม่พบข้อมูลภาพในหมวดที่เลือก หรือ data.js ไม่โหลด');
        return;
    }

    // Prepare Data Object
    const gameSettings = {
        players: players,
        images: gameImages
    };

    // Save to LocalStorage
    localStorage.setItem('maskedRiderGameSettings', JSON.stringify(gameSettings));

    // Redirect
    window.location.href = 'game.html';
});

// Initialize inputs on load
// Initialize inputs on load
updatePlayerInputs();
renderCategoryOptions();
