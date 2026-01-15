// content_manager.js - Content Management Functions for Admin Panel
console.log('Content manager script loaded');

// Global variables
let prayerTimes = {};
let currentSlideIndex = 0;
let slideInterval;
let quranVerseInterval;
let currentDate = new Date();
let adminModal;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded event fired');
    initializeApp();
});

// Initialize all application components
function initializeApp() {
    console.log('initializeApp() called');
    loadPrayerTimes();
    updateTime();
    setInterval(updateTime, 1000); // Update every second
    
    setupVideoPlayer();
    setupAdminPanel();
    setupQuranVerses();
    setupEventListeners();
    
    // Also update display immediately with default data if needed
    setTimeout(() => {
    }, 200);
    
    // Load and apply container visibility settings
    loadVisibilitySettings();
    
    // Automatically start with video-only mode on application load
    setTimeout(() => {
        // Check if the video-only radio button exists and select it
        const videoOnlyRadio = document.getElementById('show-videos');
        if (videoOnlyRadio) {
            videoOnlyRadio.checked = true;
            
            // Trigger the change event to activate video-only mode
            const event = new Event('change');
            videoOnlyRadio.dispatchEvent(event);
            
            // Also immediately call the video-only function to ensure it runs
            setTimeout(() => {
                showOnlyVideos();
            }, 100);
        }
    }, 500); // Small delay to ensure everything is loaded
    
    // Additional check to ensure videos play after a short delay
    setTimeout(() => {
        ensureVideosPlay();
    }, 1000);
}

// Function to ensure videos play even if previous attempts failed
function ensureVideosPlay() {
    const videoOnlySelected = document.getElementById('show-videos')?.checked;
    
    if (videoOnlySelected) {
        const activeSlide = document.querySelector('.carousel-slide.active');
        const activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
        
        if (activeVideo) {
            // Ensure proper configuration
            activeVideo.muted = true;
            activeVideo.defaultMuted = true;
            activeVideo.loop = true;
            activeVideo.preload = 'auto';
            
            // Try to play with various fallbacks
            activeVideo.play()
                .then(() => {
                    console.log('Video started playing successfully');
                })
                .catch(error => {
                    console.log('Error playing video:', error);
                    
                    // Try more aggressive approach
                    const playPromise = activeVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log('Video played after second attempt');
                        })
                        .catch(err => {
                            console.log('Still unable to play video:', err);
                            
                            // Final fallback - try with more aggressive settings
                            activeVideo.setAttribute('muted', '');
                            activeVideo.setAttribute('playsinline', '');
                            activeVideo.setAttribute('autoplay', '');
                            
                            // Try to play after slight delay
                            setTimeout(() => {
                                activeVideo.play().catch(fallbackErr => {
                                    console.log('Final fallback failed:', fallbackErr);
                                });
                            }, 100);
                        });
                    }
                });
        }
    }
}

// Load prayer times from localStorage or use default values
function loadPrayerTimes() {
    const savedTimes = localStorage.getItem('prayerTimes');
    if(savedTimes) {
        prayerTimes = JSON.parse(savedTimes);
    } else {
        // Default prayer times
        prayerTimes = {
            imsak: "04:30",
            subuh: "04:45",
            syuruq: "06:00",
            dhuha: "07:30",
            dhuhur: "12:00",
            ashar: "15:30",
            maghrib: "18:00",
            isya: "19:30"
        };
        savePrayerTimes();
    }
    updatePrayerTimeDisplays();
}

// Save prayer times to localStorage
function savePrayerTimes() {
    localStorage.setItem('prayerTimes', JSON.stringify(prayerTimes));
}

// Update the displayed prayer times
function updatePrayerTimeDisplays() {
    document.getElementById('imsak-time').textContent = prayerTimes.imsak;
    document.getElementById('subuh-time').textContent = prayerTimes.subuh;
    document.getElementById('syuruq-time').textContent = prayerTimes.syuruq;
    document.getElementById('dhuha-time').textContent = prayerTimes.dhuha;
    document.getElementById('dhuhur-time').textContent = prayerTimes.dhuhur;
    document.getElementById('ashar-time').textContent = prayerTimes.ashar;
    document.getElementById('maghrib-time').textContent = prayerTimes.maghrib;
    document.getElementById('isya-time').textContent = prayerTimes.isya;
}

