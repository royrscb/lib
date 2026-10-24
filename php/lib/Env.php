<?php

enum AppEnv: string
{
    case Local = 'LOCAL';
    case Prod = 'PROD';
}

final class Env
{
    private const array REQUIRED_VARS = [
        'APP_ENV',
    ];

    private static bool $loaded = false;
    /** @var array<string, string> */
    private static array $vars = [];

    /**
     * Loads the env file and checks that the required variables exist and APP_ENV is valid.
     * Only the first call has effect.
     *
     * Calling it is optional for get() / isLocal(), which also read the system environment
     * (getenv), but without it the required variables and APP_ENV are not validated.
     *
     * A variable can have an empty value (`FOO=`), but its name can't be empty (`=value` is ignored).
     * Required variables must also be non-empty.
     *
     * @param bool $overrideSystem If false (default), a variable already defined in the system
     *                             environment keeps its system value and the file's one is ignored.
     *                             If true, the file wins.
     * @throws RuntimeException If the file can't be read, a required variable is missing (or empty)
     *                          or APP_ENV is not one of the AppEnv values.
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

        $missing = array_filter(self::REQUIRED_VARS, static fn(string $name) => self::get($name, '') === '');

        if ($missing)
            throw new RuntimeException('Missing required env vars: '.implode(', ', $missing), 500);

        if (AppEnv::tryFrom(self::get('APP_ENV')) === null) {
            $valid = implode(', ', array_column(AppEnv::cases(), 'value'));
            throw new RuntimeException("APP_ENV must be one of: $valid", 500);
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
     * Without $default, a missing variable throws instead of returning false like getenv().
     *
     * @throws RuntimeException If the variable does not exist and there is no $default.
     */
    public static function get(string $name, ?string $default = null): string
    {
        $value = self::$vars[$name] ?? getenv($name);

        if ($value === false)
            return $default ?? throw new RuntimeException("Missing env var: $name".(self::$loaded ? '' : ' (Env not loaded)'), 500);

        return $value;
    }

    /**
     * Names (not values) of the variables loaded from the file.
     */
    public static function names(): array
    {
        return array_keys(self::$vars);
    }

    /**
     * Whether the app is running in the local environment (APP_ENV=LOCAL).
     *
     * @throws RuntimeException If APP_ENV is missing.
     */
    public static function isLocal(): bool
    {
        return self::get('APP_ENV') === AppEnv::Local->value;
    }

    /**
     * Whether the app is running in the prod environment (APP_ENV=PROD).
     *
     * @throws RuntimeException If APP_ENV is missing.
     */
    public static function isProd(): bool
    {
        return self::get('APP_ENV') === AppEnv::Prod->value;
    }
}