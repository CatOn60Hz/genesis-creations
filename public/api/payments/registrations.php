<?php
// GET /api/payments/registrations.php?itemId=<id?> (X-Gallery-Password)
//   -> { registrations: [...] }
// Admin-only list for the /admin Registrations view (workshop + course
// payments share one store). Newest first.
require_once __DIR__ . '/_phonepe.php';

send_cors();
require_auth();

$registrations = json_load(GC_REGISTRATIONS_FILE, []);

$itemId = trim((string) ($_GET['itemId'] ?? ''));
if ($itemId !== '') {
    $registrations = array_values(array_filter(
        $registrations,
        static fn($r) => ($r['itemId'] ?? '') === $itemId
    ));
}

json_out(['registrations' => $registrations]);
