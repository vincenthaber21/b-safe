// Global Variables
let alerts = [];
let templates = [];
let recipients = [];
let households = [];
let selectedRecipients = [];
let alertDrafts = [];

// Threshold globals
let thresholdMonitorInterval = null;
let thresholdCustomRecipients = [];
let thresholdCooldowns = {}; // { 'temp': timestamp, 'wind': timestamp, 'humid': timestamp }
const THRESHOLD_LOCATION = { lat: 17.0076, lng: 120.7872 }; // City of Candon

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('E-Mail Alerts page loaded');
    loadAlerts();
    loadTemplates();
    loadRecipients();   // async – pre-fetches from DB in background
    loadHouseholds();
    setupCharCounters();
    setupFormValidation();
    loadThresholds();
});

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load data when switching tabs
    if (tabName === 'templates') {
        renderTemplates();
    } else if (tabName === 'history') {
        renderAlertHistory();
    } else if (tabName === 'recipients') {
        renderRecipientsList();
    } else if (tabName === 'thresholds') {
        loadThresholdUI();
        runThresholdCheck(true);
    }
}

// Character Counter for Subject and Message
function setupCharCounters() {
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    if (subjectInput) {
        subjectInput.addEventListener('input', function() {
            document.getElementById('subjectCount').textContent = this.value.length;
        });
    }

    if (messageInput) {
        messageInput.addEventListener('input', function() {
            document.getElementById('messageCount').textContent = this.value.length;
        });
    }
}

// Form Validation
function setupFormValidation() {
    const alertForm = document.getElementById('alertForm');
    if (alertForm) {
        alertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendAlert();
        });
    }

    const templateForm = document.getElementById('templateForm');
    if (templateForm) {
        templateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTemplate();
        });
    }
}

// Update Alert Icon based on type
function updateAlertIcon() {
    const alertType = document.getElementById('alertType').value;
    console.log('Alert type selected:', alertType);
}

// Update Recipient Options
function updateRecipientList() {
    const recipientType = document.querySelector('input[name="recipientType"]:checked').value;
    const householdSelect = document.getElementById('householdSelect');
    const customRecipients = document.getElementById('customRecipients');

    householdSelect.style.display = 'none';
    customRecipients.style.display = 'none';

    if (recipientType === 'household') {
        householdSelect.style.display = 'block';
    } else if (recipientType === 'custom') {
        customRecipients.style.display = 'block';
    }
}

// Load households
function loadHouseholds() {
    households = [
        { id: 1, name: 'Household A', residents: ['resident1@email.com', 'resident2@email.com'] },
        { id: 2, name: 'Household B', residents: ['resident3@email.com', 'resident4@email.com'] },
        { id: 3, name: 'Household C', residents: ['resident5@email.com'] }
    ];

    // Populate household selects
    const householdSelects = document.querySelectorAll('#selectedHousehold, #householdFilter');
    householdSelects.forEach(select => {
        households.forEach(household => {
            const option = document.createElement('option');
            option.value = household.id;
            option.textContent = household.name;
            select.appendChild(option);
        });
    });
}

// Load household residents
function loadHouseholdResidents() {
    const householdId = document.getElementById('selectedHousehold').value;
    const household = households.find(h => h.id === parseInt(householdId));
    
    selectedRecipients = household ? household.residents : [];
    updateRecipientDisplay();
}

// Add custom recipient
function addRecipient() {
    const emailInput = document.getElementById('customRecipientEmail');
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (selectedRecipients.includes(email)) {
        alert('This email is already added');
        return;
    }

    selectedRecipients.push(email);
    emailInput.value = '';
    updateRecipientDisplay();
}

// Update Recipient Display
function updateRecipientDisplay() {
    const recipientList = document.getElementById('recipientList');
    recipientList.innerHTML = '';

    selectedRecipients.forEach(email => {
        const tag = document.createElement('div');
        tag.className = 'recipient-tag';
        tag.innerHTML = `
            ${email}
            <button type="button" onclick="removeRecipient('${email}')">×</button>
        `;
        recipientList.appendChild(tag);
    });
}

