<?php
/**
 * POST /api/auth/login_user.php
 *
 * Body (JSON, form or x-www-form-urlencoded):
 *   email | username  One of them is required (if both are sent, email is used).
 *   password          Plain password.
 *   persistent        Optional, true/false/1/0. Keeps the login with a cookie for AUTH_PERSISTENT_LOGIN_DAYS.
 *   includeToken      Optional, true/false/1/0. Includes a signed bearer token in the response.
 *
 * Returns the user identity as JSON, including role 'user' and the user id.
 * When includeToken is true, also returns a token that expires after AUTH_PERSISTENT_LOGIN_DAYS. 401 if credentials are wrong.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Request::requireMethod(HttpMethod::Post);

$identifier = Request::getStringOrNull('email', bodyOnly: true)
    ?? Request::getStringOrNull('username', bodyOnly: true)
    ?? throw new RuntimeException("'email' or 'username' is required", 422);
$identifier = trim($identifier);
if (is_null_or_blank($identifier))
    throw new RuntimeException("'email' or 'username' must not be empty", 422);

$password = Request::getString('password', bodyOnly: true);
$persistent = Request::getBoolOrNull('persistent', bodyOnly: true) ?? false;
$includeToken = Request::getBoolOrNull('includeToken', bodyOnly: true) ?? false;

$me = Auth::loginUser($identifier, $password, $persistent)
    ?? throw new RuntimeException('Invalid credentials', 401);

$response = $me->jsonSerialize();
if ($includeToken) {
    $response['token'] = Auth::getPersistentToken()
        ?? throw new RuntimeException('Could not create persistent login token', 500);
}

Api::sendJson($response);