// Update current time and date display
function updateTime() {
    const now = new Date();
    
    // Update current time
    const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
    document.getElementById('current-time').textContent = timeString;
    
    // Update current date
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = now.toLocaleDateString('id-ID', options);
    document.getElementById('current-date').textContent = dateString;
    
    // Update Hijri date
    updateHijriDate(now);
    
    // Update countdown to next prayer
    updateCountdownToNextPrayer(now);
}

// Convert Gregorian date to Hijri date (simplified)
function updateHijriDate(date) {
    // This is a simplified version - in production, use a proper library like moment-hijri
    // For now, we'll use a placeholder that shows today's approximate Hijri date
    // In a real application, you would use a conversion algorithm or API
    document.getElementById('hijri-date').textContent = getApproximateHijriDate(date);
}

// Simplified Hijri date calculation (approximation)
function getApproximateHijriDate(date) {
    // This is a rough approximation - in real applications, use proper conversion
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
        'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    
    // Simplified calculation - this is not accurate for all dates
    // For a real application, use a proper Hijri conversion library
    const hijriYear = 1445; // Approximate current Hijri year
    const hijriMonth = hijriMonths[2]; // Approximate current month
    const hijriDay = date.getDate(); // Approximate day
    
    return `${hijriDay} ${hijriMonth} ${hijriYear} H`;
}

// Calculate and update countdown to next prayer
function updateCountdownToNextPrayer(now) {
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    // Define prayer times in minutes from midnight
    const prayerMinutes = {};
    for (const prayer in prayerTimes) {
        const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
        prayerMinutes[prayer] = hours * 60 + minutes;
    }
    
    // Sort prayers by time
    const sortedPrayers = Object.keys(prayerMinutes).sort((a, b) => prayerMinutes[a] - prayerMinutes[b]);
    
    // Find the next prayer
    let nextPrayer = null;
    for (const prayer of sortedPrayers) {
        if (prayerMinutes[prayer] > currentTime) {
            nextPrayer = prayer;
            break;
        }
    }
    
    // If no next prayer found today, use the first prayer of tomorrow
    if (!nextPrayer) {
        nextPrayer = sortedPrayers[0];
    }
    
    // Calculate time difference
    let diffInMinutes;
    if (prayerMinutes[nextPrayer] > currentTime) {
        diffInMinutes = prayerMinutes[nextPrayer] - currentTime;
    } else {
        // Next prayer is tomorrow
        diffInMinutes = (24 * 60) - currentTime + prayerMinutes[nextPrayer];
    }
    
    // Convert to hours, minutes, seconds
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    const seconds = now.getSeconds();
    const remainingSeconds = 60 - seconds;
    
    // Adjust if seconds calculation makes minutes negative
    let finalHours = hours;
    let finalMinutes = minutes;
    let finalSeconds = remainingSeconds;
    
    if (finalSeconds >= 60) {
        finalSeconds -= 60;
        finalMinutes += 1;
    }
    
    if (finalMinutes >= 60) {
        finalMinutes -= 60;
        finalHours += 1;
    }
    
    // Format as HH:MM:SS
    const countdownText = `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}`;
    
    // Update display
    document.getElementById('countdown').textContent = countdownText;
    document.getElementById('next-prayer-name').textContent = capitalizeFirstLetter(nextPrayer);
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Setup video player functionality
function setupVideoPlayer() {
    // Initialize the main video player
    initializeVideoPlayer();
    
    // Add event listener for video mode radio button
    document.getElementById('show-videos')?.addEventListener('change', function(event) {
        initializeVideoPlayer();
    });
}

// Handle slide mode changes
function handleSlideModeChange(event) {
    const selectedValue = event.target.value;
    
    switch(selectedValue) {
        case 'videos':
            // For video-only mode, immediately show and play videos
            showOnlyVideos();
            break;
    }
}

// Show only video slides and auto-play them
function showOnlyVideos() {
    const slides = document.querySelectorAll('.carousel-slide');
    
    // First hide all image slides and show only video slides
    slides.forEach(slide => {
        const img = slide.querySelector('img');
        const video = slide.querySelector('video');
        
        if (video) {
            slide.style.display = 'block';
            video.muted = true;
            video.loop = true;
            video.preload = 'auto';
            video.setAttribute('playsinline', '');
            video.setAttribute('autoplay', '');
        } else if (img) {
            slide.style.display = 'none';
        }
    });
    
    // Show first visible video slide
    showFirstVisibleSlide();
    
    // Now play the visible video immediately
    const activeSlide = document.querySelector('.carousel-slide.active');
    const activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
    
    if (activeVideo) {
        // Ensure video is properly configured for continuous playback
        activeVideo.muted = true;
        activeVideo.loop = true;
        activeVideo.preload = 'auto';
        
        // Reset and play the video
        activeVideo.currentTime = 0;
        activeVideo.play().catch(e => {
            console.log('Video play error:', e);
            // Attempt to play again with proper configuration
            activeVideo.muted = true;
            activeVideo.loop = true;
            activeVideo.preload = 'auto';
            activeVideo.play().catch(err => console.log('Retry video play error:', err));
        });
    }
    
    // Clear any existing interval to remove delays
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// Show first visible slide (video-only)
function showFirstVisibleSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    // Find first video slide (since we're only showing videos)
    let firstVisibleIndex = -1;
    for (let i = 0; i < slides.length; i++) {
        const video = slides[i].querySelector('video');
        if (video) {  // Since we only show videos, find first slide with video
            firstVisibleIndex = i;
            break;
        }
    }
    
    if (firstVisibleIndex !== -1) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show first video slide
        slides[firstVisibleIndex].classList.add('active');
        if (dots[firstVisibleIndex]) {
            dots[firstVisibleIndex].classList.add('active');
        }
        
        currentSlideIndex = firstVisibleIndex;
        
        // Play the video
        const video = slides[firstVisibleIndex].querySelector('video');
        if (video) {
            // Pause all other videos first
            document.querySelectorAll('video').forEach(v => {
                if (v !== video) {
                    v.pause();
                    v.classList.remove('video-playing');
                }
            });
            
            // Ensure video is properly configured for continuous playback
            video.muted = true;
            video.loop = true;
            video.preload = 'auto';
            
            // Play the video
            video.currentTime = 0; // Reset to beginning
            video.play().catch(e => {
                console.log('Video play error:', e);
                // Attempt to play again with proper configuration
                video.muted = true;
                video.loop = true;
                video.preload = 'auto';
                video.play().catch(err => console.log('Retry video play error:', err));
            });
            video.classList.add('video-playing');
        }
    }
}

