<?php
/**
 * POST /login_user.php
 *
 * Body (JSON, form or x-www-form-urlencoded):
 *   email | username  One of them is required (if both are sent, email is used).
 *   password          Plain password.
 *   persistent        Optional, true/false/1/0. Keeps the login with a cookie (see Auth::PERSISTENT_LOGIN_DAYS).
 *
 * Returns the identity (see Auth::me()). 401 if the credentials are wrong.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

$identifier = Request::getStringOrNull('email', bodyOnly: true)
    ?? Request::getStringOrNull('username', bodyOnly: true)
    ?? throw new RuntimeException("'email' or 'username' is required", 422);
$identifier = trim($identifier);
if ($identifier === '')
    throw new RuntimeException("'email' or 'username' must not be empty", 422);

$password = Request::getString('password', bodyOnly: true);
$persistent = Request::getBoolOrNull('persistent', bodyOnly: true) ?? false;

$me = Auth::loginUser($identifier, $password, $persistent)
    ?? throw new RuntimeException('Invalid credentials', 401);

Api::sendJson($me);