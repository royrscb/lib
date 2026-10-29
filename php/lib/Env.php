<?php

declare(strict_types=1);

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
     * Use exists() to tell a missing variable from an empty one.
     */
    public static function getOrNull(string $name): ?string
    {
        $value = self::$vars[$name] ?? getenv($name);

        if ($value === false || $value === '')
            return null;

        return $value;
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
}