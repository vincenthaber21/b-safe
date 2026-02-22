// Sample Residents Data
let residents = [
    {
        id: 1,
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1 (555) 123-4567",
        household: "Smith Family",
        role: "Head of Household",
        status: "Active",
        avatar: "J",
        age: 42,
        dateOfBirth: "1983-05-15",
        emergencyContact: "Sarah Smith",
        emergencyPhone: "+1 (555) 123-4568",
        occupationStatus: "Employed",
        medicalInfo: "No allergies",
        joinDate: "2024-01-15"
    },
    {
        id: 2,
        name: "Sarah Smith",
        email: "sarah.smith@email.com",
        phone: "+1 (555) 123-4568",
        household: "Smith Family",
        role: "Member",
        status: "Active",
        avatar: "S",
        age: 40,
        dateOfBirth: "1985-08-22",
        emergencyContact: "John Smith",
        emergencyPhone: "+1 (555) 123-4567",
        occupationStatus: "Employed",
        medicalInfo: "Mild asthma",
        joinDate: "2024-01-15"
    },
    {
        id: 3,
        name: "Emma Smith",
        email: "emma.smith@email.com",
        phone: "+1 (555) 123-4569",
        household: "Smith Family",
        role: "Member",
        status: "Active",
        avatar: "E",
        age: 16,
        dateOfBirth: "2009-12-03",
        emergencyContact: "John Smith",
        emergencyPhone: "+1 (555) 123-4567",
        occupationStatus: "Student",
        medicalInfo: "No known allergies",
        joinDate: "2024-01-15"
    },
    {
        id: 4,
        name: "Robert Johnson",
        email: "robert.johnson@email.com",
        phone: "+1 (555) 234-5678",
        household: "Johnson Residence",
        role: "Head of Household",
        status: "Active",
        avatar: "R",
        age: 55,
        dateOfBirth: "1970-03-10",
        emergencyContact: "Patricia Johnson",
        emergencyPhone: "+1 (555) 234-5679",
        occupationStatus: "Retired",
        medicalInfo: "Hypertension - on medication",
        joinDate: "2024-02-10"
    },
    {
        id: 5,
        name: "Patricia Johnson",
        email: "patricia.johnson@email.com",
        phone: "+1 (555) 234-5679",
        household: "Johnson Residence",
        role: "Member",
        status: "Active",
        avatar: "P",
        age: 52,
        dateOfBirth: "1972-07-15",
        emergencyContact: "Robert Johnson",
        emergencyPhone: "+1 (555) 234-5678",
        occupationStatus: "Retired",
        medicalInfo: "No medical issues",
        joinDate: "2024-02-10"
    },
    {
        id: 6,
        name: "James Williams",
        email: "james.williams@email.com",
        phone: "+1 (555) 345-6789",
        household: "Williams Estate",
        role: "Head of Household",
        status: "Active",
        avatar: "J",
        age: 48,
        dateOfBirth: "1977-11-20",
        emergencyContact: "Jennifer Williams",
        emergencyPhone: "+1 (555) 345-6790",
        occupationStatus: "Employed",
        medicalInfo: "No allergies",
        joinDate: "2024-01-05"
    },
    {
        id: 7,
        name: "Michael Brown",
        email: "michael.brown@email.com",
        phone: "+1 (555) 456-7890",
        household: "Brown Household",
        role: "Head of Household",
        status: "Inactive",
        avatar: "M",
        age: 38,
        dateOfBirth: "1987-09-08",
        emergencyContact: "Karen Brown",
        emergencyPhone: "+1 (555) 456-7891",
        occupationStatus: "Employed",
        medicalInfo: "No known conditions",
        joinDate: "2024-01-20"
    },
    {
        id: 8,
        name: "Luis Garcia",
        email: "luis.garcia@email.com",
        phone: "+1 (555) 567-8901",
        household: "Garcia Family",
        role: "Head of Household",
        status: "Active",
        avatar: "L",
        age: 45,
        dateOfBirth: "1980-06-12",
        emergencyContact: "Maria Garcia",
        emergencyPhone: "+1 (555) 567-8902",
        occupationStatus: "Employed",
        medicalInfo: "Diabetes Type 2",
        joinDate: "2024-02-01"
    },
    {
        id: 9,
        name: "Antonio Martinez",
        email: "antonio.martinez@email.com",
        phone: "+1 (555) 678-9012",
        household: "Martinez Residence",
        role: "Head of Household",
        status: "Active",
        avatar: "A",
        age: 50,
        dateOfBirth: "1975-04-25",
        emergencyContact: "Rosa Martinez",
        emergencyPhone: "+1 (555) 678-9013",
        occupationStatus: "Employed",
        medicalInfo: "High cholesterol",
        joinDate: "2024-01-10"
    }
];

