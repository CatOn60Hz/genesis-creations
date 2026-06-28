<?php
// POST /api/courses/save.php (form: id?, kind, title, subtitle, why, duration,
// schedule, format, certification, badge, who + JSON-encoded learn, choose,
// careers, modules + auth) -> { courses: [...], saved }.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$list          = courses_load();
$id            = trim((string) ($_POST['id'] ?? ''));
$kind          = courses_clean_kind(trim((string) ($_POST['kind'] ?? '')));
$title         = trim((string) ($_POST['title'] ?? ''));
$subtitle      = trim((string) ($_POST['subtitle'] ?? ''));
$why           = trim((string) ($_POST['why'] ?? ''));
$duration      = trim((string) ($_POST['duration'] ?? ''));
$schedule      = trim((string) ($_POST['schedule'] ?? ''));
$format        = trim((string) ($_POST['format'] ?? ''));
$certification = trim((string) ($_POST['certification'] ?? ''));
$badge         = trim((string) ($_POST['badge'] ?? ''));
$who           = trim((string) ($_POST['who'] ?? ''));

if ($title === '') {
    json_out(['error' => 'Title is required'], 400);
}

$fields = [
    'kind'          => $kind,
    'title'         => $title,
    'subtitle'      => $subtitle,
    'why'           => $why,
    'duration'      => $duration,
    'schedule'      => $schedule,
    'format'        => $format,
    'certification' => $certification,
    'badge'         => $badge,
    'who'           => $who,
    'learn'         => courses_decode_list($_POST['learn'] ?? ''),
    'modules'       => courses_decode_modules($_POST['modules'] ?? ''),
    'choose'        => courses_decode_list($_POST['choose'] ?? ''),
    'careers'       => courses_decode_list($_POST['careers'] ?? ''),
    'updatedAt'     => date('c'),
];

$existing = null;
foreach ($list as $c) {
    if (($c['id'] ?? '') === $id && $id !== '') {
        $existing = $c;
        break;
    }
}

if ($existing !== null) {
    $record = array_merge($existing, $fields);
    $list = array_map(static function ($c) use ($record) {
        return ($c['id'] ?? '') === $record['id'] ? $record : $c;
    }, $list);
} else {
    $maxOrder = -1;
    foreach ($list as $c) {
        $maxOrder = max($maxOrder, (int) ($c['order'] ?? 0));
    }
    $record = array_merge($fields, [
        'id'        => bin2hex(random_bytes(6)),
        'order'     => $maxOrder + 1,
        'createdAt' => date('c'),
    ]);
    $list[] = $record;
}

json_save(courses_store(), $list);
json_out(['courses' => courses_sorted($list), 'saved' => $record]);
