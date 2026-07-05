<?php
// GET /api/faq/list.php -> { faqs: [...] } (public, ordered).
require_once __DIR__ . '/_common.php';

send_cors();

json_out(['faqs' => faq_sorted(faq_load())]);
