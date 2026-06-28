<?php
// POST /api/herovideo/upload.php (multipart: video + X-Gallery-Password)
// -> { video: { name, url } }
// Single-video feature: a new upload replaces the previous one.
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

if (empty($_FILES['video']['name'])) {
    json_out(['error' => 'No video uploaded'], 400);
}

$f = $_FILES['video'];
if ($f['error'] !== UPLOAD_ERR_OK) {
    json_out(['error' => 'Upload error (' . $f['error'] . ')'], 400);
}
if ($f['size'] > GC_MAX_BYTES) {
    json_out(['error' => 'Video too large (max 50 MB)'], 400);
}

$ext = strtolower(pathinfo((string) $f['name'], PATHINFO_EXTENSION));
if (!array_key_exists($ext, GC_ALLOWED_VIDEO)) {
    json_out(['error' => 'File type not allowed (mp4, webm, mov, ogg)'], 400);
}

$dir = GC_UPLOADS_DIR . '/herovideo';
ensure_dir($dir, true);

// Remove the previous video, if any (we only keep one).
$store = GC_DATA_DIR . '/herovideo.json';
$prev = json_load($store, null);
if (is_array($prev) && !empty($prev['name'])) {
    delete_named($dir, $prev['name']);
}

$final = 'hero-' . bin2hex(random_bytes(4)) . '.' . $ext;
if (!move_uploaded_file($f['tmp_name'], "$dir/$final")) {
    json_out(['error' => 'Could not save video'], 500);
}
@chmod("$dir/$final", 0644);

$video = [
    'name' => $final,
    'url'  => '/api/herovideo/stream.php?f=' . rawurlencode($final),
];
json_save($store, $video);
json_out(['video' => $video]);
