<?php
// GET /api/announcement/get.php -> the current announcement (public).
require_once __DIR__ . '/../_shared.php';

send_cors();

$default = [
    'enabled'  => true,
    'text'     => 'New: Media Production Masterclass series launches next week!',
    'ctaLabel' => 'Register now',
    'ctaHref'  => '/academy',
];

json_out(json_load(GC_DATA_DIR . '/announcement.json', $default));
