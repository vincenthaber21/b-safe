<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$type = isset($_GET['type']) ? $_GET['type'] : 'search';

if ($type === 'reverse') {
    $lat = isset($_GET['lat']) ? floatval($_GET['lat']) : 0;
    $lon = isset($_GET['lon']) ? floatval($_GET['lon']) : 0;
    $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={$lat}&lon={$lon}";
} else {
    $q     = isset($_GET['q'])     ? urlencode($_GET['q'])     : '';
    $limit = isset($_GET['limit']) ? intval($_GET['limit'])    : 6;
    $addressdetails = isset($_GET['addressdetails']) ? intval($_GET['addressdetails']) : 0;
    $url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails={$addressdetails}&limit={$limit}&q={$q}";
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: BSafe/1.0 (contact@bsafe.local)',
    'Accept-Language: en'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error || $response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Proxy request failed', 'detail' => $error]);
    exit;
}

http_response_code($httpCode);
echo $response;
