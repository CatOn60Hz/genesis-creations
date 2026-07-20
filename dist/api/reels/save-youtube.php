<?php
// POST /api/reels/save-youtube.php (form: url + X-Gallery-Password)
// -> { items: [...], saved }
// Adds a YouTube reel from any watch/shorts/youtu.be URL (or a bare 11-char id).
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$url     = (string) ($_POST['url'] ?? '');
$videoId = reels_youtube_id($url);
if ($videoId === null) {
    json_out(['error' => 'Could not find a YouTube video id in that link'], 400);
}

$records = reels_load();

// Ignore duplicates of the same video.
foreach ($records as $r) {
    if (($r['kind'] ?? '') === 'youtube' && ($r['videoId'] ?? '') === $videoId) {
        json_out(['error' => 'That video is already in the reels'], 400);
    }
}

$record = [
    'id'        => bin2hex(random_bytes(6)),
    'kind'      => 'youtube',
    'videoId'   => $videoId,
    'order'     => reels_max_order($records) + 1,
    'createdAt' => date('c'),
    'updatedAt' => date('c'),
];
$records[] = $record;

json_save(reels_store(), $records);

json_out(['items' => reels_public($records), 'saved' => $record]);
