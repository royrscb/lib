<?php

declare(strict_types=1);

enum TelegramBotTokenEnv: string
{
    case Royrscb = 'TELEGRAM_BOT_TOKEN_ROYRSCB_BOT';
    case Bug = 'TELEGRAM_BOT_TOKEN_BUGBOT';
    case Volando = 'TELEGRAM_BOT_TOKEN_VOLANDOBOT';
}

enum TelegramChatIdEnv: string
{
    case Royrscb = 'TELEGRAM_CHAT_ID_ROYRSCB';
}

// Static helper to send messages (notifications, error reports).
final class Telegram
{
    private const MAX_SENT_PER_REQUEST = 10;   // loop guard: nothing is sent beyond this
    private const PIECE_LENGTH = 3900;         // Telegram's limit is 4096

    private static int $sent = 0;

    /**
     * Sends a message using a configured bot and chat.
     *
     * The message supports <b>, <i>, <u>, <s>, <a href=""> and <br> tags; other HTML characters are escaped.
     * Long messages are split into multiple Telegram messages. At most MAX_SENT_PER_REQUEST messages are
     * sent during one PHP request.
     *
     * @param string                  $message Message text, optionally containing the supported HTML tags.
     * @param TelegramBotTokenEnv     $bot     Bot whose token is loaded from the matching environment variable.
     * @param TelegramChatIdEnv|int|string $chat Chat whose ID is loaded from the enum, or an explicit chat ID.
     * @param array|null              $keyboard Telegram reply markup.
     * @return array|null Telegram's result for the last sent piece, or null if delivery was prevented by the
     *                     per-request limit or Telegram reports that the bot is blocked / the user deactivated.
     * @throws RuntimeException If a required environment variable is missing or Telegram reports an error.
     */
    public static function send(
        string $message,
        TelegramBotTokenEnv $bot,
        TelegramChatIdEnv|int|string $chat,
        ?array $keyboard = null
    ): ?array
    {
        if (trim($message) === '')
            throw new RuntimeException('Can not send empty message', 422);

        $token = Env::get($bot->value);
        $chatId = $chat instanceof TelegramChatIdEnv ? (int)Env::get($chat->value) : $chat;

        // Messages to my chat get the project name in front (and "localhost|" in development)
        if ((int)$chatId === (int)Env::get(TelegramChatIdEnv::Royrscb->value))
            $message = '<b>['.(Env::isDev() ? 'dev|' : '').Env::get('PROJECT_NAME').']</b><br>'.$message;

        $pieces = self::split(self::toTelegramHtml($message));
        $last = null;

        foreach ($pieces as $i => $piece) {
            if (self::$sent >= self::MAX_SENT_PER_REQUEST)
                return $last;

            self::$sent++;

            if (count($pieces) > 1)
                $piece = '🧩['.($i + 1).'/'.count($pieces)."]\n".$piece;

            $data = ['chat_id' => $chatId, 'text' => $piece, 'parse_mode' => 'HTML'];
            if ($keyboard !== null)
                $data['reply_markup'] = $keyboard;

            $last = self::post($token, $data);
        }

        return $last;
    }

    /**
     * Sends a message to the configured Royrscb chat using the Royrscb bot.
     *
     * @param string     $message Message text, optionally containing supported HTML tags.
     * @param array|null $keyboard Telegram reply markup.
     * @return array|null Telegram's result, or null if delivery was prevented by the per-request limit or
     *                     Telegram reports that the bot is blocked / the user deactivated.
     * @throws RuntimeException If a required environment variable is missing or Telegram reports an error.
     */
    public static function sendToRoy(string $message, ?array $keyboard = null): ?array
    {
        return self::send(
            $message,
            TelegramBotTokenEnv::Royrscb,
            TelegramChatIdEnv::Royrscb,
            $keyboard
        );
    }

    /**
     * Sends an error report to the configured Royrscb chat using the error-reporting bot.
     *
     * @param string $message Error report text.
     * @return array|null Telegram's result, or null if delivery was prevented by the per-request limit or
     *                     Telegram reports that the bot is blocked / the user deactivated.
     * @throws RuntimeException If a required environment variable is missing or Telegram reports an error.
     */
    public static function bug(string $message): ?array
    {
        return self::send(
            $message,
            TelegramBotTokenEnv::Bug,
            TelegramChatIdEnv::Royrscb
        );
    }

