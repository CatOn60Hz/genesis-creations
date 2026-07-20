<?php
// GET /api/payments/order-status.php?order=<merchantOrderId>
//   -> { status, type, title, sessionCity, amountPaise }
//
// PUBLIC — the status page polls this after PhonePe redirects back. It also
// re-syncs our stored record from PhonePe (belt-and-braces alongside the
// webhook, which remains the source of truth). Exposes only non-personal
// fields, since anyone holding an order id could call it.
require_once __DIR__ . '/_phonepe.php';

send_cors();
phonepe_require_configured();

$order = trim((string) ($_GET['order'] ?? ''));
if (!preg_match('/^GK-[0-9\-]+-[A-F0-9]+$/', $order)) {
    json_out(['error' => 'Invalid order id'], 400);
}

[$code, $data] = phonepe_get('/checkout/v2/order/' . rawurlencode($order) . '/status');
if ($code !== 200 || !is_array($data)) {
    json_out(['error' => 'Could not fetch the payment status'], 502);
}

$status = phonepe_state_to_status((string) ($data['state'] ?? ''));
$record = registration_set_status($order, $status);
if ($record === null) {
    json_out(['error' => 'Order not found'], 404);
}

json_out([
    'status'      => $record['status'],
    'type'        => $record['type'] ?? 'workshop',
    'title'       => $record['itemTitle'] ?? '',
    'sessionCity' => $record['sessionCity'] ?? '',
    'amountPaise' => (int) ($record['amountPaise'] ?? 0),
]);
