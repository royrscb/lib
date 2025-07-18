<?php

	const PROJECT_NAME = '';

    const TIMESTAMP = 'Y-m-d H:i:s',
    	TELEGRAM_ROYRSCB_BOT_TOKEN = '1258995587:AAEO2rnPl7_eVE8YDYLs-xcQyii1jH_bhZ8',
    	TELEGRAM_BUG_BOT_TOKEN = '1396062241:AAGutzXymTPQCNpXVp_FIAB5RsI004pwTjo',
		TELEGRAM_VOLANDOBOT_BOT_TOKEN = '1155380140:AAEUudYPHh18Q3tpUh6FMoAOJmxAugixBwM',
    	TELEGRAM_ROYRSCB_CHAT_ID = '465403410',
		TELEGRAM_HERIBERT_CHAT_ID = '5944127154';

	// parse input vars ---------------------------------------------------------------------------
	function getInputVars(){

		if(isset($_SERVER['REQUEST_METHOD'])){

			if($_SERVER['REQUEST_METHOD'] == 'GET' && !empty($_GET)) return $_GET;
			else if($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($_POST)) return $_POST;
		}

		$input = file_get_contents('php://input');

		$vars = null;

		if(!empty($input)){

			if(isset($_SERVER['CONTENT_TYPE']) && strpos(strtolower($_SERVER['CONTENT_TYPE']), 'application/json') !== false) $vars = json_decode($input, true);
			else parse_str($input, $vars);
		}

		return $vars;
	}
	if(isset($_SERVER['REQUEST_METHOD'])){

		if($_SERVER['REQUEST_METHOD'] == 'GET'){ if(empty($_GET)) $_GET = getInputVars(); }
		else if($_SERVER['REQUEST_METHOD'] == 'POST'){ if(empty($_POST)) $_POST = getInputVars(); }
		else if($_SERVER['REQUEST_METHOD'] == 'PUT') $_PUT = getInputVars();
		else if($_SERVER['REQUEST_METHOD'] == 'DELETE') $_DELETE = getInputVars();
	}

	// HTTP ---------------------------------------------------------------------------------------
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

	// GET ----------------------------------------------------------------------------------------
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

	function getFileContent($filename) {

		$filePath = __DIR__;

		// Find filePath
		$pathArrayPieces = explode('/', $filePath);

		$i = 0;
		while($i < 9 && count($pathArrayPieces) > 1 && !file_exists($filePath.'/'.$filename)) {

			$pathArrayPieces = explode('/', $filePath);
			array_pop($pathArrayPieces);

			$filePath = implode('/', $pathArrayPieces);

			$i++;
		}

		$fileFullNamePath = $filePath.'/'.$filename;

		if($i < 9 && file_exists($fileFullNamePath)) {

			$contents = file_get_contents($fileFullNamePath);

			if($contents) return $contents;
		}

		logAndTelegramProblem(404, 'Contents for file: "<u>'.$fileFullNamePath.'</u>" not found', 'File not found');

		return null;
	}

	function getParameters($filename = 'parameters.json'){

		$parameters = getFileContent($filename);

		return json_decode($parameters, true);
	}

	function getObjectFromJson($objectKey, $json) {

		if(isset($json[$objectKey])) return $json[$objectKey];
		else {
			
			foreach(array_values($json) as $object) {

				if(gettype($object) == 'array') {

					$maybeObject = getObjectFromJson($objectKey, $object);
					
					if($maybeObject) return $maybeObject;
				}
			}
		}

		return null;
	}
	function getTextByKey($textKey, $lang, $filename = 'text.json'){

		$text = getFileContent($filename);
		$textJson = json_decode($text, true);
		
		$maybeObject = getObjectFromJson($textKey, $textJson);

		if(isset($maybeObject[$lang])) return $maybeObject[$lang];
		else {

			throwWarning('Text key "'.$textKey.'" not found in php text.json');

			return null;
		}
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

	// SEND ---------------------------------------------------------------------------------------
    function send_telegram($message, $bot_token = TELEGRAM_ROYRSCB_BOT_TOKEN, $chat_id = TELEGRAM_ROYRSCB_CHAT_ID, $keyboard = null){

		$GLOBALS['telegram_count'] = isset($GLOBALS['telegram_count']) ? $GLOBALS['telegram_count']+1 : 0;
		if($GLOBALS['telegram_count'] >= 10) exit();

		if(empty($message)) throwError('Can not send empty message');

		while(strlen($message) > 4000){

			send_telegram('🧩['.$GLOBALS['telegram_count'].']<br>'.substr($message, 0, 3900), $bot_token, $chat_id, $keyboard);

			$message = substr($message, 3900);
			if(strlen($message) <= 4000) $message = '🧩['.$GLOBALS['telegram_count'].']<br>'.$message;
		}

		if($chat_id == TELEGRAM_ROYRSCB_CHAT_ID && $bot_token != TELEGRAM_VOLANDOBOT_BOT_TOKEN){

			$project_name = PROJECT_NAME;
			if($_SERVER['HTTP_HOST'] == 'localhost') $project_name = 'localhost|'.PROJECT_NAME;
			$message = '<b>['.$project_name.']</b><br>'.$message;
		}
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

		try{ $response = post('https://api.telegram.org/bot'.$bot_token.'/sendMessage', $data); }
		catch(Exception $e){ throwException(500, 'Call to telegram API<br><br><b>Chat:</b> '.$chat_id); }

		if($response['ok']) return $response['result'];
		else{

			// Log only with full message
			logAndTelegramProblem($response['error_code'], $response['description'].' Message: '.$message, 'Telegram error', true, false);
			
			$wellKnownError = 
				$response['error_code'] == 403 && (
					$response['description'] == 'Forbidden: bot was blocked by the user'
					|| $response['description'] == 'Forbidden: user is deactivated'
				);
			
			if(!$wellKnownError){

				// Telegram only, with no message to prevent infinite loops
				logAndTelegramProblem($response['error_code'], '<br><br><b>Chat:</b> '.$chat_id.'<br><b>Description:</b> '.$response['description'], 'Telegram error', false, true);
				// Throw error to user (no log nor telegram)
				throwError($response['error_code'], 'Telegram error: '.$response['description']);
			}
		}
	}
	function send_mail($to, $subject, $message, $from, $html_styled = false, $cc = null, $bcc = null){

		if(!$from) $from = $_SERVER['HTTP_HOST'];
		
		$headers = 'From: '.$from."\r\n";
		if($html_styled) $headers .= 'Content-type: text/html; charset=utf-8'."\r\n";
		if($cc) $headers .= 'Cc: '.$cc."\r\n";
		if($bcc) $headers .= 'Bcc: '.$bcc."\r\n";

		$res = mail($to, $subject, $message, $headers);

		if($res) return $res;
		else throwException(500, 'Error sending email to: '.$to);
	}
	function send_push_notification($notification, $subscription, $onClickLink = null, $badge = null){

		if(!isset($subscription) || !$subscription) return false;
		
		if(!is_array($notification)) $notification = ['body' => $notification];

		require_once __DIR__.'/pushNotification.php';
		$push_notification = new PushNotification();

		if(isset($onClickLink)) $notification['data']['onClickLink'] = $onClickLink;
		if($badge !== null){

			$notification['badge'] = $badge;
			if(!$notification['body']) $notification['preventNotification'] = true;
		}

		$res = $push_notification->send($notification, $subscription);

		if($res['error']){

			$text = '<br><b>Reason:</b><br>'.$res['reason']
				.'<br><br><b>Notification:</b><br>'.json_encode($notification)
				.'<br><br><b>Subscription:</b><br>'.json_encode($subscription);

			logAndTelegramProblem($res['code'], $text, 'Sending push notification');

			return null;
		}
		
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

		if($responses !== true){
			foreach($responses as $index => $res){
				if($res['error']){

					$text = '<br><b>Reason:</b><br>'.$res['reason']
						.'<br><br><b>Notification:</b><br>'.json_encode($notification)
						.'<br><br><b>Subscription:</b><br>'.json_encode($subscriptions[$index]);

					logAndTelegramProblem($res['code'], $text, 'Sending push notification');

					$responses[$index] = null;
				}
			}
		}

		return $responses;
	}


	// PARSE --------------------------------------------------------------------------------------
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
		else if(is_numeric($bool)){

			if($bool == 0) return false;
			else if($bool == 1) return true;
		}
		else if(is_string($bool)){

			if(strtolower($bool) === 'true') return true;
			else if(strtolower($bool) === 'false') return false;
		}

		return null;
	}

	function addSlashesToString($string){

		return addcslashes($string, "\"'\\");
	}

	function mountLangField(&$data, $field, $langs = null){

		if(is_null($langs)){

			$langsKeys = array_filter(array_keys($data), function($key)use($field){ 

				// Return okay if key is $field_xx
				return preg_match('/'.$field.'_..$/', $key);
			});
			
			$langs = array_map(function($key){ return explode('_', $key)[1]; }, $langsKeys);
		}

		$data[$field] = [];

		foreach($langs as $lang){

			$data[$field][$lang] = $data[$field.'_'.$lang] ?? null;

			if(isset($data[$field.'_'.$lang])) unset($data[$field.'_'.$lang]);
		}

		return $data[$field];
	}
	function unmountLangField(&$data, $field, $langs = null){

		if(is_null($langs)) $langs = array_keys($data[$field]);

		foreach($langs as $lang){

			$data[$field.'_'.$lang] = $data[$field][$lang] ?? null;
		}

		if(isset($data[$field])) unset($data[$field]);
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

	// Array extension ----------------------------------------------------------------------------
	// returns the index of the first element that returns true to the callback(current_element, index) or -1 if not founds
	function array_find_index(callable $callback, array $array){

		$i = 0;
		while($i < count($array) && !$callback($array[$i], $i)) $i++;

		if($i < count($array)) return $i;
		else return -1;
	}
	// returns the first element that returns true to the callback(current_element, index) or null if not found
	function array_find(array $array, callable $callback){

		$index = array_find_index($array, $callback);

		if($index >= 0) return $array[$index];
		else return null;
	}
	// removes the first element that returns true to the callback(current_element, index) or null if not found
	function array_remove(array $array, callable $callback){

		$index = array_find_index($array, $callback);

		if($index >= 0) return array_splice($array, $index, 1);
		else return null;
	}


	// UTIL ---------------------------------------------------------------------------------------
	function je($value){ return json_encode($value); }
	function no($var){

		return !isset($var) || is_null($var) || empty($var);
	}
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
	function is_time_mins_multiple($number){

		return (intdiv(time(), 60) % $number) == 0;
	}
	function generate_report($appended = false){

		$inputVars = getInputVars();

		$report = '<b>📃 REPORT </b> ('.(function_exists('whoami') && whoami() ? whoami()->type.' '.whoami()->id : 'unown').')<br><br>'.
			'<b>IP: </b>'.($_SERVER['REMOTE_ADDR'] ?? 'null').'<br>'.
			'<b>LANG: </b>'.($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'null').'<br>'.
			'<b>HTML FILE: </b>'.($_SERVER['HTTP_REFERER'] ?? 'null').'<br>'.
			'<b>REQUEST URI: </b>'.($_SERVER['REQUEST_URI'] ?? 'null').'<br>'.
			'<b>SCRIPT NAME: </b>'.($_SERVER['SCRIPT_NAME'] ?? 'null').'<br>'.
			'<b>AGENT: </b>'.($_SERVER['HTTP_USER_AGENT'] ?? 'null').'<br>'.
			'<b>'.$_SERVER['REQUEST_METHOD'].(' ('.(strlen(json_encode($inputVars))).') ').':</b> '.json_encode($inputVars);

		if($appended) $report = '<br><br>---------------------------------------<br>'.$report;

		return $report;
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

    # string --------------------------------------------------------------------------------------
    function namifyEmail($object_or_email){

        $commonEmails = ['info'];
        $email = gettype($object_or_email) == 'string' ? $object_or_email : $object_or_email['email'];

        $name = implode(' ', array_map(ucfirst, explode('_', implode('_', explode('.', explode('@', $email)[0])))));
        if(in_array(strtolower($name), $commonEmails)) $name .= ' '.implode(' ', array_map(ucfirst, array_slice(explode('.', explode('@', $email)[1]), 0, -1)));

        return $name;
    }


	// DEBUG --------------------------------------------------------------------------------------
    function logAndTelegramProblem($code, $text, $type, $log = true, $telegram = true){

		$me = (function_exists('whoami') && $me = whoami()) ? $me->type.' '.$me->id : "unown";
        //* $location = ' {'.(($location = get_client_location()) ? $location['country'].', '.$location['city'] : '').'} ';

		$errorText = "🐛 <b>($me) $type $code:</b><br>$text";
		if($type == 'warning') $errorText = "⚠️ <b>($me) $type:</b><br>$text";

		if($log && $_SERVER['HTTP_HOST'] != 'localhost'){

			$newLogLine = '['.date_spain(TIMESTAMP.' O').'] '.$errorText;
			$to_replace = ['<br>' => ' ',
						   '<b>' => '', '</b>' => '',
						   '<i>' => '', '</i>' => '',
						   '<u>' => '', '</u>' => '',
						   '<s>' => '', '</s>' => '',
						  ];
			foreach($to_replace as $key => $value) $newLogLine = str_replace($key, $value, $newLogLine);

			$file = (basename(getcwd()) == 'php' ? './' : '../').'error_log_la';
			$logFileData = file_exists($file) ? $newLogLine.PHP_EOL.file_get_contents($file) : $newLogLine.PHP_EOL;
			if(!file_put_contents($file, $logFileData)){

				sleep(1);

				// Second try (sometimes doesn't log correctly) [BETA]
				if(!file_put_contents($file, $logFileData)){

					// Telegram only
					logAndTelegramProblem(500, 'Can not log in file <b>TWO TIMES</b>: <i>'.$file.'</i><br><br><b>error: </b>'.$newLogLine, 'log error', false, true);
				}
			}
		}

        if($telegram) send_telegram($errorText, TELEGRAM_BUG_BOT_TOKEN);
    }

	function throwWarning($text, $log = true, $telegram = true){

		logAndTelegramProblem(-1, $text, 'warning', $log, $telegram);
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

		logAndTelegramProblem($error['code'], $error['text'], 'error', $log, $telegram);

		exit(json_encode($error));
	}

	function throwException($code = 500, $text = null, $log = true, $telegram = true){

		logAndTelegramProblem($code, $text.generate_report(true), 'exception', $log, $telegram);

		header("HTTP/1.1 $code $text", true, 401);
		exit();
	}

	function echoDebug($msg){

		if(gettype($msg) == 'array') $msg = json_encode($msg);

		header("HTTP/1.1 555 ".$msg, true, 401);
		exit();
	}

?>