// Modal Functions
let resendTimer = null; // OTP countdown timer (top-level scope)

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
    // Reset back to step 1
    showStep('signupStep1');
    const sf = document.getElementById('signupForm');
    if (sf) sf.reset();
    hideAlert('signupError');
    hideAlert('otpError');
    if (resendTimer) clearInterval(resendTimer);
    const cd = document.getElementById('resendCountdown');
    if (cd) cd.textContent = '';
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.startsWith('#') && (href === '#login' || href === '#signup')) {
            return;
        }
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const errorEl  = document.getElementById('loginError');
        const submitBtn = this.querySelector('button[type="submit"]');
        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Hide previous error
        if (errorEl) errorEl.style.display = 'none';

        // Loading state
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in…';
        submitBtn.disabled = true;

        const fd = new FormData();
        fd.append('email',    email);
        fd.append('password', password);

        fetch('email_verify/login_handler.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Redirect to dashboard
                    window.location.href = data.redirect || 'index.php';
                } else {
                    if (errorEl) {
                        errorEl.textContent = data.message;
                        errorEl.style.display = 'block';
                    }
                    submitBtn.textContent = origText;
                    submitBtn.disabled = false;
                }
            })
            .catch(() => {
                if (errorEl) {
                    errorEl.textContent = 'Network error. Please try again.';
                    errorEl.style.display = 'block';
                }
                submitBtn.textContent = origText;
                submitBtn.disabled = false;
            });
    });
}

// ── Signup: Step 1 – Registration Form ─────────────────────────────────────
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert('signupError');

        const btnText    = document.getElementById('signupBtnText');
        const btnSpinner = document.getElementById('signupBtnSpinner');
        const submitBtn  = document.getElementById('signupSubmitBtn');

        // Show loading state
        btnText.textContent = 'Sending OTP…';
        btnSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        const formData = new FormData(this);

        fetch('email_verify/register.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                // Transition to OTP step
                const email = data.email;
                document.getElementById('otpEmail').value        = email;
                document.getElementById('otpEmailDisplay').textContent = email;
                showStep('signupStep2');
                startResendCountdown(60);
            } else {
                showAlert('signupError', data.message);
            }
        })
        .catch(() => showAlert('signupError', 'Network error. Please try again.'))
        .finally(() => {
            btnText.textContent    = 'Create Account';
            btnSpinner.style.display = 'none';
            submitBtn.disabled     = false;
        });
    });
}

// ── Signup: Step 2 – OTP Verification ──────────────────────────────────────
const otpForm = document.getElementById('otpForm');
if (otpForm) {
    otpForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert('otpError');

        const btnText    = document.getElementById('otpBtnText');
        const btnSpinner = document.getElementById('otpBtnSpinner');
        const submitBtn  = document.getElementById('otpSubmitBtn');

        btnText.textContent     = 'Verifying…';
        btnSpinner.style.display = 'inline-block';
        submitBtn.disabled      = true;

        const formData = new FormData(this);

        fetch('email_verify/verify_register_otp.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                document.getElementById('successMessage').textContent = data.message;
                showStep('signupSuccess');
            } else {
                showAlert('otpError', data.message);
                if (data.expired) {
                    // Allow user to go back and re-register
                    setTimeout(backToSignup, 2500);
                }
            }
        })
        .catch(() => showAlert('otpError', 'Network error. Please try again.'))
        .finally(() => {
            btnText.textContent     = 'Verify OTP';
            btnSpinner.style.display = 'none';
            submitBtn.disabled      = false;
        });
    });
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function showStep(stepId) {
    ['signupStep1', 'signupStep2', 'signupSuccess'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === stepId) ? 'block' : 'none';
    });
}

function showAlert(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = message; el.style.display = 'block'; }
}

function hideAlert(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function backToSignup(e) {
    if (e && e.preventDefault) e.preventDefault();
    hideAlert('otpError');
    document.getElementById('otpCode').value = '';
    showStep('signupStep1');
}

function closeAfterSuccess() {
    closeSignupModal();
    openLoginModal();
}

// Resend OTP
function resendOtp(e) {
    e.preventDefault();
    const link = document.getElementById('resendOtpLink');
    if (link.dataset.disabled === 'true') return;

    hideAlert('otpError');
    const email    = document.getElementById('otpEmail').value;
    const fullName = document.getElementById('signupFullName').value;
    const password = document.getElementById('signupPassword').value;
    const confirmP = document.getElementById('signupConfirmPassword').value;

    const fd = new FormData();
    fd.append('full_name',        fullName);
    fd.append('email',            email);
    fd.append('password',         password);
    fd.append('confirm_password', confirmP);

    link.textContent    = 'Sending…';
    link.dataset.disabled = 'true';

    fetch('email_verify/register.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showAlert('otpError', '✅ New OTP sent! Check your inbox.');
                document.getElementById('otpError').style.background = '#e8f5e9';
                document.getElementById('otpError').style.color = '#2e7d32';
                document.getElementById('otpCode').value = '';
                startResendCountdown(60);
            } else {
                showAlert('otpError', data.message);
                link.textContent = 'Resend OTP';
                link.dataset.disabled = 'false';
            }
        })
        .catch(() => {
            showAlert('otpError', 'Network error. Please try again.');
            link.textContent = 'Resend OTP';
            link.dataset.disabled = 'false';
        });
}

function startResendCountdown(seconds) {
    const link      = document.getElementById('resendOtpLink');
    const countdown = document.getElementById('resendCountdown');
    if (resendTimer) clearInterval(resendTimer);
    link.dataset.disabled = 'true';
    link.style.opacity    = '0.5';

    let remaining = seconds;
    countdown.textContent = ` (${remaining}s)`;

    resendTimer = setInterval(() => {
        remaining--;
        countdown.textContent = ` (${remaining}s)`;
        if (remaining <= 0) {
            clearInterval(resendTimer);
            countdown.textContent    = '';
            link.textContent         = 'Resend OTP';
            link.dataset.disabled    = 'false';
            link.style.opacity       = '1';
        }
    }, 1000);
}

// Add scroll event listener for navbar animation
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Add animation observer for feature cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideDown 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// Add keyboard navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        // Close any open menus or dialogs if needed
        console.log('Escape key pressed');
    }
});

// Log page load
console.log('B-Safe website loaded successfully');
