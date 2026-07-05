<?php
// POST /api/faq/save.php (form: id?, question, answer + auth)
// -> { faqs: [...], saved }. Creates when id is empty, else updates.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$list     = faq_load();
$id       = trim((string) ($_POST['id'] ?? ''));
$question = trim((string) ($_POST['question'] ?? ''));
$answer   = trim((string) ($_POST['answer'] ?? ''));

if ($question === '' || $answer === '') {
    json_out(['error' => 'Question and answer are required'], 400);
}

$existing = null;
foreach ($list as $f) {
    if (($f['id'] ?? '') === $id && $id !== '') {
        $existing = $f;
        break;
    }
}

if ($existing !== null) {
    $record = $existing;
    $record['question']  = $question;
    $record['answer']    = $answer;
    $record['updatedAt'] = date('c');
    $list = array_map(static function ($f) use ($record) {
        return ($f['id'] ?? '') === $record['id'] ? $record : $f;
    }, $list);
} else {
    $maxOrder = -1;
    foreach ($list as $f) {
        $maxOrder = max($maxOrder, (int) ($f['order'] ?? 0));
    }
    $record = [
        'id'        => bin2hex(random_bytes(6)),
        'question'  => $question,
        'answer'    => $answer,
        'order'     => $maxOrder + 1,
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];
    $list[] = $record;
}

json_save(faq_store(), $list);
json_out(['faqs' => faq_sorted($list), 'saved' => $record]);