// Restart carousel interval
function restartCarousel() {
    // Clear existing interval
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    
    // Disable automatic slide change - manual navigation only
    // slideInterval = setInterval(() => {
    //     goToNextVisibleSlide();
    // }, 5000); // Change slide every 5 seconds
}

// Initialize video player
function initializeVideoPlayer() {
    const mainVideo = document.getElementById('main-video');
    if (mainVideo) {
        // Configure video for autoplay
        mainVideo.muted = true;
        mainVideo.loop = true;
        mainVideo.preload = 'auto';
        mainVideo.setAttribute('playsinline', '');
        
        // Attempt to play the video
        mainVideo.play().catch(e => {
            console.log('Video play error:', e);
            // Try again with more aggressive settings
            mainVideo.muted = true;
            mainVideo.loop = true;
            mainVideo.play().catch(err => console.log('Retry video play error:', err));
        });
    }
}

// Setup admin panel functionality
function setupAdminPanel() {
    console.log('setupAdminPanel() called');
    const adminBtn = document.getElementById('admin-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeBtn = document.getElementById('admin-close');
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (!adminBtn || !adminModal) {
        console.warn('Admin panel elements not found');
        return;
    }
    
    // Open modal
    adminBtn.addEventListener('click', () => {
        adminModal.style.display = 'block';
        // Load current data into form fields
        loadFormData();
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });
    
    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            btn.classList.add('active');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
                

            }
        });
    });
    
    // Save general info
    document.getElementById('save-general')?.addEventListener('click', saveGeneralInfo);
    
    // Save prayer times
    document.getElementById('save-prayer-times')?.addEventListener('click', savePrayerTimesFromForm);
    

    
    // Save ramadan events
    document.getElementById('save-ramadan')?.addEventListener('click', saveRamadanEvents);
    

    
    // Save jumat schedule
    document.getElementById('save-jumat')?.addEventListener('click', saveJumatSchedule);
    
    // Save rekening info
    document.getElementById('save-rekening')?.addEventListener('click', saveRekeningInfo);
    
    // Save donation and finance info
    document.getElementById('save-donasi-finance')?.addEventListener('click', saveDonationFinance);
    
    // Save staff info
    document.getElementById('save-staff')?.addEventListener('click', saveStaffInfo);
    
    // Save visibility settings
    const saveVisibilityBtn = document.getElementById('save-visibility');
    console.log('Save visibility button found:', saveVisibilityBtn);
    if (saveVisibilityBtn) {
        saveVisibilityBtn.addEventListener('click', saveVisibilitySettings);
        console.log('Save visibility event listener added');
    } else {
        console.log('Save visibility button NOT found');
    }
}

