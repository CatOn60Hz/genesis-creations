<?php
// GET /api/courses/list.php -> { courses: [...] } (public, ordered).
require_once __DIR__ . '/_common.php';

send_cors();

json_out(['courses' => courses_sorted(courses_load())]);
