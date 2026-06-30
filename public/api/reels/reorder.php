<?php
// POST /api/reels/reorder.php (form: order=<JSON array of record ids> + auth)
// -> { items: [...] }. Rewrites each record's `order` to its index.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$order = json_decode((string) ($_POST['order'] ?? ''), true);
if (!is_array($order)) {
    json_out(['error' => 'Invalid order'], 400);
}

$pos = [];
foreach ($order as $i => $id) {
    if (is_string($id) && $id !== '') {
        $pos[$id] = $i;
    }
}

$records = reels_load();
foreach ($records as &$r) {
    if (isset($pos[$r['id'] ?? ''])) {
        $r['order'] = $pos[$r['id']];
    }
}
unset($r);

json_save(reels_store(), $records);
json_out(['items' => reels_public($records)]);
