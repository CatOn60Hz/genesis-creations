<?php
// Shared helpers for the academy certification courses (the rich cards on the
// Academy page). Records live in data/courses.json and are seeded on first read
// from the committed seed.json (the current 8 courses). Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

// Icon kinds the frontend knows how to render (see animated-course-icon.tsx).
const GC_COURSE_KINDS = [
    'diploma',
    'photography',
    'videography',
    'graphic-design',
    'video-editing',
    'drone',
    'live-sound',
    'studio-recording',
];

function courses_store(): string
{
    return GC_DATA_DIR . '/courses.json';
}

// Seed the store once from the committed seed.json.
function courses_seed(): array
{
    $raw  = @file_get_contents(__DIR__ . '/seed.json');
    $data = $raw !== false ? json_decode($raw, true) : null;
    if (!is_array($data)) {
        $data = [];
    }
    foreach ($data as &$c) {
        $c['createdAt'] = $c['createdAt'] ?? date('c');
        $c['updatedAt'] = $c['updatedAt'] ?? date('c');
    }
    unset($c);
    json_save(courses_store(), $data);
    return $data;
}

function courses_load(): array
{
    $store = courses_store();
    if (!is_file($store)) {
        return courses_seed();
    }
    $data = json_load($store, []);
    return is_array($data) ? $data : [];
}

function courses_sorted(array $list): array
{
    usort($list, static function ($a, $b) {
        return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
    });
    return $list;
}

function courses_clean_kind(string $kind): string
{
    return in_array($kind, GC_COURSE_KINDS, true) ? $kind : 'photography';
}

// Decode a posted JSON string into a clean list of non-empty trimmed strings.
function courses_decode_list($raw): array
{
    $out = [];
    $arr = json_decode((string) $raw, true);
    if (is_array($arr)) {
        foreach ($arr as $v) {
            $v = trim((string) $v);
            if ($v !== '') {
                $out[] = $v;
            }
        }
    }
    return $out;
}

// Decode posted modules JSON into [{ title, items:[...] }], dropping empties.
function courses_decode_modules($raw): array
{
    $out = [];
    $arr = json_decode((string) $raw, true);
    if (is_array($arr)) {
        foreach ($arr as $m) {
            if (!is_array($m)) {
                continue;
            }
            $title = trim((string) ($m['title'] ?? ''));
            $items = [];
            if (isset($m['items']) && is_array($m['items'])) {
                foreach ($m['items'] as $it) {
                    $it = trim((string) $it);
                    if ($it !== '') {
                        $items[] = $it;
                    }
                }
            }
            if ($title === '' && count($items) === 0) {
                continue;
            }
            $out[] = ['title' => $title, 'items' => $items];
        }
    }
    return $out;
}
