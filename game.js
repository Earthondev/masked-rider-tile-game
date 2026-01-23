// game.js (Multiplayer Game Logic)

const grid = document.getElementById('grid');
const questionTitleElement = document.getElementById('questionTitle');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const revealAllBtn = document.getElementById('revealAllBtn');
// const resetGameBtn = document.getElementById('resetGameBtn'); // Might remove or re-purpose
const backToHomeBtn = document.getElementById('backToHomeBtn');

// New UI Elements for Multiplayer
const combinedControls = document.getElementById('controls'); // We might add new buttons here dynamically
const playerInfoDiv = document.createElement('div');
playerInfoDiv.id = 'playerInfo';
playerInfoDiv.style.marginBottom = '15px';
playerInfoDiv.style.fontSize = '1.2rem';
playerInfoDiv.style.color = '#0ff';
// Insert playerInfo before grid
grid.parentNode.insertBefore(playerInfoDiv, grid);

const flipSound = document.getElementById('flipSound');
const revealSound = document.getElementById('revealSound');

const GRID_SIZE = 5;
const NUM_TILES = GRID_SIZE * GRID_SIZE;

let gameSettings = null; // { players: [], images: [] }
let allQuizImages = [];
let currentImageIndex = -1;
let currentImage = null;
let openedTiles = new Set();
let currentPlayerIndex = 0; // 0 to players.length - 1
let isRoundOver = false;

// Function to load game settings
function loadGameSettings() {
    const settingsJson = localStorage.getItem('maskedRiderGameSettings');
    if (settingsJson) {
        gameSettings = JSON.parse(settingsJson);
        allQuizImages = gameSettings.images;

        // Shuffle images initially
        allQuizImages.sort(() => Math.random() - 0.5);
    }

    if (!allQuizImages || allQuizImages.length === 0) {
        questionTitleElement.textContent = 'ไม่พบข้อมูลเกม! โปรดเริ่มใหม่';
        backToHomeBtn.onclick = () => window.location.href = 'index.html';
        return false;
    }
    return true;
}

