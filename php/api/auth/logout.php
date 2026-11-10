<?php
/**
 * POST /api/auth/logout.php
 *
 * Closes the session and forgets this device's persistent login cookie.
 * It is not an error to call it with nobody logged in.
 * Returns 204 with no body.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Request::requireMethod(HttpMethod::Post);

Auth::logout();

Api::sendNoContent();