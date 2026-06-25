<?php
// POST /api/announcement/save.php  (form: enabled, text, ctaLabel, ctaHref +
// X-Gallery-Password) -> the saved announcement.
require_once __DIR__ . '/../_shared.php';

send_cors();
require_auth();
require_post();

$enabled = ($_POST['enabled'] ?? '1');
$record = [
    'enabled'  => $enabled === '1' || $enabled === 'true' || $enabled === 'on',
    'text'     => trim((string) ($_POST['text'] ?? '')),
    'ctaLabel' => trim((string) ($_POST['ctaLabel'] ?? '')),
    'ctaHref'  => trim((string) ($_POST['ctaHref'] ?? '')),
];

if ($record['text'] === '') {
    json_out(['error' => 'Announcement text is required'], 400);
}

json_save(GC_DATA_DIR . '/announcement.json', $record);
json_out($record);
