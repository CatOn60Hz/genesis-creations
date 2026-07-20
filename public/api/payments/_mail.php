<?php
// Lightweight HTML email helper for paid-registration notifications.
// Uses PHP mail(); sending is skipped (returns false) when GC_MAIL_FROM is
// unset, so the whole feature stays dormant until secrets.php configures it.
//
// For best deliverability GC_MAIL_FROM should be a real mailbox on the site's
// domain (Hostinger). If mail lands in spam, upgrade this to authenticated
// SMTP later — the two send_* functions below are the only call sites.

require_once __DIR__ . '/../config.php';

// Send one HTML email. Returns true on success, false if disabled or failed.
// Prefers the Resend HTTPS API (domain-authenticated, reliable); falls back to
// PHP mail() when no Resend key is set. Never throws — a failed send must not
// break the payment flow.
function gc_send_mail(string $to, string $subject, string $html, ?array &$debug = null): bool
{
    if (GC_MAIL_FROM === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $debug = ['transport' => 'none', 'reason' => GC_MAIL_FROM === '' ? 'GC_MAIL_FROM is empty' : 'invalid recipient'];
        return false;
    }
    return GC_RESEND_API_KEY !== ''
        ? gc_send_via_resend($to, $subject, $html, $debug)
        : gc_send_via_phpmail($to, $subject, $html, $debug);
}

// Resend API: POST https://api.resend.com/emails with a Bearer key. "from"
// must be on a domain verified in the Resend dashboard. Fills $debug with the
// HTTP code / response body and logs to the PHP error log on failure, so a
// silent non-delivery (unverified domain, bad key, from-mismatch) is diagnosable.
function gc_send_via_resend(string $to, string $subject, string $html, ?array &$debug = null): bool
{
    $from = GC_MAIL_FROM_NAME !== ''
        ? GC_MAIL_FROM_NAME . ' <' . GC_MAIL_FROM . '>'
        : GC_MAIL_FROM;
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . GC_RESEND_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'from'     => $from,
            'to'       => [$to],
            'subject'  => $subject,
            'html'     => $html,
            'reply_to' => GC_MAIL_FROM,
        ]),
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);
    $ok = $raw !== false && $code >= 200 && $code < 300;
    $debug = [
        'transport'  => 'resend',
        'from'       => $from,
        'to'         => $to,
        'httpCode'   => $code,
        'curlError'  => $curlErr,
        'response'   => is_string($raw) ? $raw : null,
    ];
    if (!$ok) {
        error_log('gc_send_via_resend failed: HTTP ' . $code
            . ($curlErr !== '' ? ' curl=' . $curlErr : '')
            . ' from=' . $from . ' to=' . $to
            . ' body=' . (is_string($raw) ? $raw : '(none)'));
    }
    return $ok;
}

// Fallback transport: PHP mail() with a UTF-8 HTML body.
function gc_send_via_phpmail(string $to, string $subject, string $html, ?array &$debug = null): bool
{
    $fromName = mb_encode_mimeheader(GC_MAIL_FROM_NAME);
    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . GC_MAIL_FROM . '>',
        'Reply-To: ' . GC_MAIL_FROM,
        'X-Mailer: GenesisKreations',
    ]);
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $ok = @mail($to, $encodedSubject, $html, $headers);
    $debug = ['transport' => 'phpmail', 'from' => GC_MAIL_FROM, 'to' => $to, 'ok' => $ok];
    if (!$ok) {
        error_log('gc_send_via_phpmail failed: from=' . GC_MAIL_FROM . ' to=' . $to);
    }
    return $ok;
}

// Brand palette (from src/index.css): crimson primary + deep maroon-black.
const GC_MAROON = '#cb2957';
const GC_MAROON_DEEP = '#7d1a33';

