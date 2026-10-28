<?php

require_once __DIR__.'/../../bootstrap.php';

Api::serve(Database::instance()->table(User::class), [
    'GET' => [null, function ($vars, User $userTable) {
        $id = (int)($vars['id'] ?? 0);
        Auth::requireUser($id);

        return $userTable->readById($id) ?? throw new RuntimeException('Not found', 404);
    }],

    'POST' => ApiAccess::Public,

    'PUT' => [null, function ($vars, User $userTable) {
        $id = (int)($vars['id'] ?? 0);
        Auth::requireUser($id);

        return $userTable->update($id, $vars) ?? throw new RuntimeException('Not found', 404);
    }],

    'DELETE' => [null, function ($vars, User $userTable) {
        $id = (int)($vars['id'] ?? 0);
        Auth::requireUser($id);

        $userTable->delete($id);
    }],

    'PUT password' => [null, function ($vars, User $userTable) {
        $id = (int)($vars['id'] ?? 0);
        Auth::requireUser($id);

        $password = $vars['password'] ?? null;
        if (!is_string($password) || $password === '')
            throw new RuntimeException("'password' is required", 422);

        $userTable->setPassword($id, $password);
    }],
]);