<?php
// POST /api/reels/upload.php (multipart: videos[] + X-Gallery-Password)
// -> { saved: [...], errors: [...], items: [...] }
// Saves each video to uploads/reels/ and appends a "file" reel record.
require_once __DIR__ . '/_common.php';

send_cors();
require_auth();
require_post();

$dir = reels_dir();
ensure_dir($dir, true);

$records = reels_load();
$order   = reels_max_order($records);
$saved   = [];
$errors  = [];

if (!empty($_FILES['videos']) && is_array($_FILES['videos']['name'])) {
    $f = $_FILES['videos'];
    for ($i = 0, $n = count($f['name']); $i < $n; $i++) {
        $name = (string) $f['name'][$i];
        if ($f['error'][$i] !== UPLOAD_ERR_OK) {
            $errors[] = "$name: upload error ({$f['error'][$i]})";
            continue;
        }
        if ($f['size'][$i] > GC_MAX_BYTES) {
            $errors[] = "$name: too large (max 50 MB)";
            continue;
        }
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!array_key_exists($ext, GC_ALLOWED_VIDEO)) {
            $errors[] = "$name: file type not allowed (mp4, webm, mov, ogg)";
            continue;
        }
        $base = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($name, PATHINFO_FILENAME));
        $base = substr(trim((string) $base, '-'), 0, 60);
        if ($base === '') {
            $base = 'reel';
        }
        $final = $base . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
        if (move_uploaded_file($f['tmp_name'][$i], "$dir/$final")) {
            @chmod("$dir/$final", 0644);
            $records[] = [
                'id'        => bin2hex(random_bytes(6)),
                'kind'      => 'file',
                'file'      => $final,
                'order'     => ++$order,
                'createdAt' => date('c'),
                'updatedAt' => date('c'),
            ];
            $saved[] = $final;
        } else {
            $errors[] = "$name: could not save";
        }
    }
}

json_save(reels_store(), $records);

json_out([
    'saved'  => $saved,
    'errors' => $errors,
    'items'  => reels_public($records),
]);
