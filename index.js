// index.js (Multiplayer Setup & Category Selection)

const numPlayersSelect = document.getElementById('numPlayers');
const playerInputsContainer = document.getElementById('playerInputs');
const startGameBtn = document.getElementById('startGameBtn');
const gridSizeSelect = document.getElementById('gridSize');
const customImageInput = document.getElementById('customImageInput');
const customImagePreview = document.getElementById('customImagePreview');
const clearImagesBtn = document.getElementById('clearImagesBtn');

let customImages = [];

// Function to generate player name inputs
function updatePlayerInputs() {
    const num = parseInt(numPlayersSelect.value);
    playerInputsContainer.innerHTML = ''; // Clear existing

    for (let i = 1; i <= num; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `ชื่อผู้เล่น ${i}`;
        input.value = `ผู้เล่น ${i}`;
        input.style.marginTop = '10px';
        playerInputsContainer.appendChild(input);
    }
}

// Handle Custom Image Upload (Append)
customImageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    // Don't reset customImages, just append
    customImagePreview.textContent = `กำลังโหลด ${files.length} ภาพ...`;

    if (files.length === 0) {
        return; // functionality handles "cancel" gracefully usually
    }

    let loadedCount = 0;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            customImages.push({
                name: file.name.split('.')[0], // Use filename as default name
                url: event.target.result,
                category: 'custom'
            });
            loadedCount++;
            if (loadedCount === files.length) {
                customImagePreview.textContent = `พร้อมใช้งาน ${customImages.length} ภาพ (เพิ่มได้เลื่อยๆ)`;
            }
        };
        reader.readAsDataURL(file);
    });

    // Reset inputs value so same file can be selected again if needed (though usually not needed)
    // e.target.value = ''; 
});

// Handle Clear Images
clearImagesBtn.addEventListener('click', () => {
    customImages = [];
    customImagePreview.textContent = 'ยังไม่มีภาพที่เลือก';
    customImageInput.value = ''; // Reset file input
});

// Event Listeners
const categoriesContainer = document.querySelector('.checkbox-group');

// Function to generate category checkboxes
function renderCategoryOptions() {
    categoriesContainer.innerHTML = ''; // Clear hardcoded

    if (typeof GAME_DATA === 'undefined') {
        categoriesContainer.textContent = 'เกิดข้อผิดพลาด: ไม่พบข้อมูล';
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
        const name = document.getElementById(`player${i}`).value.trim() || `ผู้เล่น ${i}`;
        players.push({ name: name, score: 0 });
    }

    // 2. Get Categories & Images
    const checkboxes = document.querySelectorAll('.category-checkbox:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value); // ['animals', 'food']

    let gameImages = [];

    // Add Pre-defined images
    selectedCategories.forEach(cat => {
        if (typeof GAME_DATA !== 'undefined' && GAME_DATA[cat]) {
            if (GAME_DATA[cat].items) {
                gameImages = gameImages.concat(GAME_DATA[cat].items);
            }
        }
    });

    // Add Custom Images
    if (customImages.length > 0) {
        gameImages = gameImages.concat(customImages);
    }

    if (gameImages.length === 0) {
        alert('กรุณาเลือกหมวดหมู่หรือเพิ่มภาพเองอย่างน้อย 1 ภาพ!');
        return;
    }

    // 3. Get Grid Size
    const gridSize = parseInt(gridSizeSelect.value) || 5;

    // Prepare Data Object
    const gameSettings = {
        players: players,
        images: gameImages,
        gridSize: gridSize
    };

    // Save to LocalStorage
    try {
        localStorage.setItem('maskedRiderGameSettings', JSON.stringify(gameSettings));
        // Redirect
        window.location.href = 'game.html';
    } catch (e) {
        alert('พื้นที่จัดเก็บไม่พอสำหรับภาพจำนวนมาก (LocalStorage Full). ลองลดขนาดภาพหรือจำนวนภาพ.');
        console.error(e);
    }
});

numPlayersSelect.addEventListener('change', updatePlayerInputs);

// Initialize inputs on load
updatePlayerInputs();
renderCategoryOptions();
