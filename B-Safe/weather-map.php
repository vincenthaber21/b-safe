<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$logged_in = !empty($_SESSION['logged_in']);
$active_page = 'weather';
$assets_v = [
    'style_css'       => @filemtime(__DIR__ . '/css/style.css') ?: time(),
    'weather_map_css' => @filemtime(__DIR__ . '/css/weather-map.css') ?: time(),
    'script_js'       => @filemtime(__DIR__ . '/js/script.js') ?: time(),
    'weather_map_js'  => @filemtime(__DIR__ . '/js/weather-map.js') ?: time(),
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Map - B-Safe</title>
    <link rel="stylesheet" href="css/style.css?v=<?= $assets_v['style_css'] ?>">
    <link rel="stylesheet" href="css/weather-map.css?v=<?= $assets_v['weather_map_css'] ?>">
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
    <style>
        #weather-map {
            width: 100%;
            height: 500px;
            border-radius: 4px;
            z-index: 1;
        }
    </style>
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <!-- Weather Map Section -->
    <main class="main-content">
        <section id="page-weather" class="page">
            <div class="page-header">
                <h2>Weather Map</h2>
                <div>
                    <button id="btn-refresh-weather" class="btn" onclick="loadWeatherData()">Refresh</button>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <!-- Weather Controls -->
                    <div class="weather-controls">
                        <input type="text" id="locationInput" placeholder="Enter location or address..." class="location-input">
                        <button class="btn btn-secondary" onclick="searchLocation()">Search Location</button>
                        <button class="btn btn-secondary" onclick="getCurrentLocation()">📍 Current Location</button>
                        <button class="btn btn-primary" onclick="openSetLocationModal()">🗺️ Set Specific Location</button>
                    </div>

                    <!-- Weather Map Container -->
                    <div id="weather-map" style="width:100%;height:500px;border:1px solid #ddd;border-radius:4px;background:#f5f5f5;margin-bottom:20px;"></div>

                    <!-- Location Info Card -->
                    <div class="location-info-card">
                        <div class="info-section">
                            <h3>📍 Current Location</h3>
                            <p id="locationName">Searching location...</p>
                            <p id="coordinates" class="coordinates">Latitude: --, Longitude: --</p>
                        </div>
                        <div class="info-section">
                            <h3>🌡️ Temperature</h3>
                            <p id="tempInfo"><span id="tempValue">--</span>°C</p>
                        </div>
                        <div class="info-section">
                            <h3>💨 Wind</h3>
                            <p id="windInfo">-- km/h</p>
                        </div>
                        <div class="info-section">
                            <h3>💧 Humidity</h3>
                            <p id="humidityInfo">--%</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <?php if (!$logged_in): ?>
    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeLoginModal()">&times;</span>
            <h2>Login to B-Safe</h2>
            <div id="loginError" class="form-alert form-alert-error" style="display:none;"></div>
            <form class="auth-form" id="loginForm">
                <input type="email" id="loginEmail" name="email" placeholder="Email Address" required>
                <input type="password" id="loginPassword" name="password" placeholder="Password" required>
                <div class="remember-me">
                    <input type="checkbox" id="rememberMe">
                    <label for="rememberMe">Remember me</label>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
                <p class="form-link">Don't have an account? <a href="#" onclick="switchToSignup()">Sign Up</a></p>
            </form>
        </div>
    </div>
    <!-- Signup Modal -->
    <div id="signupModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeSignupModal()">&times;</span>
            <h2>Create B-Safe Account</h2>
            <div id="signupError" class="form-alert form-alert-error" style="display:none;"></div>
            <form class="auth-form" id="signupForm">
                <input type="text" id="signupFullName" name="full_name" placeholder="Full Name" required>
                <input type="email" id="signupEmail" name="email" placeholder="Email Address" required>
                <input type="password" id="signupPassword" name="password" placeholder="Password (min. 8 chars)" required>
                <input type="password" id="signupConfirmPassword" name="confirm_password" placeholder="Confirm Password" required>
                <div class="agree-terms">
                    <input type="checkbox" id="agreeTerms" required>
                    <label for="agreeTerms">I agree to the Terms and Conditions</label>
                </div>
                <button type="submit" class="btn btn-primary" id="signupSubmitBtn">
                    <span id="signupBtnText">Create Account</span>
                    <span id="signupBtnSpinner" class="btn-spinner" style="display:none;"></span>
                </button>
                <p class="form-link">Already have an account? <a href="#" onclick="switchToLogin()">Login</a></p>
            </form>
        </div>
    </div>
    <?php endif; ?>

    <!-- Set Specific Location Modal -->
    <div id="setLocationModal" class="modal">
        <div class="modal-content set-location-modal-content">
            <span class="close" onclick="closeSetLocationModal()">&times;</span>
            <h2>🗺️ Set Specific Location</h2>
            <p class="set-location-subtitle">Choose a location to view its weather on the map.</p>

            <!-- Tabs -->
            <div class="set-loc-tabs">
                <button class="set-loc-tab-btn active" id="tabBtnSearch" onclick="switchSetLocTab('search')">🔍 Search by Name</button>
                <button class="set-loc-tab-btn" id="tabBtnCoords" onclick="switchSetLocTab('coords')">📐 Enter Coordinates</button>
            </div>

            <!-- Search Tab -->
            <div id="setLocTabSearch" class="set-loc-tab-panel">
                <div class="set-loc-form-group">
                    <label for="setLocationSearchInput">Location Name</label>
                    <div class="set-loc-search-row">
                        <input type="text" id="setLocationSearchInput" placeholder="e.g. City of Candon, Ilocos Sur" class="location-input" onkeydown="if(event.key==='Enter') searchSetLocation()">
                        <button class="btn btn-secondary" onclick="searchSetLocation()">Search</button>
                    </div>
                </div>
                <div id="setLocSearchResults" class="set-loc-results" style="display:none;"></div>
            </div>

            <!-- Coordinates Tab -->
            <div id="setLocTabCoords" class="set-loc-tab-panel" style="display:none;">
                <div class="set-loc-coords-grid">
                    <div class="set-loc-form-group">
                        <label for="setLocLat">Latitude</label>
                        <input type="number" id="setLocLat" placeholder="e.g. 17.0076" step="0.0001" min="-90" max="90">
                    </div>
                    <div class="set-loc-form-group">
                        <label for="setLocLng">Longitude</label>
                        <input type="number" id="setLocLng" placeholder="e.g. 120.7872" step="0.0001" min="-180" max="180">
                    </div>
                </div>
                <div class="set-loc-form-group">
                    <label for="setLocCustomName">Location Label <span style="color:#999;font-weight:normal;">(optional)</span></label>
                    <input type="text" id="setLocCustomName" placeholder="e.g. My Custom Location">
                </div>
            </div>

            <!-- Preview -->
            <div id="setLocPreview" class="set-loc-preview" style="display:none;"></div>

            <!-- Actions -->
            <div class="set-loc-actions">
                <button class="btn btn-primary" onclick="confirmSetLocation()">✅ Apply Location</button>
                <button class="btn btn-secondary" onclick="closeSetLocationModal()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 B-Safe. All rights reserved. | Weather data powered by Open-Meteo</p>
        </div>
    </footer>

    <!-- Leaflet JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
    <script src="js/script.js?v=<?= $assets_v['script_js'] ?>"></script>
    <script src="js/weather-map.js?v=<?= $assets_v['weather_map_js'] ?>"></script>
</body>
</html>
