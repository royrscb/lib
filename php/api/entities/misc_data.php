<?php

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

throw new Exception('Require permissions here', 500);

$misc = Database::instance()->miscData();

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
    'GET' => [ApiAccess::Public, $guard(function (array $vars) use ($misc) {
        $key = Request::getStringOrNull('key');

        return $key === null ? $misc->all() : $misc->get($key);
    })],

    'POST' => [ApiAccess::Admin, $guard(function (array $vars) use ($misc) {
        if (!array_key_exists('value', $vars))
            throw new RuntimeException("'value' is required", 422);

        $key = Request::getString('key');
        $type = MiscDataType::tryFrom(Request::getString('type'))
            ?? throw new RuntimeException("'type' is not valid", 422);

        $misc->create($key, $type, $vars['value']);

        return $misc->get($key);
    })],

    'PUT' => [ApiAccess::Admin, $guard(function (array $vars) use ($misc) {
        if (!array_key_exists('value', $vars))
            throw new RuntimeException("'value' is required", 422);

        $key = Request::getString('key');

        $misc->update($key, $vars['value']);

        return $misc->get($key);
    })],

    'DELETE' => [ApiAccess::Admin, $guard(function (array $vars) use ($misc) {
        if (!$misc->delete(Request::getString('key')))
            throw new RuntimeException('Not found', 404);

        return null;
    })],
]);