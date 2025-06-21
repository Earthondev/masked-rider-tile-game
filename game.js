// game.js (For the Game Page)

const grid = document.getElementById('grid');
const questionTitleElement = document.getElementById('questionTitle');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const revealAllBtn = document.getElementById('revealAllBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');

const flipSound = document.getElementById('flipSound');
const revealSound = document.getElementById('revealSound');

const GRID_SIZE = 5; // 5x5 grid
const NUM_TILES = GRID_SIZE * GRID_SIZE; // 25 tiles

let allQuizImages = []; // Array of image objects from localStorage: {name, url, question}
let currentImageIndex = -1; // Index of the current image being played
let currentImage = null; // Object of the current image: {name, url, question}
let openedTiles = new Set(); // Stores indices of opened tiles (0-24)

// Function to load all quiz images from localStorage
function loadQuizImagesFromLocalStorage() {
    const imagesJson = localStorage.getItem('maskedRiderQuizImages');
    if (imagesJson) {
        allQuizImages = JSON.parse(imagesJson);
    }

    if (allQuizImages.length === 0) {
        // If no images, disable game buttons and guide user back to home
        questionTitleElement.textContent = 'ไม่พบภาพ! โปรดกลับไปหน้าหลักเพื่อโหลดภาพก่อน';
        nextQuestionBtn.disabled = true;
        revealAllBtn.disabled = true;
        resetGameBtn.disabled = true;
        backToHomeBtn.textContent = 'กลับหน้าหลัก (โหลดภาพ)'; // Change text to guide user
        backToHomeBtn.onclick = () => window.location.href = 'index.html'; // Direct to home page
        return false; // Indicate no images
    }
    return true; // Indicate images are loaded
}

// Function to select and display the next random image
function loadNextQuestion() {
    if (allQuizImages.length === 0) {
        console.error('ไม่พบภาพสำหรับเล่นเกม');
        return;
    }

    let availableIndices = allQuizImages
        .map((_, i) => i)
        .filter(idx => idx !== currentImageIndex);

    if (availableIndices.length === 0 && allQuizImages.length > 0) {
        availableIndices = allQuizImages.map((_, i) => i);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    currentImageIndex = randomIndex;
    currentImage = allQuizImages[currentImageIndex];

    // ไม่ต้องโชว์คำถามทันที
    questionTitleElement.textContent = '';
    questionTitleElement.style.color = '';
    questionTitleElement.style.textShadow = '';

    buildGrid();
    openedTiles.clear();
    updateButtonStates();
}

// Function to build the 5x5 grid
function buildGrid() {
    grid.innerHTML = ''; // Clear previous grid
    openedTiles.clear(); // Ensure openedTiles is clear for new grid

    for (let i = 0; i < NUM_TILES; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.textContent = i + 1; // Numbers 1-25
        tile.dataset.index = i; // Store index for easier access

        tile.addEventListener('click', () => {
            if (!tile.classList.contains('open')) { // Only allow opening if not already open
                openTile(tile, i);
            }
        });
        grid.appendChild(tile);
    }
}

// Function to open a specific tile
function openTile(tileElement, index) {
    tileElement.classList.add('open');
    tileElement.textContent = ''; // Hide the number
    tileElement.style.backgroundImage = `url(${currentImage.url})`;

    // Calculate background position for the specific tile
    // Each tile is 1/GRID_SIZE (20%) of the total image width/height
    const xOffset = (index % GRID_SIZE) * (100 / GRID_SIZE);
    const yOffset = Math.floor(index / GRID_SIZE) * (100 / GRID_SIZE);
    tileElement.style.backgroundPosition = `-${xOffset}% -${yOffset}%`;

    openedTiles.add(index); // Mark tile as opened
    if (flipSound) {
        flipSound.currentTime = 0; // Rewind to start for quick repeated plays
        flipSound.play();
    }
    updateButtonStates();
}

// Function to reveal all tiles and show the answer
function revealAll() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, i) => {
        if (!tile.classList.contains('open')) {
            openTile(tile, i);
        }
    });

    // แสดงชื่อคำถามเมื่อเฉลย
    questionTitleElement.textContent = `เฉลย: ${currentImage.question || currentImage.name || 'ไม่ทราบมาสค์ไรเดอร์'}`;
    questionTitleElement.style.color = '#0f0';
    questionTitleElement.style.textShadow = '0 0 10px rgba(0, 255, 0, 0.7)';

    if (revealSound) {
        revealSound.currentTime = 0;
        revealSound.play();
    }
    updateButtonStates();
}

// Function to reset the current game (keep same image, close all tiles)
function resetCurrentGame() {
    questionTitleElement.textContent = '';
    questionTitleElement.style.color = '';
    questionTitleElement.style.textShadow = '';

    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.remove('open');
        tile.style.backgroundImage = '';
        tile.style.backgroundPosition = '';
        tile.textContent = parseInt(tile.dataset.index) + 1;
    });
    openedTiles.clear();
    updateButtonStates();
}

// Function to update button enable/disable states
function updateButtonStates() {
    const allTilesOpened = openedTiles.size === NUM_TILES;
    nextQuestionBtn.disabled = allTilesOpened || allQuizImages.length === 0;
    revealAllBtn.disabled = allTilesOpened || allQuizImages.length === 0;
    resetGameBtn.disabled = allQuizImages.length === 0; // Can always reset if images are loaded
}

// Event Listeners
nextQuestionBtn.addEventListener('click', loadNextQuestion);
revealAllBtn.addEventListener('click', revealAll);
resetGameBtn.addEventListener('click', resetCurrentGame);
backToHomeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (loadQuizImagesFromLocalStorage()) {
        loadNextQuestion(); // Load the first image if images are available
    }
});
