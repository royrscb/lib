<?php

    const TIMESTAMP = 'Y-m-d H:i:s';
    const STANDARD_DATE_FORMAT = 'Y-m-d H:i:s';
    const TELEGRAM_ROYRSCB_BOT_TOKEN = 'xxx';
    const TELEGRAM_INSECTES_BOT_TOKEN = 'xxx';
    const TELEGRAM_ROYRSCB_CHAT_ID = '465403410';

    const SIGNATURE_SECRET = 'xxx';



    function logAndTelegram($code, $text, $type, $telegram){

        $logText = '';
        if($me = whoami()) $logText .= '('.$me->id.': '.$me->email.') ';
        else $log = '(Unknown user) ';
        if($location = get_client_location()) $logText .= '{'.$location['country'].', '.$location['city'].'} ';
        $logText .= $type.' '.$code.': '.$text.PHP_EOL;

        $path = basename(getcwd()) == 'php' ? './' : '../';
        file_put_contents($path.'error_log_la', $logText, FILE_APPEND);

        $logText = '<b>'.str_replace($type.' '.$code.':', $type.' '.$code.':</b>', $logText);

        if($telegram) send_telegram($logText, TELEGRAM_INSECTES_BOT_TOKEN, TELEGRAM_ROYRSCB_CHAT_ID, 'HTML');
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

        if($log) logAndTelegram($code, $text, 'error', $telegram);

		exit(json_encode($error));
  }

	function throwException($code = 500, $text = null, $log = true, $telegram = false){

        if($log) logAndTelegram($code, $text, 'exception', $telegram);

		header("HTTP/1.1 $code $text", true, 401);
		exit();
	}

    function echoDebug($msg){

        header("HTTP/1.1 555 ".json_encode($msg), true, 401);
		exit();
    }

	function getJSON($path){

		return json_decode(file_get_contents($path), true);
	}

	function saveJSON($path, $json){

		return file_put_contents($path, json_encode($json, JSON_PRETTY_PRINT));
	}

	function is_img_extension($file){

	    return  strtolower(pathinfo($file, PATHINFO_EXTENSION))=='jpg' ||
	            strtolower(pathinfo($file, PATHINFO_EXTENSION))=='jpeg' ||
	            strtolower(pathinfo($file, PATHINFO_EXTENSION))=='png';
  	}

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

	function newFileInt($dir){

		function strName2intCmp($a, $b){

			$aInt = intval(pathinfo($a, PATHINFO_FILENAME));
			$bInt = intval(pathinfo($b, PATHINFO_FILENAME));

			return $aInt - $bInt;
		}

		$dir = array_slice(scandir($dir), 2);
		usort($dir, "strName2intCmp");
		$maxIntFile = array_pop($dir);
		$maxInt = intval(pathinfo($maxIntFile, PATHINFO_FILENAME));

		return $maxInt;
	}

	function save_uploaded_file(){

		if($_FILES['file']['error'] != 0) throwError('File not found!');
		$path = $_POST['path'];
		$_POST = json_decode($_POST['dataJSON'], true);

    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
		$name = newFileInt($path) +1;
		if(isset($_POST['name'])) $name = $_POST['name'];
    $newImgSrc = $path.'/'.$name.'.'.$ext;

		if(move_uploaded_file($_FILES['file']['tmp_name'], $newImgSrc)) return $newImgSrc;
		else throwError('move_uploaded_file function failed!');
	}

	function array_swap($array, $index_a, $index_b){

		$tmp = $array[$index_a];
		$array[$index_a] = $array[$index_b];
		$array[$index_b] = $tmp;

		return $array;
	}

  function array_search_key($key, $value, $array){

		$i = 0;
		while($i < count($array) && $array[$i][$key] != $value) $i++;

		if($i == count($array)) return -1;
		else return $i;
	}

