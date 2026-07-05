<?php
// POST /api/reels/delete.php (form: id + X-Gallery-Password)
// -> { items: [...] }. Removes the record; for file reels, deletes the upload.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$id = trim((string) ($_POST['id'] ?? ''));
if ($id === '') {
    json_out(['error' => 'Missing id'], 400);
}

$records = reels_load();
$kept    = [];
foreach ($records as $r) {
    if (($r['id'] ?? '') === $id) {
        if (($r['kind'] ?? '') === 'file' && !empty($r['file'])) {
            delete_named(reels_dir(), (string) $r['file']);
        }
        continue;
    }
    $kept[] = $r;
}

json_save(reels_store(), $kept);
json_out(['items' => reels_public($kept)]);
