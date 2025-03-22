// Configuration
const AIRCRAFT_API_URL = 'https://opensky-network.org/api/states/all';
const BITCOIN_API_URL = 'https://api.blockchain.info/stats';
const AIRCRAFT_REFRESH_INTERVAL = 15000; // 15 seconds
const BITCOIN_REFRESH_INTERVAL = 60000; // 60 seconds

// DOM Elements
const aircraftCounter = document.getElementById('aircraftCounter');
const lastUpdated = document.getElementById('lastUpdated');
const bitcoinCounter = document.getElementById('bitcoinCounter');
const bitcoinLastUpdated = document.getElementById('bitcoinLastUpdated');
const statusMessage = document.getElementById('statusMessage');
const sourceButtons = document.querySelectorAll('.source-button');

// Toggle source dropdown for all counters
sourceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        button.parentElement.classList.toggle('show-source');
    });
});

// Close dropdown when clicking elsewhere
document.addEventListener('click', (e) => {
    document.querySelectorAll('.counter-source').forEach(source => {
        if (!source.contains(e.target)) {
            source.classList.remove('show-source');
        }
    });
});

// Function to format date and time
function formatDateTime(date) {
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
}

// Function to animate counter change
function animateCounterChange(element) {
    element.classList.add('pulse');
    setTimeout(() => {
        element.classList.remove('pulse');
    }, 500);
}

// Function to fetch aircraft data from the API
async function fetchAircraftData() {
    try {
        statusMessage.textContent = 'Updating aircraft data...';
        
        const response = await fetch(AIRCRAFT_API_URL);
        
        if (!response.ok) {
            throw new Error(`Aircraft API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the count of aircraft currently tracked
        const aircraftCount = data.states ? data.states.length : 0;
        
        // Update the counter with animation
        const oldValue = aircraftCounter.textContent;
        aircraftCounter.textContent = aircraftCount.toLocaleString();
        
        if (oldValue !== 'Loading...' && oldValue !== aircraftCount.toLocaleString()) {
            animateCounterChange(aircraftCounter);
        }
        
        // Update last updated time
        const now = new Date();
        lastUpdated.textContent = formatDateTime(now);
        
        statusMessage.textContent = '';
    } catch (error) {
        console.error('Error fetching aircraft data:', error);
        statusMessage.textContent = `Error: ${error.message}. Retrying in ${AIRCRAFT_REFRESH_INTERVAL/1000} seconds.`;
    }
}

// Function to fetch Bitcoin data from the API
async function fetchBitcoinData() {
    try {
        statusMessage.textContent = 'Updating bitcoin data...';
        
        const response = await fetch(BITCOIN_API_URL);
        
        if (!response.ok) {
            throw new Error(`Bitcoin API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the total number of bitcoins mined
        const bitcoinsMined = data.totalbc / 100000000; // Convert satoshis to BTC
        
        // Update the counter with animation
        const oldValue = bitcoinCounter.textContent;
        bitcoinCounter.textContent = bitcoinsMined.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        if (oldValue !== 'Loading...' && oldValue !== bitcoinCounter.textContent) {
            animateCounterChange(bitcoinCounter);
        }
        
        // Update last updated time
        const now = new Date();
        bitcoinLastUpdated.textContent = formatDateTime(now);
        
        statusMessage.textContent = '';
    } catch (error) {
        console.error('Error fetching bitcoin data:', error);
        statusMessage.textContent = `Error: ${error.message}. Retrying in ${BITCOIN_REFRESH_INTERVAL/1000} seconds.`;
    }
}

// Initial fetch
fetchAircraftData();
fetchBitcoinData();

// Set up periodic refresh
setInterval(fetchAircraftData, AIRCRAFT_REFRESH_INTERVAL);
setInterval(fetchBitcoinData, BITCOIN_REFRESH_INTERVAL);

// Add event listener for manual refresh
document.querySelectorAll('.counter-card').forEach((card, index) => {
    card.addEventListener('click', (e) => {
        // Don't trigger refresh if clicking source button or content
        if (!e.target.closest('.counter-source')) {
            if (index === 0) {
                fetchAircraftData();
            } else if (index === 1) {
                fetchBitcoinData();
            }
        }
    });
});