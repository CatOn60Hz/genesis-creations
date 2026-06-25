<?php
// Genesis Creations — gallery backend configuration.
//
// The admin password now lives in one place (../config.php, GC_ADMIN_PASSWORD)
// so the whole admin dashboard shares a single secret. Change it there.
require_once __DIR__ . '/../config.php';

const ADMIN_PASSWORD = GC_ADMIN_PASSWORD;

// Photos live under the shared persistent uploads dir (outside the web root, so
// deploys can't wipe them — see ../config.php) and are served via media.php.
define('UPLOAD_DIR', GC_UPLOADS_DIR . '/gallery');
const UPLOAD_URL_BASE = '/api/media.php?f=gallery';

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
