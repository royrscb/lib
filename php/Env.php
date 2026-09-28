<?php

final class Env
{
	public static function load(string $path): void
	{
		$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

		foreach ($lines as $line) {
			$line = trim($line);

			if ($line === '' || str_starts_with($line, '#'))
				continue;

			[$name, $value] = explode('=', $line, 2);

			putenv(trim($name) . '=' . trim($value));
		}
	}
}
