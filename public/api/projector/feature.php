<?php
// POST /api/projector/feature.php (form: name + X-Gallery-Password)
// Pins one home-screen photo so it appears first in the rotation.
// -> { images: [...], first: name }
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$dir  = GC_UPLOADS_DIR . '/projector';
$url  = GC_UPLOADS_URL . '/projector';
$name = (string) ($_POST['name'] ?? '');

// Must be a real file in the projector dir (basename guards against traversal).
if ($name === '' || basename($name) !== $name || !is_file("$dir/$name")) {
    json_out(['error' => 'Invalid name'], 400);
}

$store = GC_DATA_DIR . '/projector.json';
$meta = json_load($store, []);
$meta['first'] = $name;
json_save($store, $meta);

json_out([
    'images' => order_first(list_images($dir, $url), $name),
    'first'  => $name,
]);
