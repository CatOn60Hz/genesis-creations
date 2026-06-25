<?php
// Genesis Creations — gallery backend configuration.
//
// The admin password now lives in one place (../config.php, GC_ADMIN_PASSWORD)
// so the whole admin dashboard shares a single secret. Change it there.
require_once __DIR__ . '/../config.php';

const ADMIN_PASSWORD = GC_ADMIN_PASSWORD;

// Filesystem directory where photos are stored (created automatically on first
// upload). Relative to this file:
//   public_html/api/gallery  ->  public_html/uploads/gallery
const UPLOAD_DIR = __DIR__ . '/../../uploads/gallery';

// Public URL path that maps to UPLOAD_DIR (served as static files by Hostinger).
const UPLOAD_URL_BASE = '/uploads/gallery';

// Allowed image types: extension => expected MIME.
const ALLOWED = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
];

// Maximum size per uploaded file, in bytes (15 MB).
const MAX_BYTES = 15 * 1024 * 1024;

// CORS origin allowed to call this API. Needed so the local Vite dev server can
// talk to the live API. '*' allows any origin; set to your domain to lock down,
// or '' to disable CORS entirely (same-origin production still works).
const CORS_ORIGIN = '*';
