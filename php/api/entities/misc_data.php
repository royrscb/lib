<?php

require_once __DIR__.'/../../bootstrap.php';

$misc = Database::instance()->miscData();

// String var of the request: '' if it is missing, 422 if it is present but not a string (?key[]=x).
// The real validation (empty key, bad value...) stays in MiscData.
$str = static function (array $vars, string $name): string {
    $value = $vars[$name] ?? '';

    return is_string($value)
        ? $value
        : throw new RuntimeException("'$name' must be a string", 422);
};

// Wraps a handler so MiscDataException becomes a RuntimeException with an HTTP status.
// It is done per handler (not around Api::serve) so the conversion can never run after a response was sent.
$guard = static fn(callable $handler): callable => function (array $vars) use ($handler) {
    try {
        return $handler($vars);
    }
    catch (MiscDataException $e) {
        // MiscDataException codes are reasons (1, 2, 3), not HTTP statuses
        throw new RuntimeException($e->getMessage(), match ($e->getCode()) {
            MiscDataException::NOT_FOUND      => 404,
            MiscDataException::ALREADY_EXISTS => 409,
            default                           => 422, // MiscDataException::INVALID
        }, $e);
    }
};

// MiscData is not a DbTable, so every rule is a handler
Api::serve(null, [
    // GET ?key=x: that value. GET: every key
    'GET' => [ApiAccess::Public, $guard(function (array $vars) use ($misc, $str) {
        $key = $str($vars, 'key');

        return $key === '' ? $misc->all() : $misc->get($key);
    })],

    'POST' => [ApiAccess::Admin, $guard(function (array $vars) use ($misc, $str) {
        $key = $str($vars, 'key');
        $type = MiscDataType::tryFrom($str($vars, 'type'))
            ?? throw new RuntimeException("'type' is not valid", 422);

        // A missing 'value' becomes null: serialize() rejects it with a 422 for every type but json
        $misc->create($key, $type, $vars['value'] ?? null);

        return $misc->get($key);
    })],

    'PUT' => [ApiAccess::Admin, $guard(function (array $vars) use ($misc, $str) {
        $key = $str($vars, 'key');

        $misc->update($key, $vars['value'] ?? null);

        return $misc->get($key);
    })],

    'DELETE' => [ApiAccess::Admin, $guard(function (array $vars) use ($misc, $str) {
        if (!$misc->delete($str($vars, 'key')))
            throw new RuntimeException('Not found', 404);

        return null;
    })],
]);