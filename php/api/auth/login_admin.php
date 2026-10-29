<?php
/**
 * POST /login_admin.php
 *
 * Body (JSON, form or x-www-form-urlencoded):
 *   password    Plain password of the admin (ADMIN_HASHWORD in the .env).
 *   persistent  Optional, true/false/1/0. Keeps the login with a cookie (see Auth::PERSISTENT_LOGIN_DAYS).
 *
 * Returns the identity (see Auth::me()). 401 if the password is wrong or the app has no admin.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

$password = Request::getString('password', bodyOnly: true);
$persistent = Request::getBoolOrNull('persistent', bodyOnly: true) ?? false;

$me = Auth::loginAdmin($password, $persistent)
    ?? throw new RuntimeException('Invalid credentials', 401);

Api::sendJson($me);