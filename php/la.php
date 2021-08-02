<?php

    const TIMESTAMP = 'Y-m-d H:i:s';
    const TELEGRAM_ROYRSCB_BOT_TOKEN = '1258995587:AAEO2rnPl7_eVE8YDYLs-xcQyii1jH_bhZ8';
    const TELEGRAM_INSECTES_BOT_TOKEN = '1396062241:AAGutzXymTPQCNpXVp_FIAB5RsI004pwTjo';
    const TELEGRAM_ROYRSCB_CHAT_ID = '465403410';


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

		if(!$token) throwException(500, 'Token not found to validate hour token');

		if(is_numeric($lifeSpan)) { if($lifeSpan > 1000000) throwException(500, 'Not valid time token lifespan ['.$lifeSpan.'], max seconds 1000000'); }
		else if(is_string($lifeSpan)){

			if($lifeSpan == 'HOUR')         $lifeSpan = 3600;
			else if($lifeSpan == 'DAY')     $lifeSpan = 3600*24;
			else if($lifeSpan == 'WEEK')    $lifeSpan = 3600*24*7;
			else throwException(500, 'Not valid time token lifespan ['.$lifeSpan.'], allowed lifespans "HOUR", "DAY", "WEEK"');
		}
		else throwException(500, 'Not valid time token lifespan ['.$lifeSpan.']');

		$salt = 'una mica de salt secreta pero ben ben secreta i que no sap dingu';

		$maybeTime = time();

		while((time() - $maybeTime) < $lifeSpan && md5($uniqid.':'.$maybeTime.':'.$salt) != $token) $maybeTime--;

		return md5($uniqid.':'.$maybeTime.':'.$salt) == $token;
	}


	// SEND -------------------------------------------------------------------------------------------------
	function post_JSON($url, $json){

		$ch = curl_init($url);

		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($json));
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$result = curl_exec($ch);
		curl_close($ch);

		return json_decode($result, true);
	}

	function send_telegram($message, $bot_token = TELEGRAM_ROYRSCB_BOT_TOKEN, $chat_id = TELEGRAM_ROYRSCB_CHAT_ID, $html = false){

		if(empty($message)) { logAndTelegram(500, 'Can not send empty message', 'telegram error', true, true); return null; }

		$data = [ 'chat_id' => $chat_id, 'text' => $message ];
		if($html) $data['parse_mode'] = 'HTML';

		$response = post_JSON('https://api.telegram.org/bot'.$bot_token.'/sendMessage', $data);

		if(isset($response['ok'])){

			if($response['ok']) return $response['result'];
			else { logAndTelegram($response['error_code'], $response['description'], 'telegram error', true, true); return null; }
		}
		else throwException(500, 'error sending telegram to '.$data['chat_id'].' ('.$data['text'].')');
	}

	function send_mail($to, $subject, $message, $from, $html_styled = false){

		if(!$from) $from = $_SERVER['HTTP_HOST'];
		$headers = 'From: '.$from.PHP_EOL;
		if($html_styled) $headers .= 'Content-type: text/html; charset=iso-8859-1';

		return mail($to, $subject, $message, $headers);
	}


	// PARSE ------------------------------------------------------------------------------------------------
	function date_spain($format = null){

		$now_spain = new DateTime('now', new DateTimeZone('Europe/Madrid'));

		if($format) return $now_spain->format($format);
		else return $now_spain;
	}
	function parse_date_spain($date, $format = null){

		if(is_string($date)) $date_spain = new DateTime($date, new DateTimeZone('Europe/Madrid'));
		else if(is_numeric($date)) $date_spain = (new DateTime('@'.$date))->setTimezone(new DateTimeZone('Europe/Madrid'));

		if($format) return $date_spain->format($format);
		else return $date_spain;
	}

	function parse_bool($bool){

		if(is_bool($bool)) return $bool;
		else if(strtolower($bool) === 'true') return true;
		else if(strtolower($bool) === 'false') return false;
		else return null;
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



	// DEBUG ------------------------------------------------------------------------------------------------
    function logAndTelegram($code, $text, $type, $log, $telegram){

        $errorText = '';
        if($location = get_client_location()) $errorText .= '{'.$location['country'].', '.$location['city'].'} ';
        $errorText .= $type.' '.$code.': '.$text.PHP_EOL;

		if($log){

			$path = basename(getcwd()) == 'php' ? './' : '../';
			file_put_contents($path.'error_log_la', $errorText, FILE_APPEND);
		}

        $errorText = '<b>'.str_replace($type.' '.$code.':', $type.' '.$code.':</b>', $errorText);
        if($telegram) send_telegram($errorText, TELEGRAM_INSECTES_BOT_TOKEN, TELEGRAM_ROYRSCB_CHAT_ID, true);
    }

	function throwError($textOrCode, $text = null, $log = false, $telegram = false){

		$error['status'] = 'ERROR';
		if($text){

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
