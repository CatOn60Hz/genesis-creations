<?php
// Shared helpers for the home-screen slideshow ("projector"). Photos and videos
// live in uploads/projector/; YouTube videos are referenced by id. The display
// order is an explicit list in projector.json — filenames for uploads and
// "yt:<id>" tokens for YouTube. Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

function projector_dir(): string
{
    return GC_UPLOADS_DIR . '/projector';
}

// Pull an 11-char YouTube id out of a watch/shorts/youtu.be/embed URL, or accept
// a bare id. Returns null when nothing video-id-shaped is found.
function projector_youtube_id(string $url): ?string
{
    $url = trim($url);
    if ($url === '') {
        return null;
    }
    if (preg_match('~^[A-Za-z0-9_-]{11}$~', $url)) {
        return $url;
    }
    if (preg_match(
        '~(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/|v/)|youtu\.be/)([A-Za-z0-9_-]{11})~',
        $url,
        $m
    )) {
        return $m[1];
    }
    return null;
}

// All slideshow media as [{ name, type, url|videoId }], in the saved display
// order. Photos/videos come from disk (keyed by filename); YouTube items come
// from projector.json's `youtube` list (keyed by "yt:<id>"). Items not yet in
// the order are appended — uploads newest first, then any new YouTube ids.
function projector_items(): array
{
    $dir     = projector_dir();
    $urlBase = GC_UPLOADS_URL . '/projector';
    $byKey   = [];

    if (is_dir($dir)) {
        foreach (scandir($dir) as $f) {
            if ($f === '' || $f[0] === '.') {
                continue;
            }
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (array_key_exists($ext, GC_ALLOWED)) {
                $type = 'photo';
            } elseif (array_key_exists($ext, GC_ALLOWED_VIDEO)) {
                $type = 'video';
            } else {
                continue;
            }
            $byKey[$f] = [
                'name' => $f,
                'type' => $type,
                'url'  => $urlBase . '/' . rawurlencode($f),
            ];
        }
    }

    $meta = json_load(GC_DATA_DIR . '/projector.json', []);

    $yt = $meta['youtube'] ?? [];
    if (is_array($yt)) {
        foreach ($yt as $id) {
            if (is_string($id) && $id !== '') {
                $byKey['yt:' . $id] = [
                    'name'    => 'yt:' . $id,
                    'type'    => 'youtube',
                    'videoId' => $id,
                ];
            }
        }
    }

    $order   = $meta['order'] ?? [];
    $ordered = [];
    if (is_array($order)) {
        foreach ($order as $key) {
            if (is_string($key) && isset($byKey[$key])) {
                $ordered[] = $byKey[$key];
                unset($byKey[$key]);
            }
        }
    }

    // Leftovers: uploaded files newest first, then YouTube ids not yet ordered.
    $restFiles = [];
    $restYt    = [];
    foreach ($byKey as $item) {
        if (($item['type'] ?? '') === 'youtube') {
            $restYt[] = $item;
        } else {
            $restFiles[] = $item;
        }
    }
    usort($restFiles, static function ($a, $b) use ($dir) {
        return filemtime("$dir/{$b['name']}") <=> filemtime("$dir/{$a['name']}");
    });

    return array_merge($ordered, $restFiles, $restYt);
}
