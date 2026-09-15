<?php
require __DIR__ . '/config.php';

if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['success' => false, 'message' => 'Belum login.'], 401);
}

jsonResponse([
    'success' => true,
    'admin' => [
        'nama' => $_SESSION['admin_nama'],
        'username' => $_SESSION['admin_username']
    ]
]);