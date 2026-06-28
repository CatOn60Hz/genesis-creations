<?php
// Shared helpers for admin-editable page background/hero images. A single
// JSON map (data/backgrounds.json) holds one entry per named slot:
//   { "academy": { name, url }, "services": { name, url }, ... }
// Files live in uploads/backgrounds/. Pages fall back to their bundled hero
// image when a slot is empty, so no seeding is needed. Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

// Slots a page background may be set for. Keep in sync with the frontend
// BackgroundSlot type and usePageBackground() calls.
const GC_BG_SLOTS = ['academy', 'services', 'digital-marketing', 'about'];

function backgrounds_store(): string
{
    return GC_DATA_DIR . '/backgrounds.json';
}

function backgrounds_dir(): string
{
    return GC_UPLOADS_DIR . '/backgrounds';
}

function backgrounds_url(string $file): string
{
    return GC_UPLOADS_URL . '/backgrounds/' . rawurlencode($file);
}

function backgrounds_load(): array
{
    $data = json_load(backgrounds_store(), []);
    return is_array($data) ? $data : [];
}
