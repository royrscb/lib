<?php

declare(strict_types=1);

/**
 * Input of the current HTTP request: method, query string, body and headers.
 */
final class Request
{
    /** @var array<string, mixed>|null */
    private static ?array $body = null;

    // public --------------------------------------------------------------------------------------

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
     * Value of a request header, or null if it was not sent. The name is not case-sensitive ('X-Api-Token').
     * It does not work for Content-Type and Content-Length, which PHP does not expose as HTTP_ variables.
     */
    public static function header(string $name): ?string
    {
        return $_SERVER['HTTP_'.strtoupper(str_replace('-', '_', $name))]
            ?? null;
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
     * Scheme of the current request, including HTTPS behind a proxy that sets X-Forwarded-Proto.
     * X-Forwarded-Proto can be forged if there is no proxy in front, so do not use this for security decisions.
     */
    public static function getScheme(): string
    {
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';

        return $https ? 'https' : 'http';
    }

    /**
     * Whether the current request uses HTTPS.
     */
    public static function isHttps(): bool
    {
        return self::getScheme() === 'https';
    }

    /**
     * Whether the current request uses HTTP.
     */
    public static function isHttp(): bool
    {
        return self::getScheme() === 'http';
    }

    // Get typed vars ----------------------------

    /**
     * String from the request vars.
     *
     * @param bool $allowEmpty If false (default), an empty string ('') is treated as an error.
     * @param bool $bodyOnly   If true, the value is read only from the body, not from the query string.
     *                         Use it for secrets (passwords, tokens), so they can never travel in the URL.
     * @throws RuntimeException 422 if the key is missing, is not a string, or is empty and $allowEmpty is false;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getString(string $key, bool $allowEmpty = false, bool $bodyOnly = false): string
    {
        try {
            return array_get_string(self::getInputVars($bodyOnly), $key, $allowEmpty);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }
    /**
     * String from the request vars, or null if it is missing or an empty string ('').
     *
     * @param bool $bodyOnly If true, the value is read only from the body, not from the query string.
     *                       Use it for secrets (passwords, tokens), so they can never travel in the URL.
     * @throws RuntimeException 422 if the key is present but is not a string;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getStringOrNull(string $key, bool $bodyOnly = false): ?string
    {
        try {
            return array_get_string_or_null(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }

    /**
     * Integer from the request vars. Only whole numbers in decimal notation are accepted, as an int or
     * as a string of digits with an optional sign ('7', '-3', '+5', '007'). Decimals, exponents, spaces,
     * thousands separators and booleans are rejected, and nothing is ever rounded.
     *
     * @param bool $bodyOnly If true, the value is read only from the body, not from the query string.
     *                       Use it for secrets (passwords, tokens), so they can never travel in the URL.
     * @throws RuntimeException 422 if the key is missing or is not an integer;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getInt(string $key, bool $bodyOnly = false): int
    {
        try {
            return array_get_int(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }
    /**
     * Integer from the request vars, or null if it is missing or an empty string (what a blank form
     * field sends). Otherwise only whole numbers in decimal notation are accepted, as an int or as a
     * string of digits with an optional sign ('7', '-3', '+5', '007'); anything else is rejected.
     *
     * @param bool $bodyOnly If true, the value is read only from the body, not from the query string.
     *                       Use it for secrets (passwords, tokens), so they can never travel in the URL.
     * @throws RuntimeException 422 if the key is present but is not an integer;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getIntOrNull(string $key, bool $bodyOnly = false): ?int
    {
        try {
            return array_get_int_or_null(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }

    /**
     * Number from the request vars as an int or finite float.
     *
     * @param bool $bodyOnly If true, read only from the body, not from the query string.
     * @throws RuntimeException 422 if the key is missing or is not a finite number;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getNumber(string $key, bool $bodyOnly = false): int|float
    {
        try {
            return array_get_number(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }
    /**
     * Optional number from the request vars; missing or empty values return null.
     *
     * @param bool $bodyOnly If true, read only from the body, not from the query string.
     * @throws RuntimeException 422 if the key is present but is not a finite number;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getNumberOrNull(string $key, bool $bodyOnly = false): int|float|null
    {
        try {
            return array_get_number_or_null(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }

    /**
     * Boolean from the request vars: true or false, 1 or 0, or the text 'true' or 'false' in any case.
     * Anything else ('yes', 'on', 2, '') is rejected.
     *
     * @param bool $bodyOnly If true, the value is read only from the body, not from the query string.
     *                       Use it for secrets (passwords, tokens), so they can never travel in the URL.
     * @throws RuntimeException 422 if the key is missing or is not a boolean;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getBool(string $key, bool $bodyOnly = false): bool
    {
        try {
            return array_get_bool(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }

    /**
     * Boolean from the request vars, or null if it is missing or an empty string (what a blank form
     * field sends). Otherwise only true or false, 1 or 0, or the text 'true' or 'false' in any case
     * are accepted; anything else ('yes', 'on', 2) is rejected.
     *
     * @param bool $bodyOnly If true, the value is read only from the body, not from the query string.
     *                       Use it for secrets (passwords, tokens), so they can never travel in the URL.
     * @throws RuntimeException 422 if the key is present but is not a boolean;
     *                          400 if the body is JSON and is not valid.
     */
    public static function getBoolOrNull(string $key, bool $bodyOnly = false): ?bool
    {
        try {
            return array_get_bool_or_null(self::getInputVars($bodyOnly), $key);
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
    }

    // private -------------------------------------------------------------------------------------

    /**
     * Vars that the getters read from: only the body, or the query string and the body together
     * (the body wins if a key is in both).
     *
     * @return array<string, mixed>
     */
    private static function getInputVars(bool $bodyOnly): array
    {
        return $bodyOnly ? self::body() : self::vars();
    }
}