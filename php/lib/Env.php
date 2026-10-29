<?php

declare(strict_types=1);

enum AppEnv: string
{
    case Dev = 'dev';
    case Prod = 'prod';
}

final class Env
{
    private static bool $loaded = false;
    /** @var array<string, string> */
    private static array $vars = [];

    /**
     * Loads the env file. Only the first successful call has effect.
     *
     * Calling it is optional for get() / getOrNull(), which also read the system environment (getenv).
     *
     * A variable can have an empty value (`FOO=`), but its name can't be empty (`=value` is ignored).
     *
     * Quoted values are not supported (the quotes become part of the value), and comments must be
     * on their own line (trailing comments after a value are not supported).
     *
     * @param bool $overrideSystem If false (default), a variable already defined in the system
     *                             environment keeps its system value and the file's one is ignored.
     *                             If true, the file wins.
     * @throws RuntimeException If the file can't be read.
     */
    public static function load(string $path, bool $overrideSystem = false): void
    {
        if (self::$loaded)
            return;

        if (!is_file($path) || ($lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) === false)
            throw new RuntimeException('Can not load env file: '.$path, 500);

        // Snapshot taken before the loop, because putenv() below would otherwise make a variable repeated in the file look like it came from the system
        $system = $overrideSystem ? [] : getenv();

        foreach ($lines as $line) {
            $line = trim($line);

            // Comments must be on their own line (trailing comments after a value are not supported)
            if ($line === '' || $line[0] === '#' || !str_contains($line, '='))
                continue;

            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            if ($name === '' || isset($system[$name]))
                continue;

            self::$vars[$name] = $value;
            putenv("$name=$value"); // In case some library uses getenv()
        }

        self::$loaded = true;
    }

    /**
     * Names (not values) of the variables loaded from the file.
     *
     * @return list<string>
     */
    public static function names(): array
    {
        return array_keys(self::$vars);
    }

    /**
     * Whether the variable is defined (in the loaded file or the system environment), even if its value is empty.
     */
    public static function exists(string $name): bool
    {
        return isset(self::$vars[$name]) || getenv($name) !== false;
    }

    /**
     * Returns an env variable, from the loaded file or else from the system environment
     * (see load() for which one wins when both define it).
     *
     * @param bool $allowEmpty If false (default), an empty value is treated as an error.
     * @throws RuntimeException If the variable is missing, or empty and $allowEmpty is false.
     */
    public static function get(string $name, bool $allowEmpty = false): string
    {
        $value = self::$vars[$name] ?? getenv($name);

        if ($value === false)
            throw new RuntimeException("Missing env var: $name".(self::$loaded ? '' : ' (Env not loaded)'), 500);

        if ($value === '' && !$allowEmpty)
            throw new RuntimeException("Empty env var: $name", 500);

        return $value;
    }

    /**
     * Returns an env variable, or null if it is missing or empty.
     * Note: Use exists() to tell a missing variable from an empty one.
     */
    public static function getOrNull(string $name): ?string
    {
        $value = self::$vars[$name] ?? getenv($name);

        if ($value === false || $value === '')
            return null;

        return $value;
    }

    /**
     * Returns an env variable as a boolean: true/false, 1/0, or the text "true"/"false" in any case.
     *
     * @throws RuntimeException If the variable is missing, empty, or not a valid boolean.
     */
    public static function getBool(string $name): bool
    {
        $value = parse_bool(self::get($name));

        return $value
            ?? throw new RuntimeException("Invalid env var $name: expected true or false", 500);
    }
    /**
     * Returns an env variable as a boolean, or null if it is missing or empty.
     *
     * @throws RuntimeException If the variable is present but is not a valid boolean.
     */
    public static function getBoolOrNull(string $name): ?bool
    {
        $raw = self::getOrNull($name);

        if ($raw === null)
            return null;

        return parse_bool($raw)
            ?? throw new RuntimeException("Invalid env var $name: expected true or false", 500);
    }

    /**
     * Returns an env variable as an integer. Only whole numbers in decimal notation are accepted.
     *
     * @throws RuntimeException If the variable is missing, empty, or not a valid integer.
     */
    public static function getInt(string $name): int
    {
        return parse_int(self::get($name))
            ?? throw new RuntimeException("Invalid env var $name: expected an integer", 500);
    }
    /**
     * Returns an env variable as an integer, or null if it is missing or empty.
     *
     * @throws RuntimeException If the variable is present but is not a valid integer.
     */
    public static function getIntOrNull(string $name): ?int
    {
        $raw = self::getOrNull($name);

        if ($raw === null)
            return null;

        return parse_int($raw)
            ?? throw new RuntimeException("Invalid env var $name: expected an integer", 500);
    }

    /**
     * Returns an env variable as an int or finite float.
     *
     * @throws RuntimeException If the variable is missing, empty, or not a finite number.
     */
    public static function getNumber(string $name): int|float
    {
        return parse_number(self::get($name))
            ?? throw new RuntimeException("Invalid env var $name: expected a finite number", 500);
    }
    /**
     * Returns an env variable as an int or finite float, or null if it is missing or empty.
     *
     * @throws RuntimeException If the variable is present but is not a finite number.
     */
    public static function getNumberOrNull(string $name): int|float|null
    {
        $raw = self::getOrNull($name);

        if ($raw === null)
            return null;

        return parse_number($raw)
            ?? throw new RuntimeException("Invalid env var $name: expected a finite number", 500);
    }

    /**
     * Whether APP_ENV is set to "dev".
     */
    public static function isDev(): bool
    {
        return self::appEnv() === AppEnv::Dev;
    }

    /**
     * Whether APP_ENV is set to "prod".
     */
    public static function isProd(): bool
    {
        return self::appEnv() === AppEnv::Prod;
    }

    /**
     * Returns the configured application environment.
     *
     * @throws RuntimeException If APP_ENV is missing, empty, or not a supported environment.
     */
    public static function appEnv(): AppEnv
    {
        return AppEnv::tryFrom(self::get('APP_ENV'))
            ?? throw new RuntimeException("Invalid env var APP_ENV: expected 'dev' or 'prod'", 500);
    }
}