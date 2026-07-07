<?php
// POST /api/workshops/reorder.php (form: order=<JSON array of ids> + auth)
// -> { workshops: [...] }. Rewrites the stored array into the given order;
// list.php returns it as-is, so array order IS display order.
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$order = json_decode((string) ($_POST['order'] ?? ''), true);
if (!is_array($order)) {
    json_out(['error' => 'Invalid order'], 400);
}

$store = GC_DATA_DIR . '/workshops.json';
$workshops = json_load($store, []);

// Index existing records by id so we can re-emit them in the requested order.
$byId = [];
foreach ($workshops as $w) {
    $byId[(string) ($w['id'] ?? '')] = $w;
}

$ordered = [];
foreach ($order as $id) {
    $id = (string) $id;
    if ($id !== '' && isset($byId[$id])) {
        $ordered[] = $byId[$id];
        unset($byId[$id]);
    }
}
// Append any records not named in the order (safety against drift).
foreach ($byId as $w) {
    $ordered[] = $w;
}

json_save($store, $ordered);
json_out(['workshops' => $ordered]);
