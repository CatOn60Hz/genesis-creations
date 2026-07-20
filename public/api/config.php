<?php
// Genesis Kreations — shared backend configuration (single source of truth).
//
// SECURITY: real secrets (admin password, PhonePe keys) belong in
// GC_PERSIST_DIR/secrets.php — outside the web root and never in git; see
// secrets.php.example. The define() calls below are fallback defaults only.

// Allowed image types: extension => expected MIME.
const GC_ALLOWED = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
];

// Allowed video types for the home-screen hero video: extension => MIME.
const GC_ALLOWED_VIDEO = [
    'mp4'  => 'video/mp4',
    'webm' => 'video/webm',
    'mov'  => 'video/quicktime',
    'ogg'  => 'video/ogg',
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

// ---------------------------------------------------------------------------
// Secrets. Loaded from GC_PERSIST_DIR/secrets.php when present (outside the
// web root, so it survives deploys and never lands in git — see
// secrets.php.example). Everything below is a fallback default so endpoints
// never fatal when secrets.php is missing.
if (is_file(GC_PERSIST_DIR . '/secrets.php')) {
    require GC_PERSIST_DIR . '/secrets.php';
}

// Admin password gating all /admin write endpoints.
defined('GC_ADMIN_PASSWORD') || define('GC_ADMIN_PASSWORD', 'gcweb@2026');

// PhonePe Standard Checkout V2 (OAuth). Empty credentials mean "payments not
// configured" — the payment endpoints respond 503 until secrets.php provides
// real values from the PhonePe Business dashboard.
defined('GC_PHONEPE_ENV') || define('GC_PHONEPE_ENV', 'sandbox'); // 'sandbox' | 'production'
defined('GC_PHONEPE_CLIENT_ID') || define('GC_PHONEPE_CLIENT_ID', '');
defined('GC_PHONEPE_CLIENT_SECRET') || define('GC_PHONEPE_CLIENT_SECRET', '');
defined('GC_PHONEPE_CLIENT_VERSION') || define('GC_PHONEPE_CLIENT_VERSION', '1');
defined('GC_PHONEPE_WEBHOOK_USER') || define('GC_PHONEPE_WEBHOOK_USER', '');
defined('GC_PHONEPE_WEBHOOK_PASS') || define('GC_PHONEPE_WEBHOOK_PASS', '');

// Absolute origin used to build the PhonePe redirect URL back to the site.
defined('GC_SITE_ORIGIN') || define('GC_SITE_ORIGIN', 'https://genesiskreationsmedia.com');

// Email notifications for paid registrations. Sending is skipped gracefully
// when GC_MAIL_FROM is empty, so this stays dormant until secrets.php sets it.
// GC_MAIL_FROM should be a real mailbox on the site's domain for deliverability
// (e.g. no-reply@genesiskreationsmedia.com). GC_ADMIN_NOTIFY_EMAIL receives the
// "new registration" alert; leave empty to only email the attendee.
defined('GC_MAIL_FROM') || define('GC_MAIL_FROM', '');
defined('GC_MAIL_FROM_NAME') || define('GC_MAIL_FROM_NAME', 'Genesis Kreations');
defined('GC_ADMIN_NOTIFY_EMAIL') || define('GC_ADMIN_NOTIFY_EMAIL', '');