    /**
     * Creates inline keyboard markup with one URL button.
     *
     * @param string $url  URL opened when the button is pressed.
     * @param string $text Button label.
     * @return array Telegram inline keyboard markup.
     */
    public static function linkKeyboard(string $url, string $text): array
    {
        return ['inline_keyboard' => [[['url' => $url, 'text' => $text]]]];
    }

    // private -------------------------------------------------------------------------------------

    private static function post(string $token, array $data): ?array
    {
        $response = http_request(HttpMethod::Post->value, "https://api.telegram.org/bot$token/sendMessage", $data);

        if (!is_array($response))
            throw new RuntimeException('Telegram: invalid response', 502);

        if ($response['ok'] ?? false)
            return $response['result'];

        $code = (int)($response['error_code'] ?? 0);
        $description = (string)($response['description'] ?? 'unknown error');

        $wellKnownError = $code === 403 && in_array($description, [
            'Forbidden: bot was blocked by the user',
            'Forbidden: user is deactivated',
        ], true);

        if ($wellKnownError)
            return null;

        throw new RuntimeException("Telegram error $code: $description", 502);
    }

    // <br> => line break; everything is escaped and only the allowed tags are restored
    private static function toTelegramHtml(string $message): string
    {
        $text = preg_replace('#<br\s*/?>#i', "\n", $message);
        $text = htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');

        $text = preg_replace('#&lt;(/?)(b|i|u|s)&gt;#i', '<$1$2>', $text);
        $text = preg_replace('#&lt;a href=(["\'])([^"\'<>]*)\1&gt;#i', '<a href="$2">', $text);

        return str_ireplace('&lt;/a&gt;', '</a>', $text);
    }

    // Splits the text in pieces of at most PIECE_LENGTH characters, cutting at line breaks
    private static function split(string $text): array
    {
        if (mb_strlen($text) <= self::PIECE_LENGTH)
            return [$text];

        $pieces = [];
        $current = '';

        foreach (explode("\n", $text) as $line) {
            foreach (mb_str_split($line, self::PIECE_LENGTH) ?: [''] as $part) {
                if ($current !== '' && mb_strlen($current) + mb_strlen($part) + 1 > self::PIECE_LENGTH) {
                    $pieces[] = $current;
                    $current = '';
                }

                $current .= ($current === '' ? '' : "\n").$part;
            }
        }

        if ($current !== '')
            $pieces[] = $current;

        return $pieces;
    }
}

// Incoming update of a bot webhook, parsed. (Was Telegram_message.)
//
// Example of an update (private chat, /start command):
//   ['update_id' => 724578981, 'message' => [
//       'message_id' => 105735,
//       'from' => ['id' => 3410, 'is_bot' => false, 'first_name' => 'x', 'username' => 'xxx', 'language_code' => 'es'],
//       'chat' => ['id' => 3410, 'first_name' => 'x', 'username' => 'xxx', 'type' => 'private'],
//       'date' => 1748854016, 'text' => '/start',
//       'entities' => [['offset' => 0, 'length' => 6, 'type' => 'bot_command']]]]
final class TelegramMessage
{
    private array $update;

    public ?array $message = null;
    public ?string $type = null;
    public mixed $date = null;
    public ?array $chat = null;
    public ?array $from = null;
    public ?string $text = null;
    public int|string|null $chatId = null;

    // Depending on the type
    public mixed $id = null;                 // callback_query / my_chat_member
    public mixed $data = null;               // callback_query
    public ?array $originalFrom = null;      // callback_query
    public mixed $newChatMember = null;      // new_chat_member / left_chat_member
    public ?string $command = null;          // command
    public ?string $messageReplied = null;   // reply_to_message

