<?php

    const TIMESTAMP = 'Y-m-d H:i:s',
    	TELEGRAM_ROYRSCB_BOT_TOKEN = 'xxx',
    	TELEGRAM_BUG_BOT_TOKEN = 'xxx',
		TELEGRAM_VOLANDOBOT_BOT_TOKEN = 'xxx',
    	TELEGRAM_ROYRSCB_CHAT_ID = 'xxx';

	const PROJECT_NAME = 'VolandoBoy';

	// parse input vars ----------
	function getInputVars(){

		$input = file_get_contents('php://input');

		$vars = null;

		if(!empty($input)){

			if(isset($_SERVER['CONTENT_TYPE']) && strpos(strtolower($_SERVER['CONTENT_TYPE']), 'application/json') !== false) $vars = json_decode($input, true);
			else parse_str($input, $vars);
		}

		return $vars;
	}
	if($_SERVER['REQUEST_METHOD'] == 'GET'){ if(empty($_GET)) $_GET = getInputVars(); }
	else if($_SERVER['REQUEST_METHOD'] == 'POST'){ if(empty($_POST)) $_POST = getInputVars(); }
	else if($_SERVER['REQUEST_METHOD'] == 'PUT') $_PUT = getInputVars();
	else if($_SERVER['REQUEST_METHOD'] == 'DELETE') $_DELETE = getInputVars();

	// HTTP -------------------------------------------------------------------------------------------------
	function http_request(string $method, string $url, $data = null){

		if($method != 'GET' && $method != 'POST' && $method != 'PUT' && $method != 'DELETE') throwException(500, 'http request method must be either GET or POST');

		$ch = curl_init($url);

		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		if(isset($data)){

			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		}
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 9);

		$result = curl_exec($ch);
		if(curl_errno($ch)) throwException(500, "curl $method error ".curl_errno($ch).': '.curl_error($ch));
		curl_close($ch);

		$maybeArray = json_decode($result, true);
		if(!is_null($maybeArray) && gettype($maybeArray) == 'array') return $maybeArray;
		else return $result;
	}
	function get(string $url, $data = null){

		return http_request('GET', $url, $data);
	}
	function post(string $url, $data = null){

		return http_request('POST', $url, $data);
	}

	// GET --------------------------------------------------------------------------------------------------
	function scandir_recursively($path){

		if(is_dir($path)){

			$arr = array();

			$dir = array_slice(scandir($path), 2);
			foreach($dir as $item)
				if(is_file($path.'/'.$item)) array_push($arr, $item);
				else if(is_dir($path)) $arr[$item] = scandir_recursively($path.'/'.$item);

			return $arr;
		}
	}

	function get_client_location(){

		$info = unserialize(file_get_contents('http://ip-api.com/php/'.$_SERVER['REMOTE_ADDR']));

		if($info['status'] == 'success'){

			$location['city'] = $info['city'];
			$location['region'] = $info['regionName'];
			$location['country'] = $info['country'];

			return $location;

		}else return null;
	}

	function timeToken($uniqid = null){

		$salt = 'una mica de salt secreta pero ben ben secreta i que no sap dingu';

		$token = md5($uniqid.':'.time().':'.$salt);

		return $token;
	}
	function validateTimeToken($lifeSpan, $token, $uniqid = null){

		if(!$token) throwError(404, 'Time token not found');

		if(is_numeric($lifeSpan)) { if($lifeSpan > 1000000) throwError('Not valid time token lifespan ['.$lifeSpan.'], max seconds 1000000'); }
		else if(is_string($lifeSpan)){

			if($lifeSpan == 'HOUR')         $lifeSpan = 3600;
			else if($lifeSpan == 'DAY')     $lifeSpan = 3600*24;
			else if($lifeSpan == 'WEEK')    $lifeSpan = 3600*24*7;
			else throwError('Not valid time token lifespan ['.$lifeSpan.'], allowed lifespans "HOUR", "DAY", "WEEK"');
		}
		else throwError('Not valid time token lifespan ['.$lifeSpan.']');

		$salt = 'una mica de salt secreta pero ben ben secreta i que no sap dingu';

		$maybeTime = time();

		while((time() - $maybeTime) < $lifeSpan && md5($uniqid.':'.$maybeTime.':'.$salt) != $token) $maybeTime--;

		return md5($uniqid.':'.$maybeTime.':'.$salt) == $token;
	}

	// SEND ---------------------------------------------------------------------------
    function send_telegram($message, $bot_token = TELEGRAM_ROYRSCB_BOT_TOKEN, $chat_id = TELEGRAM_ROYRSCB_CHAT_ID, $keyboard = null){

		if(empty($message)) throwError('Can not send empty message');

		if($chat_id == TELEGRAM_ROYRSCB_CHAT_ID && $bot_token != TELEGRAM_VOLANDOBOT_BOT_TOKEN) $message = '<b>['.PROJECT_NAME.'] </b>'.$message;
		$to_replace = [

			'<br>' => "\n",
			'<b>' => '$bold_begin', '</b>' => '$bold_end',
			'<i>' => '$italic_begin', '</i>' => '$italic_end',
			'<u>' => '$underline_begin', '</u>' => '$underline_end',
			'<s>' => '$strikethrough_begin', '</s>' => '$strikethrough_end',
			'<a' => '$link_begin_begin', '">' => '$link_begin_end_one', "'>" => '$link_begin_end_two', '</a>' => '$link_end',
			'&' => '&amp;',
			'<' => '&lt;',
			'>' => '&gt;',
			'$bold_begin' => '<b>', '$bold_end' => '</b>',
			'$italic_begin' => '<i>', '$italic_end' => '</i>',
			'$underline_begin' => '<u>', '$underline_end' => '</u>',
			'$strikethrough_begin' => '<s>', '$strikethrough_end' => '</s>',
			'$link_begin_begin' => '<a', '$link_begin_end_one' => '">', '$link_begin_end_two' => "'>", '$link_end' => '</a>'
		];
		foreach($to_replace as $key => $value) $message = str_replace($key, $value, $message);

		$data = [ 'chat_id' => $chat_id, 'text' => $message, 'parse_mode' => 'HTML' ];
		if(isset($keyboard)) $data['reply_markup'] = $keyboard;

		$response = post('https://api.telegram.org/bot'.$bot_token.'/sendMessage', $data);

		if($response['ok']) return $response['result'];
		else{

			logAndTelegram($response['error_code'], $response['description'], 'Telegram error', false, true);
			throwException($response['error_code'], 'Telegram error: '.$response['description'].' Message: '.$message, true, false);
		}
	}
	function send_mail($to, $subject, $message, $from, $html_styled = false){

		if(!$from) $from = $_SERVER['HTTP_HOST'];
		$headers = 'From: '.$from.PHP_EOL;
		if($html_styled) $headers .= 'Content-type: text/html; charset=iso-8859-1';

		$res = mail($to, $subject, $message, $headers);

		if($res) return $res;
		else throwException(500, 'Error sending email to: '.$to);
	}
	function send_push_notification($notification, $subscription, $onClickLink = null, $ttl = null){

		if(!isset($subscription)) return null;

		require_once __DIR__.'/pushNotification.php';
		$push_notification = new PushNotification($ttl);

		if(isset($onClickLink)){

			if(is_array($notification)) $notification['data']['onClickLink'] = $onClickLink;
			else $notification = ['body' => $notification, 'data' => ['onClickLink' => $onClickLink]];
		}

		$res = $push_notification->send($notification, $subscription);

		if(isset($res['error'])) throwException($res['code'], 'Send push notification:<br>'.json_encode($notification).'<br><br>to subscription:<br>'.json_encode($notification['data']['receiver'] ?? $subscription).'<br><br>reason:<br>'.$res['reason']);

		return $res;
	}
	function send_multiple_push_notifications($notification, $subscriptions, $onClickLink = null, $ttl = null){

		require_once __DIR__.'/pushNotification.php';
		$push_notification = new PushNotification($ttl);

		$subscriptions = array_filter($subscriptions, function($s){ return isset($s); });
		if(isset($onClickLink)){

			if(is_array($notification)) $notification['data']['onClickLink'] = $onClickLink;
			else $notification = ['body' => $notification, 'data' => ['onClickLink' => $onClickLink]];
		}

		$responses = $push_notification->sendMultipleEqual($notification, $subscriptions);

		if($responses !== true)
			foreach($responses as $index => $res)
				if(isset($res['error'])) throwException($res['code'], 'Send push notification:<br>'.json_encode($notification).'<br><br>to subscription:<br>'.json_encode(isset($notification['data']['receiver'][$index]) ?? $subscriptions[$index]).'<br><br>reason:<br>'.$res['reason']);

		return $responses;
	}


	// PARSE ------------------------------------------------------------------------------------------------
	function date_spain($format = null){

		$now_spain = new DateTime('now', new DateTimeZone('Europe/Madrid'));

		if($format) return $now_spain->format($format);
		else return $now_spain;
	}
	function parse_date_spain($date, $format = null){

		if(!isset($date)) return parse_date_spain(0, $format);

		if(is_numeric($date)) $date_spain = new DateTime('@'.$date);
		else if(is_string($date)) $date_spain = new DateTime($date, new DateTimeZone('Europe/Madrid'));
		else if($date instanceof DateTime) $date_spain = $date;

		$date_spain->setTimezone(new DateTimeZone('Europe/Madrid'));

		if(isset($format)) return $date_spain->format($format);
		else return $date_spain;
	}

	function parse_bool($bool){

		if(is_bool($bool)) return $bool;
		else if(is_string($bool)){

			if(strtolower($bool) === 'true') return true;
			else if(strtolower($bool) === 'false') return false;
		}

		return null;
	}

	function addSlashesToString($string){

		return addcslashes($string, "\"'\\");
	}

	function json_stringify($json){

		array_walk_recursive($json, function(&$value){

			if(is_string($value)){

				if(strtolower($value) == 'null' || empty($value)) $value = null;
				else if(strtolower($value) == 'true') $value = true;
				else if(strtolower($value) == 'false') $value = false;
			}
		});

		return addSlashesToString(json_encode($json, JSON_NUMERIC_CHECK));
	}

	// returns the index of the first element that returns true to the callback(current_element, index), or null if not founds
	function array_find_index(callable $callback, array $array){

		$i = 0;
		while($i < count($array) && !$callback($array[$i], $i)) $i++;

		if($i < count($array)) return $i;
		else return null;
	}
	// returns the first element that returns true to the callback(current_element, index), or null if not founds
	function array_find(callable $callback, array $array){

		$maybeIndex = array_find_index($callback, $array);

		if(!is_null($maybeIndex)) return $array[$maybeIndex];
		else return null;
	}
	// removes the first element that returns true to the callback(current_element, index)
	function array_remove(callable $callback, array $array){

		$maybeIndex = array_find_index($callback, $array);

		return array_splice($array, $maybeIndex, 1);
	}


	// UTIL -------------------------------------------------------------------------------------------------
	function je($value){ return json_encode($value); }
	function reduce_image_width($src, $width_to_reduce){

        try{ $img = new Imagick($src); }
        catch(Exception $e){ return 0; }

        $img_width = $img->getImageGeometry()['width'];
        $img_height = $img->getImageGeometry()['height'];

        $width = $img_width -$width_to_reduce;
        $height = $img_height / ($img_width / $width);

        $img->resizeImage($width, $height, imagick::FILTER_LANCZOS, 1);

        try { return $img->writeImage($src);}
        catch (Exception $e) { throwException('Writing image ('.$src.') with imagick: '.$e->getMessage()); }
    }
	// return if time $time plus $addTime seconds has past. (if no time provided return false)
	function time_has_past($time, int $addTime = 0){

		return (parse_date_spain($time, 'U') + $addTime) < time();
	}
	function generate_report(){


		return '<b>PHP REPORT</b><br><br>'.
			'<b>DIR: </b>'.__DIR__.'<br>'.
			'<b>FILE: </b>'.__FILE__.'<br>'.
			'<b>'.$_SERVER['REQUEST_METHOD'].':</b> '.json_encode($_GET ?? $_POST ?? $_PUT ?? $_DELETE ?? null).'<br><br>'.
			'<b>SERVER: </b>'.json_encode($_SERVER);
	}
	function makeTelegramKeyboard($url, $text){

		return [

			'inline_keyboard' => [
				[
					[
						'url' => $url,
						'text' => $text
					]
				]
			]
		];
	}


	// DEBUG ------------------------------------------------------------------------------------------------
    function logAndTelegram($code, $text, $type, $log, $telegram){

		$errorText = '🐛<b>';
        if($location = get_client_location()) $errorText .= '{'.$location['country'].', '.$location['city'].'} ';
		if(function_exists('whoami') && $me = whoami()) $errorText .= '('.$me->type.': '.$me->id.') '; else $errorText .= '(unown) ';
        $errorText .= $type.' '.$code.': </b>'.$text;

		if($log){

			$newLogLine = '['.date_spain('d-M-Y H:i:s').' ESP] '.$errorText;
			$to_replace = ['<br>' => ' ',
						   '<b>' => '', '</b>' => '',
						   '<i>' => '', '</i>' => '',
						   '<u>' => '', '</u>' => '',
						   '<s>' => '', '</s>' => '',
						  ];
			foreach($to_replace as $key => $value) $newLogLine = str_replace($key, $value, $newLogLine);

			$file = (basename(getcwd()) == 'php' ? './' : '../').'error_log_la';
			$logFileData = file_exists($file) ? $newLogLine.PHP_EOL.file_get_contents($file) : $newLogLine.PHP_EOL;
			if(!file_put_contents($file, $logFileData)) logAndTelegram(500, 'Can not log in file: <i>'.$file.'</i><br><br><b>error: </b>'.$newLogLine, 'log error', false, true);
		}

        if($telegram) send_telegram($errorText, TELEGRAM_BUG_BOT_TOKEN);
    }

	function throwError($textOrCode, $text = null, $log = false, $telegram = false){

		$error['status'] = 'ERROR';
		if(isset($text)){

			$error['code'] = $textOrCode;
			$error['text'] = $text;
		}
		else{

			$error['code'] = 500;
			$error['text'] = $textOrCode;
		}

		logAndTelegram($error['code'], $error['text'], 'error', $log, $telegram);

		exit(json_encode($error));
	}

	function throwException($code = 500, $text = null, $log = true, $telegram = true){

		logAndTelegram($code, $text, 'exception', $log, $telegram);

		header("HTTP/1.1 $code $text", true, 401);
		exit();
	}

	function echoDebug($msg){

		if(gettype($msg) == 'array') $msg = json_encode($msg);

		header("HTTP/1.1 555 ".$msg, true, 401);
		exit();
	}

?>