// Remove recipient
function removeRecipient(email) {
    selectedRecipients = selectedRecipients.filter(r => r !== email);
    updateRecipientDisplay();
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Toggle Schedule Options
function toggleScheduleOptions() {
    const checkbox = document.getElementById('scheduleCheckbox');
    const scheduleOptions = document.getElementById('scheduleOptions');
    scheduleOptions.style.display = checkbox.checked ? 'block' : 'none';
}

// Toggle Attachment Options
function toggleAttachmentOptions() {
    const checkbox = document.getElementById('attachmentCheckbox');
    const attachmentOptions = document.getElementById('attachmentOptions');
    attachmentOptions.style.display = checkbox.checked ? 'block' : 'none';
}

// Send Alert
async function sendAlert() {
    const alertType = document.getElementById('alertType').value;
    const priority  = document.getElementById('priority').value;
    const subject   = document.getElementById('subject').value;
    const message   = document.getElementById('message').value;
    const recipientType = document.querySelector('input[name="recipientType"]:checked').value;

    if (!alertType || !subject || !message) {
        showToast('Please fill in all required fields.', 'warning');
        return;
    }

    let toList = [];
    if (recipientType === 'all') {
        // Always re-fetch to get the latest list from DB
        const submitBtn = document.querySelector('#alertForm button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Loading recipients...'; }
        await loadRecipients();
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '✉️ Send Alert'; }
        toList = recipients
            .filter(function(r) { return r.status !== 'Inactive'; })
            .map(function(r) { return r.email; })
            .filter(function(e) { return e && isValidEmail(e); });
    } else {
        toList = selectedRecipients.filter(function(e) { return e && isValidEmail(e); });
    }

    if (toList.length === 0) {
        showToast('No valid recipients found. Make sure residents are registered in the system.', 'warning');
        return;
    }

    const alertEntry = {
        id: Date.now(),
        type: alertType,
        priority: priority,
        subject: subject,
        message: message,
        recipients: toList,
        status: 'sending',
        date: new Date().toLocaleString(),
        scheduled: document.getElementById('scheduleCheckbox').checked,
        scheduledDate: document.getElementById('sendDate').value
    };

    // Try to send via server SMTP endpoint
    try {
        const resp   = await fetch('send-email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: subject, message: message, recipients: toList })
        });
        const result = await resp.json();
        if (resp.ok && result.ok) {
            alertEntry.status = 'sent';
            alerts.push(alertEntry);
            localStorage.setItem('alerts', JSON.stringify(alerts));
            showToast('Alert sent successfully to ' + toList.length + ' resident(s)!', 'success');
        } else {
            alertEntry.status = 'failed';
            alerts.push(alertEntry);
            localStorage.setItem('alerts', JSON.stringify(alerts));
            const msg = (result && result.error) ? result.error : 'Send failed';
            showToast('Error sending alert: ' + msg, 'error');
        }
    } catch (err) {
        alertEntry.status = 'failed';
        alerts.push(alertEntry);
        localStorage.setItem('alerts', JSON.stringify(alerts));
        showToast('Network error sending alert. Check server connection.', 'error');
        console.error('Send error', err);
    }

    // Reset form
    document.getElementById('alertForm').reset();
    selectedRecipients = [];
    updateRecipientDisplay();
    document.getElementById('subjectCount').textContent = '0';
    document.getElementById('messageCount').textContent = '0';
}

// Save Draft
function saveDraft() {
    const alertType = document.getElementById('alertType').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    if (!subject || !message) {
        alert('Please fill in subject and message');
        return;
    }

    const draft = {
        id: Date.now(),
        type: alertType,
        subject: subject,
        message: message,
        date: new Date().toLocaleString()
    };

    alertDrafts.push(draft);
    localStorage.setItem('alertDrafts', JSON.stringify(alertDrafts));
    
    alert('Alert saved as draft!');
}

// Preview Alert
function previewAlert() {
    const alertType = document.getElementById('alertType').value;
    const priority = document.getElementById('priority').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const recipientType = document.querySelector('input[name="recipientType"]:checked').value;

    if (!alertType || !subject || !message) {
        alert('Please fill in all required fields');
        return;
    }

    let recipientInfo = '';
    let recipientCount = 0;

    if (recipientType === 'all') {
        recipientCount = recipients.length;
        recipientInfo = `All ${recipientCount} residents`;
    } else if (recipientType === 'household') {
        recipientCount = selectedRecipients.length;
        recipientInfo = `${recipientCount} resident(s) in the household`;
    } else {
        recipientCount = selectedRecipients.length;
        recipientInfo = selectedRecipients.join(', ');
    }

    const typeIcons = {
        emergency: '🚨',
        warning: '⚠️',
        info: 'ℹ️',
        maintenance: '🔧',
        weather: '🌦️',
        security: '🔐',
        announcement: '📢'
    };

    const priorityColors = {
        low: '#4ecdc4',
        medium: '#ff9800',
        high: '#ff6b6b',
        critical: '#d32f2f'
    };

    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('alertPreview');

    previewContent.innerHTML = `
        <div class="alert-preview-header">
            <div class="alert-preview-type">
                ${typeIcons[alertType]} ${alertType.toUpperCase()}
            </div>
            <div class="alert-preview-priority" style="border-color: ${priorityColors[priority]}; color: ${priorityColors[priority]}">
                ${priority.toUpperCase()} PRIORITY
            </div>
        </div>
        <div class="alert-preview-subject">${subject}</div>
        <div class="alert-preview-message">${message.replace(/\n/g, '<br>')}</div>
        <div class="alert-preview-recipients">
            <strong>Recipients:</strong>
            <p>${recipientInfo}</p>
            <strong>Total Recipients:</strong>
            <p>${recipientCount}</p>
        </div>
    `;

    previewModal.style.display = 'block';
}

