<?php
// GET /api/home-courses/list.php -> { courses: [...] } (public, ordered).
require_once __DIR__ . '/_common.php';

send_cors();

json_out(['courses' => home_courses_sorted(home_courses_load())]);