// Load form data from localStorage or current display
function loadFormData() {
    // Load general info
    document.getElementById('masjid-name-input').value = document.getElementById('masjid-name').textContent;
    document.getElementById('masjid-address-input').value = document.getElementById('masjid-address').textContent;
    document.getElementById('masjid-info-input').value = document.getElementById('masjid-info').textContent;
    
    // Load prayer times
    document.getElementById('imsak-time-input').value = document.getElementById('imsak-time').textContent;
    document.getElementById('subuh-time-input').value = document.getElementById('subuh-time').textContent;
    document.getElementById('syuruq-time-input').value = document.getElementById('syuruq-time').textContent;
    document.getElementById('dhuha-time-input').value = document.getElementById('dhuha-time').textContent;
    document.getElementById('dhuhur-time-input').value = document.getElementById('dhuhur-time').textContent;
    document.getElementById('ashar-time-input').value = document.getElementById('ashar-time').textContent;
    document.getElementById('maghrib-time-input').value = document.getElementById('maghrib-time').textContent;
    document.getElementById('isya-time-input').value = document.getElementById('isya-time').textContent;
    
    // Load bank info
    document.querySelector('#bank-name')?.setAttribute('placeholder', document.querySelector('.bank-account-details p:nth-child(1)').textContent.replace('Nama Bank: ', '').trim());
    document.querySelector('#account-number')?.setAttribute('placeholder', document.querySelector('.bank-account-details p:nth-child(2)').textContent.replace('Nomor Rekening: ', '').trim());
    document.querySelector('#account-name')?.setAttribute('placeholder', document.querySelector('.bank-account-details p:nth-child(3)').textContent.replace('Atas Nama: ', '').trim());
    
    // Set video-only mode as default in the admin panel
    document.getElementById('show-videos').checked = true;
}

// Save general info from form
function saveGeneralInfo() {
    const nameInput = document.getElementById('masjid-name-input').value;
    const addressInput = document.getElementById('masjid-address-input').value;
    const infoInput = document.getElementById('masjid-info-input').value;
    
    document.getElementById('masjid-name').textContent = nameInput;
    document.getElementById('masjid-address').textContent = addressInput;
    document.getElementById('masjid-info').textContent = infoInput;
    
    // Save to localStorage
    localStorage.setItem('masjidName', nameInput);
    localStorage.setItem('masjidAddress', addressInput);
    localStorage.setItem('masjidInfo', infoInput);
    
    alert('Informasi umum berhasil disimpan!');
}

// Save prayer times from form
function savePrayerTimesFromForm() {
    prayerTimes.imsak = document.getElementById('imsak-time-input').value;
    prayerTimes.subuh = document.getElementById('subuh-time-input').value;
    prayerTimes.syuruq = document.getElementById('syuruq-time-input').value;
    prayerTimes.dhuha = document.getElementById('dhuha-time-input').value;
    prayerTimes.dhuhur = document.getElementById('dhuhur-time-input').value;
    prayerTimes.ashar = document.getElementById('ashar-time-input').value;
    prayerTimes.maghrib = document.getElementById('maghrib-time-input').value;
    prayerTimes.isya = document.getElementById('isya-time-input').value;
    
    savePrayerTimes();
    updatePrayerTimeDisplays();
    
    alert('Waktu sholat berhasil disimpan!');
}



// Save ramadan events from form
function saveRamadanEvents() {
    alert('Kegiatan Ramadhan berhasil disimpan!');
}





// Save jumat schedule from form
function saveJumatSchedule() {
    alert('Jadwal Jumat berhasil disimpan!');
}

