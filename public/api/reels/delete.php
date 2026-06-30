<?php
// POST /api/reels/delete.php (form: name + X-Gallery-Password)
// -> { items: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$name = (string) ($_POST['name'] ?? '');
if (!delete_named(reels_dir(), $name)) {
    json_out(['error' => 'Invalid name'], 400);
}

// Drop the deleted file from the saved order.
$store = GC_DATA_DIR . '/reels.json';
$meta  = json_load($store, []);
if (isset($meta['order']) && is_array($meta['order'])) {
    $meta['order'] = array_values(array_filter(
        $meta['order'],
        static fn($n) => $n !== $name
    ));
    json_save($store, $meta);
}

json_out(['items' => reels_items()]);
