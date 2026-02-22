<?php
// Persistent session – 30 days
$lifetime = 30 * 24 * 60 * 60;
ini_set('session.gc_maxlifetime', $lifetime);
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path'     => '/',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: index.php");
    exit();
}

$user_name  = htmlspecialchars($_SESSION['user_name']  ?? 'User');
$user_email = htmlspecialchars($_SESSION['user_email'] ?? '');
$show_welcome = !empty($_SESSION['just_logged_in']);
unset($_SESSION['just_logged_in']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard – B-Safe</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* ── Dashboard Layout ─────────────────────────────────────── */
        .dashboard-wrapper {
            display: flex;
            min-height: calc(100vh - 64px);
        }

        /* Sidebar */
        .sidebar {
            width: 250px;
            min-height: 100%;
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            flex-shrink: 0;
        }

        .sidebar-user {
            text-align: center;
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            margin-bottom: 1rem;
        }

        .sidebar-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(255,255,255,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 0.8rem;
        }

        .sidebar-user h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.2rem;
        }

        .sidebar-user p {
            font-size: 0.78rem;
            opacity: 0.8;
            word-break: break-all;
        }

        .sidebar-nav {
            list-style: none;
            padding: 0;
        }

        .sidebar-nav li a {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1.5rem;
            color: rgba(255,255,255,0.85);
            text-decoration: none;
            font-size: 0.95rem;
            transition: background 0.2s, color 0.2s;
        }

        .sidebar-nav li a:hover,
        .sidebar-nav li a.active {
            background: rgba(255,255,255,0.15);
            color: #fff;
        }

        .sidebar-nav li a .nav-icon {
            font-size: 1.1rem;
            width: 22px;
            text-align: center;
        }

        /* Main content */
        .main-content {
            flex: 1;
            background: #f4f6fb;
            padding: 2rem;
            overflow-y: auto;
        }

        .dash-greeting {
            margin-bottom: 1.8rem;
        }

        .dash-greeting h2 {
            font-size: 1.6rem;
            color: #333;
        }

        .dash-greeting p {
            color: #777;
            margin-top: 0.3rem;
        }

        /* Stat Cards */
        .stat-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.2rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.4rem 1.6rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(0,0,0,0.1);
        }

        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .stat-icon.blue   { background: #e8eeff; }
        .stat-icon.green  { background: #e8f5e9; }
        .stat-icon.orange { background: #fff3e0; }
        .stat-icon.purple { background: #f3e5f5; }

        .stat-info h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
            line-height: 1;
        }

        .stat-info p {
            font-size: 0.82rem;
            color: #888;
            margin-top: 0.2rem;
        }

        /* Quick Access */
        .section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #444;
            margin-bottom: 1rem;
        }

        .quick-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .quick-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem 1rem;
            text-align: center;
            text-decoration: none;
            color: #444;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .quick-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(102,126,234,0.18);
            color: #667eea;
        }

        .quick-card .qicon {
            font-size: 2.2rem;
            margin-bottom: 0.6rem;
        }

        .quick-card span {
            font-size: 0.9rem;
            font-weight: 500;
        }

        /* Recent Activity */
        .activity-card {
            background: white;
            border-radius: 12px;
            padding: 1.4rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }

        .activity-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .activity-list li {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 0.9rem;
            color: #555;
        }

        .activity-list li:last-child {
            border-bottom: none;
        }

        .activity-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .dot-blue   { background: #667eea; }
        .dot-green  { background: #27ae60; }
        .dot-orange { background: #f39c12; }

        .activity-time {
            margin-left: auto;
            font-size: 0.78rem;
            color: #bbb;
            white-space: nowrap;
        }

        /* Logout button in navbar */
        .logout-btn {
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.4);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            text-decoration: none;
            transition: background 0.2s;
        }
        .logout-btn:hover {
            background: rgba(255,255,255,0.28);
        }

        @media (max-width: 768px) {
            .dashboard-wrapper { flex-direction: column; }
            .sidebar { width: 100%; min-height: unset; padding: 1rem 0; }
            .sidebar-user { padding-bottom: 1rem; }
            .main-content { padding: 1.2rem; }
        }

        /* Welcome Toast */
        .welcome-toast {
            position: fixed;
            top: 80px;
            right: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 14px 22px 14px 18px;
            border-radius: 12px;
            box-shadow: 0 6px 24px rgba(102,126,234,0.45);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.97rem;
            font-weight: 500;
            z-index: 9999;
            opacity: 1;
            transform: translateX(0);
            transition: opacity 0.5s ease, transform 0.5s ease;
            max-width: 320px;
        }
        .welcome-toast.hide {
            opacity: 0;
            transform: translateX(40px);
        }
        .welcome-toast .toast-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        .welcome-toast .toast-close {
            margin-left: auto;
            background: none;
            border: none;
            color: rgba(255,255,255,0.75);
            cursor: pointer;
            font-size: 1.1rem;
            line-height: 1;
            padding: 0 0 0 8px;
        }
        .welcome-toast .toast-close:hover { color: #fff; }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar">
        <div class="container">
            <div class="navbar-brand">
                <h1>B-Safe</h1>
            </div>
            <ul class="navbar-menu">
                <li><a href="index.php">Home</a></li>
                <li><a href="households.php">Households</a></li>
                <li><a href="residents.php">Residents</a></li>
                <li><a href="weather-map.php">Weather Map</a></li>
                <li><a href="email-alerts.php">E-Mail Alerts</a></li>
                <li><a href="email_verify/logout.php" class="logout-btn">Logout</a></li>
            </ul>
        </div>
    </nav>

    <div class="dashboard-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-user">
                <div class="sidebar-avatar">👤</div>
                <h3><?= $user_name ?></h3>
                <p><?= $user_email ?></p>
            </div>
            <ul class="sidebar-nav">
                <li><a href="dashboard.php" class="active"><span class="nav-icon">🏠</span> Dashboard</a></li>
                <li><a href="households.php"><span class="nav-icon">🏘️</span> Households</a></li>
                <li><a href="residents.php"><span class="nav-icon">👥</span> Residents</a></li>
                <li><a href="weather-map.php"><span class="nav-icon">⛈️</span> Weather Map</a></li>
                <li><a href="email-alerts.php"><span class="nav-icon">📧</span> E-Mail Alerts</a></li>
                <li><a href="email_verify/logout.php"><span class="nav-icon">🚪</span> Logout</a></li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Greeting -->
            <div class="dash-greeting">
                <h2>Welcome back, <?= $user_name ?>! 👋</h2>
                <p>Here's an overview of your B-Safe dashboard.</p>
            </div>

            <!-- Stat Cards -->
            <div class="stat-cards">
                <div class="stat-card">
                    <div class="stat-icon blue">🏘️</div>
                    <div class="stat-info">
                        <h3>—</h3>
                        <p>Total Households</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">👥</div>
                    <div class="stat-info">
                        <h3>—</h3>
                        <p>Total Residents</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">🔔</div>
                    <div class="stat-info">
                        <h3>—</h3>
                        <p>Active Alerts</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">⛈️</div>
                    <div class="stat-info">
                        <h3>—</h3>
                        <p>Weather Events</p>
                    </div>
                </div>
            </div>

            <!-- Quick Access -->
            <p class="section-title">Quick Access</p>
            <div class="quick-grid">
                <a href="households.html" class="quick-card">
                    <div class="qicon">🏘️</div>
                    <span>Households</span>
                </a>
                <a href="residents.html" class="quick-card">
                    <div class="qicon">👥</div>
                    <span>Residents</span>
                </a>
                <a href="weather-map.html" class="quick-card">
                    <div class="qicon">🗺️</div>
                    <span>Weather Map</span>
                </a>
                <a href="email-alerts.html" class="quick-card">
                    <div class="qicon">📧</div>
                    <span>E-Mail Alerts</span>
                </a>
            </div>

            <!-- Recent Activity -->
            <p class="section-title">Recent Activity</p>
            <div class="activity-card">
                <ul class="activity-list">
                    <li>
                        <span class="activity-dot dot-blue"></span>
                        You logged in successfully
                        <span class="activity-time">Just now</span>
                    </li>
                    <li>
                        <span class="activity-dot dot-green"></span>
                        Account email verified
                        <span class="activity-time">Account setup</span>
                    </li>
                    <li>
                        <span class="activity-dot dot-orange"></span>
                        B-Safe account created
                        <span class="activity-time">Account setup</span>
                    </li>
                </ul>
            </div>
        </main>
    </div>

    <?php if ($show_welcome): ?>
    <!-- Welcome Toast -->
    <div class="welcome-toast" id="welcomeToast">
        <span class="toast-icon">👋</span>
        <div>
            <div style="font-size:0.78rem;opacity:0.85;margin-bottom:2px;">Logged in successfully</div>
            <div>Welcome back, <strong><?= $user_name ?>!</strong></div>
        </div>
        <button class="toast-close" onclick="dismissToast()" title="Dismiss">&times;</button>
    </div>
    <script>
        function dismissToast() {
            const t = document.getElementById('welcomeToast');
            if (t) { t.classList.add('hide'); setTimeout(() => t.remove(), 500); }
        }
        // Auto-dismiss after 5 seconds
        setTimeout(dismissToast, 5000);
    </script>
    <?php endif; ?>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 B-Safe. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
