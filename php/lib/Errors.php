<?php

declare(strict_types=1);

/**
 * Turns every uncaught error into a JSON response (or a message on stderr in the command line)
 * and logs the serious ones.
 *
 * - A Throwable whose code is 400-599 uses it as the HTTP status; anything else is a 500.
 * - Below 500 the message is sent as it is (it is for the client) and nothing is logged.
 * - From 500 up the message is hidden and the error is logged, unless APP_DEBUG = 1/true in the .env
 *   (then the message is also sent).
 * - Log file: LOG_FILEPATH_FROM_ROOT in the .env (relative to APP_ROOT, with an optional leading slash),
 *   or logs/error.log.
 * - Forbidden access (403) and the events sent to logAccess() (for example failed logins) go to their own
 *   access log: ACCESS_LOG_FILEPATH_FROM_ROOT in the .env, or logs/access.log. They are normal 4xx
 *   responses, so they are kept apart from the errors.
 *
 * Registering the handlers does not read the .env file, so it can happen before application
 * configuration is loaded. Configuration is read when an error occurs; process environment
 * variables are still available even if the file has not been loaded.
 */
final class Errors
{
    // Env vars ---
    private const string ENV_APP_DEBUG = 'APP_DEBUG';
    private const string ENV_ERROR_LOG_FILEPATH_FROM_ROOT = 'ERROR_LOG_FILEPATH_FROM_ROOT';
    private const string ENV_ACCESS_LOG_FILEPATH_FROM_ROOT = 'ACCESS_LOG_FILEPATH_FROM_ROOT';
    // ---

    private const string DEFAULT_ERROR_LOG_FILEPATH_FROM_ROOT = '/logs/error.log';
    private const string DEFAULT_ACCESS_LOG_FILEPATH_FROM_ROOT = '/logs/access.log';

    // public --------------------------------------------------------------------------------------

    /**
     * Registers the application error and exception handlers.
     */
    public static function register(): void
    {
        ini_set('display_errors', '0');
        ini_set('zend.exception_ignore_args', '1');
        error_reporting(E_ALL);

        // Warnings and notices become exceptions, so nothing fails silently (deprecations are not converted)
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $severity) || $severity & (E_DEPRECATED | E_USER_DEPRECATED))
                return false;

            throw new ErrorException($message, 0, $severity, $file, $line);
        });

        set_exception_handler(self::handle(...));

        register_shutdown_function(static function (): void {
            $error = error_get_last();
            if ($error === null || !in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true))
                return;

            self::handle(new ErrorException(
                $error['message'],
                0,
                $error['type'],
                $error['file'],
                $error['line']
            ));
        });
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
            self::logError($status, $e);
        else if ($status === 403)
            self::logAccess($status, $e->getMessage());

        try {
            $debug = Env::getBoolOrNull(self::ENV_APP_DEBUG) ?? false;
        } catch (Throwable) {
            $debug = false;
        }
        $message = $status < 500 || $debug
            ? $e->getMessage().($status >= 500 ? ' @ '.$e->getFile().':'.$e->getLine() : '')
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

    // private -------------------------------------------------------------------------------------

    /**
     * Logs a notable client-side event in the access log: failed logins, forbidden access.
     * These are normal 4xx responses, so they go to their own file and not to the error log.
     *
     * @param int    $status  HTTP status of the event (401, 403...).
     * @param string $message Short description. Never pass passwords or tokens.
     */
    private static function logAccess(int $status, string $message): void
    {
        $path = Env::getOrNull(self::ENV_ACCESS_LOG_FILEPATH_FROM_ROOT)
            ?? self::DEFAULT_ACCESS_LOG_FILEPATH_FROM_ROOT;

        // One event per line: line breaks in the message would let a client forge extra entries
        $message = str_replace(["\r", "\n"], ' ', $message);

        self::write($path, sprintf(
            "[%s] [%d] %s %s %s %s\n",
            date('c'),
            $status,
            $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            strtok($_SERVER['REQUEST_URI'] ?? 'cli', '?'),
            $_SERVER['REMOTE_ADDR'] ?? '-',
            $message
        ));
    }

    // Appends the error to the error log. The query string is left out of the URI because it can carry secrets.
    private static function logError(int $status, Throwable $e): void
    {
        $path = Env::getOrNull(self::ENV_ERROR_LOG_FILEPATH_FROM_ROOT)
            ?? self::DEFAULT_ERROR_LOG_FILEPATH_FROM_ROOT;

        self::write($path, sprintf(
            "[%s] [%d] %s %s %s\n%s\n",
            date('c'),
            $status,
            $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            strtok($_SERVER['REQUEST_URI'] ?? 'cli', '?'),
            $_SERVER['REMOTE_ADDR'] ?? '-',
            $e
        ));
    }

    // Appends a text to a log file (path relative to APP_ROOT, with an optional leading slash).
    private static function write(string $path, string $text): void
    {
        $file = APP_ROOT.'/'.ltrim($path, '/');

        // @ because a warning here would become an exception inside the handler itself
        @mkdir(dirname($file), 0775, true);

        // If the file can not be written, fall back to PHP's default log so the text is not lost
        if (!@error_log($text, 3, $file))
            error_log($text);
    }
}