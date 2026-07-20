<?php
// POST /api/faq/reorder.php (form: order=<JSON array of ids> + auth)
// -> { faqs: [...] }. Rewrites each record's `order` to its index.
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

$list = faq_load();
foreach ($list as &$f) {
    if (isset($pos[$f['id'] ?? ''])) {
        $f['order'] = $pos[$f['id']];
    }
}
unset($f);

json_save(faq_store(), $list);
json_out(['faqs' => faq_sorted($list)]);
