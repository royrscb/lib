<?php

declare(strict_types=1);

enum MiscDataType: string
{
    case Number = 'number';
    case Bool = 'bool';
    case String = 'string';
    case Date = 'date';
    case DateTime = 'dateTime';
    case Json = 'json';
}

/**
 * Error raised by MiscData for anything the caller can cause. The reason is in getCode().
 * The caller decides how to react (e.g. map the reason to an HTTP status in an API).
 */
final class MiscDataException extends RuntimeException
{
    public const int INVALID = 1;        // Bad key, type or value
    public const int NOT_FOUND = 2;      // The key does not exist
    public const int ALREADY_EXISTS = 3; // The key already exists (create only)
}

/**
 * Typed key/value store backed by the `misc_data` table.
 *
 * Caller errors throw MiscDataException (see its constants). Anything else (database failure, corrupt data...) is an unexpected error and is thrown as is.
 */
final class MiscData
{
    private const string TABLE_NAME = 'misc_data';

    private const int KEY_MAX_LENGTH = 128;
    private const int ER_DUP_ENTRY = 1062;
    private const string DATE_FORMAT = 'Y-m-d';
    private const string DATETIME_FORMAT = 'Y-m-d H:i:s';

    private readonly Database $db;

    // Constructor ---------------------------------------------------------------------------------

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    // public --------------------------------------------------------------------------------------

    /**
     * Creates a new key.
     *
     * @throws MiscDataException INVALID if the key is empty or the value doesn't match $type,
     *                           ALREADY_EXISTS if the key already exists.
     */
    public function create(string $key, MiscDataType $type, mixed $value): void
    {
        self::validateKey($key);

        try {
            $this->db->query(
                'INSERT INTO `'.self::TABLE_NAME.'` (`key`, type, value) VALUES (?, ?, ?)',
                [$key, $type->value, self::serialize($type, $value)]
            );
        }
        catch (mysqli_sql_exception $e) {
            if ($e->getCode() === self::ER_DUP_ENTRY)
                throw new MiscDataException("MiscData key '$key' already exists", MiscDataException::ALREADY_EXISTS, $e);

            throw $e;
        }
    }

    /**
     * Returns the typed value of a key (null if the stored value is NULL / JSON null).
     *
     * @throws MiscDataException INVALID if the key is empty, NOT_FOUND if it does not exist.
     */
    public function get(string $key): mixed
    {
        self::validateKey($key);

        $row = $this->db->query(
            'SELECT type, value FROM `'.self::TABLE_NAME.'` WHERE `key` = ?',
            [$key]
        )->fetch_assoc() ?? throw new MiscDataException("MiscData key '$key' does not exist", MiscDataException::NOT_FOUND);

        return self::deserialize(
            MiscDataType::from($row['type']),
            $row['value']
        );
    }

    /**
     * Returns all keys.
     *
     * Note: JSON values are decoded as associative arrays, so an empty JSON object `{}` comes
     * back as `[]`.
     *
     * @return array<string, mixed> key => typed value (empty array if there is no data).
     */
    public function all(): array
    {
        $result = $this->db->query('SELECT `key`, type, value FROM `'.self::TABLE_NAME.'`');

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[$row['key']] = self::deserialize(
                MiscDataType::from($row['type']),
                $row['value']
            );
        }

