// Configuration
const AIRCRAFT_API_URL = 'https://opensky-network.org/api/states/all';
const BITCOIN_API_URL = 'https://api.blockchain.info/stats';
const EARTHQUAKE_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=';
const AIRCRAFT_REFRESH_INTERVAL = 15000; // 15 seconds
const BITCOIN_REFRESH_INTERVAL = 60000; // 60 seconds
const EARTHQUAKE_REFRESH_INTERVAL = 30000; // 30 seconds

// DOM Elements
const aircraftCounter = document.getElementById('aircraftCounter');
const lastUpdated = document.getElementById('lastUpdated');
const bitcoinCounter = document.getElementById('bitcoinCounter');
const bitcoinLastUpdated = document.getElementById('bitcoinLastUpdated');
const earthquakeCounter = document.getElementById('earthquakeCounter');
const earthquakeLastUpdated = document.getElementById('earthquakeLastUpdated');
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


// Function to fetch earthquake data from the API
async function fetchEarthquakeData() {
    try {
        statusMessage.textContent = 'Updating earthquake data...';
        
        // Get today's date in YYYY-MM-DD format for the API
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;
        
        // Build the API URL with today's date and updated minimum magnitude
        const apiUrl = `${EARTHQUAKE_API_URL}${todayFormatted}&minmagnitude=0.5`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Earthquake API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the count of earthquakes today
        const earthquakeCount = data.features ? data.features.length : 0;
        
        // Update the counter with animation
        const oldValue = earthquakeCounter.textContent;
        earthquakeCounter.textContent = earthquakeCount.toLocaleString();
        
        if (oldValue !== 'Loading...' && oldValue !== earthquakeCounter.textContent) {
            animateCounterChange(earthquakeCounter);
        }
        
        // Update last updated time
        const now = new Date();
        earthquakeLastUpdated.textContent = formatDateTime(now);
        
        statusMessage.textContent = '';
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        statusMessage.textContent = `Error: ${error.message}. Retrying in ${EARTHQUAKE_REFRESH_INTERVAL/1000} seconds.`;
    }
}


// Initial fetch
fetchAircraftData();
fetchBitcoinData();
fetchEarthquakeData();

// Set up periodic refresh
setInterval(fetchAircraftData, AIRCRAFT_REFRESH_INTERVAL);
setInterval(fetchBitcoinData, BITCOIN_REFRESH_INTERVAL);
setInterval(fetchEarthquakeData, EARTHQUAKE_REFRESH_INTERVAL);

// Add event listener for manual refresh
document.querySelectorAll('.counter-card').forEach((card, index) => {
    card.addEventListener('click', (e) => {
        // Don't trigger refresh if clicking source button or content
        if (!e.target.closest('.counter-source')) {
            if (index === 0) {
                fetchAircraftData();
            } else if (index === 1) {
                fetchBitcoinData();
            } else if (index === 2) {
                fetchEarthquakeData();
            }
        }
    });
});