<?php
// GET /api/backgrounds/list.php -> { backgrounds: { slot: {name,url} } }
// (public). Empty when no slots have been customised.
require_once __DIR__ . '/_common.php';

send_cors();

// Cast to object so an empty store encodes as {} rather than [].
json_out(['backgrounds' => (object) backgrounds_load()]);
