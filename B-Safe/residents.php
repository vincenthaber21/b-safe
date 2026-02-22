<?php $active_page = 'residents'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Residents - B-Safe</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/residents.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <!-- Residents Section -->
    <section class="residents-section">
        <div class="container">
            <div class="section-header">
                <h1>Community Residents</h1>
                <p>View and manage resident information</p>
            </div>

            <!-- Filter and Search -->
            <div class="residents-controls">
                <input type="text" id="searchInput" placeholder="Search residents by name or email..." class="search-box">
                <select id="filterHousehold" class="filter-select">
                    <option value="">All Households</option>
                </select>
                <select id="filterStatus" class="filter-select">
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <button class="btn btn-secondary" onclick="addResident()">+ Add Resident</button>
            </div>

            <!-- Residents List/Grid Toggle -->
            <div class="view-toggle">
                <button class="toggle-btn active" onclick="switchToGridView()">Grid View</button>
                <button class="toggle-btn" onclick="switchToTableView()">Table View</button>
            </div>

            <!-- Residents Grid View -->
            <div id="residentsGridView" class="residents-grid">
                <!-- Residents will be loaded here -->
            </div>

            <!-- Residents Table View -->
            <div id="residentsTableView" class="residents-table-wrapper" style="display: none;">
                <table class="residents-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Household</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="residentsTableBody">
                        <!-- Table rows will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- Resident Details Modal -->
    <div id="residentModal" class="modal">
        <div class="modal-content modal-large">
            <span class="close" onclick="closeResidentModal()">&times;</span>
            <div class="resident-modal-content" id="residentDetails"></div>
        </div>
    </div>

    <!-- Add Resident Modal -->
    <div id="addResidentModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeAddResidentModal()">&times;</span>
            <h2>Add New Resident</h2>
            <form class="auth-form" id="addResidentForm">
                <input type="text" placeholder="Full Name" required>
                <input type="email" placeholder="Email Address" required>
                <input type="tel" placeholder="Phone Number" required>
                <input type="text" placeholder="Emergency Contact" required>
                <input type="tel" placeholder="Emergency Contact Phone" required>
                <select required>
                    <option value="">Select Household</option>
                    <option value="Smith Family">Smith Family</option>
                    <option value="Johnson Residence">Johnson Residence</option>
                    <option value="Williams Estate">Williams Estate</option>
                </select>
                <select required>
                    <option value="">Select Role</option>
                    <option value="Head of Household">Head of Household</option>
                    <option value="Member">Member</option>
                    <option value="Tenant">Tenant</option>
                </select>
                <select required>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <button type="submit" class="btn btn-primary">Add Resident</button>
            </form>
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
    <script src="js/residents.js"></script>
</body>
</html>
