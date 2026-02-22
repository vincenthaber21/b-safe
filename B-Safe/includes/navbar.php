<?php
// ── Shared Navbar Include ─────────────────────────────────────────────────
// Usage: set $active_page before including, e.g. $active_page = 'households';
// Pages: home | households | residents | weather | alerts
// Set $base = '' (root pages) or '../' (sub-directory pages)

$base       = $base       ?? '';
$active_page = $active_page ?? '';

// Persistent session — 30 days
$lifetime = 30 * 24 * 60 * 60;
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', $lifetime);
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path'     => '/',
        'secure'   => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

$logged_in = !empty($_SESSION['logged_in']);
$user_name = $logged_in ? htmlspecialchars($_SESSION['user_name'] ?? 'User') : '';

function nav_active(string $page, string $current): string {
    return $page === $current ? ' class="active"' : '';
}
?>
<nav class="navbar">
    <div class="container">
        <div class="navbar-brand">
            <a href="<?= $base ?>index.php" class="brand-link">B-Safe</a>
        </div>
        <ul class="navbar-menu">
            <li><a href="<?= $base ?>index.php"<?= nav_active('home', $active_page) ?>>Home</a></li>
            <li><a href="<?= $active_page === 'home' ? '#features' : $base . 'index.php#features' ?>">Features</a></li>
            <li><a href="<?= $active_page === 'home' ? '#about' : $base . 'index.php#about' ?>">About Us</a></li>
            <li><a href="<?= $base ?>households.php"<?= nav_active('households', $active_page) ?>>Households</a></li>
            <li><a href="<?= $base ?>residents.php"<?= nav_active('residents', $active_page) ?>>Residents</a></li>
            <li><a href="<?= $base ?>weather-map.php"<?= nav_active('weather', $active_page) ?>>Weather Map</a></li>
            <li><a href="<?= $base ?>email-alerts.php"<?= nav_active('alerts', $active_page) ?>>E-Mail Alerts</a></li>
            <?php if ($logged_in): ?>
            <li class="nav-user-item">
                <span class="nav-user-chip">
                    <span class="nav-user-avatar">&#128100;</span>
                    <?= $user_name ?>
                </span>
            </li>
            <li><a href="<?= $base ?>dashboard.php" class="nav-auth<?= $active_page === 'dashboard' ? ' active' : '' ?>">Dashboard</a></li>
            <li><a href="<?= $base ?>email_verify/logout.php" class="nav-auth nav-logout-btn">Logout</a></li>
            <?php else: ?>
            <li><a href="#" onclick="openLoginModal()" class="nav-auth">Login</a></li>
            <li><a href="#" onclick="openSignupModal()" class="nav-auth signup-btn">Sign Up</a></li>
            <?php endif; ?>
        </ul>
    </div>
</nav>
