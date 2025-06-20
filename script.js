const folderId = "16qekyYH7LHTySVMTja-4XJm-4pO-nX1x";
const scriptUrl = "https://script.google.com/macros/s/AKfycbx8A3ZM1ldVeltc28cF4S_PPRs7MZZckVo3ahljYFLClAjcdbU2d8qio7mhvwrGmi3N2w/exec";
const gridSize = 5;

const grid = document.getElementById('grid');
const questionTitle = document.getElementById('questionTitle');
const flipSound = document.getElementById('flipSound');
const revealAllBtn = document.getElementById('revealAllBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');

let images = [];
let currentImage = null;
let openedTiles = new Set();

async function fetchImages() {
  try {
    const res = await fetch(`${scriptUrl}?folderId=${folderId}`);
    const data = await res.json();
    return data.images || [];
  } catch (err) {
    alert('ไม่สามารถโหลดภาพจาก Google Drive ได้');
    console.error(err);
    return [];
  }
}

function buildGrid() {
  grid.innerHTML = '';
  openedTiles.clear();

  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.textContent = i + 1;
    tile.dataset.index = i;

    tile.addEventListener('click', () => {
      if (openedTiles.has(i)) return;
      openTile(tile, i);
    });

    grid.appendChild(tile);
  }
}

function openTile(tile, index) {
  tile.classList.add('open');
  tile.style.backgroundImage = `url(${currentImage.url})`;

  const xPercent = (index % gridSize) * 100;
  const yPercent = Math.floor(index / gridSize) * 100;
  tile.style.backgroundPosition = `-${xPercent}% -${yPercent}%`;

  tile.textContent = '';
  openedTiles.add(index);

  flipSound.currentTime = 0;
  flipSound.play();
}

function revealAll() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach((tile, i) => {
    if (!openedTiles.has(i)) {
      openTile(tile, i);
    }
  });
}

async function loadRandomImage() {
  if (images.length === 0) {
    images = await fetchImages();
    if (images.length === 0) {
      questionTitle.textContent = 'ไม่มีภาพในโฟลเดอร์';
      return;
    }
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  currentImage = images[randomIndex];
  questionTitle.textContent = currentImage.name;

  buildGrid();
}

revealAllBtn.addEventListener('click', revealAll);
nextQuestionBtn.addEventListener('click', loadRandomImage);

loadRandomImage();
