<?php
// GET /api/projector/list.php -> { images: [{ name, url }, ...] } (public).
require_once __DIR__ . '/../_shared.php';

send_cors();
json_out(['images' => list_images(GC_UPLOADS_DIR . '/projector', GC_UPLOADS_URL . '/projector')]);
