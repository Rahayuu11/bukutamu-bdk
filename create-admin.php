<?php
require __DIR__ . '/config.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Jalankan file ini melalui terminal PHP.');
}

$adminName = 'Administrator';
$adminUsername = 'adminbdksby';
$adminPassword = 'admin123';
$passwordHash = password_hash($adminPassword, PASSWORD_DEFAULT);

$statement = $connection->prepare(
    'INSERT INTO admins (nama, username, password) VALUES (?, ?, ?) '
    . 'ON DUPLICATE KEY UPDATE nama = VALUES(nama), password = VALUES(password)'
);
$statement->bind_param('sss', $adminName, $adminUsername, $passwordHash);
$statement->execute();

echo "Admin berhasil dibuat/diperbarui. Username: {$adminUsername}, password: {$adminPassword}\n";