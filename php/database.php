<?php

	require_once __DIR__.'/la.php';
	require_once __DIR__.'/modelCRUD.php';

	const LANGS = ['en, es, ca'];

	class Data{

		private $conn;

		private const TABLENAME = 'data';
		
		public const DATA_TYPES = [

			'number' => 'number',
			'bool' => 'bool',
			'string' => 'string',
			'datetime' => 'datetime',
			'json' => 'json'
		];

		private function get_type($value){

			if(is_numeric($value)) $type = self::DATA_TYPES['number'];
			else if(is_bool(parse_bool($value))) $type = self::DATA_TYPES['bool'];
			else if(is_string($value)){

				// YYYY-MM-DD HH:ii:ss
				$timestampRegex = '/[0-9]{4}-[0-1][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/';

				if(preg_match($timestampRegex, $value)) $type = self::DATA_TYPES['datetime'];
				else $type = self::DATA_TYPES['string'];
			}
			else if(is_array($value)) $type = self::DATA_TYPES['json'];
			else throwException(500, 'Unknown type of data for value: "'.json_encode($value).'"');

			return $type;
		}
		private function parse_value($type, $value){
			
			if(no($value)) $value = null;
			// Default is string (for string or datetime)
			else if($type == self::DATA_TYPES['string'] || $type == self::DATA_TYPES['datetime']);
			else if($type == self::DATA_TYPES['number']) $value = floatval($value);
			else if($type == self::DATA_TYPES['bool']) $value = parse_bool($value);
			else if($type == self::DATA_TYPES['json']) $value = json_decode($value, true);
			else throwException(500, 'Unknown type of data: "'.$type.'"');

			return $value;
		}

		function __construct($conn){

            $this->conn = $conn;
        }

		function create($key, $value, $type = null){

			if(!$type){

				$type = $this->get_type($value);
				if($type == self::DATA_TYPES['json']) $value = json_encode($value);
			}
			else if(!self::DATA_TYPES[$type]) throwException(500, "Not allowed value type: \"$type\"");

			$sql = "INSERT INTO ".self::TABLENAME." (`key`, value, type) VALUES('$key', '$value', '$type')";
			$result = $this->conn->query($sql);

			if($result === TRUE) return $this->read($key);
			else throwException(500, 'MySQL INSERT '.self::TABLENAME.':<br>'.$this->conn->error.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');
		}

        function read($key = null){

            $sql = 'SELECT * FROM '.self::TABLENAME;
            if(!is_null($key)) $sql .= " WHERE `key` = '$key'";
            $result = $this->conn->query($sql);

            $data_object = [];
            while($row = $result->fetch_assoc()){

				$data_object[$row['key']] = $this->parse_value($row['type'], $row['value']);
			}

			if(!is_null($key)) return $data_object[$key] ?? null;
            else return empty($data_object) ? new stdClass() : $data_object;
        }

        function update($key, $value){

			$type_sql = "SELECT type FROM ".self::TABLENAME." WHERE `key` = '$key'";
			$result = $this->conn->query($type_sql);
			if($row = $result->fetch_assoc()) $type = $row['type'];
			else throwException(500, 'UPDATE '.self::TABLENAME.":<br>key: \"$key\" does not exist");

			$new_type = $this->get_type($value);
			if($type != $new_type) throwException(500, 'UPDATE '.self::TABLENAME.":<br>type for \"$key\" was \"$type\" and now is \"$new_type\"");

			if($type == self::DATA_TYPES['json']) $value = json_encode($value);

            $sql = "UPDATE ".self::TABLENAME." SET value = '$value' WHERE `key` = '$key'";

			if($this->conn->query($sql) === TRUE) return $this->read($key);
            else throwException(500, 'MySQL UPDATE '.self::TABLENAME.':<br>'.$this->conn->error.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');
        }

		function delete($key){

			$sql = "DELETE FROM ".self::TABLENAME." WHERE `key` = '$key'";

			if($this->conn->query($sql) === TRUE) return true;
            else throwException(500, 'MySQL DELETE '.self::TABLENAME.':<br>'.$this->conn->error.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');
		}
    }


    final class Database{

		private static $instance;
        private $conn;

		public $data;

		private final function connect(){

			if($_SERVER['HTTP_HOST'] == 'localhost'){

				$servername = "localhost";
				$username = "name";
				$password = "xxx";
				$dbname = "name";
			}
			else{

				$servername = "localhost";
				$username = "name";
				$password = "pass";
				$dbname = "name";
			}

			// Create connection
			$conn = new mysqli($servername, $username, $password, $dbname);
			if($conn->connect_error) throwException(500, 'Database connection error: '.$conn->connect_error);

			$conn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, TRUE);
			if($_SERVER['HTTP_HOST'] == 'localhost') mysqli_set_charset($conn, "utf8mb4");

			return $conn;
		}

        private final function __construct() {

            $this->conn = $this->connect();

			$this->data = new Data($this->conn);
        }

		public final static function instance(){

			if(!isset(self::$instance)) self::$instance = new Database();

			return self::$instance;
		}

		final function __destruct(){

            $this->conn->close();
        }
    }

?>
