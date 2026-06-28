<?php
// GET /api/projector/list.php -> { items: [{ name, type, url }] }
// Public: the home-screen slideshow reads this (photos + videos, in order).
require_once __DIR__ . '/_common.php';

send_cors();
json_out(['items' => projector_items()]);
