<?php
// POST /api/workshops/delete.php (form: id + X-Gallery-Password)
// -> { workshops: [...] }
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$id = trim((string) ($_POST['id'] ?? ''));
if ($id === '') {
    json_out(['error' => 'Missing id'], 400);
}

$store = GC_DATA_DIR . '/workshops.json';
$workshops = json_load($store, []);

$kept = [];
foreach ($workshops as $w) {
    if (($w['id'] ?? '') === $id) {
        if (!empty($w['banner']['name'])) {
            delete_named(GC_UPLOADS_DIR . '/workshops', $w['banner']['name']);
        }
        continue;
    }
    $kept[] = $w;
}

json_save($store, $kept);
json_out(['workshops' => $kept]);
