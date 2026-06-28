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
// The filename class allows spaces and parentheses too, so files placed on the
// server directly (e.g. "36(1).jpg", not run through the upload sanitizer) still
// serve. Traversal is blocked by the '..' guard plus the realpath check below.
if (strpos($rel, '..') !== false ||
    !preg_match('#^[a-z0-9_-]+/[A-Za-z0-9 ._()-]+$#', $rel)) {
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

$ext  = strtolower(pathinfo($real, PATHINFO_EXTENSION));
$mime = GC_ALLOWED[$ext] ?? (GC_ALLOWED_VIDEO[$ext] ?? null);
if ($mime === null) {
    http_response_code(404);
    exit;
}

$size  = filesize($real);
$start = 0;
$end   = $size - 1;

header('Content-Type: ' . $mime);
header('Accept-Ranges: bytes');
header('Cache-Control: public, max-age=31536000, immutable');

// Honour a single byte-range request (bytes=start-end). Required for <video>
// playback in Safari/iOS and for seeking; harmless for images (which are
// usually requested whole).
$range = $_SERVER['HTTP_RANGE'] ?? '';
if ($range !== '' && preg_match('/bytes=(\d*)-(\d*)/', $range, $m)) {
    if ($m[1] !== '') {
        $start = (int) $m[1];
    }
    if ($m[2] !== '') {
        $end = (int) $m[2];
    }
    if ($start > $end || $start >= $size) {
        header('Content-Range: bytes */' . $size);
        http_response_code(416);
        exit;
    }
    $end = min($end, $size - 1);
    http_response_code(206);
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
}

$length = $end - $start + 1;
header('Content-Length: ' . $length);

if ($start === 0 && $end === $size - 1) {
    readfile($real);
    exit;
}

$fp = fopen($real, 'rb');
if ($fp === false) {
    http_response_code(500);
    exit;
}
fseek($fp, $start);
$bufSize   = 8192;
$remaining = $length;
while ($remaining > 0 && !feof($fp)) {
    $read = $remaining > $bufSize ? $bufSize : $remaining;
    echo fread($fp, $read);
    $remaining -= $read;
    @ob_flush();
    @flush();
}
fclose($fp);
exit;
