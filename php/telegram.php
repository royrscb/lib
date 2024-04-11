<?php

	require_once __DIR__.'/la.php';

	class Telegram_message{

		private $update;
		public $message, $type, $date, $chat, $from, $text;

		function __construct($update) {

			$this->update = $update;

			if(isset($update['message'])) $this->message = $update['message'];
			else if(isset($update['callback_query'])){

				$this->type = 'callback_query';
				$this->id = $update['callback_query']['id'];
				$this->data = $update['callback_query']['data'];
				$this->message = $update['callback_query']['message'];
				$this->original_from = $update['callback_query']['from'];
			}

			$this->date = $this->message['date'];
			$this->chat = $this->message['chat'];
			$this->from = $this->message['from'];
			if(isset($this->message['text'])) $this->text = $this->message['text'];

			if(isset($this->message['group_chat_created']) && $this->message['group_chat_created']){

				$this->type = 'group_chat_created';
			}
			else if(isset($this->message['new_chat_member'])){

				$this->type = 'new_chat_member';
				$this->new_chat_member = $this->message['new_chat_member'];
			}
			else if(isset($this->message['left_chat_member'])){

				$this->type = 'left_chat_member';
				$this->new_chat_member = $this->message['left_chat_member'];
			}
			else if(isset($update['my_chat_member'])){

				$this->type = 'my_chat_member';
				$this->id = $update['my_chat_member']['chat']['id'];
				$this->message = $update['my_chat_member'];
			}
			else if(isset($this->message['entities']) && $this->message['entities'][0]['type'] == 'bot_command'){

				$this->type = 'command';
				$this->command = explode('@', $this->message['text'])[0];
			}
			else $this->type = 'message';
		}

		function from_group(){

			return $this->chat['type'] == 'group' || $this->chat['type'] == 'supergroup';
		}
	}


    class Telegram_bot{

		private $id, $token, $username;

        function __construct(string $token, string $username) {

			$this->id = explode(':', $token)[0];
			$this->token = $token;
			$this->username = $username;
		}

		private function throwError($code, $text){

			logAndTelegramProblem($code, $text, 'telegram error', true, true);

			return null;
		}

		private function postMethod($method, $data){

			$response = post('https://api.telegram.org/bot'.$this->token.'/'.$method, $data);

			if($response['ok']) return $response['result'];
			else return $this->throwError($response['error_code'], $response['description']);
		}

		// get ---------------------------------
		public function getMe(){

			return $this->postMethod('getMe', null);
		}

		function getUpdates($bot_token){

			return $this->postMethod('getUpdates', null);
		}

		// set ----------------------------------
		public function setDefaultChatId($chat_id){

			$this->default_chat_id = $chat_id;
		}

		public function setWebhook($url){

			$data = [ 'url' => $url ];

			return $this->postMethod('setWebhook', $data);
		}

		// send --------------------
		public function sendMessage($message, $chat_id = null, $keyboard = null, $html = false){

			if(empty($message)) $this->throwError(500, 'Can not send empty message');

			if(is_null($chat_id) && isset($this->default_chat_id)) $chat_id = $this->default_chat_id;

			$data = [

				'chat_id' => $chat_id,
				'text' => $message
			];
			if($html) $data['parse_mode'] = 'HTML';
			if(isset($keyboard)) $data['reply_markup'] = $keyboard;

			return $this->postMethod('sendMessage', $data);
		}

		public function sendButton($chat_id, $message, $button_text, $callback_data, $html = false){

			$button = ['text' => $button_text, 'callback_data' => $callback_data];
			$keyboard = ['inline_keyboard' => [[$button]]];

			$this->sendMessage($message, $chat_id, $keyboard, $html);
		}


		// edit ----------------------
		public function editMessage($chat_id, $message_id, $message, $keyboard = null, $html = false){

			if(empty($message)) $this->throwError(500, 'Can not send empty message');

			$data = [

				'chat_id' => $chat_id,
				'message_id' => $message_id,
				'text' => $message
			];
			if($html) $data['parse_mode'] = 'HTML';
			if(isset($keyboard)) $data['reply_markup'] = $keyboard;

			return $this->postMethod('editMessageText', $data);
		}

		public function editButton($chat_id, $message_id, $message, $button_text, $callback_data, $html = false){

			$button = ['text' => $button_text, 'callback_data' => $callback_data];
			$keyboard = ['inline_keyboard' => [[$button]]];

			$this->editMessage($chat_id, $message_id, $message, $keyboard, $html);
		}

		public function answerCallbackQuery($callback_query_id, $message = null, $show_alert = false){

			$data = [ 'callback_query_id' => $callback_query_id ];
			if(isset($message)){

				$data['text'] = $message;
				$data['show_alert'] = $show_alert;
			}

			return $this->postMethod('answerCallbackQuery', $data);
		}

    }

?>
