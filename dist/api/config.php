<?php
// Genesis Creations — shared backend configuration (single source of truth).
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

// Maximum size per uploaded file, in bytes (15 MB).
const GC_MAX_BYTES = 15 * 1024 * 1024;

// CORS origin allowed to call the API (so the local Vite dev server can reach
// the live API). '*' allows any; set to your domain to lock down; '' disables.
const GC_CORS_ORIGIN = '*';

// Filesystem locations, relative to the web root (this file lives in
// <webroot>/api). Created automatically as needed.
define('GC_DATA_DIR', dirname(__DIR__) . '/data');        // <webroot>/data
define('GC_UPLOADS_DIR', dirname(__DIR__) . '/uploads');  // <webroot>/uploads
const GC_UPLOADS_URL = '/uploads';                        // public URL base
