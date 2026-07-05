<?php
// GET /api/testimonials/list.php -> { testimonials: [...] } (public, ordered).
require_once __DIR__ . '/_common.php';

send_cors();

json_out(['testimonials' => testimonials_sorted(testimonials_load())]);
