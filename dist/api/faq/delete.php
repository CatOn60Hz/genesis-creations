<?php
// POST /api/faq/delete.php (form: id + auth) -> { faqs: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$id = trim((string) ($_POST['id'] ?? ''));
if ($id === '') {
    json_out(['error' => 'Missing id'], 400);
}

$list = faq_load();
$kept = array_values(array_filter($list, static function ($f) use ($id) {
    return ($f['id'] ?? '') !== $id;
}));

json_save(faq_store(), $kept);
json_out(['faqs' => faq_sorted($kept)]);