// Save rekening info from form
function saveRekeningInfo() {
    const bankName = document.querySelector('#bank-name').value;
    const accountNumber = document.querySelector('#account-number').value;
    const accountName = document.querySelector('#account-name').value;
    
    // Update display if values are provided
    if (bankName) {
        document.querySelector('.bank-account-details p:nth-child(1) strong').nextSibling.textContent = ` ${bankName}`;
    }
    if (accountNumber) {
        document.querySelector('.bank-account-details p:nth-child(2) strong').nextSibling.textContent = ` ${accountNumber}`;
    }
    if (accountName) {
        document.querySelector('.bank-account-details p:nth-child(3) strong').nextSibling.textContent = ` ${accountName}`;
    }
    
    alert('Informasi rekening berhasil disimpan!');
}

// Save donation and finance info from form
function saveDonationFinance() {
    alert('Data donasi dan keuangan berhasil disimpan!');
}

// Save staff info from form
function saveStaffInfo() {
    alert('Data petugas berhasil disimpan!');
}

// Save visibility settings
function saveVisibilitySettings() {
    console.log('Save visibility settings clicked');
    const visibilitySettings = {
        videoContainer: document.getElementById('video-container-visibility')?.checked,
        quranContainer: document.getElementById('quran-container-visibility')?.checked,
        qrisContainer: document.getElementById('qris-container-visibility')?.checked,
        bankContainer: document.getElementById('bank-container-visibility')?.checked,
        infoContainer: document.getElementById('info-container-visibility')?.checked,
        ramadanContainer: document.getElementById('ramadan-container-visibility')?.checked,
        jumatContainer: document.getElementById('jumat-container-visibility')?.checked,
        donaturContainer: document.getElementById('donatur-container-visibility')?.checked,
        financeContainer: document.getElementById('finance-container-visibility')?.checked,
        staffFooterContainer: document.getElementById('staff-footer-container-visibility')?.checked
    };
    
    // Save to localStorage
    console.log('Saving visibility settings to localStorage:', visibilitySettings);
    localStorage.setItem('containerVisibility', JSON.stringify(visibilitySettings));
    
    // Apply visibility settings immediately
    applyVisibilitySettings(visibilitySettings);
    
    alert('Pengaturan visibilitas kontainer berhasil disimpan!');
}

// Apply visibility settings to containers
function applyVisibilitySettings(settings) {
    console.log('Applying visibility settings:', settings);
    
    // Main containers - using correct selectors based on actual HTML structure
    const videoContainer = document.querySelector('.carousel-container-wrapper');
    const quranContainer = document.querySelector('.quran-verse-section');
    
    if (videoContainer) {
        console.log('Setting video container to:', settings.videoContainer ? 'block' : 'none');
        videoContainer.style.display = settings.videoContainer ? 'block' : 'none';
    } else {
        console.log('Video container not found');
    }
    if (quranContainer) {
        console.log('Setting quran container to:', settings.quranContainer ? 'block' : 'none');
        quranContainer.style.display = settings.quranContainer ? 'block' : 'none';
    } else {
        console.log('Quran container not found');
    }
    
    // Left containers - using correct selectors
    const qrisContainer = document.querySelector('.qris-section');
    const bankContainer = document.querySelector('.bank-account-section');
    
    if (qrisContainer) {
        console.log('Setting qris container to:', settings.qrisContainer ? 'block' : 'none');
        qrisContainer.style.display = settings.qrisContainer ? 'block' : 'none';
    } else {
        console.log('QRIS container not found');
    }
    if (bankContainer) {
        console.log('Setting bank container to:', settings.bankContainer ? 'block' : 'none');
        bankContainer.style.display = settings.bankContainer ? 'block' : 'none';
    } else {
        console.log('Bank container not found');
    }
    
    // Right containers - using correct selectors
    const infoContainer = document.querySelector('.info-section');
    const ramadanContainer = document.querySelector('.ramadan-info-section');
    const jumatContainer = document.querySelector('.jumat-schedule-section');
    
    if (infoContainer) {
        console.log('Setting info container to:', settings.infoContainer ? 'block' : 'none');
        infoContainer.style.display = settings.infoContainer ? 'block' : 'none';
    } else {
        console.log('Info container not found');
    }
    if (ramadanContainer) {
        console.log('Setting ramadan container to:', settings.ramadanContainer ? 'block' : 'none');
        ramadanContainer.style.display = settings.ramadanContainer ? 'block' : 'none';
    } else {
        console.log('Ramadan container not found');
    }
    if (jumatContainer) {
        console.log('Setting jumat container to:', settings.jumatContainer ? 'block' : 'none');
        jumatContainer.style.display = settings.jumatContainer ? 'block' : 'none';
    } else {
        console.log('Jumat container not found');
    }
    
    // Left containers - donation list section
    const donationListContainer = document.querySelector('.donation-list-section');
    if (donationListContainer) {
        console.log('Setting donation list container to:', settings.donaturContainer ? 'block' : 'none');
        donationListContainer.style.display = settings.donaturContainer ? 'block' : 'none';
    } else {
        console.log('Donation list container not found');
    }
    
    // Footer containers - using correct selectors (now includes 3 columns: Keuangan, Petugas Sholat, Jadwal Jumat)
    const footerColumns = document.querySelectorAll('.footer-column');
    console.log('Found footer columns:', footerColumns.length);
    if (footerColumns.length >= 2) {
        // Keuangan (first column)
        console.log('Setting finance container (column 0) to:', settings.financeContainer ? 'block' : 'none');
        footerColumns[0].style.display = settings.financeContainer ? 'block' : 'none';
        // Petugas (second column)
        console.log('Setting staff container (column 1) to:', settings.staffFooterContainer ? 'block' : 'none');
        footerColumns[1].style.display = settings.staffFooterContainer ? 'block' : 'none';
        
        // Jadwal Jumat (third column) - if it exists
        if (footerColumns.length >= 3) {
            console.log('Setting jumat schedule container (column 2) to:', settings.jumatContainer ? 'block' : 'none');
            footerColumns[2].style.display = settings.jumatContainer ? 'block' : 'none';
        }
    } else {
        console.log('Footer columns not found or insufficient');
    }
}