    /**
     * Parses a Telegram webhook update into convenient message fields.
     *
     * Recognizes messages, callback queries, membership updates, commands and replies.
     * Unrecognized or incomplete updates leave the corresponding public fields null.
     *
     * @param array<string, mixed> $update Decoded Telegram Bot API update.
     */
    public function __construct(array $update)
    {
        $this->update = $update;

        if (isset($update['message'])) {
            $this->message = $update['message'];
        }
        else if (isset($update['callback_query'])) {
            $this->type = 'callback_query';
            $this->id = $update['callback_query']['id'];
            $this->data = $update['callback_query']['data'] ?? null;
            $this->message = $update['callback_query']['message'] ?? null;
            $this->originalFrom = $update['callback_query']['from'] ?? null;
        }
        else if (isset($update['my_chat_member'])) {
            $this->type = 'my_chat_member';
            $this->id = $update['my_chat_member']['chat']['id'] ?? null;
            $this->message = $update['my_chat_member'];
        }

        $this->date = $this->message['date'] ?? null;
        $this->chat = $this->message['chat'] ?? null;
        $this->from = $this->message['from'] ?? null;
        $this->text = $this->message['text'] ?? null;

        $this->chatId = $this->chat['id'] ?? null;

        // callback_query and my_chat_member keep the type set above (before, a callback_query ended up as 'message')
        if ($this->type !== null)
            return;

        if (!empty($this->message['group_chat_created'])) {
            $this->type = 'group_chat_created';
        }
        else if (isset($this->message['new_chat_member'])) {
            $this->type = 'new_chat_member';
            $this->newChatMember = $this->message['new_chat_member'];
        }
        else if (isset($this->message['left_chat_member'])) {
            $this->type = 'left_chat_member';
            $this->newChatMember = $this->message['left_chat_member'];   // kept as it was (same property for both)
        }
        else if (($this->message['entities'][0]['type'] ?? null) === 'bot_command') {
            $this->type = 'command';
            $this->command = explode('@', (string)$this->text)[0];
        }
        else if (isset($this->message['reply_to_message'])) {
            $this->type = 'reply_to_message';
            $this->messageReplied = $this->message['reply_to_message']['text'] ?? null;
        }
        else $this->type = 'message';
    }

    /**
     * Whether this update's chat is a group or supergroup.
     */
    public function fromGroup(): bool
    {
        return in_array($this->chat['type'] ?? null, ['group', 'supergroup'], true);
    }
}

/**
 * Thin wrapper of the Telegram Bot API for webhook bots.
 *
 * Request and API failures throw RuntimeException; invalid local arguments throw InvalidArgumentException.
 */
final class TelegramBot
{
    private string $token;
    private string $username;

    public ?TelegramMessage $msg = null;
    public int|string|null $defaultChatId = null;

    /**
     * Creates a bot client, optionally attaching the incoming webhook update.
     *
     * @param string $token    Telegram bot token.
     * @param string $username Bot username, used to identify the bot in API error messages.
     * @param array|null $update Decoded incoming Telegram update, if handling a webhook.
     */
    public function __construct(string $token, string $username, ?array $update = null)
    {
        $this->token = $token;
        $this->username = $username;

        if ($update !== null)
            $this->msg = new TelegramMessage($update);
    }

    private function postMethod(string $method, ?array $data = null): mixed
    {
        $response = http_request(HttpMethod::Post->value, 'https://api.telegram.org/bot'.$this->token.'/'.$method, $data);

        if (!is_array($response))
            throw new RuntimeException("Telegram bot $this->username: invalid response", 502);

        if ($response['ok'] ?? false)
            return $response['result'];

        $code = $response['error_code'] ?? 0;
        $description = (string)($response['description'] ?? 'unknown error');

        throw new RuntimeException("Telegram bot $this->username error $code: $description", 502);
    }

    /**
     * Gets this bot's Telegram account information.
     *
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function getMe(): mixed
    {
        return $this->postMethod('getMe');
    }

    /**
     * Gets pending updates for this bot.
     *
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function getUpdates(): mixed
    {
        return $this->postMethod('getUpdates');
    }

    /**
     * Sets the default destination used by sendMessage() when no chat ID is provided.
     *
     * @param int|string $chatId Telegram chat ID.
     */
    public function setDefaultChatId(int|string $chatId): void
    {
        $this->defaultChatId = $chatId;
    }

