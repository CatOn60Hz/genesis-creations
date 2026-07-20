<?php
// POST /api/payments/test-mail.php  (X-Gallery-Password; body: to=<email>)
//   -> { config: {...}, sent: bool, debug: {...} }
//
// ADMIN-ONLY diagnostic. Sends a single test email through the exact same
// transport the payment flow uses (Resend, or PHP mail() fallback) and returns
// the real result — HTTP code + Resend response body — so a silent
// non-delivery (unverified domain, wrong from-address, bad key) is visible.
// Delete or ignore once mail is confirmed working; it is harmless if left.
require_once __DIR__ . '/../_shared.php';
require_once __DIR__ . '/_mail.php';

send_cors();
require_auth();
require_post();

$to = trim((string) ($_POST['to'] ?? GC_ADMIN_NOTIFY_EMAIL));
if ($to === '') {
    json_out(['error' => 'Provide a "to" email (or set GC_ADMIN_NOTIFY_EMAIL)'], 400);
}

// Snapshot of the mail config as the server actually sees it — never echo the
// key itself, only whether it is present and its length as a sanity check.
$config = [
    'mailFrom'        => GC_MAIL_FROM,
    'mailFromName'    => GC_MAIL_FROM_NAME,
    'adminNotify'     => GC_ADMIN_NOTIFY_EMAIL,
    'resendKeySet'    => GC_RESEND_API_KEY !== '',
    'resendKeyLen'    => strlen(GC_RESEND_API_KEY),
    'transportChosen' => GC_MAIL_FROM === '' ? 'disabled'
        : (GC_RESEND_API_KEY !== '' ? 'resend' : 'phpmail'),
];

$debug = [];
$html = gc_mail_shell(
    'Test email',
    'Mail configuration check',
    '<p style="margin:0 0 12px;">If you can read this, Genesis Kreations mail '
        . 'delivery is working. This is a diagnostic message.</p>'
        . '<p style="margin:0;color:#8a8a8a;font-size:13px;">Sent ' . date('c') . '</p>'
);
$sent = gc_send_mail($to, 'Genesis Kreations — mail test', $html, $debug);

json_out([
    'config' => $config,
    'sent'   => $sent,
    'debug'  => $debug,
]);
