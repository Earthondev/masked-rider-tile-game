// index.js (For the Home Page - Image Fetching)

// !!! IMPORTANT: Replace with your actual Google Drive Folder ID !!!
// This is the ID of the Google Drive folder containing your mystery images.
// Example: "16qekyYH7LHTySVMTja-4XJm-4pO-nX1x"
const GOOGLE_DRIVE_FOLDER_ID = "16qekyYH7LHTySVMTja-4XJm-4pO-nX1x";

// !!! IMPORTANT: Replace with your actual Google Apps Script Deployment URL !!!
// This is the URL obtained after deploying your Google Apps Script as a Web App.
// Example: "https://script.google.com/macros/s/AKfycbx8A3ZM1ldVeltc28cF4S_PPRs7MZZckVo3ahljYFLClAjcdbU2d8qio7mhvwrGmi3N2w/exec"
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzD6d6RWeFfFVrzED1IRDda19PJ_nKzrx5EVAfHnuYNwCJ8JaQu8BdIxtLmigvQxUtY3Q/exec";

const loadingSection = document.getElementById('loading-section');
const gameStartSection = document.getElementById('game-start-section');
const loadingStatus = document.getElementById('loadingStatus');
const imageCountStatus = document.getElementById('imageCountStatus');
const startGameBtn = document.getElementById('startGameBtn');

let fetchedImages = []; // Stores objects with {name, url, question}

// Function to fetch images from Google Drive via Google Apps Script
async function fetchImagesFromDrive() {
    loadingStatus.textContent = 'กำลังดึงภาพจาก Google Drive... โปรดรอสักครู่';
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?folderId=${GOOGLE_DRIVE_FOLDER_ID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! สถานะ: ${response.status}`);
        }
        const data = await response.json();

        if (!data || !Array.isArray(data.images)) {
            throw new Error('รูปแบบข้อมูลจาก API ไม่ถูกต้อง (ไม่พบ data.images)');
        }

        // Map the fetched images to include a 'question' property
        // The question is derived from the image name, cleaning up common file extensions/separators.
        fetchedImages = data.images.map(img => ({
            ...img,
            // Example: "KamenRider_Ichigo.jpg" becomes "Kamen Rider Ichigo"
            question: img.name.replace(/(_|-|\.jpg|\.png|\.gif|\.webp)/g, ' ').trim()
        }));

        if (fetchedImages.length === 0) {
            loadingStatus.textContent = 'ไม่พบภาพในโฟลเดอร์ Google Drive ที่ระบุ โปรดตรวจสอบ Folder ID และการตั้งค่าสิทธิ์การเข้าถึง';
            startGameBtn.disabled = true;
        } else {
            // Save images to localStorage for access by game.html
            localStorage.setItem('maskedRiderQuizImages', JSON.stringify(fetchedImages));
            imageCountStatus.textContent = `โหลดภาพปริศนาสำเร็จ ${fetchedImages.length} ภาพ`;
            startGameBtn.disabled = false; // Enable start game button
            loadingSection.style.display = 'none'; // Hide loading section
            gameStartSection.style.display = 'block'; // Show start game section
        }
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงภาพ:', error);
        loadingStatus.textContent = `ไม่สามารถโหลดภาพได้: ${error.message}. โปรดตรวจสอบ Google Drive Folder ID และ Apps Script URL ว่าถูกต้อง และสคริปต์มีการตั้งค่าสิทธิ์ "Anyone"`;
        startGameBtn.disabled = true;
        loadingSection.style.display = 'block'; // Ensure loading section is visible to show error
        gameStartSection.style.display = 'none';
    }
}

// Event listener for "Start Game" button
startGameBtn.addEventListener('click', () => {
    // Navigate to the game page
    window.location.href = 'game.html';
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchImagesFromDrive);
