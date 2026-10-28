<?php

enum HttpMethod: string
{
    case Post   = 'POST';
    case Get    = 'GET';
    case Put    = 'PUT';
    case Delete = 'DELETE';
}

/**
 * Input of the current HTTP request: method, query string, body and headers.
 */
final class Request
{
    /** @var array<string, mixed>|null */
    private static ?array $body = null;

    /**
     * HTTP method of the request (GET when there is none, e.g. on the command line).
     *
     * @throws RuntimeException 405 if the method is not one of HttpMethod (PATCH, HEAD, OPTIONS...).
     */
    public static function method(): HttpMethod
    {
        return HttpMethod::tryFrom(strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'))
            ?? throw new RuntimeException('Method not allowed', 405);
    }

    /**
     * Scheme of the current request, including HTTPS behind a proxy that sets X-Forwarded-Proto.
     * X-Forwarded-Proto can be forged if there is no proxy in front, so do not use this for security decisions.
     */
    public static function scheme(): string
    {
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';

        return $https ? 'https' : 'http';
    }

    public static function isHttps(): bool
    {
        return self::scheme() === 'https';
    }

    public static function isHttp(): bool
    {
        return self::scheme() === 'http';
    }

    /**
     * Query string and body together.
     *
     * @param bool $queryWins If false (default), a key that is in both takes the value from the body.
     *                        If true, it takes the value from the query string.
     * @return array<string, mixed>
     * @throws RuntimeException 400 if the body is JSON and is not valid.
     */
    public static function vars(bool $queryWins = false): array
    {
        // array_replace() instead of array_merge(), which would renumber integer-like keys
        return $queryWins
            ? array_replace(self::body(), $_GET)
            : array_replace($_GET, self::body());
    }

    /**
     * Request body as an array, whatever its format: form ($_POST), JSON or x-www-form-urlencoded
     * (what PUT and DELETE send). Empty if there is no body.
     * A JSON body that is not an object or an array counts as empty.
     * multipart/form-data is only read on POST, because PHP does not parse it on other methods.
     *
     * @return array<string, mixed>
     * @throws RuntimeException 400 if the body is JSON and is not valid.
     */
    public static function body(): array
    {
        if (self::$body !== null)
            return self::$body;

        if (!empty($_POST))
            return self::$body = $_POST;

        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '')
            return self::$body = [];

        if (str_contains(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
            $data = json_decode($raw, true);

            if (json_last_error() !== JSON_ERROR_NONE)
                throw new RuntimeException('Invalid JSON body', 400);

            return self::$body = is_array($data) ? $data : [];
        }

        parse_str($raw, $data);

        return self::$body = $data;
    }

    /**
     * Value of a request header, or null if it was not sent. The name is not case-sensitive ('X-Api-Token').
     * It does not work for Content-Type and Content-Length, which PHP does not expose as HTTP_ variables.
     */
    public static function header(string $name): ?string
    {
        return $_SERVER['HTTP_'.strtoupper(str_replace('-', '_', $name))]
            ?? null;
    }
}
