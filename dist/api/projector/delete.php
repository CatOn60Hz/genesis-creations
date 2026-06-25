<?php
// POST /api/projector/delete.php (form: name + X-Gallery-Password)
// -> { images: [...] }
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$dir = GC_UPLOADS_DIR . '/projector';
$url = GC_UPLOADS_URL . '/projector';

$name = (string) ($_POST['name'] ?? '');
if (!delete_named($dir, $name)) {
    json_out(['error' => 'Invalid name'], 400);
}

json_out(['images' => list_images($dir, $url)]);
