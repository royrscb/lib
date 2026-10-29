<?php

declare(strict_types=1);

/**
 * Sends emails with PHP's mail(). Text and HTML have their own method.
 * The order of the arguments is the one of an email: from, to, subject, body.
 *
 * Mail::send('support@example.com', 'ana@example.com', 'Welcome', "Hi Ana,\nYour account is ready.");
 * Mail::sendHtml('support@example.com', 'ana@example.com', 'Welcome', '<p>Hi <b>Ana</b></p>');
 * Mail::send('support@example.com', 'ana@example.com', 'Welcome', 'Hi', cc: ['boss@example.com'], bcc: ['archive@example.com']);
 *
 * Every failure throws a RuntimeException: 422 if an address is not valid, 500 if mail() fails.
 */
final class Mail
{
    // const ---------------------------------------------------------------------------------------

    private const string CONTENT_TYPE_TEXT = 'text/plain';
    private const string CONTENT_TYPE_HTML = 'text/html';

    // public --------------------------------------------------------------------------------------

    /**
     * Sends a plain text email.
     *
     * @param string $from    Sender email address.
     * @param string $to      Recipient email address.
     * @param string $subject Any text (line breaks are removed).
     * @param string $body    Plain text.
     * @param string[] $cc    Email addresses in copy (visible to everybody).
     * @param string[] $bcc   Email addresses in hidden copy (nobody sees them).
     * @throws RuntimeException 422 if any address is not a valid email, 500 if it can't be sent.
     */
    public static function send(string $from, string $to, string $subject, string $body, array $cc = [], array $bcc = []): void
    {
        self::deliver(self::CONTENT_TYPE_TEXT, $from, $to, $subject, $body, $cc, $bcc);
    }

    /**
     * Sends an HTML email. $html is sent as is: escape any user data inside it (htmlspecialchars).
     *
     * @param string $from    Sender email address.
     * @param string $to      Recipient email address.
     * @param string $subject Any text (line breaks are removed).
     * @param string $html    HTML body.
     * @param string[] $cc    Email addresses in copy (visible to everybody).
     * @param string[] $bcc   Email addresses in hidden copy (nobody sees them).
     * @throws RuntimeException 422 if any address is not a valid email, 500 if it can't be sent.
     */
    public static function sendHtml(string $from, string $to, string $subject, string $html, array $cc = [], array $bcc = []): void
    {
        self::deliver(self::CONTENT_TYPE_HTML, $from, $to, $subject, $html, $cc, $bcc);
    }

    // private -------------------------------------------------------------------------------------

    private static function deliver(string $contentType, string $from, string $to, string $subject, string $body, array $cc, array $bcc): void
    {
        $from = self::getValidAddress($from, 'sender');
        $to   = self::getValidAddress($to, 'recipient');

        $headers = [
            "From: $from",
            'MIME-Version: 1.0',
            "Content-Type: $contentType; charset=utf-8",
            'Content-Transfer-Encoding: base64', // The body is UTF-8, which is not valid as the default 7bit
        ];
        if ($cc)
            $headers[] = 'Cc: '.self::getValidAddresses($cc, 'cc');
        if ($bcc)
            $headers[] = 'Bcc: '.self::getValidAddresses($bcc, 'bcc');

        $encodedSubject = mb_encode_mimeheader(self::removeLineBreaks($subject), 'UTF-8', 'B');
        $encodedBody    = chunk_split(base64_encode($body));

        if (!mail($to, $encodedSubject, $encodedBody, $headers))
            throw new RuntimeException('Error sending email to: '.$to, 500);
    }

    // A valid email never has line breaks, so it can't inject headers (Bcc: ...)
    private static function getValidAddress(string $email, string $role): string
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL))
            throw new RuntimeException("Invalid $role email", 422);

        return $email;
    }

    // Valid emails joined for a header (Cc, Bcc)
    private static function getValidAddresses(array $emails, string $role): string
    {
        return implode(', ', array_map(static fn(string $email) => self::getValidAddress($email, $role), $emails));
    }

    // For the subject, which is not an email: a line break could inject headers
    private static function removeLineBreaks(string $value): string
    {
        return str_replace(["\r", "\n"], '', $value);
    }
}