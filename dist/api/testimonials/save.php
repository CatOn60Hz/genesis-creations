<?php
// POST /api/testimonials/save.php (multipart: id?, quote, author, role?,
// image? + X-Gallery-Password) -> { testimonials: [...], saved }.
// Creates when id is empty, otherwise updates the matching record.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$list   = testimonials_load();
$id     = trim((string) ($_POST['id'] ?? ''));
$quote  = trim((string) ($_POST['quote'] ?? ''));
$author = trim((string) ($_POST['author'] ?? ''));
$role   = trim((string) ($_POST['role'] ?? ''));

if ($quote === '' || $author === '') {
    json_out(['error' => 'Quote and author are required'], 400);
}

// Find existing record (for updates) so we can keep its image if none uploaded.
$existing = null;
foreach ($list as $t) {
    if (($t['id'] ?? '') === $id && $id !== '') {
        $existing = $t;
        break;
    }
}

// Optional portrait upload (single image under the `image` field).
$image = $existing['image'] ?? null;
if (!empty($_FILES['image']['name'])) {
    $dir = testimonials_dir();
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
    if (!empty($existing['image']['name'])) {
        delete_named($dir, $existing['image']['name']);
    }
    $image = ['name' => $final, 'url' => testimonials_url($final)];
}

if ($existing !== null) {
    $record = $existing;
    $record['quote']     = $quote;
    $record['author']    = $author;
    $record['role']      = $role;
    $record['image']     = $image;
    $record['updatedAt'] = date('c');
    $list = array_map(static function ($t) use ($record) {
        return ($t['id'] ?? '') === $record['id'] ? $record : $t;
    }, $list);
} else {
    $maxOrder = -1;
    foreach ($list as $t) {
        $maxOrder = max($maxOrder, (int) ($t['order'] ?? 0));
    }
    $record = [
        'id'        => bin2hex(random_bytes(6)),
        'quote'     => $quote,
        'author'    => $author,
        'role'      => $role,
        'image'     => $image,
        'order'     => $maxOrder + 1,
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];
    $list[] = $record;
}

json_save(testimonials_store(), $list);
json_out(['testimonials' => testimonials_sorted($list), 'saved' => $record]);
