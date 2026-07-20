<?php
// POST /api/testimonials/reorder.php (form: order=<JSON array of ids> + auth)
// -> { testimonials: [...] }. Rewrites each record's `order` to its index.
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

$list = testimonials_load();
foreach ($list as &$t) {
    if (isset($pos[$t['id'] ?? ''])) {
        $t['order'] = $pos[$t['id']];
    }
}
unset($t);

json_save(testimonials_store(), $list);
json_out(['testimonials' => testimonials_sorted($list)]);
