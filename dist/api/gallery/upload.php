<?php
// POST /api/gallery/upload.php  (multipart: photos[] + X-Gallery-Password)
// -> { saved: [...], errors: [...], photos: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

ensure_upload_dir();

if (empty($_FILES['photos']) || !is_array($_FILES['photos']['name'])) {
    json_out(['error' => 'No files uploaded'], 400);
}

$files  = $_FILES['photos'];
$count  = count($files['name']);
$saved  = [];
$errors = [];

for ($i = 0; $i < $count; $i++) {
    $name = (string) $files['name'][$i];
    $tmp  = $files['tmp_name'][$i];
    $err  = $files['error'][$i];
    $size = $files['size'][$i];

    if ($err !== UPLOAD_ERR_OK) {
        $errors[] = "$name: upload error ($err)";
        continue;
    }
    if ($size > MAX_BYTES) {
        $errors[] = "$name: too large (max 15 MB)";
        continue;
    }

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!array_key_exists($ext, ALLOWED)) {
        $errors[] = "$name: file type not allowed";
        continue;
    }

    // Confirm the bytes are really an image (defends against disguised scripts).
    $info = @getimagesize($tmp);
    if ($info === false) {
        $errors[] = "$name: not a valid image";
        continue;
    }

    // Build a safe, unique filename.
    $base = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($name, PATHINFO_FILENAME));
    $base = substr(trim((string) $base, '-'), 0, 60);
    if ($base === '') {
        $base = 'photo';
    }
    $final = $base . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest  = UPLOAD_DIR . '/' . $final;

    if (move_uploaded_file($tmp, $dest)) {
        @chmod($dest, 0644);
        $saved[] = [
            'name' => $final,
            'url'  => UPLOAD_URL_BASE . '/' . rawurlencode($final),
        ];
    } else {
        $errors[] = "$name: could not save";
    }
}

json_out(['saved' => $saved, 'errors' => $errors, 'photos' => list_photos()]);
