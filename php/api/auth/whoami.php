<?php

/**
 * GET /whoami.php
 *
 * Who is logged in (see Auth::me()):
 *   - the admin: ['id' => null, 'role' => 'admin']
 *   - a user: the user row plus 'role' => 'user'
 *   - nobody: null (200, so the client can ask without an error)
 */

require_once __DIR__.'/bootstrap.php';

if (Request::method() !== HttpMethod::Get)
    throw new RuntimeException('Method not allowed', 405);

Api::sendJson(Auth::me());