// Branded HTML shell — a light card with a crimson gradient header and a
// no-reply footer. $heading/$subheading fill the header band.
function gc_mail_shell(string $heading, string $subheading, string $bodyHtml): string
{
    return '<div style="margin:0;padding:24px 12px;background:#f4f2f3;'
        . 'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">'
        . '<div style="max-width:560px;margin:0 auto;background:#ffffff;'
        . 'border:1px solid #ececec;border-radius:14px;overflow:hidden;">'
        // Header
        . '<div style="background:linear-gradient(135deg,' . GC_MAROON . ' 0%,'
        . GC_MAROON_DEEP . ' 100%);padding:28px 28px 24px;color:#ffffff;">'
        . '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;'
        . 'opacity:.8;">Genesis Kreations</div>'
        . '<div style="font-size:22px;font-weight:700;margin-top:8px;line-height:1.2;">'
        . htmlspecialchars($heading) . '</div>'
        . ($subheading !== ''
            ? '<div style="font-size:14px;margin-top:6px;opacity:.9;">'
                . htmlspecialchars($subheading) . '</div>'
            : '')
        . '</div>'
        // Body
        . '<div style="padding:28px;color:#1f1f1f;font-size:15px;line-height:1.55;">'
        . $bodyHtml . '</div>'
        // Footer (no-reply)
        . '<div style="padding:18px 28px;background:#faf7f8;border-top:1px solid #f0e9eb;'
        . 'color:#8a8a8a;font-size:12px;line-height:1.6;">'
        . 'This is an automated message from a no-reply address — please don\'t reply. '
        . 'For any help, email <a href="mailto:info@genesiskreationsmedia.com" '
        . 'style="color:' . GC_MAROON . ';text-decoration:none;">info@genesiskreationsmedia.com</a> '
        . 'or visit <a href="' . GC_SITE_ORIGIN . '" '
        . 'style="color:' . GC_MAROON . ';text-decoration:none;">genesiskreationsmedia.com</a>.<br>'
        . '&copy; ' . date('Y') . ' Genesis Kreations, Chennai.'
        . '</div></div></div>';
}

// A rounded status pill for the top of the body.
function gc_mail_pill(string $text, string $bg, string $fg): string
{
    return '<div style="margin:0 0 18px;"><span style="display:inline-block;'
        . 'padding:6px 14px;border-radius:999px;background:' . $bg . ';color:' . $fg
        . ';font-size:12px;font-weight:700;letter-spacing:.5px;">'
        . htmlspecialchars($text) . '</span></div>';
}

// A crimson call-to-action button.
function gc_mail_button(string $href, string $label): string
{
    return '<div style="margin:20px 0 4px;"><a href="' . htmlspecialchars($href)
        . '" style="display:inline-block;background:' . GC_MAROON . ';color:#ffffff;'
        . 'text-decoration:none;font-weight:600;font-size:14px;padding:12px 26px;'
        . 'border-radius:999px;">' . htmlspecialchars($label) . '</a></div>';
}

// Render the registration detail rows shared by all emails, in a soft card.
function gc_mail_details(array $reg): string
{
    $amount = '&#8377;' . number_format(((int) ($reg['amountPaise'] ?? 0)) / 100, 2);
    $kind = ($reg['type'] ?? 'workshop') === 'course' ? 'Course' : 'Workshop';
    $rows = [[$kind, htmlspecialchars((string) ($reg['itemTitle'] ?? ''))]];
    if (($reg['sessionCity'] ?? '') !== '') {
        $rows[] = ['Session', htmlspecialchars((string) $reg['sessionCity'])];
    }
    $rows[] = ['Name', htmlspecialchars((string) ($reg['name'] ?? ''))];
    $rows[] = ['Email', htmlspecialchars((string) ($reg['email'] ?? ''))];
    $rows[] = ['Phone', htmlspecialchars((string) ($reg['phone'] ?? ''))];
    if (($reg['dob'] ?? '') !== '') {
        $rows[] = ['Date of birth', htmlspecialchars((string) $reg['dob'])];
    }
    $rows[] = ['Amount', $amount];
    $rows[] = ['Order ID', htmlspecialchars((string) ($reg['merchantOrderId'] ?? ''))];

    $html = '<table style="width:100%;border-collapse:separate;border-spacing:0;'
        . 'background:#faf9f9;border:1px solid #f0eef0;border-radius:10px;'
        . 'font-size:14px;overflow:hidden;">';
    foreach ($rows as $i => [$label, $value]) {
        $border = $i > 0 ? 'border-top:1px solid #f0eef0;' : '';
        $html .= '<tr>'
            . '<td style="padding:11px 16px;color:#8a8a8a;width:130px;'
            . 'vertical-align:top;' . $border . '">' . $label . '</td>'
            . '<td style="padding:11px 16px;font-weight:600;color:#1f1f1f;'
            . $border . '">' . $value . '</td></tr>';
    }
    return $html . '</table>';
}

