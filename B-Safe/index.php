<?php $active_page = 'home'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B-Safe - Your Safety, Our Priority</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-content">
                <?php if ($logged_in): ?>
                <h2>Welcome back, <?= $user_name ?>! 👋</h2>
                <p>You're logged in to B-Safe – your trusted safety platform</p>
                <a href="dashboard.php" class="btn btn-primary">Go to Dashboard</a>
                <?php else: ?>
                <h2>Welcome to B-Safe</h2>
                <p>Your trusted platform for comprehensive safety solutions</p>
                <button class="btn btn-primary" onclick="openSignupModal()">Get Started</button>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
        <div class="container">
            <h2>Our Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🛡️</div>
                    <h3>HouseHolds</h3>
                    <p>Enterprise-grade security to protect your data</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <h3>E-Mail Alerts</h3>
                    <p>Get instant notifications for critical events</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⛈️</div>
                    <h3>Weather Map</h3>
                    <p>Access Weather Hazards and Alerts</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <h3>Residents</h3>
                    <p>Information about residents in the community</p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
        <div class="container">
            <h2>About B-Safe</h2>
            <p>B-Safe is a comprehensive safety management platform designed to help businesses and individuals maintain the highest safety standards. With cutting-edge technology and user-friendly interfaces, we make safety management simple and effective.</p>
        </div>
    </section>

    <?php if (!$logged_in): ?>
    <!-- Login Modal (only shown when not logged in) -->
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

            <!-- Step 1: Registration Form -->
            <div id="signupStep1">
                <div class="modal-step-indicator">
                    <span class="step-dot active" id="stepDot1"></span>
                    <span class="step-line"></span>
                    <span class="step-dot" id="stepDot2"></span>
                </div>
                <h2>Create B-Safe Account</h2>
                <div id="signupError" class="form-alert form-alert-error" style="display:none;"></div>
                <form class="auth-form" id="signupForm">
                    <input type="text"     id="signupFullName"        name="full_name"       placeholder="Full Name" required>
                    <input type="email"    id="signupEmail"           name="email"           placeholder="Email Address" required>
                    <input type="password" id="signupPassword"        name="password"        placeholder="Password (min. 8 chars)" required>
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

            <!-- Step 2: OTP Verification -->
            <div id="signupStep2" style="display:none;">
                <div class="modal-step-indicator">
                    <span class="step-dot done" id="stepDot1b"></span>
                    <span class="step-line active"></span>
                    <span class="step-dot active" id="stepDot2b"></span>
                </div>
                <div class="otp-header">
                    <div class="otp-icon">📧</div>
                    <h2>Verify Your Email</h2>
                    <p id="otpSubtitle" class="otp-subtitle">We sent a 6-digit code to<br><strong id="otpEmailDisplay"></strong></p>
                </div>
                <div id="otpError" class="form-alert form-alert-error" style="display:none;"></div>
                <form class="auth-form" id="otpForm">
                    <input type="hidden" id="otpEmail" name="email">
                    <input type="text" id="otpCode" name="otp"
                           placeholder="Enter 6-digit OTP"
                           maxlength="6" pattern="[0-9]{6}"
                           autocomplete="one-time-code"
                           class="otp-input" required>
                    <button type="submit" class="btn btn-primary" id="otpSubmitBtn">
                        <span id="otpBtnText">Verify OTP</span>
                        <span id="otpBtnSpinner" class="btn-spinner" style="display:none;"></span>
                    </button>
                    <p class="otp-resend-link">
                        Didn't receive the code?
                        <a href="#" id="resendOtpLink" onclick="resendOtp(event)">Resend OTP</a>
                        <span id="resendCountdown"></span>
                    </p>
                    <p class="form-link">
                        <a href="#" onclick="backToSignup(event)">← Back</a>
                    </p>
                </form>
            </div>

            <!-- Step 3: Success -->
            <div id="signupSuccess" style="display:none;" class="signup-success">
                <div class="success-icon">🎉</div>
                <h2>Welcome to B-Safe!</h2>
                <p id="successMessage" class="success-msg-text">Your account has been created successfully.</p>
                <button class="btn btn-primary" onclick="closeAfterSuccess()">Go to Login</button>
            </div>
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
</body>
</html>
