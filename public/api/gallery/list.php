<?php
// GET /api/gallery/list.php -> { photos: [{ name, url }, ...] }
require_once __DIR__ . '/_common.php';

send_cors();
json_out(['photos' => list_photos()]);
