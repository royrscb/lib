<?php

final class Env
{
    private static bool $loaded = false;

	public static function load(string $path): void
	{
        if (self::$loaded)
            return;

		$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if($lines === false)
            throw new RuntimeException('Can not load env file: '.$path);

		foreach ($lines as $line) {
			if (str_starts_with($line, '#') || !str_contains($line, '='))
				continue;

			[$name, $value] = explode('=', $line, 2);

			putenv(trim($name) . '=' . trim($value));
		}

        self::$loaded = true;
	}
}
