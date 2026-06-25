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

// If the removed image was pinned to show first, forget that choice.
$store = GC_DATA_DIR . '/projector.json';
$meta = json_load($store, []);
if (($meta['first'] ?? null) === $name) {
    unset($meta['first']);
    json_save($store, $meta);
}
$first = $meta['first'] ?? null;

json_out([
    'images' => order_first(list_images($dir, $url), $first),
    'first'  => $first,
]);
