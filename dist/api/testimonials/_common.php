<?php
// Shared helpers for student testimonials. Records live in
// data/testimonials.json; portrait images in uploads/testimonials/. On the very
// first read the store is seeded from the bundled defaults (seed/*.png + the
// copy below) so the site shows the current reviews and the admin can edit them.
// Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

function testimonials_store(): string
{
    return GC_DATA_DIR . '/testimonials.json';
}

function testimonials_dir(): string
{
    return GC_UPLOADS_DIR . '/testimonials';
}

function testimonials_url(string $file): string
{
    return GC_UPLOADS_URL . '/testimonials/' . rawurlencode($file);
}

// Seed the store once from the current hardcoded reviews. Copies each bundled
// portrait from seed/ into the uploads dir (random-suffixed, like real uploads).
function testimonials_seed(): array
{
    $dir = testimonials_dir();
    ensure_dir($dir, true);

    $defaults = [
        [
            'file'   => 'student_john.png',
            'quote'  => 'It gave me the confidence and skills that I needed to get into the Media industry.',
            'author' => 'John Bosco',
        ],
        [
            'file'   => 'student_jeremiah.png',
            'quote'  => 'Best place to learn media course — all the basic subjects required to excel in media are covered.',
            'author' => 'Jeremiah Philemon',
        ],
        [
            'file'   => 'student_derrick.png',
            'quote'  => 'They teach from scratch so no prior knowledge is required.',
            'author' => 'Derrick Gannon',
        ],
    ];

    $records = [];
    $order = 0;
    foreach ($defaults as $d) {
        $image = null;
        $src = __DIR__ . '/seed/' . $d['file'];
        if (is_file($src)) {
            $ext   = strtolower(pathinfo($d['file'], PATHINFO_EXTENSION));
            $stem  = pathinfo($d['file'], PATHINFO_FILENAME);
            $final = $stem . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
            if (@copy($src, "$dir/$final")) {
                @chmod("$dir/$final", 0644);
                $image = ['name' => $final, 'url' => testimonials_url($final)];
            }
        }
        $records[] = [
            'id'        => bin2hex(random_bytes(6)),
            'quote'     => $d['quote'],
            'author'    => $d['author'],
            'role'      => '',
            'image'     => $image,
            'order'     => $order++,
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
        ];
    }

    json_save(testimonials_store(), $records);
    return $records;
}

// Load all testimonials, seeding the store on first read (file absent).
function testimonials_load(): array
{
    $store = testimonials_store();
    if (!is_file($store)) {
        return testimonials_seed();
    }
    $data = json_load($store, []);
    return is_array($data) ? $data : [];
}

// Return a copy sorted by the admin-defined `order` (ascending, stable).
function testimonials_sorted(array $list): array
{
    usort($list, static function ($a, $b) {
        return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
    });
    return $list;
}
