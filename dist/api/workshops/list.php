<?php
// GET /api/workshops/list.php -> { workshops: [...] } (public, newest first).
require_once __DIR__ . '/../_shared.php';

send_cors();

$workshops = json_load(GC_DATA_DIR . '/workshops.json', []);
json_out(['workshops' => $workshops]);
