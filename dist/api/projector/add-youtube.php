<?php
// POST /api/projector/add-youtube.php (form: url + X-Gallery-Password)
// -> { items: [...] }. Adds a YouTube video to the home-screen slideshow from
// any watch / Shorts / youtu.be URL (or a bare 11-char id).
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$url = (string) ($_POST['url'] ?? '');
$id  = projector_youtube_id($url);
if ($id === null) {
    json_out(['error' => 'Could not find a YouTube video id in that link'], 400);
}

$store = GC_DATA_DIR . '/projector.json';
$meta  = json_load($store, []);

$yt = (isset($meta['youtube']) && is_array($meta['youtube'])) ? $meta['youtube'] : [];
if (in_array($id, $yt, true)) {
    json_out(['error' => 'That video is already in the slideshow'], 400);
}
$yt[] = $id;
$meta['youtube'] = $yt;

$order = (isset($meta['order']) && is_array($meta['order'])) ? $meta['order'] : [];
$order[] = 'yt:' . $id;
$meta['order'] = $order;

json_save($store, $meta);

json_out(['items' => projector_items()]);
