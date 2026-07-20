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
$tagline     = trim((string) ($_POST['tagline'] ?? ''));
$badge       = trim((string) ($_POST['badge'] ?? ''));
$icon        = trim((string) ($_POST['icon'] ?? ''));
$registerUrl = trim((string) ($_POST['registerUrl'] ?? ''));
$note        = trim((string) ($_POST['note'] ?? ''));

if ($title === '') {
    json_out(['error' => 'Title is required'], 400);
}

// Lists arrive as JSON strings (FormData is flat). Decode + trim, drop blanks.
$decode_list = static function ($raw): array {
    $out = [];
    $arr = json_decode((string) $raw, true);
    if (is_array($arr)) {
        foreach ($arr as $v) {
            $v = trim((string) $v);
            if ($v !== '') {
                $out[] = $v;
            }
        }
    }
    return $out;
};
$learn    = $decode_list($_POST['learn'] ?? '');
$included = $decode_list($_POST['included'] ?? '');

// Sessions: array of { city, dates, timing, venue }. A city is required.
$sessions = [];
$sessRaw = json_decode((string) ($_POST['sessions'] ?? ''), true);
if (is_array($sessRaw)) {
    foreach ($sessRaw as $s) {
        if (!is_array($s)) {
            continue;
        }
        $city = trim((string) ($s['city'] ?? ''));
        if ($city === '') {
            continue;
        }
        $sessions[] = [
            'city'   => $city,
            'dates'  => trim((string) ($s['dates'] ?? '')),
            'timing' => trim((string) ($s['timing'] ?? '')),
            'venue'  => trim((string) ($s['venue'] ?? '')),
        ];
    }
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
    'tagline'     => $tagline,
    'badge'       => $badge,
    'icon'        => $icon,
    'registerUrl' => $registerUrl,
    'note'        => $note,
    'sessions'    => $sessions,
    'learn'       => $learn,
    'included'    => $included,
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
