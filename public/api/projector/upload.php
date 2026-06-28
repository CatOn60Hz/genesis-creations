<?php
// POST /api/projector/upload.php (multipart: photos[] + X-Gallery-Password)
// -> { saved: [...], errors: [...], items: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$result = save_uploaded_images('photos', projector_dir());

json_out([
    'saved'  => $result['saved'],
    'errors' => $result['errors'],
    'items'  => projector_items(),
]);
