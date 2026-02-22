// Sample Households Data
let households = [
    {
        id: 1,
        name: "Smith Family",
        address: "123 Oak Street",
        email: "smith.family@email.com",
        phone: "+1 (555) 123-4567",
        members: [
            { name: "John Smith", role: "Head of Household", avatar: "J" },
            { name: "Sarah Smith", role: "Member", avatar: "S" },
            { name: "Emma Smith", role: "Member", avatar: "E" },
            { name: "Michael Smith", role: "Member", avatar: "M" }
        ]
    },
    {
        id: 2,
        name: "Johnson Residence",
        address: "456 Maple Avenue",
        email: "johnson.home@email.com",
        phone: "+1 (555) 234-5678",
        members: [
            { name: "Robert Johnson", role: "Head of Household", avatar: "R" },
            { name: "Patricia Johnson", role: "Member", avatar: "P" },
            { name: "David Johnson", role: "Member", avatar: "D" }
        ]
    },
    {
        id: 3,
        name: "Williams Estate",
        address: "789 Pine Road",
        email: "williams.estate@email.com",
        phone: "+1 (555) 345-6789",
        members: [
            { name: "James Williams", role: "Head of Household", avatar: "J" },
            { name: "Jennifer Williams", role: "Member", avatar: "J" },
            { name: "Christopher Williams", role: "Member", avatar: "C" },
            { name: "Amanda Williams", role: "Member", avatar: "A" },
            { name: "Daniel Williams", role: "Member", avatar: "D" }
        ]
    },
    {
        id: 4,
        name: "Brown Household",
        address: "321 Elm Street",
        email: "brown.home@email.com",
        phone: "+1 (555) 456-7890",
        members: [
            { name: "Michael Brown", role: "Head of Household", avatar: "M" },
            { name: "Karen Brown", role: "Member", avatar: "K" }
        ]
    },
    {
        id: 5,
        name: "Garcia Family",
        address: "654 Cedar Lane",
        email: "garcia.family@email.com",
        phone: "+1 (555) 567-8901",
        members: [
            { name: "Luis Garcia", role: "Head of Household", avatar: "L" },
            { name: "Maria Garcia", role: "Member", avatar: "M" },
            { name: "Carlos Garcia", role: "Member", avatar: "C" },
            { name: "Sofia Garcia", role: "Member", avatar: "S" }
        ]
    },
    {
        id: 6,
        name: "Martinez Residence",
        address: "987 Birch Street",
        email: "martinez.res@email.com",
        phone: "+1 (555) 678-9012",
        members: [
            { name: "Antonio Martinez", role: "Head of Household", avatar: "A" },
            { name: "Rosa Martinez", role: "Member", avatar: "R" },
            { name: "Miguel Martinez", role: "Member", avatar: "M" }
        ]
    }
];

// Initialize households on page load
document.addEventListener('DOMContentLoaded', function() {
    displayHouseholds(households);
    setupSearchFunctionality();
    setupFormHandlers();
});

// Display all households
function displayHouseholds(data) {
    const container = document.getElementById('householdsContainer');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🏠</div>
                <div class="empty-state-text">No households found</div>
                <button class="btn btn-primary" onclick="addHousehold()">Create First Household</button>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(household => `
        <div class="household-card" onclick="viewHouseholdDetails(${household.id})">
            <div class="household-header">
                <div class="household-icon">🏠</div>
                <div class="household-name">
                    <h3>${household.name}</h3>
                    <p class="household-address">${household.address}</p>
                </div>
            </div>
            
            <div class="household-info">
                <div class="info-row">
                    <span class="info-label">📧 Email:</span>
                    <span class="info-value">${household.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📱 Phone:</span>
                    <span class="info-value">${household.phone}</span>
                </div>
            </div>

            <div class="members-list">
                <div class="members-label">
                    Members
                    <span class="members-count">${household.members.length}</span>
                </div>
                ${household.members.map(member => `
                    <div class="member-item">
                        <div class="member-avatar">${member.avatar}</div>
                        <div class="member-info">
                            <p class="member-name">${member.name}</p>
                            <p class="member-role">${member.role}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="card-actions">
                <button class="card-btn" onclick="event.stopPropagation(); viewHouseholdDetails(${household.id})">View</button>
                <button class="card-btn" onclick="event.stopPropagation(); editHousehold(${household.id})">Edit</button>
                <button class="card-btn" onclick="event.stopPropagation(); deleteHousehold(${household.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// View household details in modal
function viewHouseholdDetails(householdId) {
    const household = households.find(h => h.id === householdId);
    if (!household) return;

    const details = `
        <div class="household-details">
            <div class="details-section">
                <h3>Household Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${household.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${household.address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${household.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${household.phone}</span>
                </div>
            </div>

            <div class="details-section">
                <h3>Members (${household.members.length})</h3>
                <div class="members-details-grid">
                    ${household.members.map(member => `
                        <div class="member-card">
                            <div class="member-card-avatar">${member.avatar}</div>
                            <div class="member-card-name">${member.name}</div>
                            <div class="member-card-role">${member.role}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('householdDetails').innerHTML = details;
    document.getElementById('householdModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = households.filter(household => 
                household.name.toLowerCase().includes(searchTerm) ||
                household.address.toLowerCase().includes(searchTerm) ||
                household.members.some(m => m.name.toLowerCase().includes(searchTerm))
            );
            displayHouseholds(filtered);
        });
    }
}

// Add household
function addHousehold() {
    document.getElementById('addHouseholdModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAddHouseholdModal() {
    document.getElementById('addHouseholdModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Edit household
function editHousehold(householdId) {
    alert('Edit functionality for household ' + householdId);
}

// Delete household
function deleteHousehold(householdId) {
    if (confirm('Are you sure you want to delete this household?')) {
        households = households.filter(h => h.id !== householdId);
        displayHouseholds(households);
    }
}

// Close household modal
function closeHouseholdModal() {
    document.getElementById('householdModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Setup form handlers
function setupFormHandlers() {
    const addForm = document.getElementById('addHouseholdForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input');
            const newHousehold = {
                id: households.length + 1,
                name: inputs[0].value,
                address: inputs[1].value,
                email: inputs[2].value,
                phone: inputs[3].value,
                members: []
            };
            
            households.push(newHousehold);
            displayHouseholds(households);
            closeAddHouseholdModal();
            this.reset();
            alert('Household created successfully!');
        });
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const householdModal = document.getElementById('householdModal');
    const addHouseholdModal = document.getElementById('addHouseholdModal');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === householdModal) {
        closeHouseholdModal();
    }
    if (event.target === addHouseholdModal) {
        closeAddHouseholdModal();
    }
});