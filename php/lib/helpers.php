<?php

declare(strict_types=1);

// Plain stateless functions. Loaded from bootstrap.php.

// HTTP --------------------------------------------------------------------------------------------

/**
 * Sends an HTTP request with cURL.
 * For GET, $data goes in the query string; for the other methods, in a JSON body.
 *
 * @param string             $method  GET, POST, PUT or DELETE.
 * @param string             $url
 * @param mixed              $data    Query string (GET) or JSON body (the others). Null: nothing is sent.
 * @param array<int, string> $headers Extra headers ('Authorization: Bearer ...').
 * @return array|string The decoded JSON (array) or, if the response is not JSON, the raw text.
 * @throws InvalidArgumentException If $method is not one of the four.
 * @throws RuntimeException 502 if the request fails. The status code of the response is not checked.
 */
function http_request(string $method, string $url, mixed $data = null, array $headers = []): array|string
{
    if (!in_array($method, ['GET', 'POST', 'PUT', 'DELETE'], true))
        throw new InvalidArgumentException('http request method must be either GET, POST, PUT or DELETE', 500);

    if ($method === 'GET' && $data !== null) {
        $url .= (str_contains($url, '?') ? '&' : '?').http_build_query((array)$data);
        $data = null;
    }

    $ch = curl_init($url);

    $headers = array_merge(['User-Agent: Mozilla/5.0 (compatible; PHP-cURL/7.0)', 'Accept: */*'], $headers);

    if ($data !== null) {
        $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        $headers[] = 'Content-Type: application/json';
    }

    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 9,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 5,
        // SSL certificates are verified (it used to be disabled). If your hosting lacks the CA bundle, fix it there.
    ]);

    $result = curl_exec($ch);

    if ($result === false)
        throw new RuntimeException("curl $method error ".curl_errno($ch).': '.curl_error($ch), 502);

    $decoded = json_decode($result, true);

    return is_array($decoded) ? $decoded : $result;
}

// Files -------------------------------------------------------------------------------------------

/**
 * Reduces the width of an image by $widthToReduce pixels, keeping its proportions (rewrites the file).
 * Needs the Imagick extension.
 *
 * @return bool true if the file was rewritten, false if it is not a valid image.
 * @throws InvalidArgumentException 422 if the image is not wider than $widthToReduce.
 * @throws RuntimeException 500 if the file can't be written.
 */
function reduce_image_width(string $src, int $widthToReduce): bool
{
    try { $img = new Imagick($src); }
    catch (Exception) { return false; }

    $geometry = $img->getImageGeometry();
    $width = $geometry['width'] - $widthToReduce;

    if ($width < 1)
        throw new InvalidArgumentException('Can not reduce the image that much', 422);

    $height = (int)round($geometry['height'] / ($geometry['width'] / $width));

    $img->resizeImage($width, $height, Imagick::FILTER_LANCZOS, 1);

    try { return $img->writeImage($src); }
    catch (Exception $e) { throw new RuntimeException("Writing image ($src) with imagick: ".$e->getMessage(), 500); }
    finally { $img->clear(); }
}

// Dates -------------------------------------------------------------------------------------------

/**
 * Current date and time in UTC.
 *
 * @param string|null $format Format of DateTime::format() ('Y-m-d H:i:s'...). Null: the DateTime object.
 */
function date_utc(?string $format = null): DateTime|string
{
    $now = new DateTime('now', new DateTimeZone('UTC'));

    return $format ? $now->format($format) : $now;
}

/**
 * Current date and time in Spain (Europe/Madrid).
 *
 * @param string|null $format Format of DateTime::format() ('Y-m-d H:i:s'...). Null: the DateTime object.
 */
function date_spain(?string $format = null): DateTime|string
{
    $now = new DateTime('now', new DateTimeZone('Europe/Madrid'));

    return $format ? $now->format($format) : $now;
}

/**
 * Whether $value is a date written exactly in that format. It rejects dates that PHP would roll over (2024-02-31).
 *
 * @param string $format 'Y-m-d' by default; also 'Y-m-d H:i:s'...
 */
function is_valid_date(mixed $value, string $format = 'Y-m-d'): bool
{
    if (!is_string($value))
        return false;

    $date = DateTimeImmutable::createFromFormat('!'.$format, $value);

    return $date !== false && $date->format($format) === $value;
}

// Conversion --------------------------------------------------------------------------------------

/**
 * Boolean from a request value, strict: it only understands true/false and 0/1.
 *
 * Returns true for:
 *  - the boolean true
 *  - the int 1 or the string '1'
 *  - the text 'true' in any case ('true', 'TRUE', 'True')
 *
 * Returns false for:
 *  - the boolean false
 *  - the int 0 or the string '0'
 *  - the text 'false' in any case ('false', 'FALSE', 'FaLse')
 *
 * Returns null (not a boolean) for:
 *  - the text 'yes', 'no', 'on', 'off', 'y', 'n', 't', 'f'
 *  - an empty string '', text with spaces around it, or numeric variants ('01', '1.0', '+1', '0.0', '-0')
 *  - any other number: 2, -1, '2', '0.5'
 *  - any other text ('abc')
 *
 * Returns null as well for any other type (null, float, array, object).
 *
 * To also accept 'yes', 'on'... use filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE).
 *
 * @return bool|null The boolean, or null if the value is not one of the cases above.
 */
