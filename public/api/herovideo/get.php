<?php
// GET /api/herovideo/get.php -> { video: { name, url } | null }
// Public: the home-page hero reads this to add the video to its slideshow.
require_once __DIR__ . '/../_shared.php';

send_cors();

$video = json_load(GC_DATA_DIR . '/herovideo.json', null);
json_out([
    'video' => (is_array($video) && !empty($video['name'])) ? $video : null,
]);