        return $data;
    }

    /**
     * Whether the key exists (regardless of its value, which may be null).
     *
     * @throws MiscDataException INVALID if the key is empty.
     */
    public function exists(string $key): bool
    {
        self::validateKey($key);

        return $this->db->query(
            'SELECT 1 FROM `'.self::TABLE_NAME.'` WHERE `key` = ?',
            [$key]
        )->num_rows > 0;
    }

    /**
     * Changes the value of an existing key. The key's type never changes.
     *
     * @throws MiscDataException INVALID if the key is empty or the value doesn't match its type,
     *                           NOT_FOUND if the key does not exist.
     */
    public function update(string $key, mixed $value): void
    {
        self::validateKey($key);

        $row = $this->db->query(
            'SELECT type FROM `'.self::TABLE_NAME.'` WHERE `key` = ?',
            [$key]
        )->fetch_assoc() ?? throw new MiscDataException("MiscData key '$key' does not exist", MiscDataException::NOT_FOUND);

        $serializedValue = self::serialize(MiscDataType::from($row['type']), $value);

        $this->db->query(
            'UPDATE `'.self::TABLE_NAME.'` SET value = ? WHERE `key` = ?',
            [$serializedValue, $key]
        );
    }

    /**
     * Creates the key if it does not exist; otherwise changes its value keeping its existing
     * type (so $type is ignored for keys that already exist).
     *
     * @throws MiscDataException INVALID if the key is empty or the value doesn't match the type.
     */
    public function set(string $key, MiscDataType $type, mixed $value): void
    {
        if ($this->exists($key)) {
            $this->update($key, $value);
        }
        else {
            $this->create($key, $type, $value);
        }
    }

    /**
     * Deletes a key.
     *
     * @return bool true if the key existed and was deleted, false if it did not exist.
     * @throws MiscDataException INVALID if the key is empty.
     */
    public function delete(string $key): bool
    {
        if (!$this->exists($key))
            return false;

        $this->db->query(
            'DELETE FROM `'.self::TABLE_NAME.'` WHERE `key` = ?',
            [$key]
        );

        return true;
    }

    // private -------------------------------------------------------------------------------------

    private static function validateKey(string $key): void
    {
        if ($key === '')
            throw new MiscDataException("'key' is required", MiscDataException::INVALID);

        if (mb_strlen($key) > self::KEY_MAX_LENGTH)
            throw new MiscDataException("'key' must be at most ".self::KEY_MAX_LENGTH." characters", MiscDataException::INVALID);
    }

    // Client value => text stored in the value column. Validates the value against the type.
    private static function serialize(MiscDataType $type, mixed $value): string
    {
        switch ($type) {
            case MiscDataType::String:
                if (!is_string($value))
                    throw new MiscDataException('Value must be a string', MiscDataException::INVALID);

                return $value;

            case MiscDataType::Number:
                if (!is_numeric($value))
                    throw new MiscDataException('Value must be a number', MiscDataException::INVALID);

                $number = $value + 0; // normalizes numeric strings ("5", " 1e3") to int|float

                if (!is_float($number))
                    return (string)$number;

                if (!is_finite($number))
                    throw new MiscDataException('Value must be a finite number', MiscDataException::INVALID);

                // json_encode uses serialize_precision (-1): shortest text that round-trips.
                // (string) would use `precision` and lose digits (0.1 + 0.2 => "0.3").
                return json_encode($number, JSON_THROW_ON_ERROR);

            case MiscDataType::Bool:
                $bool = is_scalar($value) ? parse_bool($value) : null;

                if ($bool === null)
                    throw new MiscDataException('Value must be a boolean', MiscDataException::INVALID);

                return $bool ? '1' : '0';

            case MiscDataType::Date:
            case MiscDataType::DateTime:
                $format = $type === MiscDataType::Date ? self::DATE_FORMAT : self::DATETIME_FORMAT;

                if (!is_valid_date($value, $format))
                    throw new MiscDataException("Value must be a valid date with format '$format'", MiscDataException::INVALID);

                return $value;

            case MiscDataType::Json:
                try {
                    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
                }
                catch (JsonException $e) {
                    throw new MiscDataException('Value cannot be encoded as JSON', MiscDataException::INVALID, $e);
                }
        }

        // Only reachable if a new enum case is added and not handled above
        throw new LogicException("Unhandled MiscData type: {$type->value}");
    }

    // Stored text => typed value (inverse of serialize)
    private static function deserialize(MiscDataType $type, ?string $value): mixed
    {
        if ($value === null)
            return null;

        return match ($type) {
            MiscDataType::String, MiscDataType::Date, MiscDataType::DateTime => $value,
            MiscDataType::Number => $value + 0, // int or float depending on the stored text
            MiscDataType::Bool   => $value !== '0',
            MiscDataType::Json   => json_decode($value, true, 512, JSON_THROW_ON_ERROR),
        };
    }
}

/*
CREATE TABLE `misc_data` (
    `key`   VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    `type`  ENUM('number', 'bool', 'string', 'date', 'dateTime', 'json') NOT NULL,
    `value` TEXT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/
