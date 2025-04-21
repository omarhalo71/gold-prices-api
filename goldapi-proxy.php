<?php
// Set headers to allow cross-origin requests
header('Access-Control-Allow-Origin: *') ;
header('Content-Type: application/json');

// Get the API key from the request
$apiKey = $_GET['key'] ?? '';

// Check if API key is provided
if (empty($apiKey)) {
    echo json_encode(['error' => 'API key is required']);
    exit;
}

// Get the metal type from the request
$metal = $_GET['metal'] ?? 'XAU';

// Make request to GoldAPI
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.goldapi.io/api/$metal/USD") ;
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "x-access-token: $apiKey"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE) ;
curl_close($ch);

// Return the response
http_response_code($httpCode) ;
echo $response;
?>
