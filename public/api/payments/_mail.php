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
function gc_send_mail(string $to, string $subject, string $html): bool
{
    if (GC_MAIL_FROM === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $fromName = mb_encode_mimeheader(GC_MAIL_FROM_NAME);
    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . GC_MAIL_FROM . '>',
        'Reply-To: ' . GC_MAIL_FROM,
        'X-Mailer: GenesisKreations',
    ]);
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    // Suppress warnings — a failed send must never break the payment flow.
    return @mail($to, $encodedSubject, $html, $headers);
}

// Shared HTML shell for both emails.
function gc_mail_shell(string $heading, string $bodyHtml): string
{
    return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;'
        . 'margin:0 auto;color:#1a1a1a;">'
        . '<div style="background:#cb2957;color:#fff;padding:20px 24px;'
        . 'border-radius:8px 8px 0 0;">'
        . '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;'
        . 'opacity:.85;">Genesis Kreations</div>'
        . '<div style="font-size:20px;font-weight:bold;margin-top:4px;">'
        . htmlspecialchars($heading) . '</div></div>'
        . '<div style="border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px;'
        . 'padding:24px;">' . $bodyHtml . '</div></div>';
}

// Render the registration detail rows shared by both emails.
function gc_mail_details(array $reg): string
{
    $amount = '₹' . number_format(((int) ($reg['amountPaise'] ?? 0)) / 100, 2);
    $kind = ($reg['type'] ?? 'workshop') === 'course' ? 'Course' : 'Workshop';
    $rows = [
        [$kind, (string) ($reg['itemTitle'] ?? '')],
    ];
    if (($reg['sessionCity'] ?? '') !== '') {
        $rows[] = ['Session', (string) $reg['sessionCity']];
    }
    $rows[] = ['Name', (string) ($reg['name'] ?? '')];
    $rows[] = ['Email', (string) ($reg['email'] ?? '')];
    $rows[] = ['Phone', (string) ($reg['phone'] ?? '')];
    if (($reg['dob'] ?? '') !== '') {
        $rows[] = ['Date of birth', (string) $reg['dob']];
    }
    $rows[] = ['Amount paid', $amount];
    $rows[] = ['Order ID', (string) ($reg['merchantOrderId'] ?? '')];

    $html = '<table style="width:100%;border-collapse:collapse;font-size:14px;">';
    foreach ($rows as [$label, $value]) {
        $html .= '<tr>'
            . '<td style="padding:6px 0;color:#777;width:120px;vertical-align:top;">'
            . htmlspecialchars($label) . '</td>'
            . '<td style="padding:6px 0;font-weight:600;">'
            . htmlspecialchars($value) . '</td></tr>';
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
    $body = '<p style="margin:0 0 16px;">A new paid ' . $kind . ' just came in:</p>'
        . gc_mail_details($reg);
    gc_send_mail(
        GC_ADMIN_NOTIFY_EMAIL,
        'New paid ' . $kind . ' — ' . (string) ($reg['itemTitle'] ?? ''),
        gc_mail_shell('New registration', $body)
    );
}

// Confirmation to the attendee who paid.
function gc_notify_attendee(array $reg): void
{
    $to = (string) ($reg['email'] ?? '');
    $isCourse = ($reg['type'] ?? 'workshop') === 'course';
    $what = $isCourse ? 'admission' : 'registration';
    $body = '<p style="margin:0 0 8px;">Hi ' . htmlspecialchars((string) ($reg['name'] ?? '')) . ',</p>'
        . '<p style="margin:0 0 16px;">Thank you! Your payment was successful and your '
        . $what . ' is confirmed. Here are your details:</p>'
        . gc_mail_details($reg)
        . '<p style="margin:16px 0 0;color:#555;">Our team will be in touch with any '
        . 'further information. If you have questions, just reply to this email.</p>'
        . '<p style="margin:16px 0 0;">— Team Genesis Kreations</p>';
    gc_send_mail(
        $to,
        'Your ' . ($isCourse ? 'admission' : 'registration') . ' is confirmed — '
            . (string) ($reg['itemTitle'] ?? ''),
        gc_mail_shell('Payment confirmed', $body)
    );
}
