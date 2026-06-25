<?php
// POST /api/workshops/save.php (multipart: id?, title, description, date,
// location, banner? + X-Gallery-Password) -> { workshops: [...] }.
// Creates a workshop when id is empty, otherwise updates the matching one.
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$store = GC_DATA_DIR . '/workshops.json';
$workshops = json_load($store, []);

$id          = trim((string) ($_POST['id'] ?? ''));
$title       = trim((string) ($_POST['title'] ?? ''));
$description = trim((string) ($_POST['description'] ?? ''));
$date        = trim((string) ($_POST['date'] ?? ''));
$location    = trim((string) ($_POST['location'] ?? ''));

if ($title === '') {
    json_out(['error' => 'Title is required'], 400);
}

// Find existing record (for updates) so we can keep its banner if no new one.
$existing = null;
foreach ($workshops as $w) {
    if (($w['id'] ?? '') === $id && $id !== '') {
        $existing = $w;
        break;
    }
}

// Optional banner upload (single image under the `banner` field).
$banner = $existing['banner'] ?? null;
if (!empty($_FILES['banner']['name'])) {
    $dir = GC_UPLOADS_DIR . '/workshops';
    ensure_dir($dir, true);
    $errors = [];
    $final = save_one_image(
        (string) $_FILES['banner']['name'],
        $_FILES['banner']['tmp_name'],
        $_FILES['banner']['error'],
        (int) $_FILES['banner']['size'],
        $dir,
        $errors
    );
    if ($final === null) {
        json_out(['error' => $errors[0] ?? 'Banner upload failed'], 400);
    }
    // Remove the previous banner file now that a new one replaced it.
    if (!empty($existing['banner']['name'])) {
        delete_named($dir, $existing['banner']['name']);
    }
    $banner = ['name' => $final, 'url' => GC_UPLOADS_URL . '/workshops/' . rawurlencode($final)];
}

$record = [
    'id'          => $id !== '' ? $id : bin2hex(random_bytes(6)),
    'title'       => $title,
    'description' => $description,
    'date'        => $date,
    'location'    => $location,
    'banner'      => $banner,
    'updatedAt'   => date('c'),
];

if ($existing !== null) {
    // Replace in place.
    $workshops = array_map(static function ($w) use ($record) {
        return ($w['id'] ?? '') === $record['id'] ? $record : $w;
    }, $workshops);
} else {
    // Newest first.
    $record['createdAt'] = date('c');
    array_unshift($workshops, $record);
}

json_save($store, $workshops);
json_out(['workshops' => $workshops, 'saved' => $record]);
