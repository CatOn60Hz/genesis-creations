<?php
// GET /api/herovideo/stream.php?f=<file>
// Streams the hero video from the persistent uploads dir (outside the web root)
// with HTTP Range support — required for <video> playback in Safari/iOS and for
// seeking. Public, path-traversal safe.
require_once __DIR__ . '/../_shared.php';

$name = isset($_GET['f']) ? (string) $_GET['f'] : '';

// Filename only (no path), safe characters, no traversal.
if ($name === '' || basename($name) !== $name || !preg_match('#^[A-Za-z0-9._-]+$#', $name)) {
    http_response_code(404);
    exit;
}

$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
if (!array_key_exists($ext, GC_ALLOWED_VIDEO)) {
    http_response_code(404);
    exit;
}

$path     = GC_UPLOADS_DIR . '/herovideo/' . $name;
$real     = realpath($path);
$baseReal = realpath(GC_UPLOADS_DIR . '/herovideo');
if ($real === false || $baseReal === false ||
    strpos($real, $baseReal . DIRECTORY_SEPARATOR) !== 0 || !is_file($real)) {
    http_response_code(404);
    exit;
}

$size = filesize($real);
$start = 0;
$end   = $size - 1;

header('Content-Type: ' . GC_ALLOWED_VIDEO[$ext]);
header('Accept-Ranges: bytes');
header('Cache-Control: public, max-age=31536000, immutable');

// Honour a single byte-range request (bytes=start-end).
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
