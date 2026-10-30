<?php

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Api::serve(Database::instance()->table(User::class), [
    'GET' => [null, function ($vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        return $userTable->readById($id)
            ?? throw new RuntimeException('Not found', 404);
    }],

    'POST' => [null, function ($vars, User $userTable) {
        $vars['password'] = Request::getString('password', bodyOnly: true);

        return $userTable->create($vars);
    }],

    'PUT' => [null, function ($vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        return $userTable->update($id, $vars)
            ?? throw new RuntimeException('Not found', 404);
    }],

    'DELETE' => [null, function ($vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        $userTable->delete($id);
    }],

    'PUT password' => [null, function ($vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        $password = Request::getString('password', bodyOnly: true);

        $userTable->setPassword($id, $password);
    }],
]);