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

require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

Auth::requireAdmin();

$vars = Request::vars();

$getString = static function (array $vars, string $key): string {
    $value = $vars[$key] ?? null;

    if (!is_string($value) || $value === '')
        throw new RuntimeException("'$key' must be a non-empty string", 422);

    return $value;
};

$getAddresses = static function (array $vars, string $key): array {
    $value = $vars[$key] ?? [];

    if (!is_array($value) || !array_is_list($value))
        throw new RuntimeException("'$key' must be a list of email addresses", 422);

    foreach ($value as $address) {
        if (!is_string($address) || $address === '')
            throw new RuntimeException("'$key' must contain only non-empty email addresses", 422);
    }

    return $value;
};

$html = parse_bool($vars['html'] ?? false)
    ?? throw new RuntimeException("'html' must be true or false", 422);

$from = $getString($vars, 'from');
$to = $getString($vars, 'to');
$subject = $getString($vars, 'subject');
$body = $getString($vars, 'body');
$cc = $getAddresses($vars, 'cc');
$bcc = $getAddresses($vars, 'bcc');

if ($html)
    Mail::sendHtml($from, $to, $subject, $body, $cc, $bcc);
else
    Mail::send($from, $to, $subject, $body, $cc, $bcc);

http_response_code(204);
header('Cache-Control: no-store');