<?php
// POST /api/courses/delete.php (form: id + auth) -> { courses: [...] }
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$id = trim((string) ($_POST['id'] ?? ''));
if ($id === '') {
    json_out(['error' => 'Missing id'], 400);
}

$list = courses_load();
$kept = array_values(array_filter($list, static function ($c) use ($id) {
    return ($c['id'] ?? '') !== $id;
}));

json_save(courses_store(), $kept);
json_out(['courses' => courses_sorted($kept)]);