function array_insert($array, $positon, $element){

	for($i = count($array); $i > $positon; $i--) $array[$i] = $array[$i -1];
	$array[$positon] = $element;

	return $array;
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

    function get_telegram_updates($bot_token){

        $url = 'https://api.telegram.org';

        $request = $url.'/bot'.$bot_token.'/getUpdates';
        $response = json_decode(file_get_contents($request), true);

        if($response['ok']) return $response['result'];
        else throwException($response->error_code, $reponse->message);
    }

    function send_telegram($message, $bot_token = TELEGRAM_ROYRSCB_BOT_TOKEN, $chat_id = TELEGRAM_ROYRSCB_CHAT_ID, $parse_mode = null, $keyboard = null){

        $url = 'https://api.telegram.org';

        $request = $url.'/bot'.$bot_token.'/sendMessage?chat_id='.$chat_id.'&text='.urlencode($message);
        if($keyboard){

            $keyboard['inline_keyboard'][0][0]['text'] = urlencode($keyboard['inline_keyboard'][0][0]['text']);
            $request .= '&reply_markup='.json_encode($keyboard);
        }
        if($parse_mode) $request .= '&parse_mode='.$parse_mode;

        $response = json_decode(file_get_contents($request), true);

        if(isset($response['ok'])){

            if($response['ok']) return $response['result'];
            else throwException($response['error_code'], $reponse['message']);
        }
        else throwException(500, 'error sending telegram to '.$chat_id.' ('.$message.')');
    }


    function timeToken($uniqid = null){

        $salt = 'una mica de salt secreta';

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

        $salt = 'una mica de salt secreta';

        $maybeTime = time();

        while((time() - $maybeTime) < $lifeSpan && md5($uniqid.':'.$maybeTime.':'.$salt) != $token) $maybeTime--;

        return md5($uniqid.':'.$maybeTime.':'.$salt) == $token;
    }



    function send_mail($to, $subject, $message, $from, $html_styled = false){

        if(!$from) $from = $_SERVER['HTTP_HOST'];
        $headers = 'From: '.$from.PHP_EOL;
        if($html_styled) $headers .= 'Content-type: text/html; charset=iso-8859-1';

        return mail($to, $subject, $message, $headers);
    }

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

	function addSlashesToString($string){

		return addcslashes($string, "\"'\\");
	}

	function json_stringify($json){

		array_walk_recursive($json, function(&$value){

			if(is_string($value)){

				if(strtolower($value) == 'null' || $value == '') $value = null;
				else if(strtolower($value) == 'true') $value = true;
				else if(strtolower($value) == 'false') $value = false;
			}
		});

		return "'".addSlashesToString(json_encode($json, JSON_NUMERIC_CHECK))."'";
	}



    function whoami(){

        if(session_status() == PHP_SESSION_NONE) session_start();

        // session check
        if(isset($_SESSION['user'])){

            $maybeUser = json_decode($_SESSION['user']);

            $allSet = isset($maybeUser->id) && isset($maybeUser->email) && isset($maybeUser->signature);
            $correctSignature = $allSet && $maybeUser->signature == md5($maybeUser->id.'|'.$maybeUser->email.'|'.SIGNATURE_SECRET);

            if($correctSignature) return $maybeUser;
        }

        // cookie check
        if(isset($_COOKIE['user'])){

            $maybeUser = json_decode($_COOKIE['user']);

            $allSet = isset($maybeUser->id) && isset($maybeUser->email) && isset($maybeUser->signature);
            $correctSignature = $allSet && $maybeUser->signature == md5($maybeUser->id.'|'.$maybeUser->email.'|'.SIGNATURE_SECRET);

            if($correctSignature){

                $_SESSION['user'] = $_COOKIE['user'];
                return $maybeUser;
            }
            else setcookie('user', null, -1, '/');
        }

        return null;
    }




    function checkAuthAdmin($handleForbidden = true){

        if(!is_null(whoami()) && intval(whoami()->id) === 1) return true;
        else if($handleForbidden) throwException(403, 'Forbidden ADMIN');
        else return false;
    }
    function checkAuthUser($id, $handleForbidden = true){

        //if(checkAuthAdmin(false) || !is_null(whoami()) && intval(whoami()->id) === intval($id)) return true;
        if(!is_null(whoami()) && intval(whoami()->id) === intval($id)) return true;
        else if($handleForbidden) throwException(403, 'Forbidden USER');
        else return false;
    }




?>
