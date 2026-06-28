<?php
// POST /api/herovideo/delete.php (X-Gallery-Password) -> { video: null }
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$store = GC_DATA_DIR . '/herovideo.json';
$prev = json_load($store, null);
if (is_array($prev) && !empty($prev['name'])) {
    delete_named(GC_UPLOADS_DIR . '/herovideo', $prev['name']);
}
@unlink($store);

json_out(['video' => null]);