let currentView = 'grid';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayResidents(residents);
    populateFilters();
    setupSearchFunctionality();
    setupFilterFunctionality();
    setupFormHandlers();
});

// Display residents in grid view
function displayResidents(data) {
    const container = document.getElementById('residentsGridView');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">No residents found</div>
                <button class="btn btn-primary" onclick="addResident()">Add First Resident</button>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(resident => `
        <div class="resident-card" onclick="viewResidentDetails(${resident.id})">
            <div class="resident-header">
                <div class="resident-avatar">${resident.avatar}</div>
                <div class="resident-name-info">
                    <p class="resident-name">${resident.name}</p>
                    <p class="resident-role">${resident.role}</p>
                </div>
                <span class="status-badge status-${resident.status.toLowerCase()}">${resident.status}</span>
            </div>
            
            <div class="resident-info">
                <div class="info-row">
                    <span class="info-label">📧 Email:</span>
                    <span class="info-value">${resident.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📱 Phone:</span>
                    <span class="info-value">${resident.phone}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🏠 Household:</span>
                    <span class="info-value">${resident.household}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">👤 Age:</span>
                    <span class="info-value">${resident.age} years</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="card-btn" onclick="event.stopPropagation(); viewResidentDetails(${resident.id})">View</button>
                <button class="card-btn" onclick="event.stopPropagation(); editResident(${resident.id})">Edit</button>
                <button class="card-btn" onclick="event.stopPropagation(); deleteResident(${resident.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Display residents in table view
function displayResidentsTable(data) {
    const tbody = document.getElementById('residentsTableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #999;">No residents found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(resident => `
        <tr onclick="viewResidentDetails(${resident.id})">
            <td>${resident.name}</td>
            <td>${resident.email}</td>
            <td>${resident.phone}</td>
            <td>${resident.household}</td>
            <td>${resident.role}</td>
            <td><span class="status-badge status-${resident.status.toLowerCase()}">${resident.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="table-btn" onclick="event.stopPropagation(); viewResidentDetails(${resident.id})">View</button>
                    <button class="table-btn" onclick="event.stopPropagation(); editResident(${resident.id})">Edit</button>
                    <button class="table-btn" onclick="event.stopPropagation(); deleteResident(${resident.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// View resident details
function viewResidentDetails(residentId) {
    const resident = residents.find(r => r.id === residentId);
    if (!resident) return;

    const details = `
        <div class="modal-header">
            <div class="modal-avatar">${resident.avatar}</div>
            <div class="modal-header-info">
                <h2>${resident.name}</h2>
                <p>${resident.role} • ${resident.household}</p>
            </div>
        </div>

        <div class="modal-section">
            <h3>Personal Information</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${resident.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${resident.dateOfBirth}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Age:</span>
                <span class="detail-value">${resident.age} years</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Occupation Status:</span>
                <span class="detail-value">${resident.occupationStatus}</span>
            </div>
        </div>

        <div class="modal-section">
            <h3>Contact Information</h3>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${resident.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${resident.phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Emergency Contact:</span>
                <span class="detail-value">${resident.emergencyContact}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Emergency Phone:</span>
                <span class="detail-value">${resident.emergencyPhone}</span>
            </div>
        </div>

        <div class="modal-section">
            <h3>Household Information</h3>
            <div class="detail-row">
                <span class="detail-label">Household:</span>
                <span class="detail-value">${resident.household}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Role:</span>
                <span class="detail-value">${resident.role}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-${resident.status.toLowerCase()}">${resident.status}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Join Date:</span>
                <span class="detail-value">${resident.joinDate}</span>
            </div>
        </div>

        <div class="modal-section">
            <h3>Medical Information</h3>
            <div class="detail-row">
                <span class="detail-label">Medical Notes:</span>
                <span class="detail-value">${resident.medicalInfo}</span>
            </div>
        </div>
    `;

    document.getElementById('residentDetails').innerHTML = details;
    document.getElementById('residentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Switch to grid view
function switchToGridView() {
    currentView = 'grid';
    document.getElementById('residentsGridView').style.display = 'grid';
    document.getElementById('residentsTableView').style.display = 'none';
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayResidents(residents);
}

// Switch to table view
function switchToTableView() {
    currentView = 'table';
    document.getElementById('residentsGridView').style.display = 'none';
    document.getElementById('residentsTableView').style.display = 'block';
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayResidentsTable(residents);
}

// Populate filter dropdowns
function populateFilters() {
    const households = [...new Set(residents.map(r => r.household))];
    const householdSelect = document.getElementById('filterHousehold');
    
    households.forEach(household => {
        const option = document.createElement('option');
        option.value = household;
        option.textContent = household;
        householdSelect.appendChild(option);
    });
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterResidents);
    }
}

// Filter functionality
function setupFilterFunctionality() {
    const householdFilter = document.getElementById('filterHousehold');
    const statusFilter = document.getElementById('filterStatus');
    
    if (householdFilter) householdFilter.addEventListener('change', filterResidents);
    if (statusFilter) statusFilter.addEventListener('change', filterResidents);
}

// Filter residents based on search and filters
function filterResidents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const householdFilter = document.getElementById('filterHousehold').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = residents.filter(resident => {
        const matchesSearch = resident.name.toLowerCase().includes(searchTerm) || 
                            resident.email.toLowerCase().includes(searchTerm);
        const matchesHousehold = !householdFilter || resident.household === householdFilter;
        const matchesStatus = !statusFilter || resident.status === statusFilter;

        return matchesSearch && matchesHousehold && matchesStatus;
    });

    if (currentView === 'grid') {
        displayResidents(filtered);
    } else {
        displayResidentsTable(filtered);
    }
}

// Add resident
function addResident() {
    document.getElementById('addResidentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAddResidentModal() {
    document.getElementById('addResidentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Edit resident
function editResident(residentId) {
    alert('Edit functionality for resident ' + residentId);
}

// Delete resident
function deleteResident(residentId) {
    if (confirm('Are you sure you want to delete this resident?')) {
        residents = residents.filter(r => r.id !== residentId);
        if (currentView === 'grid') {
            displayResidents(residents);
        } else {
            displayResidentsTable(residents);
        }
        populateFilters();
    }
}

// Close resident modal
function closeResidentModal() {
    document.getElementById('residentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Setup form handlers
function setupFormHandlers() {
    const addForm = document.getElementById('addResidentForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input, select');
            const newResident = {
                id: residents.length + 1,
                name: inputs[0].value,
                email: inputs[1].value,
                phone: inputs[2].value,
                emergencyContact: inputs[3].value,
                emergencyPhone: inputs[4].value,
                household: inputs[5].value,
                role: inputs[6].value,
                status: inputs[7].value,
                avatar: inputs[0].value.charAt(0).toUpperCase(),
                age: 30,
                dateOfBirth: "1993-01-01",
                occupationStatus: "Employed",
                medicalInfo: "No known conditions",
                joinDate: new Date().toISOString().split('T')[0]
            };
            
            residents.push(newResident);
            if (currentView === 'grid') {
                displayResidents(residents);
            } else {
                displayResidentsTable(residents);
            }
            populateFilters();
            closeAddResidentModal();
            this.reset();
            alert('Resident added successfully!');
        });
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const residentModal = document.getElementById('residentModal');
    const addResidentModal = document.getElementById('addResidentModal');
    
    if (event.target === residentModal) {
        closeResidentModal();
    }
    if (event.target === addResidentModal) {
        closeAddResidentModal();
    }
});