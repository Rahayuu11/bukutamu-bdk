<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metode tidak diizinkan.'], 405);
}

$body = requestBody();
$loginUsername = trim((string) ($body['username'] ?? ''));
$loginPassword = (string) ($body['password'] ?? '');

if ($loginUsername === '' || $loginPassword === '') {
    jsonResponse(['success' => false, 'message' => 'Username dan kata sandi wajib diisi.'], 422);
}

$statement = $connection->prepare('SELECT id, nama, username, password FROM admins WHERE username = ? LIMIT 1');
$statement->bind_param('s', $loginUsername);
$statement->execute();
$admin = $statement->get_result()->fetch_assoc();

if (!$admin || !password_verify($loginPassword, $admin['password'])) {
    jsonResponse(['success' => false, 'message' => 'Username atau kata sandi salah.'], 401);
}

session_regenerate_id(true);
$_SESSION['admin_id'] = (int) $admin['id'];
$_SESSION['admin_nama'] = $admin['nama'];
$_SESSION['admin_username'] = $admin['username'];

jsonResponse([
    'success' => true,
    'admin' => [
        'nama' => $admin['nama'],
        'username' => $admin['username']
    ]
]);