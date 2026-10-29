<?php
/**
 * POST /send/telegram.php
 *
 * Body (JSON, form or x-www-form-urlencoded):
 *   message  Message to send to the configured Royrscb Telegram chat.
 *
 * Admin only. Message text supports the HTML tags documented by Telegram::send().
 * Returns Telegram's result as JSON.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

Auth::requireAdmin();

$message = Request::vars()['message'] ?? null;

Api::sendJson(Telegram::sendToRoy($message));