function parse_bool(mixed $value): ?bool
{
    if (is_bool($value))
        return $value;

    return match ($value) {
        0, '0' => false,
        1, '1' => true,
        default => !is_string($value) ? null
            : match (strtolower($value)) {
                'true' => true,
                'false' => false,
                default => null
            }
    };
}

/**
 * Integer from a request value, strict: only whole numbers written in decimal notation.
 *
 * Returns the int for:
 *  - any int (positive, negative or 0)
 *  - a string of digits with an optional sign: '0', '007', '+5', '-05', '123456'
 *
 * Returns null (not an int) for:
 *  - '' and null
 *  - spaces or line breaks (' 5', '5 ', "5\n")
 *  - decimals or exponents ('5.0', '5.5', '1e3'), hexadecimal ('0x1A'), thousands separators ('1,000')
 *  - digits that are not 0-9 (Arabic or full-width digits)
 *  - a number too big for an int ('9223372036854775808' on 64 bits)
 *  - booleans (true is NOT 1), floats (even 5.0), arrays and objects
 *
 * Leading zeros and explicit plus signs are accepted; non-integers are never rounded or truncated.
 *
 * @return int|null The int, or null if the value is not one of the cases above.
 */
function parse_int(mixed $value): ?int
{
    if (is_int($value))
        return $value;

    if (!is_string($value) || !preg_match('/^[+-]?[0-9]+$/D', $value))
        return null;

    $negative = str_starts_with($value, '-');
    $digits = ltrim($value, '+-');
    $digits = ltrim($digits, '0') ?: '0';
    $normalized = $negative && $digits !== '0' ? '-'.$digits : $digits;

    // Validate the normalized value so leading zeros and a plus sign are accepted without overflow.
    $int = filter_var($normalized, FILTER_VALIDATE_INT);
    return $int === false ? null : $int;
}

// Strings -----------------------------------------------------------------------------------------

/**
 * Whether $value is null or an empty string. Strict: '0' and strings with only spaces are NOT empty
 * (unlike empty(), which treats '0' as empty).
 */
function is_null_or_empty(?string $value): bool
{
    return $value === null || $value === '';
}

/**
 * Splits a name into its words, whatever case it is written in.
 * It cuts at every character that is not a letter or a digit ('_', '-', spaces, '.', '/'...) and
 * between a lower case letter or digit and an upper case letter.
 * A run of capitals is one word, which ends before the capital that starts the next word.
 *
 * 'HolaQue_Tal'  => ['Hola', 'Que', 'Tal']
 * 'hola-que tal' => ['hola', 'que', 'tal']
 * 'HTTPServer'   => ['HTTP', 'Server']
 * 'OrderV2Item'  => ['Order', 'V2', 'Item']
 *
 * @return list<string> The words with their original case (empty array if there are none).
 */
function split_words(string $string): array
{
    $string = preg_replace('/(?<=[\p{Ll}\p{N}])(?=\p{Lu})|(?<=\p{Lu})(?=\p{Lu}\p{Ll})/u', ' ', $string);

    // preg_* return null/false on invalid UTF-8: that counts as no words
    return preg_split('/[^\p{L}\p{N}]+/u', (string)$string, -1, PREG_SPLIT_NO_EMPTY) ?: [];
}

/**
 * Converts a name to snake_case: HolaQue_Tal => hola_que_tal, HTTPServer => http_server.
 * See split_words() for how the words are found.
 */
function to_snake_case(string $string): string
{
    return mb_strtolower(implode('_', split_words($string)));
}

/**
 * Converts a name to kebab-case: HolaQue_Tal => hola-que-tal, HTTPServer => http-server.
 * See split_words() for how the words are found.
 */
function to_kebab_case(string $string): string
{
    return mb_strtolower(implode('-', split_words($string)));
}

/**
 * Converts a name to PascalCase: hola_que_tal => HolaQueTal, HTTPServer => HttpServer.
 * Each word keeps only its first letter in upper case. See split_words() for how the words are found.
 */
function to_pascal_case(string $string): string
{
    $pascal = '';

    foreach (split_words($string) as $word)
        $pascal .= mb_strtoupper(mb_substr($word, 0, 1)).mb_strtolower(mb_substr($word, 1));

    return $pascal;
}

/**
 * Converts a name to camelCase: hola_que_tal => holaQueTal, HTTPServer => httpServer.
 * See split_words() for how the words are found.
 */
function to_camel_case(string $string): string
{
    $pascal = to_pascal_case($string);

    return mb_strtolower(mb_substr($pascal, 0, 1)).mb_substr($pascal, 1);
}