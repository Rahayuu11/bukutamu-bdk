<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metode tidak diizinkan.'], 405);
}

$body = requestBody();
$token = (string) ($body['token'] ?? '');
$newPassword = (string) ($body['password'] ?? '');

if ($token === '' || strlen($newPassword) < 6) {
    jsonResponse(['success' => false, 'message' => 'Token atau password tidak valid.'], 422);
}

$tokenHash = hash('sha256', $token);
$statement = $connection->prepare(
    'SELECT id, admin_id FROM password_resets WHERE token = ? AND expires_at > NOW() LIMIT 1'
);
$statement->bind_param('s', $tokenHash);
$statement->execute();
$reset = $statement->get_result()->fetch_assoc();

if (!$reset) {
    jsonResponse(['success' => false, 'message' => 'Link reset tidak valid atau sudah kedaluwarsa.'], 400);
}

$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $connection->prepare('UPDATE admins SET password = ? WHERE id = ?');
$update->bind_param('si', $passwordHash, $reset['admin_id']);
$update->execute();

$delete = $connection->prepare('DELETE FROM password_resets WHERE id = ?');
$delete->bind_param('i', $reset['id']);
$delete->execute();

jsonResponse(['success' => true, 'message' => 'Password berhasil diubah.']);
