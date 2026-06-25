<?php
// POST /api/projector/upload.php (multipart: photos[] + X-Gallery-Password)
// -> { saved: [...], errors: [...], images: [...] }
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$dir = GC_UPLOADS_DIR . '/projector';
$url = GC_UPLOADS_URL . '/projector';

$result = save_uploaded_images('photos', $dir);

json_out([
    'saved'  => $result['saved'],
    'errors' => $result['errors'],
    'images' => list_images($dir, $url),
]);
