<?php
// GET /api/reels/list.php -> { items: [{ id, kind, videoId? , name?, url? }] }
// Public: the home-page reel wall reads this (youtube + file reels, in order).
require_once __DIR__ . '/_common.php';

send_cors();
json_out(['items' => reels_public(reels_load())]);
