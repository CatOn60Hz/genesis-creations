<?php
// POST /api/payments/webhook.php — PhonePe server-to-server callback.
// Source of truth for payment outcomes (the user may never return from the
// PhonePe page, so order-status polling alone is not enough).
//
// PhonePe authenticates by sending Authorization: SHA256(username:password),
// where username/password are the values configured with the webhook URL in
// the PhonePe Business dashboard (GC_PHONEPE_WEBHOOK_USER / _PASS here).
require_once __DIR__ . '/_phonepe.php';

require_post();

if (GC_PHONEPE_WEBHOOK_USER === '' || GC_PHONEPE_WEBHOOK_PASS === '') {
    json_out(['error' => 'Webhook not configured'], 503);
}

// REDIRECT_ variant appears when the header is forwarded via mod_rewrite.
$given = trim((string) ($_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));
// Some stacks prefix the scheme; PhonePe sends the bare hash. Accept both.
if (stripos($given, 'SHA256 ') === 0) {
    $given = trim(substr($given, 7));
}
$expected = hash('sha256', GC_PHONEPE_WEBHOOK_USER . ':' . GC_PHONEPE_WEBHOOK_PASS);
if ($given === '' || !hash_equals($expected, strtolower($given))) {
    json_out(['error' => 'Unauthorized'], 401);
}

$body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($body)) {
    json_out(['error' => 'Bad payload'], 400);
}

// V2 events: checkout.order.completed / checkout.order.failed, with the order
// details under payload.
$payload = is_array($body['payload'] ?? null) ? $body['payload'] : [];
$merchantOrderId = (string) ($payload['merchantOrderId'] ?? '');
if ($merchantOrderId === '') {
    json_out(['error' => 'Missing merchantOrderId'], 400);
}

$status = phonepe_state_to_status((string) ($payload['state'] ?? ''));
registration_set_status($merchantOrderId, $status, [
    'phonepeOrderId' => (string) ($payload['orderId'] ?? ''),
]);

// Always 200 for a recognised, authenticated event — even for unknown order
// ids — so PhonePe does not endlessly retry.
json_out(['ok' => true]);