function updatePlayerUI() {
    if (!gameSettings) return;
    const player = gameSettings.players[currentPlayerIndex];
    playerInfoDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 400px; margin: 0 auto;">
            <span>รอบของ: <strong>${player.name}</strong></span>
            <span>คะแนน: ${player.score}</span>
        </div>
        <div style="font-size: 0.9rem; color: #aaa; margin-top: 5px;">
            (ผู้เล่นอื่นรอ: ${gameSettings.players.map(p => p.name + ':' + p.score).join(', ')})
        </div>
    `;
}
// Duplicates removed

// Duplicate variables removed.

// Function to select and display the next random image
function loadNextQuestion() {
    if (allQuizImages.length === 0) {
        console.error('ไม่พบภาพสำหรับเล่นเกม');
        return;
    }

    // Check if we played all
    if (allQuizImages.length === 0) { // Should check played count if we want unique
        // For now, infinite loop or random is fine as per original logic, 
        // but let's try to remove played ones if possible. 
        // Original logic: let availableIndices...
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

    // Preload image
    const imgPreloader = new Image();
    imgPreloader.src = currentImage.url;

    // Reset State
    questionTitleElement.textContent = '';
    questionTitleElement.style.color = '';
    questionTitleElement.style.textShadow = '';
    isRoundOver = false;

    buildGrid();
    openedTiles.clear();
    updateButtonStates();
    updatePlayerUI(); // Show current player
}

function buildGrid() {
    grid.innerHTML = '';
    // Calculate tile size or just rely on CSS grid
    // CSS Grid handles layout. We just need 25 divs.

    for (let i = 0; i < NUM_TILES; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.index = i;
        tile.textContent = i + 1; // Show numbers 1-25

        tile.addEventListener('click', () => {
            if (!tile.classList.contains('open') && !isRoundOver) {
                openTile(tile, i);
            }
        });

        grid.appendChild(tile);
    }
}

// Function to handle tile open (Turn Logic)
function openTile(tileElement, index) {
    if (isRoundOver) return;

    tileElement.classList.add('open');
    tileElement.textContent = ''; // Hide the number
    tileElement.style.backgroundImage = `url(${currentImage.url})`;

    // Formula for background-position percentage: (value / (total - 1)) * 100
    const xStep = 100 / (GRID_SIZE - 1);
    const yStep = 100 / (GRID_SIZE - 1);

    const xOffset = (index % GRID_SIZE) * xStep;
    const yOffset = Math.floor(index / GRID_SIZE) * yStep;
    tileElement.style.backgroundPosition = `${xOffset}% ${yOffset}%`;

    openedTiles.add(index);
    if (flipSound) {
        flipSound.currentTime = 0;
        flipSound.play();
    }

    // Switch turn after flip
    currentPlayerIndex = (currentPlayerIndex + 1) % gameSettings.players.length;
    updatePlayerUI();

    updateButtonStates();
}

function handleCorrectAnswer() {
    isRoundOver = true;
    revealAll();

    // The player who answered likely just played or it's their turn
    // If we auto-switch turn on flip, the "current player" is the NEXT one.
    // So the point should go to the PREVIOUS player?
    // Or we allow anyone to buzz in?
    // Let's assume the "Turn" player guessed correctly BEFORE flipping?
    // Or After flipping, they guess.
    // If I flip, and I see it, I guess.
    // So the point goes to the player who flipped last.
    // We switched turn in openTile... so we need `prevPlayerIndex`.

    let scorerIndex = (currentPlayerIndex - 1 + gameSettings.players.length) % gameSettings.players.length;
    gameSettings.players[scorerIndex].score++;

    questionTitleElement.textContent = `ถูกต้อง! (ตอบโดย ${gameSettings.players[scorerIndex].name}) - เฉลย: ${currentImage.name}`;
    updatePlayerUI();

    // Enable Next Question
    nextQuestionBtn.disabled = false;
}

// Function to reveal all tiles and show the answer (Give up / End Round)
function revealAll() {
    const tilesToOpen = Array.from(document.querySelectorAll('.tile'))
        .filter(tile => !tile.classList.contains('open'));

    if (tilesToOpen.length > 0) {
        tilesToOpen.forEach((tile, i) => {
            setTimeout(() => {
                const index = parseInt(tile.dataset.index);
                // Just visually open, don't trigger turn switch logic
                tile.classList.add('open');
                tile.textContent = '';
                tile.style.backgroundImage = `url(${currentImage.url})`;
                // ... calc pos ...
                const xStep = 100 / (GRID_SIZE - 1);
                const yStep = 100 / (GRID_SIZE - 1);
                const xOffset = (index % GRID_SIZE) * xStep;
                const yOffset = Math.floor(index / GRID_SIZE) * yStep;
                tile.style.backgroundPosition = `${xOffset}% ${yOffset}%`;
            }, i * 30);
        });
    }

    // Show Answer
    if (!isRoundOver) { // If manual reveal (give up)
        questionTitleElement.textContent = `เฉลย: ${currentImage.name}`;
        questionTitleElement.style.color = '#ff2e2e';
    }

    if (revealSound) {
        revealSound.currentTime = 0;
        revealSound.play();
    }

    isRoundOver = true;
    openedTiles = new Set(Array.from({ length: NUM_TILES }, (_, i) => i)); // Mark all as open
    updateButtonStates();
}

// Function to update button enable/disable states
function updateButtonStates() {
    // Logic mostly handled by isRoundOver
}

// Initialize Custom Buttons
function setupMultiplayerButtons() {
    const answerBtn = document.createElement('button');
    answerBtn.id = 'answerBtn';
    answerBtn.textContent = 'ตอบถูก (+1)';
    answerBtn.style.backgroundColor = '#00aa00';
    answerBtn.addEventListener('click', handleCorrectAnswer);

    // Insert before Reveal All
    revealAllBtn.parentNode.insertBefore(answerBtn, revealAllBtn);

    // Hide Reset Game button
    const oldReset = document.getElementById('resetGameBtn');
    if (oldReset) oldReset.style.display = 'none';

    // Update Reveal All Text
    revealAllBtn.textContent = 'ยอดแพ้ / เฉลย';
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (loadGameSettings()) {
        setupMultiplayerButtons();
        loadNextQuestion();
    }
});
