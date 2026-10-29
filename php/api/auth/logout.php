<?php
/**
 * POST /logout.php
 *
 * Closes the session and forgets this device's persistent login cookie.
 * It is not an error to call it with nobody logged in.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

Auth::logout();

Api::sendJson(['ok' => true]);