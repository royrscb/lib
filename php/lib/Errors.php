<?php

/**
 * Turns every uncaught error into a JSON response (or a message on stderr in the command line).
 *
 * - A Throwable whose code is 400-599 uses it as the HTTP status; anything else is a 500.
 * - Below 500 the message is sent as it is (it is for the client). From 500 up it is hidden
 *   and logged instead, unless APP_DEBUG=1 in the .env.
 */
final class Errors
{
    public static function register(): void
    {
        ini_set('display_errors', '0');
        error_reporting(E_ALL);

        // Warnings and notices become exceptions, so nothing fails silently (deprecations are only logged)
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $severity) || $severity & (E_DEPRECATED | E_USER_DEPRECATED))
                return false;

            throw new ErrorException($message, 0, $severity, $file, $line);
        });

        set_exception_handler(self::handle(...));
    }

    public static function handle(Throwable $e): void
    {
        $code = $e->getCode();
        $status = is_int($code) && $code >= 400 && $code <= 599 ? $code : 500;
        $debug = Env::getOrNull('APP_DEBUG') === '1';

        if ($status >= 500)
            error_log((string)$e);

        $message = $status < 500 || $debug
            ? $e->getMessage()
            : 'Internal server error';

        if (PHP_SAPI === 'cli') {
            fwrite(STDERR, "[$status] $message\n");
            exit(1);
        }

        if (!headers_sent()) {
            http_response_code($status);
            header('Content-Type: application/json; charset=utf-8');
            header('Cache-Control: no-store');
        }

        echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}