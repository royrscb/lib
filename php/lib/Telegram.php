<?php

// Names of the .env variables (not the values)
enum TelegramBotToken: string
{
    case Royrscb = 'TELEGRAM_BOT_TOKEN_ROYRSCB_BOT';
    case Bug = 'TELEGRAM_BOT_TOKEN_BUGBOT';
    case Volando = 'TELEGRAM_BOT_TOKEN_VOLANDOBOT';
}
enum TelegramChat: string
{
    case Royrscb = 'TELEGRAM_CHAT_ID_ROYRSCB';
}

// Static helper to send messages (notifications, error reports).
final class Telegram
{
    private const MAX_SENT_PER_REQUEST = 10;   // loop guard: nothing is sent beyond this
    private const PIECE_LENGTH = 3900;         // Telegram's limit is 4096

    private static int $sent = 0;

    // Message with <b> <i> <u> <s> <a href=""> and <br> tags; any other < > & is escaped automatically.
    // Returns Telegram's result, or null when it could not be delivered for a "normal" reason (bot blocked, user deactivated).
    public static function send(string $message, TelegramBotToken $bot, TelegramChat|int $chat, ?array $keyboard = null): ?array
    {
        if (trim($message) === '')
            throw new RuntimeException('Can not send empty message', 422);

        $chatId = $chat instanceof TelegramChat ? (int)Env::get($chat->value) : $chat;
        $token = Env::get($bot->value);

        // Messages to my chat get the project name in front (and "localhost|" in development)
        if ($chatId === (int)Env::get(TelegramChat::Royrscb->value) && $bot !== TelegramBotToken::Volando)
            $message = '<b>['.(Env::isLocal() ? 'localhost|' : '').Env::get('PROJECT_NAME', 'App').']</b><br>'.$message;

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

    public static function sendToRoy(string $message, ?array $keyboard = null): ?array
    {
        return self::send($message, TelegramBotToken::Royrscb, TelegramChat::Royrscb, $keyboard);
    }

    // Error reports (used by Errors)
    public static function bug(string $message): ?array
    {
        return self::send($message, TelegramBotToken::Bug, TelegramChat::Royrscb);
    }

    // Keyboard with a single button that opens a link
    public static function linkKeyboard(string $url, string $text): array
    {
        return ['inline_keyboard' => [[['url' => $url, 'text' => $text]]]];
    }

    // private ------------------------------

    private static function post(string $token, array $data): ?array
    {
        $response = http_post("https://api.telegram.org/bot$token/sendMessage", $data);

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
    public int|string|null $chat_id = null;

    // Depending on the type
    public mixed $id = null;                 // callback_query / my_chat_member
    public mixed $data = null;               // callback_query
    public ?array $original_from = null;     // callback_query
    public mixed $new_chat_member = null;    // new_chat_member / left_chat_member
    public ?string $command = null;          // command
    public ?string $message_replied = null;  // reply_to_message

    function __construct(array $update)
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
            $this->original_from = $update['callback_query']['from'] ?? null;
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

        $this->chat_id = $this->chat['id'] ?? null;

        // callback_query and my_chat_member keep the type set above (before, a callback_query ended up as 'message')
        if ($this->type !== null)
            return;

        if (!empty($this->message['group_chat_created'])) {
            $this->type = 'group_chat_created';
        }
        else if (isset($this->message['new_chat_member'])) {
            $this->type = 'new_chat_member';
            $this->new_chat_member = $this->message['new_chat_member'];
        }
        else if (isset($this->message['left_chat_member'])) {
            $this->type = 'left_chat_member';
            $this->new_chat_member = $this->message['left_chat_member'];   // kept as it was (same property for both)
        }
        else if (($this->message['entities'][0]['type'] ?? null) === 'bot_command') {
            $this->type = 'command';
            $this->command = explode('@', (string)$this->text)[0];
        }
        else if (isset($this->message['reply_to_message'])) {
            $this->type = 'reply_to_message';
            $this->message_replied = $this->message['reply_to_message']['text'] ?? null;
        }
        else $this->type = 'message';
    }

    function from_group(): bool
    {
        return in_array($this->chat['type'] ?? null, ['group', 'supergroup'], true);
    }
}

// Thin wrapper of the Telegram Bot API for webhook bots. (Was Telegram_bot.)
// API failures are logged (and notified through Errors) and the method returns null.
final class TelegramBot
{
    private string $id;
    private string $token;
    private string $username;

