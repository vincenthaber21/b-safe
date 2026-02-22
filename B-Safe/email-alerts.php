<?php $active_page = 'alerts'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Mail Alerts - B-Safe</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/email-alerts.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <!-- E-Mail Alerts Section -->
    <section class="alerts-section">
        <div class="container">
            <div class="section-header">
                <h1>E-Mail Alerts</h1>
                <p>Send important messages and alerts to residents</p>
            </div>

            <!-- Tabs Navigation -->
            <div class="alerts-tabs">
                <button class="tab-btn active" onclick="switchTab('compose')">📝 Compose Alert</button>
                <button class="tab-btn" onclick="switchTab('templates')">📋 Alert Templates</button>
                <button class="tab-btn" onclick="switchTab('history')">📊 Alert History</button>
                <button class="tab-btn" onclick="switchTab('recipients')">👥 Recipients</button>
                <button class="tab-btn" onclick="switchTab('thresholds')">🌡️ Set Threshold</button>
            </div>

            <!-- Compose Alert Tab -->
            <div id="composeTab" class="tab-content active">
                <div class="compose-container">
                    <h2>Compose New Alert</h2>
                    <form id="alertForm" class="alert-form">
                        <div class="form-group">
                            <label for="alertType">Alert Type <span class="required">*</span></label>
                            <select id="alertType" class="form-control" onchange="updateAlertIcon()" required>
                                <option value="">-- Select Alert Type --</option>
                                <option value="emergency">🚨 Emergency</option>
                                <option value="warning">⚠️ Warning</option>
                                <option value="info">ℹ️ Information</option>
                                <option value="maintenance">🔧 Maintenance</option>
                                <option value="weather">🌦️ Weather Alert</option>
                                <option value="security">🔐 Security Alert</option>
                                <option value="announcement">📢 Announcement</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="priority">Priority Level <span class="required">*</span></label>
                            <select id="priority" class="form-control" required>
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="subject">Subject <span class="required">*</span></label>
                            <input type="text" id="subject" class="form-control" placeholder="Enter alert subject" maxlength="100" required>
                            <small class="char-count"><span id="subjectCount">0</span>/100</small>
                        </div>
                        <div class="form-group">
                            <label for="message">Message <span class="required">*</span></label>
                            <textarea id="message" class="form-control" placeholder="Enter your alert message..." rows="6" maxlength="1000" required></textarea>
                            <small class="char-count"><span id="messageCount">0</span>/1000</small>
                        </div>
                        <div class="form-group">
                            <label>Recipients <span class="required">*</span></label>
                            <div class="recipients-options">
                                <label class="checkbox-label">
                                    <input type="radio" name="recipientType" value="all" checked onchange="updateRecipientList()">
                                    <span>All Residents</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="radio" name="recipientType" value="household" onchange="updateRecipientList()">
                                    <span>Specific Household</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="radio" name="recipientType" value="custom" onchange="updateRecipientList()">
                                    <span>Custom Recipients</span>
                                </label>
                            </div>
                            <div id="householdSelect" class="recipient-selector" style="display:none;margin-top:1rem;">
                                <select id="selectedHousehold" class="form-control" onchange="loadHouseholdResidents()">
                                    <option value="">-- Select Household --</option>
                                </select>
                            </div>
                            <div id="customRecipients" class="recipient-selector" style="display:none;margin-top:1rem;">
                                <input type="text" id="customRecipientEmail" class="form-control" placeholder="Enter email address" style="margin-bottom:0.5rem;">
                                <button type="button" class="btn btn-secondary" onclick="addRecipient()">+ Add Recipient</button>
                                <div id="recipientList" class="recipient-list" style="margin-top:1rem;"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="scheduleCheckbox" onchange="toggleScheduleOptions()">
                                <span>Schedule Send</span>
                            </label>
                            <div id="scheduleOptions" style="display:none;margin-top:1rem;">
                                <label for="sendDate">Send Date &amp; Time</label>
                                <input type="datetime-local" id="sendDate" class="form-control">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="attachmentCheckbox" onchange="toggleAttachmentOptions()">
                                <span>Add Attachment</span>
                            </label>
                            <div id="attachmentOptions" style="display:none;margin-top:1rem;">
                                <input type="file" id="attachment" class="form-control">
                                <small>Max file size: 5MB</small>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="saveDraft()">💾 Save as Draft</button>
                            <button type="button" class="btn btn-secondary" onclick="previewAlert()">👁️ Preview</button>
                            <button type="submit" class="btn btn-primary">✉️ Send Alert</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Templates Tab -->
            <div id="templatesTab" class="tab-content">
                <div class="templates-container">
                    <div class="templates-header">
                        <h2>Alert Templates</h2>
                        <button class="btn btn-primary" onclick="createNewTemplate()">+ Create Template</button>
                    </div>
                    <div class="templates-grid" id="templatesGrid"></div>
                    <div id="templateModal" class="modal" style="display:none;">
                        <div class="modal-content">
                            <span class="close" onclick="closeTemplateModal()">&times;</span>
                            <h2>Create Alert Template</h2>
                            <form id="templateForm">
                                <div class="form-group">
                                    <label for="templateName">Template Name</label>
                                    <input type="text" id="templateName" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="templateType">Template Type</label>
                                    <select id="templateType" class="form-control" required>
                                        <option value="">-- Select Type --</option>
                                        <option value="emergency">🚨 Emergency</option>
                                        <option value="warning">⚠️ Warning</option>
                                        <option value="maintenance">🔧 Maintenance</option>
                                        <option value="weather">🌦️ Weather Alert</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="templateSubject">Subject</label>
                                    <input type="text" id="templateSubject" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="templateMessage">Message</label>
                                    <textarea id="templateMessage" class="form-control" rows="5" required></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" onclick="closeTemplateModal()">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Template</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alert History Tab -->
            <div id="historyTab" class="tab-content">
                <div class="history-container">
                    <div class="history-header">
                        <h2>Alert History</h2>
                        <div class="history-filters">
                            <select id="historyFilter" class="filter-select" onchange="filterAlertHistory()">
                                <option value="">All Statuses</option>
                                <option value="sent">Sent</option>
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="failed">Failed</option>
                            </select>
                            <input type="text" id="historySearch" class="search-box" placeholder="Search alerts..." onkeyup="filterAlertHistory()">
                        </div>
                    </div>
                    <div class="history-table-wrapper">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Type</th><th>Subject</th><th>Recipients</th>
                                    <th>Status</th><th>Date</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="historyTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Thresholds Tab -->
            <div id="thresholdsTab" class="tab-content">
                <div class="thresholds-container">
                    <div class="thresholds-header">
                        <h2>⚙️ Auto-Alert Thresholds</h2>
                        <p>Configure weather thresholds that automatically send email alerts to residents when conditions are met.</p>
                    </div>

                    <!-- Monitoring Status Card -->
                    <div class="monitoring-status-card">
                        <div class="monitoring-info">
                            <span class="monitoring-badge off" id="monitoringBadge">● Monitoring OFF</span>
                            <span class="last-check-text" id="lastCheckTime">Last check: Never</span>
                        </div>
                        <button class="btn btn-primary" id="toggleMonitorBtn" onclick="toggleMonitoring()">▶ Start Monitoring</button>
                    </div>

                    <!-- Current Weather Panel -->
                    <div class="current-weather-panel">
                        <h3>📡 Current Weather — City of Candon</h3>
                        <div class="weather-readings">
                            <div class="reading-card" id="tw-temp-card">
                                <div class="reading-icon">🌡️</div>
                                <div class="reading-label">Temperature</div>
                                <div class="reading-value" id="tw-temp">--°C</div>
                            </div>
                            <div class="reading-card" id="tw-wind-card">
                                <div class="reading-icon">💨</div>
                                <div class="reading-label">Wind Speed</div>
                                <div class="reading-value" id="tw-wind">-- km/h</div>
                            </div>
                            <div class="reading-card" id="tw-humid-card">
                                <div class="reading-icon">💧</div>
                                <div class="reading-label">Humidity</div>
                                <div class="reading-value" id="tw-humid">--%</div>
                            </div>
                            <div class="reading-card">
                                <div class="reading-icon">🌤️</div>
                                <div class="reading-label">Condition</div>
                                <div class="reading-value" id="tw-code">--</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary" style="margin-top:0.75rem;" onclick="runThresholdCheck(true)">🔄 Refresh Weather</button>
                    </div>

                    <!-- Threshold Settings Form -->
                    <form id="thresholdForm" onsubmit="saveThresholds(event)">
                        <div class="thresholds-grid">

                            <!-- Temperature Threshold -->
                            <div class="threshold-card" id="threshold-card-temp">
                                <div class="threshold-card-header">
                                    <h3>🌡️ Temperature</h3>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="tempEnabled" onchange="updateThresholdCardState('temp')">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="threshold-fields disabled" id="tempFields">
                                    <div class="form-group">
                                        <label>Send alert when temperature exceeds:</label>
                                        <div class="threshold-input-group">
                                            <input type="number" id="tempMax" class="form-control" value="38" min="0" max="60" step="0.5">
                                            <span class="unit">°C</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Alert Priority:</label>
                                        <select id="tempPriority" class="form-control">
                                            <option value="low">Low</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Wind Speed Threshold -->
                            <div class="threshold-card" id="threshold-card-wind">
                                <div class="threshold-card-header">
                                    <h3>💨 Wind Speed</h3>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="windEnabled" onchange="updateThresholdCardState('wind')">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="threshold-fields disabled" id="windFields">
                                    <div class="form-group">
                                        <label>Send alert when wind speed exceeds:</label>
                                        <div class="threshold-input-group">
                                            <input type="number" id="windMax" class="form-control" value="60" min="0" max="300" step="1">
                                            <span class="unit">km/h</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Alert Priority:</label>
                                        <select id="windPriority" class="form-control">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high" selected>High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Humidity Threshold -->
                            <div class="threshold-card" id="threshold-card-humid">
                                <div class="threshold-card-header">
                                    <h3>💧 Humidity</h3>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="humidEnabled" onchange="updateThresholdCardState('humid')">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="threshold-fields disabled" id="humidFields">
                                    <div class="form-group">
                                        <label>Send alert when humidity exceeds:</label>
                                        <div class="threshold-input-group">
                                            <input type="number" id="humidMax" class="form-control" value="90" min="0" max="100" step="1">
                                            <span class="unit">%</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Alert Priority:</label>
                                        <select id="humidPriority" class="form-control">
                                            <option value="low" selected>Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Alert Delivery Settings -->
                        <div class="threshold-settings-section">
                            <h3>📧 Delivery Settings</h3>
                            <div class="form-group">
                                <label>Check weather every:</label>
                                <select id="checkInterval" class="form-control" style="max-width:250px;">
                                    <option value="1">1 minute</option>
                                    <option value="5" selected>5 minutes</option>
                                    <option value="10">10 minutes</option>
                                    <option value="30">30 minutes</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Cooldown between same-type alerts:</label>
                                <select id="alertCooldown" class="form-control" style="max-width:250px;">
                                    <option value="15">15 minutes</option>
                                    <option value="30" selected>30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Send automatic alerts to:</label>
                                <div class="recipients-options">
                                    <label class="checkbox-label">
                                        <input type="radio" name="thresholdRecipients" value="all" checked onchange="toggleThresholdCustom()">
                                        <span>All Residents</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="radio" name="thresholdRecipients" value="custom" onchange="toggleThresholdCustom()">
                                        <span>Custom Recipients</span>
                                    </label>
                                </div>
                                <div id="thresholdCustomBlock" style="display:none; margin-top:0.75rem;">
                                    <div style="display:flex;gap:0.5rem;align-items:center;">
                                        <input type="text" id="thresholdCustomEmail" class="form-control" placeholder="Enter email address">
                                        <button type="button" class="btn btn-secondary" onclick="addThresholdRecipient()">+ Add</button>
                                    </div>
                                    <div id="thresholdRecipientList" class="recipient-list" style="margin-top:0.5rem;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">💾 Save Thresholds</button>
                            <button type="button" class="btn btn-secondary" onclick="resetThresholds()">↩ Reset to Defaults</button>
                        </div>
                    </form>

                    <!-- Auto-Alert Log -->
                    <div class="threshold-log">
                        <div class="threshold-log-header">
                            <h3>📋 Auto-Alert Log</h3>
                            <button class="btn btn-secondary btn-sm" onclick="clearThresholdLog()">🗑 Clear Log</button>
                        </div>
                        <div id="thresholdLogContainer" class="threshold-log-list">
                            <p class="empty-log">No automatic alerts triggered yet.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recipients Tab -->
            <div id="recipientsTab" class="tab-content">
                <div class="recipients-container">
                    <div class="recipients-header">
                        <h2>Recipients List</h2>
                        <div class="recipients-filters">
                            <input type="text" id="recipientSearch" class="search-box" placeholder="Search recipients..." onkeyup="filterRecipients()">
                            <select id="householdFilter" class="filter-select" onchange="filterRecipients()">
                                <option value="">All Households</option>
                            </select>
                        </div>
                    </div>
                    <div class="recipients-table-wrapper">
                        <table class="recipients-table">
                            <thead>
                                <tr>
                                    <th>Name</th><th>Email</th><th>Household</th>
                                    <th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="recipientsTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Alert Preview Modal -->
    <div id="previewModal" class="modal" style="display:none;">
        <div class="modal-content preview-modal">
            <span class="close" onclick="closePreviewModal()">&times;</span>
            <h2>Alert Preview</h2>
            <div class="alert-preview" id="alertPreview"></div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closePreviewModal()">Close</button>
                <button type="button" class="btn btn-primary" onclick="sendAlertFromPreview()">Send Alert</button>
            </div>
        </div>
    </div>

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

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 B-Safe. All rights reserved.</p>
        </div>
    </footer>

    <script src="js/script.js"></script>
    <script src="js/email-alerts.js"></script>
</body>
</html>