// Notify the Genesis team that someone paid. No-op if no admin address set.
function gc_notify_admin(array $reg): void
{
    if (GC_ADMIN_NOTIFY_EMAIL === '') {
        return;
    }
    $kind = ($reg['type'] ?? 'workshop') === 'course' ? 'course admission' : 'workshop registration';
    $body = gc_mail_pill('NEW PAID ' . strtoupper($kind), '#eafaf0', '#137a45')
        . '<p style="margin:0 0 16px;">A new paid ' . $kind . ' just came in:</p>'
        . gc_mail_details($reg);
    gc_send_mail(
        GC_ADMIN_NOTIFY_EMAIL,
        'New paid ' . $kind . ' — ' . (string) ($reg['itemTitle'] ?? ''),
        gc_mail_shell('New registration', (string) ($reg['name'] ?? ''), $body)
    );
}

// Success confirmation to the attendee who paid. Returns whether it sent.
function gc_notify_attendee(array $reg): bool
{
    $to = (string) ($reg['email'] ?? '');
    $isCourse = ($reg['type'] ?? 'workshop') === 'course';
    $what = $isCourse ? 'admission' : 'registration';
    $body = gc_mail_pill('PAYMENT SUCCESSFUL', '#eafaf0', '#137a45')
        . '<p style="margin:0 0 8px;">Hi ' . htmlspecialchars((string) ($reg['name'] ?? '')) . ',</p>'
        . '<p style="margin:0 0 18px;">Thank you! Your payment went through and your '
        . $what . ' is <b>confirmed</b>. Here are your details:</p>'
        . gc_mail_details($reg)
        . '<p style="margin:18px 0 0;color:#555;">Our team will reach out with any '
        . 'further information ahead of the ' . ($isCourse ? 'course' : 'workshop') . '. '
        . 'We look forward to seeing you!</p>'
        . '<p style="margin:16px 0 0;">— Team Genesis Kreations</p>';
    return gc_send_mail(
        $to,
        'Your ' . $what . ' is confirmed — ' . (string) ($reg['itemTitle'] ?? ''),
        gc_mail_shell(
            $isCourse ? 'Admission confirmed' : 'You\'re registered!',
            (string) ($reg['itemTitle'] ?? ''),
            $body
        )
    );
}

// Failure notice to the attendee whose payment did not complete. Returns
// whether it sent.
function gc_notify_attendee_failed(array $reg): bool
{
    $to = (string) ($reg['email'] ?? '');
    $isCourse = ($reg['type'] ?? 'workshop') === 'course';
    $what = $isCourse ? 'admission' : 'registration';
    $retryUrl = GC_SITE_ORIGIN . ($isCourse ? '/academy' : '/workshops');
    $body = gc_mail_pill('PAYMENT FAILED', '#fdecec', '#c0392b')
        . '<p style="margin:0 0 8px;">Hi ' . htmlspecialchars((string) ($reg['name'] ?? '')) . ',</p>'
        . '<p style="margin:0 0 16px;">Your payment for the ' . $what . ' below '
        . '<b>did not complete</b>, so your spot isn\'t booked yet. If any amount was '
        . 'debited, banks auto-reverse failed payments within a few working days.</p>'
        . gc_mail_details($reg)
        . '<p style="margin:18px 0 0;color:#555;">You can try again anytime:</p>'
        . gc_mail_button($retryUrl, $isCourse ? 'Apply again' : 'Register again')
        . '<p style="margin:16px 0 0;">— Team Genesis Kreations</p>';
    return gc_send_mail(
        $to,
        'Payment not completed — ' . (string) ($reg['itemTitle'] ?? ''),
        gc_mail_shell('Payment not completed', (string) ($reg['itemTitle'] ?? ''), $body)
    );
}
