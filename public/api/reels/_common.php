<?php
// Shared helpers for the home-page "reels" video wall (short vertical videos,
// played in a lightbox). Videos live in uploads/reels/; the display order is an
// explicit list of filenames in reels.json. Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

function reels_dir(): string
{
    return GC_UPLOADS_DIR . '/reels';
}

// All reel videos as [{ name, type, url }], in the saved display order. Files
// not yet in the order (just uploaded) are appended, newest first. Videos are
// streamed through media.php (Range-capable) so they seek/scrub correctly.
function reels_items(): array
{
    $dir     = reels_dir();
    $urlBase = GC_UPLOADS_URL . '/reels';
    $byName  = [];

    if (is_dir($dir)) {
        foreach (scandir($dir) as $f) {
            if ($f === '' || $f[0] === '.') {
                continue;
            }
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (!array_key_exists($ext, GC_ALLOWED_VIDEO)) {
                continue;
            }
            $byName[$f] = [
                'name' => $f,
                'type' => 'video',
                'url'  => $urlBase . '/' . rawurlencode($f),
            ];
        }
    }

    $order   = json_load(GC_DATA_DIR . '/reels.json', [])['order'] ?? [];
    $ordered = [];
    if (is_array($order)) {
        foreach ($order as $name) {
            if (is_string($name) && isset($byName[$name])) {
                $ordered[] = $byName[$name];
                unset($byName[$name]);
            }
        }
    }

    // Leftovers (uploaded but not yet ordered): newest first.
    $rest = array_values($byName);
    usort($rest, static function ($a, $b) use ($dir) {
        return filemtime("$dir/{$b['name']}") <=> filemtime("$dir/{$a['name']}");
    });

    return array_merge($ordered, $rest);
}