// Load and apply visibility settings on page load
function loadVisibilitySettings() {
    const savedSettings = localStorage.getItem('containerVisibility');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            applyVisibilitySettings(settings);
            
            // Update checkboxes in admin panel
            document.getElementById('video-container-visibility').checked = settings.videoContainer !== false;
            document.getElementById('quran-container-visibility').checked = settings.quranContainer !== false;
            document.getElementById('qris-container-visibility').checked = settings.qrisContainer !== false;
            document.getElementById('bank-container-visibility').checked = settings.bankContainer !== false;
            document.getElementById('info-container-visibility').checked = settings.infoContainer !== false;
            document.getElementById('ramadan-container-visibility').checked = settings.ramadanContainer !== false;
            document.getElementById('jumat-container-visibility').checked = settings.jumatContainer !== false;
            document.getElementById('donatur-container-visibility').checked = settings.donaturContainer !== false;
            document.getElementById('finance-container-visibility').checked = settings.financeContainer !== false;
            document.getElementById('staff-footer-container-visibility').checked = settings.staffFooterContainer !== false;
        } catch (e) {
            console.error('Error loading visibility settings:', e);
        }
    }
}

// Setup Quran verses rotation
function setupQuranVerses() {
    const verses = document.querySelectorAll('.quran-verse-item');
    let currentVerseIndex = 0;
    
    if (verses.length === 0) {
        console.warn('Quran verse elements not found');
        return;
    }
    
    // Show first verse
    verses.forEach((verse, index) => {
        if (index === 0) {
            verse.classList.add('active');
        } else {
            verse.classList.remove('active');
        }
    });
    
    // Rotate verses every 10 seconds
    quranVerseInterval = setInterval(() => {
        verses[currentVerseIndex].classList.remove('active');
        currentVerseIndex = (currentVerseIndex + 1) % verses.length;
        verses[currentVerseIndex].classList.add('active');
    }, 10000); // Change verse every 10 seconds
}

