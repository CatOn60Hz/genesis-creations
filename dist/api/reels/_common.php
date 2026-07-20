<?php
// Shared helpers for the home-page "reels" wall (short vertical videos played in
// a lightbox). Each reel is a record in data/reels.json and is one of two kinds:
//   - "youtube": { id, kind, videoId, order }       (embedded from YouTube)
//   - "file":    { id, kind, file, order }           (uploaded to uploads/reels/)
// Self-hosted files are streamed through media.php. Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

function reels_dir(): string
{
    return GC_UPLOADS_DIR . '/reels';
}

function reels_store(): string
{
    return GC_DATA_DIR . '/reels.json';
}

// All reel records (unsorted). Starts empty — there are no seeded reels.
function reels_load(): array
{
    $data = json_load(reels_store(), []);
    if (!is_array($data)) {
        return [];
    }
    return array_values(array_filter($data, 'is_array'));
}

function reels_sorted(array $list): array
{
    usort($list, static function ($a, $b) {
        return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
    });
    return $list;
}

// Highest order value in the store, or -1 when empty (so the next is 0).
function reels_max_order(array $list): int
{
    $max = -1;
    foreach ($list as $r) {
        $max = max($max, (int) ($r['order'] ?? 0));
    }
    return $max;
}

// Pull an 11-char YouTube id out of a watch/shorts/youtu.be/embed URL, or accept
// a bare id. Returns null when nothing video-id-shaped is found.
function reels_youtube_id(string $url): ?string
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

// Map stored records to the public shape the frontend consumes, in display
// order. Drops file records whose upload has gone missing and youtube records
// with no id.
function reels_public(array $records): array
{
    $out = [];
    foreach (reels_sorted($records) as $r) {
        $kind = $r['kind'] ?? '';
        if ($kind === 'youtube') {
            if (empty($r['videoId'])) {
                continue;
            }
            $out[] = [
                'id'      => $r['id'] ?? '',
                'kind'    => 'youtube',
                'videoId' => $r['videoId'],
            ];
        } elseif ($kind === 'file') {
            $file = (string) ($r['file'] ?? '');
            if ($file === '' || !is_file(reels_dir() . '/' . $file)) {
                continue;
            }
            $out[] = [
                'id'   => $r['id'] ?? '',
                'kind' => 'file',
                'name' => $file,
                'url'  => GC_UPLOADS_URL . '/reels/' . rawurlencode($file),
            ];
        }
    }
    return $out;
}
