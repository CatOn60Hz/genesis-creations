<?php
// POST /api/testimonials/delete.php (form: id + X-Gallery-Password)
// -> { testimonials: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$id = trim((string) ($_POST['id'] ?? ''));
if ($id === '') {
    json_out(['error' => 'Missing id'], 400);
}

$list = testimonials_load();
$kept = [];
foreach ($list as $t) {
    if (($t['id'] ?? '') === $id) {
        if (!empty($t['image']['name'])) {
            delete_named(testimonials_dir(), $t['image']['name']);
        }
        continue;
    }
    $kept[] = $t;
}

json_save(testimonials_store(), $kept);
json_out(['testimonials' => testimonials_sorted($kept)]);