// Close Preview Modal
function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// Send Alert from Preview
function sendAlertFromPreview() {
    closePreviewModal();
    sendAlert();
}

// Load Alerts from localStorage
function loadAlerts() {
    const stored = localStorage.getItem('alerts');
    if (stored) {
        alerts = JSON.parse(stored);
    }
}

// Load Recipients from the database (get-residents.php)
async function loadRecipients() {
    try {
        const res  = await fetch('get-residents.php');
        const data = await res.json();
        if (data.ok && Array.isArray(data.residents)) {
            recipients = data.residents;
            console.log('Recipients loaded from DB:', recipients.length);
        } else {
            console.warn('get-residents.php error:', data.error || 'unknown');
        }
    } catch (e) {
        console.warn('Could not fetch residents from DB:', e);
    }
    return recipients.map(function(r) { return r.email; });
}

// Render Recipients List
async function renderRecipientsList() {
    const tbody = document.getElementById('recipientsTableBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1rem;">Loading residents...</td></tr>';
    await loadRecipients();
    tbody.innerHTML = '';

    recipients.forEach(recipient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${recipient.name}</td>
            <td>${recipient.email}</td>
            <td>${recipient.household}</td>
            <td><span class="recipient-status">${recipient.status}</span></td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="editRecipient(${recipient.id})">Edit</button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteRecipient(${recipient.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter Recipients
function filterRecipients() {
    const searchTerm = document.getElementById('recipientSearch').value.toLowerCase();
    const householdFilter = document.getElementById('householdFilter').value;
    const tbody = document.getElementById('recipientsTableBody');
    
    tbody.innerHTML = '';

    recipients.filter(recipient => {
        const matchesSearch = recipient.name.toLowerCase().includes(searchTerm) || recipient.email.toLowerCase().includes(searchTerm);
        const matchesHousehold = !householdFilter || recipient.household === householdFilter;
        return matchesSearch && matchesHousehold;
    }).forEach(recipient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${recipient.name}</td>
            <td>${recipient.email}</td>
            <td>${recipient.household}</td>
            <td><span class="recipient-status">${recipient.status}</span></td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="editRecipient(${recipient.id})">Edit</button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteRecipient(${recipient.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Templates
function loadTemplates() {
    const stored = localStorage.getItem('templates');
    if (stored) {
        templates = JSON.parse(stored);
    } else {
        templates = [
            { id: 1, name: 'Emergency Alert', type: 'emergency', subject: 'EMERGENCY: Immediate Action Required', message: 'Please take immediate action. Your safety is our priority.' },
            { id: 2, name: 'Maintenance Notice', type: 'maintenance', subject: 'Scheduled Maintenance', message: 'Scheduled maintenance will be performed. Please plan accordingly.' },
            { id: 3, name: 'Weather Warning', type: 'weather', subject: 'Severe Weather Alert', message: 'Severe weather expected. Please stay indoors and avoid travel.' }
        ];
    }
}

// Render Templates
function renderTemplates() {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';

    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        
        const typeIcons = {
            emergency: '🚨',
            warning: '⚠️',
            maintenance: '🔧',
            weather: '🌦️'
        };

        card.innerHTML = `
            <h3>${typeIcons[template.type]} ${template.name}</h3>
            <div class="template-type">${template.type}</div>
            <p><strong>Subject:</strong> ${template.subject}</p>
            <p><strong>Message:</strong> ${template.message}</p>
            <div class="template-actions">
                <button class="btn btn-secondary" onclick="useTemplate(${template.id})">Use</button>
                <button class="btn btn-secondary" onclick="editTemplate(${template.id})">Edit</button>
                <button class="btn btn-secondary" onclick="deleteTemplate(${template.id})">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Use Template
function useTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
        document.getElementById('alertType').value = template.type;
        document.getElementById('subject').value = template.subject;
        document.getElementById('message').value = template.message;
        document.getElementById('subjectCount').textContent = template.subject.length;
        document.getElementById('messageCount').textContent = template.message.length;
        switchTab('compose');
    }
}

// Create New Template Modal
function createNewTemplate() {
    document.getElementById('templateModal').style.display = 'block';
}

// Close Template Modal
function closeTemplateModal() {
    document.getElementById('templateModal').style.display = 'none';
    document.getElementById('templateForm').reset();
}

// Save Template
function saveTemplate() {
    const name = document.getElementById('templateName').value;
    const type = document.getElementById('templateType').value;
    const subject = document.getElementById('templateSubject').value;
    const message = document.getElementById('templateMessage').value;

    if (!name || !type || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }

    const template = {
        id: Date.now(),
        name: name,
        type: type,
        subject: subject,
        message: message
    };

    templates.push(template);
    localStorage.setItem('templates', JSON.stringify(templates));
    
    alert('Template saved successfully!');
    closeTemplateModal();
    renderTemplates();
}

// Edit Template
function editTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
        document.getElementById('templateName').value = template.name;
        document.getElementById('templateType').value = template.type;
        document.getElementById('templateSubject').value = template.subject;
        document.getElementById('templateMessage').value = template.message;
        deleteTemplate(templateId);
        createNewTemplate();
    }
}

// Delete Template
function deleteTemplate(templateId) {
    if (confirm('Are you sure you want to delete this template?')) {
        templates = templates.filter(t => t.id !== templateId);
        localStorage.setItem('templates', JSON.stringify(templates));
        renderTemplates();
    }
}

// Render Alert History
function renderAlertHistory() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (alerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No alerts sent yet</td></tr>';
        return;
    }

    alerts.forEach(alert => {
        const row = document.createElement('tr');
        const typeIcons = {
            emergency: '🚨',
            warning: '⚠️',
            info: 'ℹ️',
            maintenance: '🔧',
            weather: '🌦️',
            security: '🔐',
            announcement: '📢'
        };

        row.innerHTML = `
            <td>${typeIcons[alert.type]} ${alert.type}</td>
            <td>${alert.subject}</td>
            <td>${alert.recipients.length} recipient(s)</td>
            <td><span class="alert-status ${alert.status}">${alert.status.toUpperCase()}</span></td>
            <td>${alert.date}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="viewAlert(${alert.id})">View</button>
                    <button class="btn btn-secondary btn-sm" onclick="resendAlert(${alert.id})">Resend</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter Alert History
function filterAlertHistory() {
    const status = document.getElementById('historyFilter').value;
    const search = document.getElementById('historySearch').value.toLowerCase();
    const tbody = document.getElementById('historyTableBody');
    
    tbody.innerHTML = '';

    let filtered = alerts;

    if (status) {
        filtered = filtered.filter(a => a.status === status);
    }

    if (search) {
        filtered = filtered.filter(a => 
            a.subject.toLowerCase().includes(search) ||
            a.type.toLowerCase().includes(search)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No alerts found</td></tr>';
        return;
    }

    filtered.forEach(alert => {
        const row = document.createElement('tr');
        const typeIcons = {
            emergency: '🚨',
            warning: '⚠️',
            info: 'ℹ️',
            maintenance: '🔧',
            weather: '🌦️',
            security: '🔐',
            announcement: '📢'
        };

        row.innerHTML = `
            <td>${typeIcons[alert.type]} ${alert.type}</td>
            <td>${alert.subject}</td>
            <td>${alert.recipients.length} recipient(s)</td>
            <td><span class="alert-status ${alert.status}">${alert.status.toUpperCase()}</span></td>
            <td>${alert.date}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="viewAlert(${alert.id})">View</button>
                    <button class="btn btn-secondary btn-sm" onclick="resendAlert(${alert.id})">Resend</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// View Alert Details
function viewAlert(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert('Alert Details:\n\nSubject: ' + alert.subject + '\nType: ' + alert.type + '\nPriority: ' + alert.priority + '\nRecipients: ' + alert.recipients.length + '\nDate: ' + alert.date);
    }
}

// Resend Alert
function resendAlert(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (alert && confirm('Are you sure you want to resend this alert?')) {
        alert('Alert resent to ' + alert.recipients.length + ' recipient(s)!');
    }
}

// Edit Recipient
function editRecipient(recipientId) {
    alert('Edit recipient ' + recipientId);
}

// Delete Recipient
function deleteRecipient(recipientId) {
    if (confirm('Are you sure you want to delete this recipient?')) {
        recipients = recipients.filter(r => r.id !== recipientId);
        renderRecipientsList();
        alert('Recipient deleted successfully!');
    }
}

// Modal Functions (imported from main script)
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const previewModal = document.getElementById('previewModal');
    const templateModal = document.getElementById('templateModal');
    
    if (event.target === loginModal) closeLoginModal();
    if (event.target === signupModal) closeSignupModal();
    if (event.target === previewModal) closePreviewModal();
    if (event.target === templateModal) closeTemplateModal();
});

// ═══════════════════════════════════════════════════════════════
//  THRESHOLD / AUTO-ALERT SYSTEM
// ═══════════════════════════════════════════════════════════════

const DEFAULT_THRESHOLDS = {
    tempEnabled: false,  tempMax: 38,  tempPriority: 'medium',
    windEnabled: false,  windMax: 60,  windPriority: 'high',
    humidEnabled: false, humidMax: 90, humidPriority: 'low',
    checkInterval: 5,
    alertCooldown: 30,
    recipientType: 'all',
    customRecipients: []
};

// Load saved thresholds from localStorage and populate form
function loadThresholds() {
    const stored = localStorage.getItem('thresholds');
    if (stored) {
        try {
            const t = JSON.parse(stored);
            Object.assign(DEFAULT_THRESHOLDS, t);
        } catch(e) {}
    }
    // Load cooldown timestamps
    const cd = localStorage.getItem('thresholdCooldowns');
    if (cd) {
        try { thresholdCooldowns = JSON.parse(cd); } catch(e) {}
    }
    // Load threshold custom recipients
    thresholdCustomRecipients = DEFAULT_THRESHOLDS.customRecipients || [];
    // Load log
    renderThresholdLog();
}

// Populate the threshold UI form controls from current settings
function loadThresholdUI() {
    const t = getThresholdSettings();

    setEl('tempEnabled', t.tempEnabled, 'checked');
    setEl('tempMax', t.tempMax);
    setEl('tempPriority', t.tempPriority);
    setEl('windEnabled', t.windEnabled, 'checked');
    setEl('windMax', t.windMax);
    setEl('windPriority', t.windPriority);
    setEl('humidEnabled', t.humidEnabled, 'checked');
    setEl('humidMax', t.humidMax);
    setEl('humidPriority', t.humidPriority);
    setEl('checkInterval', t.checkInterval);
    setEl('alertCooldown', t.alertCooldown);

    // Recipient type
    const radios = document.querySelectorAll('input[name="thresholdRecipients"]');
    radios.forEach(r => { r.checked = (r.value === t.recipientType); });
    toggleThresholdCustom();

    // Custom recipients list
    thresholdCustomRecipients = t.customRecipients || [];
    renderThresholdRecipientList();

    // Update card states
    updateThresholdCardState('temp');
    updateThresholdCardState('wind');
    updateThresholdCardState('humid');

    // Restore monitoring button state
    if (thresholdMonitorInterval) {
        document.getElementById('monitoringBadge').textContent = '● Monitoring ON';
        document.getElementById('monitoringBadge').className = 'monitoring-badge on';
        document.getElementById('toggleMonitorBtn').textContent = '⏹ Stop Monitoring';
        document.getElementById('toggleMonitorBtn').className = 'btn btn-danger';
    }
}

function setEl(id, value, attr) {
    const el = document.getElementById(id);
    if (!el) return;
    if (attr === 'checked') { el.checked = !!value; } else { el.value = value; }
}

// Return the current threshold config from the form (or localStorage defaults)
function getThresholdSettings() {
    const stored = localStorage.getItem('thresholds');
    if (stored) {
        try { return JSON.parse(stored); } catch(e) {}
    }
    return Object.assign({}, DEFAULT_THRESHOLDS);
}

// Save threshold form to localStorage
function saveThresholds(event) {
    if (event) event.preventDefault();
    const t = {
        tempEnabled:  !!(document.getElementById('tempEnabled') && document.getElementById('tempEnabled').checked),
        tempMax:      parseFloat((document.getElementById('tempMax') || {value: 38}).value)  || 38,
        tempPriority: (document.getElementById('tempPriority') || {value: 'medium'}).value,
        windEnabled:  !!(document.getElementById('windEnabled') && document.getElementById('windEnabled').checked),
        windMax:      parseFloat((document.getElementById('windMax') || {value: 60}).value)  || 60,
        windPriority: (document.getElementById('windPriority') || {value: 'high'}).value,
        humidEnabled: !!(document.getElementById('humidEnabled') && document.getElementById('humidEnabled').checked),
        humidMax:     parseFloat((document.getElementById('humidMax') || {value: 90}).value) || 90,
        humidPriority:(document.getElementById('humidPriority') || {value: 'low'}).value,
        checkInterval: parseInt((document.getElementById('checkInterval') || {value: 5}).value) || 5,
        alertCooldown: parseInt((document.getElementById('alertCooldown') || {value: 30}).value) || 30,
        recipientType: (document.querySelector('input[name="thresholdRecipients"]:checked') || {value: 'all'}).value,
        customRecipients: thresholdCustomRecipients
    };
    localStorage.setItem('thresholds', JSON.stringify(t));

    // Restart monitoring if active so new interval takes effect
    if (thresholdMonitorInterval) {
        clearInterval(thresholdMonitorInterval);
        thresholdMonitorInterval = setInterval(runThresholdCheck, t.checkInterval * 60000);
    }

    showToast('Thresholds saved successfully!', 'success');
}

// Reset thresholds to defaults
function resetThresholds() {
    if (!confirm('Reset all threshold settings to defaults?')) return;
    localStorage.removeItem('thresholds');
    thresholdCustomRecipients = [];
    loadThresholdUI();
    showToast('Thresholds reset to defaults.', 'info');
}

// Enable / disable threshold card fields based on toggle
function updateThresholdCardState(type) {
    const checkbox = document.getElementById(type + 'Enabled');
    const fields   = document.getElementById(type + 'Fields');
    const card     = document.getElementById('threshold-card-' + type);
    if (!checkbox || !fields) return;

    if (checkbox.checked) {
        fields.classList.remove('disabled');
        if (card) card.classList.add('active');
    } else {
        fields.classList.add('disabled');
        if (card) card.classList.remove('active');
    }
}

// Toggle custom recipients input block
function toggleThresholdCustom() {
    const val = (document.querySelector('input[name="thresholdRecipients"]:checked') || {value: ''}).value;
    const block = document.getElementById('thresholdCustomBlock');
    if (block) block.style.display = (val === 'custom') ? 'block' : 'none';
}

// Add a recipient to threshold custom list
function addThresholdRecipient() {
    const inp = document.getElementById('thresholdCustomEmail');
    const email = inp ? inp.value.trim() : '';
    if (!email || !isValidEmail(email)) { showToast('Please enter a valid email address.', 'error'); return; }
    if (thresholdCustomRecipients.includes(email)) { showToast('Email already added.', 'warning'); return; }
    thresholdCustomRecipients.push(email);
    if (inp) inp.value = '';
    renderThresholdRecipientList();
}

function removeThresholdRecipient(email) {
    thresholdCustomRecipients = thresholdCustomRecipients.filter(e => e !== email);
    renderThresholdRecipientList();
}

function renderThresholdRecipientList() {
    const container = document.getElementById('thresholdRecipientList');
    if (!container) return;
    container.innerHTML = '';
    thresholdCustomRecipients.forEach(email => {
        const tag = document.createElement('div');
        tag.className = 'recipient-tag';
        tag.innerHTML = `${email} <button type="button" onclick="removeThresholdRecipient('${email}')">×</button>`;
        container.appendChild(tag);
    });
}

// ── Monitoring ──────────────────────────────────────────────────

function toggleMonitoring() {
    if (thresholdMonitorInterval) {
        // Stop
        clearInterval(thresholdMonitorInterval);
        thresholdMonitorInterval = null;
        document.getElementById('monitoringBadge').textContent = '● Monitoring OFF';
        document.getElementById('monitoringBadge').className = 'monitoring-badge off';
        document.getElementById('toggleMonitorBtn').textContent = '▶ Start Monitoring';
        document.getElementById('toggleMonitorBtn').className = 'btn btn-primary';
        showToast('Threshold monitoring stopped.', 'info');
    } else {
        // Check at least one threshold is enabled
        const t = getThresholdSettings();
        const anyEnabled = t.tempEnabled || t.windEnabled || t.humidEnabled;
        if (!anyEnabled) {
            showToast('Please enable at least one threshold and save first.', 'warning');
            return;
        }
        const intervalMs = (t.checkInterval || 5) * 60000;
        thresholdMonitorInterval = setInterval(runThresholdCheck, intervalMs);
        document.getElementById('monitoringBadge').textContent = '● Monitoring ON';
        document.getElementById('monitoringBadge').className = 'monitoring-badge on';
        document.getElementById('toggleMonitorBtn').textContent = '⏹ Stop Monitoring';
        document.getElementById('toggleMonitorBtn').className = 'btn btn-danger';
        showToast('Threshold monitoring started. Checking every ' + t.checkInterval + ' min.', 'success');
        // Run immediately
        runThresholdCheck(true);
    }
}

// ── Weather Fetch + Check ─────────────────────────────────────────

async function runThresholdCheck(silent) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${THRESHOLD_LOCATION.lat}&longitude=${THRESHOLD_LOCATION.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
    try {
        const res  = await fetch(url);
        const data = await res.json();
        const c    = data.current || {};

        const temp  = c.temperature_2m;
        const wind  = c.wind_speed_10m;
        const humid = c.relative_humidity_2m;
        const code  = c.weathercode;

        // Update current weather display
        updateWeatherDisplay(temp, wind, humid, code);

        // Record last check time
        const now = new Date().toLocaleString();
        const el = document.getElementById('lastCheckTime');
        if (el) el.textContent = 'Last check: ' + now;

        // Compare against thresholds
        checkWeatherThresholds(temp, wind, humid);

    } catch(e) {
        console.warn('Threshold weather fetch failed:', e);
        if (!silent) showToast('Could not fetch weather data.', 'error');
    }
}

function updateWeatherDisplay(temp, wind, humid, code) {
    const weatherDescriptions = {
        0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
        45:'Fog', 48:'Icy fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
        61:'Light rain', 63:'Rain', 65:'Heavy rain', 71:'Light snow', 73:'Snow', 75:'Heavy snow',
        80:'Light showers', 81:'Showers', 82:'Heavy showers',
        95:'Thunderstorm', 96:'Thunder + hail', 99:'Thunder + heavy hail'
    };

    const t = document.getElementById('tw-temp');
    const w = document.getElementById('tw-wind');
    const h = document.getElementById('tw-humid');
    const co = document.getElementById('tw-code');
    const threshSettings = getThresholdSettings();

    if (t) {
        t.textContent = (temp !== undefined) ? `${temp}°C` : '--°C';
        const card = document.getElementById('tw-temp-card');
        if (card && threshSettings.tempEnabled) {
            card.classList.toggle('above-threshold', temp > threshSettings.tempMax);
        }
    }
    if (w) {
        w.textContent = (wind !== undefined) ? `${wind} km/h` : '-- km/h';
        const card = document.getElementById('tw-wind-card');
        if (card && threshSettings.windEnabled) {
            card.classList.toggle('above-threshold', wind > threshSettings.windMax);
        }
    }
    if (h) {
        h.textContent = (humid !== undefined) ? `${humid}%` : '--%';
        const card = document.getElementById('tw-humid-card');
        if (card && threshSettings.humidEnabled) {
            card.classList.toggle('above-threshold', humid > threshSettings.humidMax);
        }
    }
    if (co) co.textContent = (code !== undefined) ? (weatherDescriptions[code] || 'Code ' + code) : '--';
}

// Check each enabled threshold and trigger alerts
function checkWeatherThresholds(temp, wind, humid) {
    const t = getThresholdSettings();
    const now = Date.now();
    const cooldownMs = (t.alertCooldown || 30) * 60000;

    if (t.tempEnabled && temp !== undefined) {
        const lastAlert = thresholdCooldowns['temp'] || 0;
        if (temp > t.tempMax && (now - lastAlert) >= cooldownMs) {
            triggerThresholdAlert('temp', temp, t.tempMax, t.tempPriority, t);
        }
    }
    if (t.windEnabled && wind !== undefined) {
        const lastAlert = thresholdCooldowns['wind'] || 0;
        if (wind > t.windMax && (now - lastAlert) >= cooldownMs) {
            triggerThresholdAlert('wind', wind, t.windMax, t.windPriority, t);
        }
    }
    if (t.humidEnabled && humid !== undefined) {
        const lastAlert = thresholdCooldowns['humid'] || 0;
        if (humid > t.humidMax && (now - lastAlert) >= cooldownMs) {
            triggerThresholdAlert('humid', humid, t.humidMax, t.humidPriority, t);
        }
    }
}

async function triggerThresholdAlert(type, currentValue, threshold, priority, settings) {
    const typeLabels = { temp: 'Temperature', wind: 'Wind Speed', humid: 'Humidity' };
    const typeUnits  = { temp: '°C',          wind: ' km/h',     humid: '%' };
    const typeIcons  = { temp: '🌡️',           wind: '💨',        humid: '💧' };

    const label = typeLabels[type];
    const unit  = typeUnits[type];
    const icon  = typeIcons[type];

    const subject = `${icon} [B-Safe Auto-Alert] ${label} Threshold Exceeded`;
    const htmlBody = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#e74c3c;color:#fff;padding:20px 24px;">
    <h2 style="margin:0;font-size:20px;">${icon} B-Safe Weather Alert</h2>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;"><strong>${label} threshold has been exceeded</strong> for the City of Candon.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f8f9fa;">
        <td style="padding:10px 14px;font-weight:bold;">Current ${label}</td>
        <td style="padding:10px 14px;color:#e74c3c;font-weight:bold;font-size:18px;">${currentValue}${unit}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:bold;">Alert Threshold</td>
        <td style="padding:10px 14px;">${threshold}${unit}</td>
      </tr>
      <tr style="background:#f8f9fa;">
        <td style="padding:10px 14px;font-weight:bold;">Priority</td>
        <td style="padding:10px 14px;text-transform:uppercase;font-weight:bold;">${priority}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:bold;">Time</td>
        <td style="padding:10px 14px;">${new Date().toLocaleString()}</td>
      </tr>
    </table>
    <p style="color:#555;">Please take appropriate precautions. Stay safe and monitor the situation closely.</p>
    <p style="color:#888;font-size:12px;">This is an automated alert from the B-Safe monitoring system.</p>
  </div>
</div>`;

    // Resolve recipients
    let toList = [];
    if (settings.recipientType === 'all') {
        // Re-fetch from DB so we always have the latest registered residents
        await loadRecipients();
        toList = recipients
            .filter(function(r) { return (typeof r === 'object') ? r.status !== 'Inactive' : true; })
            .map(function(r) { return typeof r === 'string' ? r : r.email; })
            .filter(function(e) { return e && isValidEmail(e); });
    } else {
        toList = (settings.customRecipients || thresholdCustomRecipients)
            .filter(function(e) { return e && isValidEmail(e); });
    }

    if (toList.length === 0) {
        addThresholdLog(`⚠️ No recipients configured — ${label} alert not sent (${currentValue}${unit} > ${threshold}${unit})`, 'warning');
        return;
    }

    // Set cooldown immediately to prevent double-sends during async
    thresholdCooldowns[type] = Date.now();
    localStorage.setItem('thresholdCooldowns', JSON.stringify(thresholdCooldowns));

    // Send via SMTP
    try {
        const resp = await fetch('send-email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: subject, message: htmlBody, recipients: toList })
        });
        const result = await resp.json();

        if (resp.ok && result.ok) {
            const logMsg = `✅ Auto-alert sent: ${label} = ${currentValue}${unit} exceeded ${threshold}${unit} → ${toList.length} recipient(s)`;
            addThresholdLog(logMsg, 'success');
            showToast(`Auto-alert sent! ${label} threshold exceeded.`, 'success');

            // Also record in alert history
            alerts.push({
                id: Date.now(),
                type: 'weather',
                priority: priority,
                subject: subject,
                message: `${label} ${currentValue}${unit} exceeded threshold ${threshold}${unit}`,
                recipients: toList,
                status: 'sent',
                date: new Date().toLocaleString()
            });
            localStorage.setItem('alerts', JSON.stringify(alerts));
        } else {
            const errMsg = (result && result.error) ? result.error : 'Unknown error';
            addThresholdLog(`❌ Auto-alert FAILED: ${label} = ${currentValue}${unit} — ${errMsg}`, 'error');
        }
    } catch (err) {
        addThresholdLog(`❌ Network error sending ${label} alert: ${err.message}`, 'error');
        console.error('Auto-alert send error:', err);
    }
}

// ── Threshold Log UI ─────────────────────────────────────────────

function addThresholdLog(message, level) {
    const log = JSON.parse(localStorage.getItem('thresholdLog') || '[]');
    log.unshift({ message, level, time: new Date().toLocaleString() });
    if (log.length > 50) log.splice(50);
    localStorage.setItem('thresholdLog', JSON.stringify(log));
    renderThresholdLog();
}

function renderThresholdLog() {
    const container = document.getElementById('thresholdLogContainer');
    if (!container) return;
    const log = JSON.parse(localStorage.getItem('thresholdLog') || '[]');
    if (log.length === 0) {
        container.innerHTML = '<p class="empty-log">No automatic alerts triggered yet.</p>';
        return;
    }
    container.innerHTML = log.map(entry => `
        <div class="log-entry log-${entry.level || 'info'}">
            <span class="log-time">${entry.time}</span>
            <span class="log-message">${entry.message}</span>
        </div>
    `).join('');
}

function clearThresholdLog() {
    if (!confirm('Clear all log entries?')) return;
    localStorage.removeItem('thresholdLog');
    renderThresholdLog();
}

// ── Toast notification ──────────────────────────────────────────

function showToast(message, type) {
    type = type || 'info';
    let toast = document.getElementById('bsafe-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'bsafe-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'bsafe-toast toast-' + type + ' visible';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.classList.remove('visible'); }, 3500);
}
