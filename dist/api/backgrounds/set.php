<?php
// POST /api/backgrounds/set.php (multipart: slot, image + X-Gallery-Password)
// -> { backgrounds: { slot: {name,url} } }. Replaces the slot's image.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$slot = trim((string) ($_POST['slot'] ?? ''));
if (!in_array($slot, GC_BG_SLOTS, true)) {
    json_out(['error' => 'Unknown background slot'], 400);
}
if (empty($_FILES['image']['name'])) {
    json_out(['error' => 'No image uploaded'], 400);
}

$dir = backgrounds_dir();
ensure_dir($dir, true);
$errors = [];
$final = save_one_image(
    (string) $_FILES['image']['name'],
    $_FILES['image']['tmp_name'],
    $_FILES['image']['error'],
    (int) $_FILES['image']['size'],
    $dir,
    $errors
);
if ($final === null) {
    json_out(['error' => $errors[0] ?? 'Image upload failed'], 400);
}

$data = backgrounds_load();
// Remove the previous file for this slot now that a new one replaced it.
if (!empty($data[$slot]['name'])) {
    delete_named($dir, $data[$slot]['name']);
}
$data[$slot] = ['name' => $final, 'url' => backgrounds_url($final)];

json_save(backgrounds_store(), $data);
json_out(['backgrounds' => (object) $data]);
