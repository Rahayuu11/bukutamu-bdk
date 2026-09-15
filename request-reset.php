<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metode tidak diizinkan.'], 405);
}

$body = requestBody();
$email = trim((string) ($body['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Format email tidak valid.'], 422);
}

$statement = $connection->prepare('SELECT id FROM admins WHERE email = ? LIMIT 1');
$statement->bind_param('s', $email);
$statement->execute();
$admin = $statement->get_result()->fetch_assoc();

$message = 'Jika email terdaftar, link reset password akan dikirim.';
if (!$admin) {
    jsonResponse(['success' => true, 'message' => $message]);
}

$token = bin2hex(random_bytes(32));
$tokenHash = hash('sha256', $token);
$expiresAt = date('Y-m-d H:i:s', time() + 900);

$delete = $connection->prepare('DELETE FROM password_resets WHERE admin_id = ?');
$delete->bind_param('i', $admin['id']);
$delete->execute();

$insert = $connection->prepare('INSERT INTO password_resets (admin_id, token, expires_at) VALUES (?, ?, ?)');
$insert->bind_param('iss', $admin['id'], $tokenHash, $expiresAt);
$insert->execute();

$resetUrl = 'http://localhost:5500/reset-password.html?token=' . urlencode($token);
$emailBody = "Buka link berikut untuk membuat password baru (berlaku 15 menit):\n\n{$resetUrl}\n\nJika Anda tidak meminta reset password, abaikan email ini.";
$sent = mail($email, 'Reset Password Buku Tamu BDK', $emailBody, "From: no-reply@bdk-surabaya.local\r\n");

if (!$sent) {
    jsonResponse(['success' => false, 'message' => 'Email belum dapat dikirim. Konfigurasi SMTP/mail server PHP terlebih dahulu.'], 500);
}

jsonResponse(['success' => true, 'message' => $message]);
