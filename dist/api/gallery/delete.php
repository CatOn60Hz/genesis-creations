<?php
// POST /api/gallery/delete.php  (form: name + X-Gallery-Password)
// -> { photos: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

$name = $_POST['name'] ?? '';

// Only a bare filename is allowed — blocks path traversal (../, absolute paths).
if (!is_string($name) || $name === '' || basename($name) !== $name) {
    json_out(['error' => 'Invalid name'], 400);
}

$path = UPLOAD_DIR . '/' . $name;
if (is_file($path)) {
    @unlink($path);
}

json_out(['photos' => list_photos()]);
