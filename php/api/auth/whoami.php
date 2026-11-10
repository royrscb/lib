<?php
/**
 * GET /api/auth/whoami.php
 *
 * Returns the currently authenticated identity:
 *   - the admin: ['id' => null, 'role' => 'admin']
 *   - a user: the user row plus 'role' => 'user'
 *   - nobody: 401
 *
 * Each call renews the login for another AUTH_PERSISTENT_LOGIN_DAYS:
 *   - Bearer request (the app): the response includes a fresh 'token'.
 *   - Cookie request (web): the persistent login cookie is renewed, if the device has one.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Request::requireMethod(HttpMethod::Post);
Auth::requireUser();

$response = Auth::me()->jsonSerialize();

if (Request::header('Authorization') !== null)
    $response['token'] = Auth::getPersistentToken();
else
    Auth::renewPersistentCookie();

Api::sendJson($response);