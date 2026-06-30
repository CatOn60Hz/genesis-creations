<?php
// GET /api/reels/list.php -> { items: [{ name, type, url }] }
// Public: the home-page reel wall reads this (videos, in order).
require_once __DIR__ . '/_common.php';

send_cors();
json_out(['items' => reels_items()]);
