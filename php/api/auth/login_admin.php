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

require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

$vars = Request::vars();

$password = $vars['password']
    ?? throw new RuntimeException("'password' is required", 422);
$persistent = parse_bool($vars['persistent'] ?? false)
    ?? throw new RuntimeException("'persistent' must be true or false", 422);

$me = Auth::loginAdmin($password, $persistent)
    ?? throw new RuntimeException('Invalid credentials', 401);

Api::sendJson($me);