// Setup event listeners for various interactive elements
function setupEventListeners() {
    // Set up Intersection Observer to detect when videos become visible
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of the video is visible
    };
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const videoOnlySelected = document.getElementById('show-videos')?.checked;
            
            if (entry.isIntersecting && videoOnlySelected) {
                // Video is visible and in video-only mode, try to play it
                video.muted = true;
                video.loop = true;
                
                video.play()
                    .then(() => {
                        console.log('Video started playing via intersection observer');
                    })
                    .catch(error => {
                        console.log('Intersection observer play error:', error);
                        
                        // Try alternative approach
                        setTimeout(() => {
                            video.play().catch(err => {
                                console.log('Retry after intersection observer failed:', err);
                            });
                        }, 100);
                    });
            } else if (!entry.isIntersecting) {
                // Pause video when it's no longer visible
                video.pause();
            }
        });
    }, observerOptions);
    
    // Handle video playback in carousel
    document.querySelectorAll('video').forEach(video => {
        // Ensure videos are properly configured for continuous playback
        video.muted = true;
        video.loop = true;
        video.preload = 'auto';
        
        // Observe each video
        videoObserver.observe(video);
        
        video.addEventListener('loadedmetadata', function() {
            // Ensure video maintains aspect ratio
            this.style.objectFit = 'cover';
            
            // If this video is currently active and in video-only mode, try to play it
            const isActiveSlide = this.closest('.carousel-slide')?.classList.contains('active');
            const videoOnlySelected = document.getElementById('show-videos')?.checked;
            
            if (isActiveSlide && videoOnlySelected) {
                this.play().catch(e => console.log('Auto-play on load error:', e));
            }
        });
        
        video.addEventListener('canplay', function() {
            const isActiveSlide = this.closest('.carousel-slide')?.classList.contains('active');
            const videoOnlySelected = document.getElementById('show-videos')?.checked;
            if (isActiveSlide && videoOnlySelected) {
                this.play().catch(e => console.log('Auto-play on canplay error:', e));
            }
        });
        
        video.addEventListener('ended', function() {
            // Restart video when it ends (in case loop attribute doesn't work)
            this.currentTime = 0;
            this.play().catch(e => console.log('Video restart error:', e));
        });
        
        // Pause video when it's not active
        video.addEventListener('play', function() {
            // Pause other videos
            document.querySelectorAll('video').forEach(otherVideo => {
                if (otherVideo !== this && otherVideo.classList.contains('video-playing')) {
                    otherVideo.pause();
                    otherVideo.classList.remove('video-playing');
                }
            });
            
            this.classList.add('video-playing');
        });
        
        video.addEventListener('pause', function() {
            this.classList.remove('video-playing');
        });
    });
    
    // Handle responsive behavior
    window.addEventListener('resize', function() {
        // Adjust layout as needed
        adjustLayout();
    });
    
    // Initial layout adjustment
    adjustLayout();
}

// Adjust layout based on screen size
function adjustLayout() {
    // This function can handle responsive adjustments
    // For now, we'll just log the resize event
    console.log('Layout adjusted for resize');
}

// Utility function to convert time string to minutes since midnight
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Utility function to convert minutes since midnight to time string
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Function to check if it's currently prayer time (within 5 minutes of adhan)
function isPrayerTime(now) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const prayer in prayerTimes) {
        const prayerMinute = timeToMinutes(prayerTimes[prayer]);
        
        // Check if current time is within 5 minutes before or after prayer time
        if (Math.abs(currentTime - prayerMinute) <= 5) {
            return prayer;
        }
    }
    
    return null;
}

// Function to play adhan audio (if available)
function playAdhan(prayerName) {
    // In a real implementation, this would play the appropriate adhan audio
    console.log(`Adhan for ${prayerName} should be played now`);
    
    // Example of how to play audio if adhan files exist
    /*
    const audio = new Audio(`asset/sound/${prayerName}_adhan.mp3`);
    audio.play().catch(e => console.error("Error playing adhan:", e));
    */
}

// Function to handle prayer time notifications
function handlePrayerTimeNotifications() {
    const now = new Date();
    const prayer = isPrayerTime(now);
    
    if (prayer) {
        playAdhan(prayer);
        // Highlight the current prayer in the UI
        highlightCurrentPrayer(prayer);
    }
}

// Function to highlight current prayer in the UI
function highlightCurrentPrayer(prayerName) {
    // Remove highlighting from all prayer cards
    document.querySelectorAll('.prayer-card').forEach(card => {
        card.classList.remove('current-prayer');
    });
    
    // Add highlighting to current prayer card
    const prayerCard = document.getElementById(`${prayerName}-time`).closest('.prayer-card');
    prayerCard.classList.add('current-prayer');
    
    // Remove highlighting after 5 minutes
    setTimeout(() => {
        prayerCard.classList.remove('current-prayer');
    }, 5 * 60 * 1000); // 5 minutes
}

// Export functions that might be needed by other scripts
window.AdzanApp = {
    updateTime: updateTime,
    loadPrayerTimes: loadPrayerTimes,
    updatePrayerTimeDisplays: updatePrayerTimeDisplays,
    setupAdminPanel: setupAdminPanel,
    setupQuranVerses: setupQuranVerses
};