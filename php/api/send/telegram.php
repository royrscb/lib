<?php
/**
 * POST /send/telegram.php
 *
 * Body (JSON, form or x-www-form-urlencoded):
 *   message  Message to send to the configured Royrscb Telegram chat.
 *
 * Admin only. Message text supports <b>, <i>, <u>, <s>, <a href=""> and <br>; other HTML characters are escaped.
 * Returns Telegram's result as JSON.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

Request::requireMethod(HttpMethod::Post);

Auth::requireAdmin();

$message = Request::getString('message', bodyOnly: true);
if (trim($message) === '')
    throw new RuntimeException("'message' must not be empty", 422);

Api::sendJson(Telegram::sendToRoy($message));