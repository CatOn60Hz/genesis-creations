<?php
// Shared helpers for the home page "Workshops & Courses" menu list. Records
// (data/home-courses.json) are text-only: { id, kind, title, text, order }.
// `kind` selects the animated icon on the frontend (see courses.tsx). Seeded on
// first read from the current hardcoded list. Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

// Icon kinds the frontend knows how to render. Keep in sync with courses.tsx.
const GC_HOME_COURSE_KINDS = ['gimbal', 'drone', 'aerial', 'clapper', 'camera'];

function home_courses_store(): string
{
    return GC_DATA_DIR . '/home-courses.json';
}

function home_courses_seed(): array
{
    $defaults = [
        ['kind' => 'gimbal', 'title' => 'Gimbal Workshop', 'text' => 'Master smooth, cinematic motion with professional gimbal stabilization.'],
        ['kind' => 'drone', 'title' => 'Drone Workshop', 'text' => 'Hands-on drone operation and flight fundamentals for aerial work.'],
        ['kind' => 'aerial', 'title' => 'Aerial Cinematography', 'text' => 'Capture breathtaking aerial shots and compose them like a pro.'],
        ['kind' => 'clapper', 'title' => 'Media Technology', 'text' => 'The complete toolkit — camera, lighting, audio, editing and production.'],
        ['kind' => 'camera', 'title' => 'Digital Photography', 'text' => 'From exposure to composition, build a strong photography foundation.'],
    ];

    $records = [];
    $order = 0;
    foreach ($defaults as $d) {
        $records[] = [
            'id'        => bin2hex(random_bytes(6)),
            'kind'      => $d['kind'],
            'title'     => $d['title'],
            'text'      => $d['text'],
            'order'     => $order++,
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
        ];
    }
    json_save(home_courses_store(), $records);
    return $records;
}

function home_courses_load(): array
{
    $store = home_courses_store();
    if (!is_file($store)) {
        return home_courses_seed();
    }
    $data = json_load($store, []);
    return is_array($data) ? $data : [];
}

function home_courses_sorted(array $list): array
{
    usort($list, static function ($a, $b) {
        return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
    });
    return $list;
}

// Normalise a posted `kind` to a known value (defaults to the first kind).
function home_courses_clean_kind(string $kind): string
{
    return in_array($kind, GC_HOME_COURSE_KINDS, true) ? $kind : GC_HOME_COURSE_KINDS[0];
}
