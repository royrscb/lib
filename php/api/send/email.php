<?php
/**
 * POST /send/email.php
 *
 * Body (JSON, form or x-www-form-urlencoded):
 *   from     Sender email address.
 *   to       Recipient email address.
 *   subject  Email subject.
 *   body     Plain text or HTML email body.
 *   html     Optional, true/false/1/0. If true, body is sent as HTML.
 *   cc       Optional list of email addresses.
 *   bcc      Optional list of email addresses.
 *
 * Admin only. Returns 204 when the email is sent.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

Auth::requireAdmin();

$body = Request::body();
$getAddresses = static function (array $body, string $key): array {
    $value = $body[$key] ?? [];

    if (!is_array($value) || !array_is_list($value))
        throw new RuntimeException("'$key' must be a list of email addresses", 422);

    foreach ($value as $address) {
        if (!is_string($address) || $address === '')
            throw new RuntimeException("'$key' must contain only non-empty email addresses", 422);
    }

    return $value;
};

$html = Request::getBoolOrNull('html', bodyOnly: true) ?? false;

$from = Request::getString('from', bodyOnly: true);
$to = Request::getString('to', bodyOnly: true);
$subject = Request::getString('subject', allowEmpty: true, bodyOnly: true);
$message = Request::getString('body', allowEmpty: true, bodyOnly: true);
$cc = $getAddresses($body, 'cc');
$bcc = $getAddresses($body, 'bcc');

if ($html)
    Mail::sendHtml($from, $to, $subject, $message, $cc, $bcc);
else
    Mail::send($from, $to, $subject, $message, $cc, $bcc);

http_response_code(204);
header('Cache-Control: no-store');