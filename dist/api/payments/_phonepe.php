<?php
// PhonePe Standard Checkout V2 helpers (OAuth model). Not a routable endpoint.
//
// Flow: client-credentials token -> POST /checkout/v2/pay (returns a hosted
// checkout redirectUrl) -> user pays on PhonePe -> webhook.php confirms
// (source of truth) and/or order-status.php polls.

require_once __DIR__ . '/../_shared.php';

// Registrations store: array of records, newest first. See registrations.php
// for the record shape.
const GC_REGISTRATIONS_FILE = GC_DATA_DIR . '/registrations.json';

// 503 unless PhonePe credentials are configured (secrets.php on the server).
function phonepe_require_configured(): void
{
    if (GC_PHONEPE_CLIENT_ID === '' || GC_PHONEPE_CLIENT_SECRET === '') {
        json_out(['error' => 'Payments are not configured yet'], 503);
    }
}

// API base URLs per environment. Production uses a separate identity-manager
// host path for the OAuth token; sandbox serves both from pg-sandbox.
function phonepe_token_url(): string
{
    return GC_PHONEPE_ENV === 'production'
        ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
}

function phonepe_pg_base(): string
{
    return GC_PHONEPE_ENV === 'production'
        ? 'https://api.phonepe.com/apis/pg'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
}

// Low-level HTTP via curl. Returns [httpCode, decodedBody|null].
function phonepe_http(string $method, string $url, array $headers, ?string $body): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 10,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($raw === false) {
        return [0, null];
    }
    return [$code, json_decode($raw, true)];
}

// OAuth access token, cached in GC_DATA_DIR until shortly before expiry.
// PhonePe's expires_at is an epoch (seconds); refresh 60s early to be safe.
function phonepe_token(): string
{
    $cacheFile = GC_DATA_DIR . '/phonepe-token.json';
    $cache = json_load($cacheFile, []);
    if (
        ($cache['env'] ?? '') === GC_PHONEPE_ENV
        && ($cache['access_token'] ?? '') !== ''
        && (int) ($cache['expires_at'] ?? 0) - 60 > time()
    ) {
        return $cache['access_token'];
    }

    [$code, $data] = phonepe_http(
        'POST',
        phonepe_token_url(),
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query([
            'client_id'      => GC_PHONEPE_CLIENT_ID,
            'client_secret'  => GC_PHONEPE_CLIENT_SECRET,
            'client_version' => GC_PHONEPE_CLIENT_VERSION,
            'grant_type'     => 'client_credentials',
        ])
    );
    $token = is_array($data) ? (string) ($data['access_token'] ?? '') : '';
    if ($code !== 200 || $token === '') {
        json_out(['error' => 'Payment gateway authentication failed'], 502);
    }
    json_save($cacheFile, [
        'env'          => GC_PHONEPE_ENV,
        'access_token' => $token,
        'expires_at'   => (int) ($data['expires_at'] ?? time() + 900),
    ]);
    return $token;
}

// Authenticated JSON POST/GET against the PG API.
function phonepe_post(string $path, array $body): array
{
    return phonepe_http('POST', phonepe_pg_base() . $path, [
        'Content-Type: application/json',
        'Authorization: O-Bearer ' . phonepe_token(),
    ], json_encode($body));
}

function phonepe_get(string $path): array
{
    return phonepe_http('GET', phonepe_pg_base() . $path, [
        'Content-Type: application/json',
        'Authorization: O-Bearer ' . phonepe_token(),
    ], null);
}

// flock-guarded read-modify-write of registrations.json. New orders, webhook
// hits and status polls can land concurrently — the plain json_save() has no
// lock, so all registration writes must go through here. $fn receives the
// current array and returns the new one.
function registrations_update(callable $fn): array
{
    ensure_dir(GC_DATA_DIR);
    $fp = fopen(GC_REGISTRATIONS_FILE, 'c+');
    if ($fp === false) {
        json_out(['error' => 'Storage unavailable'], 500);
    }
    flock($fp, LOCK_EX);
    $raw = stream_get_contents($fp);
    $list = json_decode((string) $raw, true);
    if (!is_array($list)) {
        $list = [];
    }
    $list = $fn($list);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $list;
}

// Map a PhonePe order state onto our record status. PhonePe uses COMPLETED /
// FAILED / PENDING (plus EXPIRED and similar terminal failures).
function phonepe_state_to_status(string $state): string
{
    if ($state === 'COMPLETED') {
        return 'COMPLETED';
    }
    if ($state === 'PENDING' || $state === '') {
        return 'PENDING';
    }
    return 'FAILED';
}

// Update one registration's status by merchantOrderId (locked). Returns the
// updated record or null when the order id is unknown. A COMPLETED record is
// never downgraded (a late FAILED poll must not overwrite a webhook success).
function registration_set_status(string $merchantOrderId, string $status, array $extra = []): ?array
{
    $updated = null;
    registrations_update(static function (array $list) use ($merchantOrderId, $status, $extra, &$updated) {
        foreach ($list as $i => $r) {
            if (($r['merchantOrderId'] ?? '') !== $merchantOrderId) {
                continue;
            }
            if (($r['status'] ?? '') !== 'COMPLETED') {
                $r['status'] = $status;
            }
            foreach ($extra as $k => $v) {
                if ($v !== null && $v !== '') {
                    $r[$k] = $v;
                }
            }
            $r['updatedAt'] = date('c');
            $list[$i] = $r;
            $updated = $r;
            break;
        }
        return $list;
    });
    return $updated;
}
