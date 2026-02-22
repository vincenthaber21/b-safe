// Global variables
let map;
let currentLocation = { lat: 40.7128, lng: -74.0060 }; // Default: New York
let currentMarker;
let heatLayers = [];
let heatmapData = [];
let currentIntensity = 0.8;
let hazardMarkers = [];
let mapPollInterval = null;
let weatherPollInterval = null;
let mainCityMarker = null;

// Weather Map page with Hazard Warnings
function renderWeatherMap(){
  const container = document.getElementById('weather-map');
  if(!container) return;

  // City of Candon coordinates (Ilocos Sur, Philippines)
  const candonLocation = { lat: 17.0076, lng: 120.7872 };

  // Hazard data for City of Candon area
  const hazards = [
    { lat: 17.0076, lng: 120.7872, type: 'flood', level: 'warning', name: 'Flood Advisory - Downtown' },
    { lat: 17.0150, lng: 120.7900, type: 'flood', level: 'caution', name: 'Flash Flood Watch - North' },
    { lat: 16.9950, lng: 120.7700, type: 'landslide', level: 'watch', name: 'Landslide Risk - South' }
  ];

  // Prepare container
  container.style.width  = '100%';
  container.style.height = '500px';
  container.style.display = 'block';

  // Destroy previous map instance if exists
  if (map) {
    try { map.remove(); } catch(e){}
    map = null;
    mainCityMarker = null;
    hazardMarkers = [];
    heatLayers = [];
  }
  container.innerHTML = '';

  // --- Initialize Leaflet map immediately (don't wait for API) ---
  try {
    if (!window.L) throw new Error('Leaflet not available');

    map = L.map('weather-map', {
      zoomControl: true,
      attributionControl: true
    }).setView([candonLocation.lat, candonLocation.lng], 14);

    // Base layer: CARTO Voyager tiles — free, no API key, highly reliable
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Free precipitation/radar overlay via RainViewer (no API key required)
    // Fetches the latest radar snapshot URLs from RainViewer's public API
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then(rv => {
        if (rv && rv.radar && rv.radar.past && rv.radar.past.length > 0) {
          const latest = rv.radar.past[rv.radar.past.length - 1];
          L.tileLayer(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`, {
            attribution: '&copy; <a href="https://www.rainviewer.com" target="_blank">RainViewer</a>',
            opacity: 0.5,
            zIndex: 100,
            tileSize: 256
          }).addTo(map);
        }
      })
      .catch(() => { /* RainViewer unavailable – base map still shown */ });

    // Main city marker (use default icon to avoid SVG parsing issues)
    mainCityMarker = L.marker([candonLocation.lat, candonLocation.lng])
      .addTo(map)
      .bindPopup('<b>City of Candon</b><br>Loading weather...')
      .openPopup();

    // Hazard markers
    updateHazardMarkers(hazards);

    // Force correct tile rendering after layout settles
    setTimeout(() => { if (map) { map.invalidateSize(); } }, 200);
    setTimeout(() => { if (map) { map.invalidateSize(); } }, 600);
    setTimeout(() => { if (map) { map.invalidateSize(); } }, 1500);

    // --- Fetch weather in the background and update popup ---
    fetchAndUpdateWeather(candonLocation);

    // Restart polling intervals
    if (weatherPollInterval) clearInterval(weatherPollInterval);
    if (mapPollInterval)     clearInterval(mapPollInterval);

    startWeatherPolling(candonLocation);

    mapPollInterval = setInterval(async () => {
      try {
        const newHazards = await fetchHazards();
        updateHazardMarkers(newHazards);
      } catch(e) { console.warn('Hazard poll error', e); }
    }, 15000);

    window.addEventListener('beforeunload', () => {
      if (mapPollInterval) clearInterval(mapPollInterval);
      stopWeatherPolling();
    });

  } catch(e) {
    console.error('Map init error:', e);
    renderMapFallback(container);
  }

  // Update location info panel immediately
  updateLocationInfo('City of Candon', candonLocation.lat, candonLocation.lng);

  const btnRefresh = document.getElementById('btn-refresh-weather');
  if (btnRefresh) btnRefresh.onclick = () => renderWeatherMap();
}

// Fetch weather data and update the main city marker popup
async function fetchAndUpdateWeather(location) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const c = data.current;
    const temp = c.temperature_2m !== undefined ? `${c.temperature_2m}°C` : '--';
    const cond = getWeatherDescription(c.weathercode);
    if (mainCityMarker) {
      mainCityMarker.setPopupContent(
        `<b>City of Candon</b><br>🌦️ ${temp}<br>${cond}<br><small>Updated: ${new Date().toLocaleTimeString()}</small>`
      );
    }
    // Update panel
    const tempEl = document.getElementById('tempInfo');
    if (tempEl) tempEl.innerHTML = `<span id="tempValue">${Math.round(c.temperature_2m)}</span>&deg;C`;
    const windEl = document.getElementById('windInfo');
    if (windEl) windEl.textContent = Math.round(c.wind_speed_10m) + ' km/h';
    const humEl = document.getElementById('humidityInfo');
    if (humEl) humEl.textContent = c.relative_humidity_2m + '%';
  } catch(e) {
    console.warn('fetchAndUpdateWeather error:', e);
  }
}

// Fetch hazards (placeholder - replace with server API if available)
async function fetchHazards(){
    // For now return the same static hazards near City of Candon.
    return [
        { lat: 17.0076, lng: 120.7872, type: 'flood', level: 'warning', name: 'Flood Advisory - Downtown' },
        { lat: 17.0150, lng: 120.7900, type: 'flood', level: 'caution', name: 'Flash Flood Watch - North' },
        { lat: 16.9950, lng: 120.7700, type: 'landslide', level: 'watch', name: 'Landslide Risk - South' }
    ];
}

// Update hazard markers on map
function updateHazardMarkers(hazards){
    if (!map) return;
    // Remove existing hazard markers
    hazardMarkers.forEach(m=>{ try{ map.removeLayer(m); }catch(e){} });
    hazardMarkers = [];

    hazards.forEach(hazard=>{
        const icons = { flood: '💧', landslide: '⛰️', typhoon: '🌪️' };
        const levelColor = { warning: '#ff6b6b', caution: '#ff9800', watch: '#ffc107' };
        const marker = L.circleMarker([hazard.lat, hazard.lng], {
            radius: 8,
            fillColor: levelColor[hazard.level] || '#ff6b6b',
            color: '#333',
            weight: 1,
            opacity: 0.9,
            fillOpacity: 0.9
        }).addTo(map).bindPopup(`<b>${hazard.name}</b><br>Type: ${hazard.type}<br>Level: <strong>${hazard.level.toUpperCase()}</strong>`);
        hazardMarkers.push(marker);
    });
}

// Weather polling: fetch current weather from Open-Meteo
async function fetchCurrentWeather(lat, lng){
    try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        if(!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        return data.current_weather || null;
    }catch(e){
        console.warn('fetchCurrentWeather error', e);
        return null;
    }
}

async function updateWeatherOnMap(location){
    if(!map || !mainCityMarker) return;
    const w = await fetchCurrentWeather(location.lat, location.lng);
    if(!w) return;

    const temp = (w.temperature !== undefined) ? `${w.temperature}°C` : 'N/A';
    const cond = w.weathercode !== undefined ? getWeatherDescription(w.weathercode) : 'Unknown';

    // Update popup content
    const popupContent = `<b>City of Candon</b><br>🌦️ ${temp}<br>${cond}<br><small>Updated: ${new Date().toLocaleTimeString()}</small>`;
    mainCityMarker.setPopupContent(popupContent);

    // Regenerate heatmap around updated data (slightly shift points based on temp)
    updateHeatmapLayer();
}

function startWeatherPolling(location){
    // initial update
    updateWeatherOnMap(location);
    // poll every 60 seconds
    weatherPollInterval = setInterval(()=> updateWeatherOnMap(location), 60000);
}

function stopWeatherPolling(){
    if(weatherPollInterval) { clearInterval(weatherPollInterval); weatherPollInterval = null; }
}

// Helper function to convert WMO weather codes to descriptions
function getWeatherDescription(code){
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Unknown';
}

function renderMapFallback(container){
  container.innerHTML = `
    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0">
      <div style="text-align:center;padding:20px">
        <h3 style="margin:0;color:#333">City of Candon</h3>
        <div style="font-size:48px;margin:20px 0">🌍</div>
        <p style="color:#666;margin:5px 0">Latitude: 17.0065° N</p>
        <p style="color:#666;margin:5px 0">Longitude: 120.7857° E</p>
        <p style="font-size:12px;color:#999;margin-top:10px">(Map view unavailable)</p>
      </div>
    </div>
  `;
}

// Initialize on page load
function bootWeatherMapPage() {
    try {
        renderWeatherMap();
        setupEventListeners();
    } catch (e) {
        console.error('Weather map boot error:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootWeatherMapPage);
} else {
    // If this script is loaded after DOMContentLoaded (e.g., cached/dynamically injected),
    // ensure the map still initializes.
    bootWeatherMapPage();
}

// Generate heatmap data based on current location
function generateHeatmapData() {
    const points = [];
    const centerLat = currentLocation.lat;
    const centerLng = currentLocation.lng;
    
    // Generate weighted points around the location based on temperature
    for (let i = 0; i < 100; i++) {
        const lat = centerLat + (Math.random() - 0.5) * 0.5;
        const lng = centerLng + (Math.random() - 0.5) * 0.5;
        // Weight represents intensity (0-1 scale)
        const weight = Math.random() * currentIntensity;
        
        points.push({
            lat: lat,
            lng: lng,
            weight: weight
        });
    }
    
    return points;
}

// Update heatmap visualization on the map
function updateHeatmapLayer() {
    if (!map) return;
    
    try {
        // Remove existing heatmap circles
        heatLayers.forEach(layer => map.removeLayer(layer));
        heatLayers = [];
        
        // Generate new heatmap data
        heatmapData = generateHeatmapData();
        
        // Create colored circles for each heatmap point
        heatmapData.forEach(point => {
            // Color gradient from blue (cold) to red (hot)
            let color = '#3388ff'; // blue
            if (point.weight > 0.3) color = '#00ff00'; // green
            if (point.weight > 0.5) color = '#ffff00'; // yellow
            if (point.weight > 0.7) color = '#ff9900'; // orange
            if (point.weight > 0.85) color = '#ff0000'; // red
            
            const circle = L.circleMarker([point.lat, point.lng], {
                radius: 5,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: currentIntensity,
                fillOpacity: currentIntensity * 0.7
            }).addTo(map);
            
            heatLayers.push(circle);
        });
    } catch (error) {
        console.error('Error updating heatmap:', error);
    }
}

// Search location using OpenStreetMap Nominatim API
function searchLocation() {
    const locationInput = document.getElementById('locationInput').value.trim();
    if (!locationInput) {
        alert('Please enter a location');
        return;
    }

    const nominatimUrl = `nominatim-proxy.php?type=search&q=${encodeURIComponent(locationInput)}`;
    
    fetch(nominatimUrl)
        .then(response => response.json())
        .then(results => {
            if (results && results.length > 0) {
                const location = results[0];
                const lat = parseFloat(location.lat);
                const lng = parseFloat(location.lon);
                currentLocation.lat = lat;
                currentLocation.lng = lng;
                applyLocationToMap(lat, lng, location.display_name);
            } else {
                alert('Location not found. Please try another search.');
            }
        })
        .catch(error => {
            alert('Error searching location');
            console.error('Geocoding error:', error);
        });
}

// Setup event listeners
function setupEventListeners() {
    const locationInput = document.getElementById('locationInput');
    if (locationInput) {
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
    }
}

// Get current location using geolocation
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentLocation.lat = lat;
            currentLocation.lng = lng;

            // Reverse geocode then apply to map
            fetch(`nominatim-proxy.php?type=reverse&lat=${lat}&lon=${lng}`)
                .then(r => r.json())
                .then(result => {
                    const name = result && result.display_name ? result.display_name : 'Current Location';
                    applyLocationToMap(lat, lng, name);
                })
                .catch(() => applyLocationToMap(lat, lng, 'Current Location'));
        }, function() {
            alert('Unable to get your location. Please enable location services.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Update location information display
function updateLocationInfo(locationName, lat, lng) {
    document.getElementById('locationName').textContent = locationName;
    document.getElementById('coordinates').textContent = `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`;
    
    // Update weather information
    updateWeatherInfo(lat, lng);
}

// Update weather information from Open-Meteo API
function updateWeatherInfo(lat, lng) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const current = data.current;
            document.getElementById('tempInfo').innerHTML = `<span id="tempValue">${Math.round(current.temperature_2m)}</span>°C`;
            document.getElementById('windInfo').textContent = Math.round(current.wind_speed_10m) + ' km/h';
            document.getElementById('humidityInfo').textContent = current.relative_humidity_2m + '%';
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            document.getElementById('tempInfo').innerHTML = `<span id="tempValue">--</span>°C`;
            document.getElementById('windInfo').textContent = '-- km/h';
            document.getElementById('humidityInfo').textContent = '--%';
        });
}

// Set heatmap intensity (opacity)
// Overlay intensity control removed — keep `currentIntensity` default value

// ===== Set Specific Location Modal =====
let pendingSetLocation = null; // { lat, lng, name }

function openSetLocationModal() {
    pendingSetLocation = null;
    document.getElementById('setLocPreview').style.display = 'none';
    document.getElementById('setLocSearchResults').style.display = 'none';
    document.getElementById('setLocSearchResults').innerHTML = '';
    document.getElementById('setLocationSearchInput').value = '';
    document.getElementById('setLocLat').value = '';
    document.getElementById('setLocLng').value = '';
    document.getElementById('setLocCustomName').value = '';
    switchSetLocTab('search');
    document.getElementById('setLocationModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('setLocationSearchInput').focus(), 100);
}

function closeSetLocationModal() {
    document.getElementById('setLocationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    pendingSetLocation = null;
}

function switchSetLocTab(tab) {
    const isSearch = tab === 'search';
    document.getElementById('setLocTabSearch').style.display = isSearch ? '' : 'none';
    document.getElementById('setLocTabCoords').style.display = isSearch ? 'none' : '';
    document.getElementById('tabBtnSearch').classList.toggle('active', isSearch);
    document.getElementById('tabBtnCoords').classList.toggle('active', !isSearch);
    pendingSetLocation = null;
    document.getElementById('setLocPreview').style.display = 'none';
}

async function searchSetLocation() {
    const query = document.getElementById('setLocationSearchInput').value.trim();
    if (!query) { alert('Please enter a location name.'); return; }

    const resultsBox = document.getElementById('setLocSearchResults');
    resultsBox.style.display = '';
    resultsBox.innerHTML = '<div class="set-loc-searching">🔍 Searching...</div>';
    pendingSetLocation = null;
    document.getElementById('setLocPreview').style.display = 'none';

    try {
        const url = `nominatim-proxy.php?type=search&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const results = await res.json();

        if (!results || results.length === 0) {
            resultsBox.innerHTML = '<div class="set-loc-no-results">No results found. Try a different search term.</div>';
            return;
        }

        resultsBox.innerHTML = results.map((r, i) => {
            const parts = r.display_name.split(',');
            const name = parts.slice(0, 2).join(',').trim();
            const detail = parts.slice(2).join(',').trim();
            return `<div class="set-loc-result-item" onclick="selectSetLocResult(${parseFloat(r.lat)}, ${parseFloat(r.lon)}, ${JSON.stringify(r.display_name)}, this)">
                        <span class="set-loc-result-icon">📍</span>
                        <div class="set-loc-result-text">
                            <div class="result-name">${name}</div>
                            <div class="result-detail">${detail}</div>
                        </div>
                    </div>`;
        }).join('');
    } catch (e) {
        resultsBox.innerHTML = '<div class="set-loc-no-results">Search failed. Check your connection.</div>';
        console.error('Set location search error:', e);
    }
}

function selectSetLocResult(lat, lng, displayName, el) {
    // Highlight selected
    document.querySelectorAll('.set-loc-result-item').forEach(i => i.classList.remove('selected'));
    if (el) el.classList.add('selected');

    pendingSetLocation = { lat, lng, name: displayName };
    showSetLocPreview(displayName, lat, lng);
}

function showSetLocPreview(name, lat, lng) {
    const preview = document.getElementById('setLocPreview');
    preview.style.display = '';
    preview.innerHTML = `<strong>Selected:</strong> ${name}<br><small style="color:#555;">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</small>`;
}

function confirmSetLocation() {
    let lat, lng, name;

    const activeCoords = document.getElementById('setLocTabCoords').style.display !== 'none';

    if (activeCoords) {
        lat = parseFloat(document.getElementById('setLocLat').value);
        lng = parseFloat(document.getElementById('setLocLng').value);
        name = document.getElementById('setLocCustomName').value.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid latitude and longitude values.');
            return;
        }
        if (lat < -90 || lat > 90) { alert('Latitude must be between -90 and 90.'); return; }
        if (lng < -180 || lng > 180) { alert('Longitude must be between -180 and 180.'); return; }
    } else {
        if (!pendingSetLocation) {
            alert('Please search and select a location from the results.');
            return;
        }
        lat = pendingSetLocation.lat;
        lng = pendingSetLocation.lng;
        name = pendingSetLocation.name;
    }

    // Apply to map
    applyLocationToMap(lat, lng, name);
    closeSetLocationModal();
}

function applyLocationToMap(lat, lng, locationName) {
    if (!map) return;

    currentLocation.lat = lat;
    currentLocation.lng = lng;

    // Move map view
    map.setView([lat, lng], 13);

    // Remove existing main city marker
    if (mainCityMarker) {
        try { map.removeLayer(mainCityMarker); } catch (e) {}
        mainCityMarker = null;
    }

    // Add new main city marker
    mainCityMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="10" fill="%23667eea"/><text x="12" y="15" text-anchor="middle" font-size="12" fill="white" font-weight="bold">📍</text></svg>',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })
    }).addTo(map).bindPopup(`<b>${locationName.split(',')[0]}</b><br><small>Loading weather...</small>`).openPopup();

    // Remove old hazard markers (they were for previous location)
    hazardMarkers.forEach(m => { try { map.removeLayer(m); } catch (e) {} });
    hazardMarkers = [];

    // Update heatmap
    updateHeatmapLayer();

    // Restart weather polling for new location
    stopWeatherPolling();
    startWeatherPollingAtLocation({ lat, lng }, locationName);

    // Update location info panel
    updateLocationInfo(locationName, lat, lng);
}

function startWeatherPollingAtLocation(location, locationName) {
    fetchCurrentWeather(location.lat, location.lng).then(w => {
        if (w && mainCityMarker) {
            const temp = w.temperature !== undefined ? `${w.temperature}°C` : 'N/A';
            const cond = w.weathercode !== undefined ? getWeatherDescription(w.weathercode) : 'Unknown';
            mainCityMarker.setPopupContent(
                `<b>${locationName.split(',')[0]}</b><br>🌦️ ${temp}<br>${cond}<br><small>Updated: ${new Date().toLocaleTimeString()}</small>`
            );
        }
    });
    weatherPollInterval = setInterval(() => {
        fetchCurrentWeather(location.lat, location.lng).then(w => {
            if (w && mainCityMarker) {
                const temp = w.temperature !== undefined ? `${w.temperature}°C` : 'N/A';
                const cond = w.weathercode !== undefined ? getWeatherDescription(w.weathercode) : 'Unknown';
                mainCityMarker.setPopupContent(
                    `<b>${locationName.split(',')[0]}</b><br>🌦️ ${temp}<br>${cond}<br><small>Updated: ${new Date().toLocaleTimeString()}</small>`
                );
            }
        });
    }, 60000);
}

// Close Set Location modal when clicking outside
window.addEventListener('click', function (event) {
    const setLocModal = document.getElementById('setLocationModal');
    if (setLocModal && event.target === setLocModal) {
        closeSetLocationModal();
    }
});

// Load initial weather data for current/default location
function loadWeatherData() {
    renderWeatherMap();
}

// Modal open/close helpers are provided by script.js — no duplicate definitions here.
