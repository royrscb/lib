<?php

declare(strict_types=1);

/**
 * Turns every uncaught error into a JSON response (or a message on stderr in the command line)
 * and logs the serious ones.
 *
 * - A Throwable whose code is 400-599 uses it as the HTTP status; anything else is a 500.
 * - Below 500 the message is sent as it is (it is for the client) and nothing is logged.
 * - From 500 up the message is hidden and the error is logged, unless APP_DEBUG=1 in the .env
 *   (then the message is also sent).
 * - Log file: LOG_FILE in the .env, or logs/app.log in APP_ROOT.
 *
 * register() reads nothing from the .env, so it can run before Env::load(). The .env is read
 * when an error happens, and if it is not loaded yet the defaults are used.
 */
final class Errors
{
    private const string ENV_APP_DEBUG = 'APP_DEBUG';
    private const string ENV_LOG_FILEPATH_FROM_ROOT = 'LOG_FILEPATH_FROM_ROOT';

    /**
     * Registers the application error and exception handlers.
     */
    public static function register(): void
    {
        ini_set('display_errors', '0');
        error_reporting(E_ALL);

        // Warnings and notices become exceptions, so nothing fails silently (deprecations are not converted)
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $severity) || $severity & (E_DEPRECATED | E_USER_DEPRECATED))
                return false;

            throw new ErrorException($message, 0, $severity, $file, $line);
        });

        set_exception_handler(self::handle(...));
    }

    /**
     * Logs an uncaught error and sends the corresponding response or CLI message.
     *
     * @param Throwable $e Uncaught error or exception.
     */
    public static function handle(Throwable $e): void
    {
        $code = $e->getCode();
        $status = is_int($code) && $code >= 400 && $code <= 599 ? $code : 500;

        if ($status >= 500)
            self::log($status, $e);

        $debug = parse_bool(Env::getBoolOrNull(self::ENV_APP_DEBUG) ?? false);
        $message = $status < 500 || $debug ? $e->getMessage() : 'Internal server error';

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

    // Appends the error to the log file. The query string is left out of the URI because it can carry secrets.
    private static function log(int $status, Throwable $e): void
    {
        $file = APP_ROOT.(Env::getOrNull(self::ENV_LOG_FILEPATH_FROM_ROOT) ?? '/logs/app.log');

        $line = sprintf(
            "[%s] [%d] %s %s %s\n%s\n",
            date('c'),
            $status,
            $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            strtok($_SERVER['REQUEST_URI'] ?? 'cli', '?'),
            $_SERVER['REMOTE_ADDR'] ?? '-',
            $e
        );

        // @ because a warning here would become an exception inside the handler itself
        @mkdir(dirname($file), 0775, true);

        // If the file can not be written, fall back to PHP's default log so the error is not lost
        if (!@error_log($line, 3, $file))
            error_log($line);
    }
}