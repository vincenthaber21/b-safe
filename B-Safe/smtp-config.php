<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'test_01');

// SMTP configuration - edit with your SMTP provider settings
// Return an array with keys: host, port, username, password, secure ('ssl'|'tls'|''), from_email, from_name
return [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'username' => 'habervincent21@gmail.com',
    'password' => 'nvli tbsz atiz mqwc',
    'secure' => 'tls', // 'ssl' for implicit SSL (port 465), 'tls' to use STARTTLS (port 587), or '' for plain
    'from_email' => 'habervincent21@gmail.com',
    'from_name' => 'ALERT MESSAGE',
    'timezone' => 'Asia/Manila' // Philippine Standard Time (UTC+8)
];
