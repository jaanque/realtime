// Configuration
const API_URL = 'https://opensky-network.org/api/states/all';
const REFRESH_INTERVAL = 15000; // 15 seconds (be mindful of API rate limits)

// DOM Elements
const aircraftCounter = document.getElementById('aircraftCounter');
const lastUpdated = document.getElementById('lastUpdated');
const statusMessage = document.getElementById('statusMessage');
const sourceButton = document.querySelector('.source-button');

// Toggle source dropdown
sourceButton.addEventListener('click', (e) => {
    e.stopPropagation();
    sourceButton.parentElement.classList.toggle('show-source');
});

// Close dropdown when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.counter-source')) {
        document.querySelector('.counter-source').classList.remove('show-source');
    }
});

// Function to format date and time
function formatDateTime(date) {
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
}

// Function to animate counter change
function animateCounterChange() {
    aircraftCounter.classList.add('pulse');
    setTimeout(() => {
        aircraftCounter.classList.remove('pulse');
    }, 500);
}

// Function to fetch data from the API
async function fetchAircraftData() {
    try {
        statusMessage.textContent = 'Updating...';
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the count of aircraft currently tracked
        const aircraftCount = data.states ? data.states.length : 0;
        
        // Update the counter with animation
        const oldValue = aircraftCounter.textContent;
        aircraftCounter.textContent = aircraftCount.toLocaleString();
        
        if (oldValue !== 'Loading...' && oldValue !== aircraftCount.toLocaleString()) {
            animateCounterChange();
        }
        
        // Update last updated time
        const now = new Date();
        lastUpdated.textContent = formatDateTime(now);
        
        statusMessage.textContent = '';
    } catch (error) {
        console.error('Error fetching aircraft data:', error);
        statusMessage.textContent = `Error: ${error.message}. Retrying in ${REFRESH_INTERVAL/1000} seconds.`;
    }
}

// Initial fetch
fetchAircraftData();

// Set up periodic refresh
setInterval(fetchAircraftData, REFRESH_INTERVAL);

// Add event listener for manual refresh
document.querySelector('.counter-card').addEventListener('click', (e) => {
    // Don't trigger refresh if clicking source button or content
    if (!e.target.closest('.counter-source')) {
        fetchAircraftData();
    }
});