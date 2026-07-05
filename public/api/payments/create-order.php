<?php
// POST /api/payments/create-order.php (form: workshopId OR courseId,
// sessionCity?, name, email, phone) -> { redirectUrl }.
//
// PUBLIC endpoint — visitors create orders, so NO require_auth() here. The
// amount is derived server-side from the stored fee (workshop fee or course
// admission fee); nothing money-related is trusted from the client.
require_once __DIR__ . '/_phonepe.php';

send_cors();
require_post();
phonepe_require_configured();

$workshopId  = trim((string) ($_POST['workshopId'] ?? ''));
$courseId    = trim((string) ($_POST['courseId'] ?? ''));
$sessionCity = trim((string) ($_POST['sessionCity'] ?? ''));
$name        = trim((string) ($_POST['name'] ?? ''));
$email       = trim((string) ($_POST['email'] ?? ''));
$phone       = preg_replace('/[^0-9+]/', '', (string) ($_POST['phone'] ?? ''));

// Exactly one payable item.
if (($workshopId === '') === ($courseId === '') || $name === '') {
    json_out(['error' => 'Missing required fields'], 400);
}
if (mb_strlen($name) > 120) {
    json_out(['error' => 'Name is too long'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_out(['error' => 'Enter a valid email address'], 400);
}
if (strlen(preg_replace('/\D/', '', $phone)) < 10) {
    json_out(['error' => 'Enter a valid phone number'], 400);
}

// The item + fee come from our own store, never from the request.
if ($workshopId !== '') {
    $type = 'workshop';
    $itemId = $workshopId;
    $list = json_load(GC_DATA_DIR . '/workshops.json', []);
} else {
    $type = 'course';
    $itemId = $courseId;
    // courses_load() seeds the store on first read.
    require_once __DIR__ . '/../courses/_common.php';
    $list = courses_load();
}
$item = null;
foreach ($list as $x) {
    if (($x['id'] ?? '') === $itemId) {
        $item = $x;
        break;
    }
}
if ($item === null) {
    json_out(['error' => ucfirst($type) . ' not found'], 404);
}
if ($type === 'course' && !empty($item['admissionClosed'])) {
    json_out(['error' => 'Admissions are currently closed for this course'], 400);
}
$fee = (int) ($item['fee'] ?? 0);
if ($fee <= 0) {
    json_out(['error' => 'This ' . $type . ' does not take online payment'], 400);
}

// When a workshop lists sessions, the attendee must pick one of them.
if ($type === 'workshop') {
    $cities = array_map(static fn($s) => (string) ($s['city'] ?? ''), (array) ($item['sessions'] ?? []));
    $cities = array_values(array_filter($cities, static fn($c) => $c !== ''));
    if (count($cities) > 0 && !in_array($sessionCity, $cities, true)) {
        json_out(['error' => 'Pick a session'], 400);
    }
} else {
    $sessionCity = '';
}

$title = (string) ($item['title'] ?? '');
$amountPaise = $fee * 100;
$merchantOrderId = 'GK-' . date('Ymd-His') . '-' . strtoupper(bin2hex(random_bytes(4)));

[$code, $data] = phonepe_post('/checkout/v2/pay', [
    'merchantOrderId' => $merchantOrderId,
    'amount'          => $amountPaise,
    'expireAfter'     => 1800, // seconds; abandoned checkouts expire server-side
    'paymentFlow'     => [
        'type'         => 'PG_CHECKOUT',
        'message'      => ($type === 'workshop' ? 'Workshop registration — ' : 'Course admission — ') . $title,
        'merchantUrls' => [
            'redirectUrl' => GC_SITE_ORIGIN . '/payment-status?order=' . rawurlencode($merchantOrderId),
        ],
    ],
]);
$redirectUrl = is_array($data) ? (string) ($data['redirectUrl'] ?? '') : '';
if ($code !== 200 || $redirectUrl === '') {
    json_out(['error' => 'Could not start the payment. Please try again.'], 502);
}

registrations_update(static function (array $regs) use (
    $type, $itemId, $title, $sessionCity, $name, $email, $phone, $amountPaise, $merchantOrderId, $data
) {
    array_unshift($regs, [
        'id'              => bin2hex(random_bytes(6)),
        'type'            => $type,
        'itemId'          => $itemId,
        'itemTitle'       => $title,
        'sessionCity'     => $sessionCity,
        'name'            => $name,
        'email'           => $email,
        'phone'           => $phone,
        'amountPaise'     => $amountPaise,
        'merchantOrderId' => $merchantOrderId,
        'phonepeOrderId'  => (string) ($data['orderId'] ?? ''),
        'status'          => 'PENDING',
        'createdAt'       => date('c'),
        'updatedAt'       => date('c'),
    ]);
    return $regs;
});

json_out(['redirectUrl' => $redirectUrl, 'merchantOrderId' => $merchantOrderId]);
