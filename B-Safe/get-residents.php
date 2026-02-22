<?php
/**
 * get-residents.php
 * Returns all verified, active residents (registered users) as JSON.
 * Used by email-alerts.js to populate the recipient list.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/email_verify/config.php'; // provides $conn (mysqli)

$sql = "SELECT id, full_name, email
        FROM users_1
        WHERE is_verified = 1
          AND email IS NOT NULL
          AND email != ''
        ORDER BY full_name ASC";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'DB query failed: ' . $conn->error]);
    exit;
}

$residents = [];
while ($row = $result->fetch_assoc()) {
    $residents[] = [
        'id'        => (int) $row['id'],
        'name'      => $row['full_name'] ?: 'Unknown',
        'email'     => $row['email'],
        'household' => 'Registered User',
        'status'    => 'Active'
    ];
}

$conn->close();

echo json_encode(['ok' => true, 'residents' => $residents, 'count' => count($residents)]);
