<?php
// Genesis Kreations — shared backend configuration (single source of truth).
//
// SECURITY: change GC_ADMIN_PASSWORD to your own secret before going live.
// This one password gates the whole /admin dashboard (announcements, workshops,
// gallery, projector).

const GC_ADMIN_PASSWORD = 'gcweb@2026';

// Allowed image types: extension => expected MIME.
const GC_ALLOWED = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
];

// Maximum size per uploaded file, in bytes (50 MB). NOTE: PHP's own
// upload_max_filesize / post_max_size (set in .user.ini at the web root) must be
// >= this, or large uploads are rejected before this check ever runs.
const GC_MAX_BYTES = 50 * 1024 * 1024;

// CORS origin allowed to call the API (so the local Vite dev server can reach
// the live API). '*' allows any; set to your domain to lock down; '' disables.
const GC_CORS_ORIGIN = '*';

// Persistent storage that SURVIVES deploys. The site auto-builds on every push,
// which wipes the web root — so runtime data (uploaded images + the
// announcement / workshops / projector JSON) must live OUTSIDE the web root.
// This file is <webroot>/api/config.php, so dirname(dirname(__DIR__)) is the
// folder ABOVE the web root, which the build never touches.
//
// If your host wipes that folder too, hard-code an absolute path to any
// persistent folder outside the deployed tree, e.g.:
//   define('GC_PERSIST_DIR', '/home/uXXXXXXXX/gc-data');
if (!defined('GC_PERSIST_DIR')) {
    define('GC_PERSIST_DIR', dirname(dirname(__DIR__)) . '/gc-data');
}

// Data + uploads live under the persistent dir (created automatically).
// Uploaded images sit outside the web root, so they are NOT reachable as static
// files — they are streamed by media.php instead (see GC_UPLOADS_URL).
define('GC_DATA_DIR', GC_PERSIST_DIR . '/data');
define('GC_UPLOADS_DIR', GC_PERSIST_DIR . '/uploads');
// Image URL base. Callers append "/<section>/<file>", giving e.g.
// /api/media.php?f=/projector/abc.jpg — media.php strips the leading slash.
const GC_UPLOADS_URL = '/api/media.php?f=';
