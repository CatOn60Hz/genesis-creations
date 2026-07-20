<?php
// POST /api/backgrounds/delete.php (form: slot + X-Gallery-Password)
// -> { backgrounds: { slot: {name,url} } }. Clears the slot, reverting the page
// to its bundled image.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$slot = trim((string) ($_POST['slot'] ?? ''));

$data = backgrounds_load();
if (isset($data[$slot])) {
    if (!empty($data[$slot]['name'])) {
        delete_named(backgrounds_dir(), $data[$slot]['name']);
    }
    unset($data[$slot]);
    json_save(backgrounds_store(), $data);
}

json_out(['backgrounds' => (object) $data]);
