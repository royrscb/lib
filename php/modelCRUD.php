<?php

	require_once __DIR__.'/la.php';

	class ModelCRUD{

		// atributes
		private $conn;
        protected $tableName, $db;

		// help private functions
		private function executeQuery($sql){

			// send_telegram('Executing query to table '.$this->tableName.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');

			if(strpos(strtoupper($sql), 'DROP ')) throwException(500, 'MySQL warning <u>DROP</u> executed to '.$this->tableName.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');
			else if(strpos(strtoupper($sql), 'ALTER ')) throwException(500, 'MySQL warning <u>ALTER</u> executed to '.$this->tableName.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');
			else if(strpos($sql, ';')) throwException(500, 'MySQL warning <u>";"</u> executed to '.$this->tableName.'<br><br><b>SQL:</b> '.$sql);

			else return $this->conn->query($sql);
		}
		private function throwSqlException($method, $sql){

			throwException(500, 'MySQL '.$method.' '.$this->tableName.': '.$this->conn->error.'<br><br><b>SQL:</b> <i>'.$sql.'</i>');
		}
        private function parseUnknownDataElementToSql($element){

            if(is_bool(parse_bool($element))) return parse_bool($element) ? 1 : 0;
			else if(is_numeric($element)) return $element;
            else if(is_string($element) && !empty($element)) return "'".addSlashesToString($element)."'";
            else if(is_array($element)) return "'".json_stringify($element)."'";
            else return 'NULL';
        }

        // build crud sqls
        private function buildInsertSql($fields, $data){

            $insertFields = [];
            $insertValues = [];

            foreach($fields as $field){

                if(key_exists($field, $data)){

                    array_push($insertFields, $field);
                    array_push($insertValues, $this->parseUnknownDataElementToSql($data[$field]));
                }
            }

			if(empty($insertFields)) throwException(511, "Any field to INSERT in table [$this->tableName]");

			$sqlInsertFields = implode(', ', $insertFields);
			$sqlInsertValues = implode(', ', $insertValues);
            $sql = "INSERT INTO $this->tableName ($sqlInsertFields) VALUES ($sqlInsertValues)";

            return $sql;
        }
		private function buildSelectSql($id, $id_owner, $order, $filter){

			if(isset($id)){

                if(isset($id_owner)) $sql = 'SELECT * FROM '.$this->tableName.' WHERE id_'.$id_owner.'='.$id;
                else $sql = 'SELECT * FROM '.$this->tableName.' WHERE id='.$id;

            }else $sql = 'SELECT * FROM '.$this->tableName;

			if(isset($filter)) $sql .= isset($id) ? ' AND ('.$filter.')' : ' WHERE '.$filter;
			if(isset($order)) $sql .= ' ORDER BY '.$order;

			return $sql;
		}
        private function buildUpdateSql($fields, $data, $id){

            $fieldValues = [];

            foreach($fields as $field){

                if(key_exists($field, $data)){

					$value = $this->parseUnknownDataElementToSql($data[$field]);
                    array_push($fieldValues, $field.'='.$value);
                }
            }

			if(empty($fieldValues)) throwException(511, "Any field to SET in table [$this->tableName] for row with id [$id]");

			$sqlUpdateFieldsValues = implode(', ', $fieldValues);
            $sql = "UPDATE $this->tableName SET $sqlUpdateFieldsValues WHERE id=".$id;

            return $sql;
        }

		// help protected
		protected function buildTimeFilterSql($fieldName, $filter){

			if(isset($filter)){

				if(is_numeric($filter)) $sql_filter = '('.$filter.' <= unix_timestamp(CONVERT_TZ('.$fieldName.', "+02:00", "+00:00")))';
				else if(is_array($filter) && is_numeric($filter[0]) && is_numeric($filter[1])) $sql_filter = '('.$filter[0].' <= unix_timestamp(CONVERT_TZ('.$fieldName.', "+02:00", "+00:00")) AND unix_timestamp(CONVERT_TZ('.$fieldName.', "+02:00", "+00:00")) <= '.$filter[1].')';
				else throwException(500, 'command time filter ('.json_encode($filter).') is not a unix time');
			}
			else $sql_filter = null;

			return $sql_filter;
		}
		protected function readHashword(int $id){

			$sql = $this->buildSelectSql($id, null, null, null);
            $row = $this->executeQuery($sql)->fetch_assoc();

			if(isset($row['hashword'])) return $row['hashword'];
			else return null;
		}
		protected function updateHashword($id_or_email, $hashword){

			$sql = 'UPDATE '.$this->tableName.' SET hashword='.(!is_null($hashword) ? '"'.$hashword.'"' : 'NULL').' '.
				'WHERE '.(is_numeric($id_or_email) ? 'id='.$id_or_email : 'email="'.$id_or_email.'"');

			if($this->executeQuery($sql) === TRUE) return true;
            else throwException(500, 'Error updating hashword of user with email: '.$email);
		}
		protected function readByEmail($email){

			$res = $this->read(null, null, null, "email='$email'");

			if(!empty($res)) return $res[0];
			else return null;
		}
		protected function getName(&$data){

			$data['name'] = [

				'en' => $data['name_en'],
				'ca' => $data['name_ca'],
				'es' => $data['name_es']
			];

			unset($data['name_en'], $data['name_ca'], $data['name_es']);
		}
		protected function setName(&$data){

			$data['name_en'] = $data['name']['en'];
			$data['name_ca'] = $data['name']['ca'];
			$data['name_es'] = $data['name']['es'];

			unset($data['name']);
		}
		protected function newDisplayOrder(int $id = null, string $id_owner = null){

			$sql = 'SELECT MAX(display_order) FROM '.$this->tableName;
			if(isset($id) && isset($id_owner)) $sql .= ' WHERE id_'.$id_owner.'='.$id;

			$result = $this->executeQuery($sql);
			$max_display_order = $result->fetch_row()[0];

			return $max_display_order +1;
		}

		// constructor
        final public function __construct($conn, $db){

            $this->conn = $conn;

			$this->tableName = strtolower(get_class($this));

			$this->db = $db;
        }

        // crud
        public function create(array $data){

			if(!isset($this->create_fields)) throwException(500, 'create_fields array not exist for table '.$this->tableName);
			if(empty($this->create_fields)) throwException(500, 'create_fields array is empty for table '.$this->tableName);

			$sql = $this->buildInsertSql($this->create_fields, $data);

            if($this->executeQuery($sql) === TRUE) return $this->read($this->conn->insert_id);
            else $this->throwSqlException('CREATE', $sql);
		}
        public function read(int $id = null, string $id_owner = null, string $order = null, string $filter = null){

			$sql = $this->buildSelectSql($id, $id_owner, $order, $filter);
            $result = $this->executeQuery($sql);

			$row_array = [];
            while($row = $result->fetch_assoc()){

				if(method_exists($this, 'read_foreach_row')) $this->read_foreach_row($row);

				array_push($row_array, $row);
			}

			if(isset($id) && !isset($id_owner)){

                if(empty($row_array)) return null;
                else return $row_array[0];
            }
            else return $row_array;
		}
        public function update(int $id, array $data){

			if(!isset($this->update_fields)) throwException(500, 'update_fields array not exist for table '.$this->tableName);
			if(empty($this->update_fields)) throwException(500, 'update_fields array is empty for table '.$this->tableName);

			$sql = $this->buildUpdateSql($this->update_fields, $data, $id);

            if($this->executeQuery($sql) === TRUE) return $this->read($id);
            else $this->throwSqlException('UPDATE', $sql);
		}
        public function delete(int $id){

            $sql = 'DELETE FROM '.$this->tableName.' WHERE id='.$id;

            if($this->executeQuery($sql) === TRUE) return true;
            else $this->throwSqlException('DELETE', $sql);
        }
    }

?>
