<?php
// POST /api/courses/reorder.php (form: order=<JSON array of ids> + auth)
// -> { courses: [...] }. Rewrites each record's `order` to its index.
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

$list = courses_load();
foreach ($list as &$c) {
    if (isset($pos[$c['id'] ?? ''])) {
        $c['order'] = $pos[$c['id']];
    }
}
unset($c);

json_save(courses_store(), $list);
json_out(['courses' => courses_sorted($list)]);
