<?php
// POST /api/home-courses/save.php (form: id?, kind, title, text + auth)
// -> { courses: [...], saved }. Creates when id is empty, else updates.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$list  = home_courses_load();
$id    = trim((string) ($_POST['id'] ?? ''));
$kind  = home_courses_clean_kind(trim((string) ($_POST['kind'] ?? '')));
$title = trim((string) ($_POST['title'] ?? ''));
$text  = trim((string) ($_POST['text'] ?? ''));

if ($title === '') {
    json_out(['error' => 'Title is required'], 400);
}

$existing = null;
foreach ($list as $c) {
    if (($c['id'] ?? '') === $id && $id !== '') {
        $existing = $c;
        break;
    }
}

if ($existing !== null) {
    $record = $existing;
    $record['kind']      = $kind;
    $record['title']     = $title;
    $record['text']      = $text;
    $record['updatedAt'] = date('c');
    $list = array_map(static function ($c) use ($record) {
        return ($c['id'] ?? '') === $record['id'] ? $record : $c;
    }, $list);
} else {
    $maxOrder = -1;
    foreach ($list as $c) {
        $maxOrder = max($maxOrder, (int) ($c['order'] ?? 0));
    }
    $record = [
        'id'        => bin2hex(random_bytes(6)),
        'kind'      => $kind,
        'title'     => $title,
        'text'      => $text,
        'order'     => $maxOrder + 1,
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];
    $list[] = $record;
}

json_save(home_courses_store(), $list);
json_out(['courses' => home_courses_sorted($list), 'saved' => $record]);
