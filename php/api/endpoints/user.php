<?php

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Api::serve(Database::instance()->table(User::class), [
    'GET' => function (array $vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        return $userTable->readById($id)
            ?? throw new RuntimeException('Not found', 404);
    },

    'POST' => function (array $vars, User $userTable) {
        $vars['password'] = Request::getString('password', bodyOnly: true);

        return $userTable->create($vars);
    },

    'PUT' => function (array $vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        return $userTable->update($id, $vars)
            ?? throw new RuntimeException('Not found', 404);
    },

    'DELETE' => function (array $vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id);

        $userTable->delete($id);
    },

    'PUT password' => function ($vars, User $userTable) {
        $id = Request::getInt('id');
        Auth::requireUser($id, allowAdmin: false);

        $currentPassword = Request::getString('current_password', bodyOnly: true);
        $newPassword = Request::getString('password', bodyOnly: true);

        $userTable->changePassword($id, $currentPassword, $newPassword);
        Auth::passwordChanged($id);
    },
]);