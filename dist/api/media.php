<?php
// Streams an uploaded image from the persistent uploads dir, which lives OUTSIDE
// the web root (so deploys can't wipe it) and therefore can't be served as a
// plain static file.
//
//   URL:  /api/media.php/<section>/<file>     (e.g. /api/media.php/gallery/x.jpg)
//   also: /api/media.php?f=<section>/<file>   (fallback if PATH_INFO is off)
//
// Filenames are unique (random suffix on upload) and immutable, so responses
// carry a long cache lifetime.
require_once __DIR__ . '/_shared.php';

// Accept either PATH_INFO (/api/media.php/gallery/x.jpg) or ?f=gallery/x.jpg.
$rel = $_SERVER['PATH_INFO'] ?? '';
if ($rel === '' && isset($_GET['f'])) {
    $rel = '/' . ltrim((string) $_GET['f'], '/');
}
$rel = ltrim($rel, '/');

// Shape must be "<section>/<filename>" with safe characters and no traversal.
if (strpos($rel, '..') !== false ||
    !preg_match('#^[a-z0-9_-]+/[A-Za-z0-9._-]+$#', $rel)) {
    http_response_code(404);
    exit;
}

$path     = GC_UPLOADS_DIR . '/' . $rel;
$real     = realpath($path);
$baseReal = realpath(GC_UPLOADS_DIR);

// Resolve and confirm the file really sits inside the uploads dir.
if ($real === false || $baseReal === false ||
    strpos($real, $baseReal . DIRECTORY_SEPARATOR) !== 0 || !is_file($real)) {
    http_response_code(404);
    exit;
}

$ext = strtolower(pathinfo($real, PATHINFO_EXTENSION));
if (!array_key_exists($ext, GC_ALLOWED)) {
    http_response_code(404);
    exit;
}

header('Content-Type: ' . GC_ALLOWED[$ext]);
header('Content-Length: ' . filesize($real));
header('Cache-Control: public, max-age=31536000, immutable');
readfile($real);
exit;
