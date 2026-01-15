// quran_functions.js - Quran verse management functions

// Quran verses data
const quranVerses = [
    {
        arabic: "يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوا اسْتَعِيْنُوْا بِالصَّبْرِ وَالصَّلٰوةِ ۗاِنَّ اللّٰهَ مَعَ الصّٰبِرِيْنَ",
        translation: "Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Sungguh, Allah beserta orang-orang yang sabar.",
        reference: "QS. Al-Baqarah: 153"
    },
    {
        arabic: "وَعَدَ اللّٰهُ الَّذِيْنَ اٰمَنُوْا مِنْكُمْ وَعَمِلُوا الصّٰلِحٰتِ لَيَسْتَخْلِفَنَّهُمْ فِى الْاَرْثِ كَمَا اسْتَخْلَفَ الَّذِيْنَ مِنْ قَبْلِهِمْ",
        translation: "Allah telah berjanji kepada orang-orang yang beriman di antaramu dan mengerjakan kebajikan, bahwa Dia sungguh-sungguh akan menjadikan mereka khalifah di bumi, sebagaimana Dia telah menjadikan orang-orang sebelum mereka khalifah.",
        reference: "QS. An-Nur: 55"
    },
    {
        arabic: "اِنَّ سَعْيَكُمْ لَشَتٰى",
        translation: "Sungguh, usaha kamu beraneka ragam.",
        reference: "QS. Al-Lail: 4"
    },
    {
        arabic: "فَاِذَا فَرَغْتَ فَانْصَبْۙ",
        translation: "Maka apabila engkau telah selesai (dari suatu urusan), kerjakanlah dengan sungguh-sungguh (urusan) yang lain.",
        reference: "QS. Al-Insyirah: 7"
    },
    {
        arabic: "وَجَعَلْنَا مِنْهُمْ اٖئِمَّةً يَّهْدُوْنَ بِاَمْرِنَا لَمَّا صَبَرُوْاۗ وَكَانُوْا بِاٰيٰتِنَا يُوْقِنُوْنَ",
        translation: "Dan Kami jadikan di antara mereka pemimpin-pemimpin yang memberi petunjuk dengan perintah Kami ketika mereka sabar. Dan mereka meyakini ayat-ayat Kami.",
        reference: "QS. As-Sajdah: 24"
    },
    {
        arabic: "يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوْا ارْكَعُوْا وَاسْجُدُوْا وَاعْبُدُوْا رَبَّكُمْ وَافْعَلُوْا الْخَيْرَ لَعَلَّكُمْ تُفْلِحُوْنَ",
        translation: "Wahai orang-orang yang beriman! Rukuklah, dan sujudlah, serta sembahlah Tuhanmu dan berbuatlah kebaikan, agar kamu beruntung.",
        reference: "QS. Al-Hajj: 77"
    },
    {
        arabic: "وَمَنْ يَّتَّقِ اللّٰهَ يَجْعَلْ لَّهٗ مَخْرَجًا",
        translation: "Barangsiapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.",
        reference: "QS. At-Talaq: 2"
    },
    {
        arabic: "اَللّٰهُ لَاۤ اِلٰهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ",
        translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang Maha Mandiri.",
        reference: "QS. Al-Baqarah: 255 (Ayat Kursi)"
    }
];

// Initialize Quran verses when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeQuranVerses();
});

// Initialize Quran verses display
function initializeQuranVerses() {
    populateQuranVerses();
}

// Populate Quran verses in the HTML
function populateQuranVerses() {
    const container = document.querySelector('.quran-verse-container');
    if (!container) {
        console.error('Quran verse container not found');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create verse items
    quranVerses.forEach((verse, index) => {
        const verseItem = document.createElement('div');
        verseItem.className = `quran-verse-item ${index === 0 ? 'active' : ''}`;
        
        verseItem.innerHTML = `
            <div class="quran-arabic">${verse.arabic}</div>
            <div class="quran-translation-container">
                <div class="quran-translation">${verse.translation}</div>
                <div class="verse-reference">${verse.reference}</div>
            </div>
        `;
        
        container.appendChild(verseItem);
    });
}

// Function to get a random Quran verse
function getRandomVerse() {
    const randomIndex = Math.floor(Math.random() * quranVerses.length);
    return quranVerses[randomIndex];
}

// Function to get a specific verse by index
function getVerseByIndex(index) {
    if (index >= 0 && index < quranVerses.length) {
        return quranVerses[index];
    }
    return null;
}

// Function to rotate Quran verses
function rotateQuranVerses() {
    const verses = document.querySelectorAll('.quran-verse-item');
    if (verses.length <= 1) return;
    
    let currentIndex = 0;
    
    // Find currently active verse
    verses.forEach((verse, index) => {
        if (verse.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    // Remove active class from current verse
    verses[currentIndex].classList.remove('active');
    
    // Calculate next index
    const nextIndex = (currentIndex + 1) % verses.length;
    
    // Add active class to next verse
    verses[nextIndex].classList.add('active');
}

// Function to manually change to a specific verse
function showVerse(index) {
    if (index < 0 || index >= quranVerses.length) {
        console.error('Invalid verse index:', index);
        return;
    }
    
    const verses = document.querySelectorAll('.quran-verse-item');
    verses.forEach((verse, i) => {
        if (i === index) {
            verse.classList.add('active');
        } else {
            verse.classList.remove('active');
        }
    });
}

// Auto-rotate verses every 10 seconds if not already handled in main script
if (typeof window.quranVerseInterval === 'undefined' || window.quranVerseInterval === null) {
    window.quranVerseInterval = setInterval(rotateQuranVerses, 10000);
}

// Export Quran functions for potential use by other scripts
window.QuranFunctions = {
    getRandomVerse: getRandomVerse,
    getVerseByIndex: getVerseByIndex,
    rotateQuranVerses: rotateQuranVerses,
    showVerse: showVerse,
    verses: quranVerses
};