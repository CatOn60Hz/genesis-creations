<?php
// GET /api/projector/list.php -> { images: [...], first: name|null } (public).
require_once __DIR__ . '/../_shared.php';

send_cors();

$dir   = GC_UPLOADS_DIR . '/projector';
$url   = GC_UPLOADS_URL . '/projector';
$first = json_load(GC_DATA_DIR . '/projector.json', [])['first'] ?? null;

json_out([
    'images' => order_first(list_images($dir, $url), $first),
    'first'  => $first,
]);
