<?php
// Simple SMTP mailer endpoint
// Expects JSON POST: { subject, message, recipients: ["a@b.com", ...] }
date_default_timezone_set('Asia/Manila'); // Philippine Standard Time (UTC+8)
header('Content-Type: application/json');

// Load SMTP configuration
$configPath = __DIR__ . '/smtp-config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'SMTP config missing. Create smtp-config.php']);
    exit;
}
$smtp = include $configPath;

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$subject = isset($input['subject']) ? $input['subject'] : '';
$body = isset($input['message']) ? $input['message'] : '';
$recipients = isset($input['recipients']) && is_array($input['recipients']) ? $input['recipients'] : [];

if (empty($recipients) || empty($subject) || empty($body)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
    exit;
}

// Basic SMTP send using sockets
function smtp_send($smtp, $fromEmail, $fromName, $toList, $subject, $htmlMessage) {
    $host = $smtp['host'];
    $port = $smtp['port'];
    $user = $smtp['username'];
    $pass = $smtp['password'];
    $secure = isset($smtp['secure']) ? $smtp['secure'] : '';

    $errno = 0; $errstr = '';
    $transport = ($secure === 'ssl') ? 'ssl://' : '';
    $fp = @fsockopen($transport . $host, $port, $errno, $errstr, 15);
    if (!$fp) return ['ok' => false, 'error' => "Connection failed: $errstr ($errno)"];

    $read = fgets($fp, 512);

    fwrite($fp, "EHLO localhost\r\n");
    $res = '';
    while ($line = fgets($fp, 515)) {
        $res .= $line;
        if (substr($line, 3, 1) == ' ') break;
    }

    // STARTTLS if requested and available
    if ($secure === 'tls') {
        fwrite($fp, "STARTTLS\r\n");
        $resp = fgets($fp, 512);
        if (strpos($resp, '220') === 0) {
            stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            // Re-EHLO after TLS
            fwrite($fp, "EHLO localhost\r\n");
            while ($line = fgets($fp, 515)) { if (substr($line, 3, 1) == ' ') break; }
        }
    }

    // Authenticate if username provided
    if (!empty($user)) {
        fwrite($fp, "AUTH LOGIN\r\n");
        fgets($fp, 512);
        fwrite($fp, base64_encode($user) . "\r\n");
        fgets($fp, 512);
        fwrite($fp, base64_encode($pass) . "\r\n");
        $authResp = fgets($fp, 512);
        if (strpos($authResp, '235') !== 0) {
            fclose($fp);
            return ['ok' => false, 'error' => 'SMTP authentication failed'];
        }
    }

    // MAIL FROM
    fwrite($fp, "MAIL FROM:<" . $fromEmail . ">\r\n");
    fgets($fp, 512);

    foreach ($toList as $rcpt) {
        fwrite($fp, "RCPT TO:<{$rcpt}>\r\n");
        fgets($fp, 512);
    }

    fwrite($fp, "DATA\r\n");
    fgets($fp, 512);

    $headers = [];
    $headers[] = 'Date: ' . date('r'); // RFC 2822 date in Asia/Manila (PHT UTC+8)
    $headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $fromEmail;
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/html; charset=UTF-8';

    $msg = implode("\r\n", $headers) . "\r\n\r\n";
    $msg .= $htmlMessage . "\r\n.\r\n";

    fwrite($fp, $msg);
    $dataResp = fgets($fp, 512);

    fwrite($fp, "QUIT\r\n");
    fclose($fp);

    if (strpos($dataResp, '250') === false) {
        return ['ok' => false, 'error' => 'SMTP DATA failed: ' . trim($dataResp)];
    }
    return ['ok' => true];
}

$fromEmail = isset($smtp['from_email']) ? $smtp['from_email'] : $smtp['username'];
$fromName = isset($smtp['from_name']) ? $smtp['from_name'] : 'B-Safe Alerts';

$result = smtp_send($smtp, $fromEmail, $fromName, $recipients, $subject, $body);

if ($result['ok']) {
    echo json_encode(['ok' => true, 'message' => 'Sent']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $result['error']]);
}

?>
