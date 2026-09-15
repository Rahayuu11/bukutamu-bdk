<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metode tidak diizinkan.'], 405);
}

if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['success' => false, 'message' => 'Silakan login terlebih dahulu.'], 401);
}

$body = requestBody();
$newPassword = (string) ($body['password'] ?? '');

if (strlen($newPassword) < 6) {
    jsonResponse(['success' => false, 'message' => 'Kata sandi minimal 6 karakter.'], 422);
}

$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
$statement = $connection->prepare('UPDATE admins SET password = ? WHERE id = ?');
$statement->bind_param('si', $passwordHash, $_SESSION['admin_id']);
$statement->execute();

jsonResponse(['success' => true, 'message' => 'Kata sandi berhasil diubah.']);