    public ?TelegramMessage $msg = null;
    public int|string|null $default_chat_id = null;

    function __construct(string $token, string $username, ?array $update = null)
    {
        $this->token = $token;
        $this->id = explode(':', $token)[0];

        $this->username = $username;

        if ($update !== null)
            $this->msg = new TelegramMessage($update);
    }

    private function fail(int|string $code, string $description): null
    {
        Errors::report(new RuntimeException("Telegram bot $this->username error $code: $description", 502));

        return null;
    }

    private function postMethod(string $method, ?array $data = null): mixed
    {
        $response = http_post('https://api.telegram.org/bot'.$this->token.'/'.$method, $data);

        if (!is_array($response))
            return $this->fail(502, 'Invalid response');

        if ($response['ok'] ?? false)
            return $response['result'];

        return $this->fail($response['error_code'] ?? 0, (string)($response['description'] ?? 'unknown error'));
    }

    // get ---------------------------------
    public function getMe(): mixed
    {
        return $this->postMethod('getMe');
    }

    function getUpdates(): mixed
    {
        return $this->postMethod('getUpdates');
    }

    // set ----------------------------------
    public function setDefaultChatId(int|string $chat_id): void
    {
        $this->default_chat_id = $chat_id;
    }

    public function getWebhook(): mixed
    {
        return $this->postMethod('getWebhookInfo');
    }
    public function setWebhook(string $url): mixed
    {
        return $this->postMethod('setWebhook', ['url' => $url]);
    }
    public function deleteWebhook(bool $drop_pending_updates = true): mixed
    {
        return $this->postMethod('deleteWebhook', ['drop_pending_updates' => $drop_pending_updates]);
    }

    // send --------------------
    public function replyMessage(string $text): mixed
    {
        if ($this->msg === null)
            throw new RuntimeException('No incoming message was set in the constructor', 500);

        return $this->sendMessage($text, $this->msg->chat_id);
    }
    public function sendMessage(string $message, int|string|null $chat_id = null, ?array $keyboard = null, bool $html = false): mixed
    {
        if ($message === '')
            return $this->fail(500, 'Can not send empty message');

        $chat_id ??= $this->default_chat_id;

        $data = [
            'chat_id' => $chat_id,
            'text' => $message
        ];
        if ($html) $data['parse_mode'] = 'HTML';
        if ($keyboard !== null) $data['reply_markup'] = $keyboard;

        return $this->postMethod('sendMessage', $data);
    }

    public function sendButton(int|string $chat_id, string $message, string $button_text, string $callback_data, bool $html = false): mixed
    {
        $button = ['text' => $button_text, 'callback_data' => $callback_data];
        $keyboard = ['inline_keyboard' => [[$button]]];

        return $this->sendMessage($message, $chat_id, $keyboard, $html);
    }

    // edit ----------------------
    public function editMessage(int|string $chat_id, int $message_id, string $message, ?array $keyboard = null, bool $html = false): mixed
    {
        if ($message === '')
            return $this->fail(500, 'Can not send empty message');

        $data = [
            'chat_id' => $chat_id,
            'message_id' => $message_id,
            'text' => $message
        ];
        if ($html) $data['parse_mode'] = 'HTML';
        if ($keyboard !== null) $data['reply_markup'] = $keyboard;

        return $this->postMethod('editMessageText', $data);
    }

    public function editButton(int|string $chat_id, int $message_id, string $message, string $button_text, string $callback_data, bool $html = false): mixed
    {
        $button = ['text' => $button_text, 'callback_data' => $callback_data];
        $keyboard = ['inline_keyboard' => [[$button]]];

        return $this->editMessage($chat_id, $message_id, $message, $keyboard, $html);
    }

    public function answerCallbackQuery(string $callback_query_id, ?string $message = null, bool $show_alert = false): mixed
    {
        $data = ['callback_query_id' => $callback_query_id];
        if ($message !== null) {
            $data['text'] = $message;
            $data['show_alert'] = $show_alert;
        }

        return $this->postMethod('answerCallbackQuery', $data);
    }
}
