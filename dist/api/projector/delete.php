<?php
// POST /api/projector/delete.php (form: name + X-Gallery-Password)
// -> { items: [...] }. `name` is a filename, or "yt:<id>" for a YouTube item.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$name  = (string) ($_POST['name'] ?? '');
$store = GC_DATA_DIR . '/projector.json';
$meta  = json_load($store, []);

if (strpos($name, 'yt:') === 0) {
    $id = substr($name, 3);
    if (isset($meta['youtube']) && is_array($meta['youtube'])) {
        $meta['youtube'] = array_values(array_filter(
            $meta['youtube'],
            static fn($n) => $n !== $id
        ));
    }
} elseif (!delete_named(projector_dir(), $name)) {
    json_out(['error' => 'Invalid name'], 400);
}

// Drop the deleted item from the saved order.
if (isset($meta['order']) && is_array($meta['order'])) {
    $meta['order'] = array_values(array_filter(
        $meta['order'],
        static fn($n) => $n !== $name
    ));
}
json_save($store, $meta);

json_out(['items' => projector_items()]);
