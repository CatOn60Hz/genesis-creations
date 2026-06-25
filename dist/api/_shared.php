<?php
// Shared helpers for the Genesis Creations CMS API. Not a routable endpoint.

require_once __DIR__ . '/config.php';

// Emit CORS headers and short-circuit preflight (OPTIONS) requests.
function send_cors(): void
{
    if (GC_CORS_ORIGIN !== '') {
        header('Access-Control-Allow-Origin: ' . GC_CORS_ORIGIN);
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

// Reject unless the correct admin password was supplied, via the
// X-Gallery-Password header or a `password` form field.
function require_auth(): void
{
    $given = $_SERVER['HTTP_X_GALLERY_PASSWORD'] ?? ($_POST['password'] ?? '');
    if (!is_string($given) || !hash_equals(GC_ADMIN_PASSWORD, $given)) {
        json_out(['error' => 'Unauthorized'], 401);
    }
}

// Require POST, else 405.
function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        json_out(['error' => 'Method not allowed'], 405);
    }
}

// Ensure a directory exists. When $guard is true (upload dirs), drop an
// .htaccess so nothing inside can ever be executed as a script.
function ensure_dir(string $dir, bool $guard = false): void
{
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if ($guard) {
        $htaccess = $dir . '/.htaccess';
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
}

// Read a JSON data file, returning $default when it is missing/unreadable.
function json_load(string $path, $default)
{
    if (!is_file($path)) {
        return $default;
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return $data === null ? $default : $data;
}

// Write a JSON data file (pretty-printed), creating the data dir if needed.
function json_save(string $path, $data): void
{
    ensure_dir(dirname($path));
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// List image files in $dir as [{ name, url }, ...], newest first.
function list_images(string $dir, string $urlBase): array
{
    if (!is_dir($dir)) {
        return [];
    }
    $files = [];
    foreach (scandir($dir) as $f) {
        if ($f === '' || $f[0] === '.') {
            continue;
        }
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!array_key_exists($ext, GC_ALLOWED)) {
            continue;
        }
        $files[] = $f;
    }
    usort($files, static function ($a, $b) use ($dir) {
        return filemtime("$dir/$b") <=> filemtime("$dir/$a");
    });
    return array_map(static function ($f) use ($urlBase) {
        return ['name' => $f, 'url' => $urlBase . '/' . rawurlencode($f)];
    }, $files);
}

// Move the admin-chosen "first" image to the front of a list (stable order).
function order_first(array $images, ?string $first): array
{
    if ($first === null || $first === '') {
        return $images;
    }
    $featured = null;
    $rest = [];
    foreach ($images as $img) {
        if ($featured === null && ($img['name'] ?? null) === $first) {
            $featured = $img;
        } else {
            $rest[] = $img;
        }
    }
    return $featured !== null ? array_merge([$featured], $rest) : $images;
}

// Validate + save one uploaded image. Returns the saved filename, or null on
// failure (with a reason pushed onto &$errors).
function save_one_image(string $name, $tmp, int $err, int $size, string $destDir, array &$errors): ?string
{
    if ($err !== UPLOAD_ERR_OK) {
        $errors[] = "$name: upload error ($err)";
        return null;
    }
    if ($size > GC_MAX_BYTES) {
        $errors[] = "$name: too large (max 15 MB)";
        return null;
    }
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!array_key_exists($ext, GC_ALLOWED)) {
        $errors[] = "$name: file type not allowed";
        return null;
    }
    if (@getimagesize($tmp) === false) {
        $errors[] = "$name: not a valid image";
        return null;
    }
    $base = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($name, PATHINFO_FILENAME));
    $base = substr(trim((string) $base, '-'), 0, 60);
    if ($base === '') {
        $base = 'image';
    }
    $final = $base . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (move_uploaded_file($tmp, "$destDir/$final")) {
        @chmod("$destDir/$final", 0644);
        return $final;
    }
    $errors[] = "$name: could not save";
    return null;
}

// Save every file uploaded under $field (an array input like name[]).
// Returns ['saved' => string[], 'errors' => string[]].
function save_uploaded_images(string $field, string $destDir, bool $guard = true): array
{
    ensure_dir($destDir, $guard);
    $saved = [];
    $errors = [];
    if (empty($_FILES[$field]) || !is_array($_FILES[$field]['name'])) {
        return ['saved' => $saved, 'errors' => $errors];
    }
    $f = $_FILES[$field];
    for ($i = 0, $n = count($f['name']); $i < $n; $i++) {
        $final = save_one_image((string) $f['name'][$i], $f['tmp_name'][$i], $f['error'][$i], $f['size'][$i], $destDir, $errors);
        if ($final !== null) {
            $saved[] = $final;
        }
    }
    return ['saved' => $saved, 'errors' => $errors];
}

// Delete a single named file from $dir (path-traversal safe). No-op if absent.
function delete_named(string $dir, string $name): bool
{
    if ($name === '' || basename($name) !== $name) {
        return false;
    }
    $path = "$dir/$name";
    if (is_file($path)) {
        @unlink($path);
    }
    return true;
}
