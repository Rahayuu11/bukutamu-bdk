<?php
declare(strict_types=1);

session_start();

$allowedOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($allowedOrigin, ['http://localhost:5500', 'http://127.0.0.1:5500'], true)) {
    header("Access-Control-Allow-Origin: {$allowedOrigin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$host = '127.0.0.1';
$database = 'buku_tamu_bdk';
$username = 'root';
$password = '';

$connection = new mysqli($host, $username, $password, $database);

if ($connection->connect_error) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode(['success' => false, 'message' => 'Koneksi database gagal.']));
}

$connection->set_charset('utf8mb4');

function jsonResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function requestBody(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}