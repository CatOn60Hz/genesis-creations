<?php
// POST /api/projector/reorder.php (form: order=<JSON array of filenames> + auth)
// -> { items: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$order = json_decode((string) ($_POST['order'] ?? ''), true);
if (!is_array($order)) {
    json_out(['error' => 'Invalid order'], 400);
}

// Keep only plain filenames (no paths/traversal); preserve the given sequence.
$clean = [];
foreach ($order as $n) {
    if (is_string($n) && $n !== '' && basename($n) === $n) {
        $clean[] = $n;
    }
}

$store = GC_DATA_DIR . '/projector.json';
$meta  = json_load($store, []);
$meta['order'] = $clean;
json_save($store, $meta);

json_out(['items' => projector_items()]);
