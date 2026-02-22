<?php $active_page = 'households'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Households - B-Safe</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/households.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <!-- Households Section -->
    <section class="households-section">
        <div class="container">
            <div class="section-header">
                <h1>Community Households</h1>
                <p>View and manage all households and their members</p>
            </div>

            <!-- Filter and Search -->
            <div class="households-controls">
                <input type="text" id="searchInput" placeholder="Search households..." class="search-box">
                <button class="btn btn-secondary" onclick="addHousehold()">+ Add Household</button>
            </div>

            <!-- Households Grid -->
            <div class="households-grid" id="householdsContainer">
                <!-- Households will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Household Details Modal -->
    <div id="householdModal" class="modal">
        <div class="modal-content modal-large">
            <span class="close" onclick="closeHouseholdModal()">&times;</span>
            <h2>Household Details</h2>
            <div id="householdDetails"></div>
        </div>
    </div>

    <!-- Add Household Modal -->
    <div id="addHouseholdModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeAddHouseholdModal()">&times;</span>
            <h2>Add New Household</h2>
            <form class="auth-form" id="addHouseholdForm">
                <input type="text" placeholder="Household Name" required>
                <input type="text" placeholder="Address" required>
                <input type="email" placeholder="Contact Email" required>
                <input type="tel" placeholder="Contact Phone" required>
                <button type="submit" class="btn btn-primary">Create Household</button>
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
    <script src="js/households.js"></script>
</body>
</html>
