<?php
// Shared helpers for the gallery API. Not a routable endpoint on its own.

require_once __DIR__ . '/config.php';

// Emit CORS headers and short-circuit preflight (OPTIONS) requests.
function send_cors(): void
{
    if (CORS_ORIGIN !== '') {
        header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
        header('Access-Control-Allow-Headers: Content-Type, X-Gallery-Password');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// Send a JSON response and stop. API responses must never be cached —
// LiteSpeed/proxies would otherwise serve a stale list (e.g. an empty gallery)
// long after photos are uploaded.
function json_out($data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('X-LiteSpeed-Cache-Control: no-cache');
    echo json_encode($data);
    exit;
}

// Reject the request unless the correct admin password was supplied, either via
// the X-Gallery-Password header or a `password` form field.
function require_auth(): void
{
    $given = $_SERVER['HTTP_X_GALLERY_PASSWORD'] ?? ($_POST['password'] ?? '');
    if (!is_string($given) || !hash_equals(ADMIN_PASSWORD, $given)) {
        json_out(['error' => 'Unauthorized'], 401);
    }
}

// Ensure the upload directory exists and can never execute uploaded files.
function ensure_upload_dir(): void
{
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    $htaccess = UPLOAD_DIR . '/.htaccess';
    if (!file_exists($htaccess)) {
        file_put_contents(
            $htaccess,
            "php_flag engine off\n" .
            "RemoveHandler .php .phtml .php3 .php4 .php5 .php7 .phps\n" .
            "RemoveType .php .phtml\n" .
            "Options -ExecCGI\n"
        );
    }
}

// Return the gallery photos as [{ name, url }, ...], newest first.
function list_photos(): array
{
    if (!is_dir(UPLOAD_DIR)) {
        return [];
    }

    $files = [];
    foreach (scandir(UPLOAD_DIR) as $f) {
        if ($f === '' || $f[0] === '.') {
            continue;
        }
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!array_key_exists($ext, ALLOWED)) {
            continue;
        }
        $files[] = $f;
    }

    // Newest first by modification time.
    usort($files, static function ($a, $b) {
        return filemtime(UPLOAD_DIR . '/' . $b) <=> filemtime(UPLOAD_DIR . '/' . $a);
    });

    return array_map(static function ($f) {
        return [
            'name' => $f,
            'url'  => UPLOAD_URL_BASE . '/' . rawurlencode($f),
        ];
    }, $files);
}