    /**
     * Gets this bot's webhook configuration.
     *
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function getWebhook(): mixed
    {
        return $this->postMethod('getWebhookInfo');
    }
    /**
     * Sets the URL Telegram uses to deliver updates to this bot.
     *
     * @param string $url Public HTTPS webhook URL.
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function setWebhook(string $url): mixed
    {
        return $this->postMethod('setWebhook', ['url' => $url]);
    }
    /**
     * Deletes this bot's webhook.
     *
     * @param bool $dropPendingUpdates Whether Telegram should discard pending updates.
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function deleteWebhook(bool $dropPendingUpdates = true): mixed
    {
        return $this->postMethod('deleteWebhook', ['drop_pending_updates' => $dropPendingUpdates]);
    }

    /**
     * Replies to the chat associated with the attached incoming update.
     *
     * @param string $text Reply text.
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If there is no attached update, the request fails, or Telegram returns an error.
     * @throws InvalidArgumentException If the text is empty or no chat ID is available.
     */
    public function replyMessage(string $text): mixed
    {
        if ($this->msg === null)
            throw new RuntimeException('No incoming message was set in the constructor', 500);

        return $this->sendMessage($text, $this->msg->chatId);
    }
    /**
     * Sends a message to the given chat or the configured default chat.
     *
     * @param string $message Message text.
     * @param int|string|null $chatId Destination chat; defaults to defaultChatId.
     * @param array|null $keyboard Telegram reply markup.
     * @param bool $html Whether Telegram should parse the message as HTML.
     * @return mixed The Telegram Bot API result.
     * @throws InvalidArgumentException If the message is empty or no chat ID is available.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function sendMessage(string $message, int|string|null $chatId = null, ?array $keyboard = null, bool $html = false): mixed
    {
        if ($message === '')
            throw new InvalidArgumentException('Can not send empty message', 422);

        $chatId ??= $this->defaultChatId;

        if ($chatId === null)
            throw new InvalidArgumentException('Chat ID is required', 422);

        $data = [
            'chat_id' => $chatId,
            'text' => $message
        ];
        if ($html) $data['parse_mode'] = 'HTML';
        if ($keyboard !== null) $data['reply_markup'] = $keyboard;

        return $this->postMethod('sendMessage', $data);
    }

    /**
     * Sends a message with one inline callback button.
     *
     * @param int|string $chatId Destination chat.
     * @param string $message Message text.
     * @param string $buttonText Button label.
     * @param string $callbackData Data returned when the button is pressed.
     * @param bool $html Whether Telegram should parse the message as HTML.
     * @return mixed The Telegram Bot API result.
     * @throws InvalidArgumentException If the message is empty.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function sendButton(int|string $chatId, string $message, string $buttonText, string $callbackData, bool $html = false): mixed
    {
        $button = ['text' => $buttonText, 'callback_data' => $callbackData];
        $keyboard = ['inline_keyboard' => [[$button]]];

        return $this->sendMessage($message, $chatId, $keyboard, $html);
    }

    /**
     * Edits an existing message.
     *
     * @param int|string $chatId Chat containing the message.
     * @param int $messageId ID of the message to edit.
     * @param string $message Replacement message text.
     * @param array|null $keyboard Replacement inline keyboard, if any.
     * @param bool $html Whether Telegram should parse the message as HTML.
     * @return mixed The Telegram Bot API result.
     * @throws InvalidArgumentException If the replacement message is empty.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function editMessage(int|string $chatId, int $messageId, string $message, ?array $keyboard = null, bool $html = false): mixed
    {
        if ($message === '')
            throw new InvalidArgumentException('Can not send empty message', 422);

        $data = [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $message
        ];
        if ($html) $data['parse_mode'] = 'HTML';
        if ($keyboard !== null) $data['reply_markup'] = $keyboard;

        return $this->postMethod('editMessageText', $data);
    }

    /**
     * Edits an existing message and sets a single inline callback button.
     *
     * @param int|string $chatId Chat containing the message.
     * @param int $messageId ID of the message to edit.
     * @param string $message Replacement message text.
     * @param string $buttonText Button label.
     * @param string $callbackData Data returned when the button is pressed.
     * @param bool $html Whether Telegram should parse the message as HTML.
     * @return mixed The Telegram Bot API result.
     * @throws InvalidArgumentException If the replacement message is empty.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function editButton(int|string $chatId, int $messageId, string $message, string $buttonText, string $callbackData, bool $html = false): mixed
    {
        $button = ['text' => $buttonText, 'callback_data' => $callbackData];
        $keyboard = ['inline_keyboard' => [[$button]]];

        return $this->editMessage($chatId, $messageId, $message, $keyboard, $html);
    }

    /**
     * Answers a callback query, optionally displaying a message to the user.
     *
     * @param string $callbackQueryId ID of the callback query to answer.
     * @param string|null $message Optional text to display.
     * @param bool $showAlert Whether to display the text as an alert instead of a notification.
     * @return mixed The Telegram Bot API result.
     * @throws RuntimeException If the request fails or Telegram returns an error.
     */
    public function answerCallbackQuery(string $callbackQueryId, ?string $message = null, bool $showAlert = false): mixed
    {
        $data = ['callback_query_id' => $callbackQueryId];
        if ($message !== null) {
            $data['text'] = $message;
            $data['show_alert'] = $showAlert;
        }

        return $this->postMethod('answerCallbackQuery', $data);
    }
}
