<?php
/**
 * GET /api/auth/whoami.php
 *
 * Returns the currently authenticated identity:
 *   - the admin: ['id' => null, 'role' => 'admin']
 *   - a user: the user row plus 'role' => 'user'
 *   - nobody: null (200, so the client can ask without an error)
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Request::requireMethod(HttpMethod::Get);

Api::sendJson(Auth::me());