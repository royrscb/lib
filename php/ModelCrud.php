<?php

	abstract class ModelCrud {

		// Atributes ----------------------------

        // private
		private object $conn;

        // protected
        protected object $db;
        protected string $tableName;

        protected array $creatable_fields = [];
        protected array $updatable_fields = [];

        protected bool $prevent_foreach_row = false;

		// Constructor --------------------------
        public final function __construct(object $conn, object $db, ?string $tableName = null) {
            $this->conn = $conn;
			$this->db = $db;
			$this->tableName = $tableName ?? strtolower(get_class($this));
        }

        // public -------------------------------

        // CRUD
        public function create(array $data): ?array {
			if (empty($this->creatable_fields))
                throw ModelCrudException::invalidFieldsConfig($this->tableName, 'creatable_fields');

			$sql = $this->buildInsertSql($this->creatable_fields, $data);
            $this->executeQuery($sql);

            return $this->read($this->conn->insert_id);
		}
        public function read(?int $id = null, ?string $fkName = null, ?string $filter = null, ?string $order = null): ?array {
			$sql = $this->buildSelectSql($id, $fkName, $filter, $order);
            $res = $this->executeQuery($sql);

			$all_rows = [];
            while ($row = $res->fetch_assoc()) {
				if (method_exists($this, 'foreach_row_on_read') && !$this->prevent_foreach_row) {
                    $this->foreach_row_on_read($row);
                }

				array_push($all_rows, $row);
			}

			if (isset($id) && !isset($fkName)) { // Query 1
                if (empty($all_rows)) return null;
                else return $all_rows[0];
            }
            else return $all_rows;
		}
        public function update(int $id, array $data): ?array {
			if (empty($this->updatable_fields))
                throw ModelCrudException::invalidFieldsConfig($this->tableName, 'updatable_fields');

			$sql = $this->buildUpdateSql($id, $this->updatable_fields, $data);
            
            $this->executeQuery($sql);

            return $this->read($id);
		}
        public function delete(int $id): void {
            $sql = $this->buildDeleteSql($id);
            $this->executeQuery($sql);
        }

        // protected ----------------------------

        // Build CRUD SQLs
        protected final function buildInsertSql(array $fields, array $data): string {

            $insertFields = [];
            $insertValues = [];

            foreach($fields as $field) {
                if (key_exists($field, $data)) {
                    array_push($insertFields, $field);
                    array_push($insertValues, $this->parseUnknownDataElementToSql($data[$field]));
                }
            }

			if (empty($insertFields))
                throw ModelCrudException::noValidFields($this->tableName, array_keys($data));

			$sqlInsertFields = implode(', ', $insertFields);
			$sqlInsertValues = implode(', ', $insertValues);
            $sql = "INSERT INTO $this->tableName ($sqlInsertFields) VALUES ($sqlInsertValues)";

            return $sql;
        }
		protected final function buildSelectSql(?int $id = null, ?string $fkName = null, ?string $filter = null, ?string $order = null): string {
            $sql = "SELECT * FROM $this->tableName";

			if (isset($id)) {
                if (isset($fkName)) $sql .= " WHERE ".$fkName."_id=$id";
                else $sql .= " WHERE id=$id";
            }

			if (isset($filter)) {
                $sql .= strpos(strtoupper($sql), 'WHERE ') === false 
                    ? " WHERE $filter"
                    : " AND ($filter)";
            }
			if (isset($order)) {
                $sql .= " ORDER BY $order";
            }

			return $sql;
		}
        protected final function buildUpdateSql(int $id, array $fields, array $data): string {

            $fieldValues = [];

            foreach($fields as $field) {
                if (key_exists($field, $data)) {
					$value = $this->parseUnknownDataElementToSql($data[$field]);
                    array_push($fieldValues, $field.'='.$value);
                }
            }

			if (empty($fieldValues))
                throw ModelCrudException::noValidFields($this->tableName, array_keys($data), $id);

			$sqlUpdateFieldsValues = implode(', ', $fieldValues);
            $sql = "UPDATE $this->tableName SET $sqlUpdateFieldsValues WHERE id=$id";

            return $sql;
        }
        protected final function buildDeleteSql(int $id): string {
            return "DELETE FROM $this->tableName WHERE id=$id";
        }
        // ---

        protected final function real_escape_string(string $s): string {
            return $this->conn->real_escape_string($s);
        }
        
        protected final function executeQuery(string $sql): bool|object {
            if (strpos(strtoupper($sql), 'DROP ') !== false)
                throw ModelCrudException::forbiddenQuery('DROP statement blocked', $this->tableName, $sql);
            if (strpos(strtoupper($sql), 'ALTER ') !== false)
                throw ModelCrudException::forbiddenQuery('ALTER statement blocked', $this->tableName, $sql);
            if (strpos($sql, ';') !== false)
                throw ModelCrudException::forbiddenQuery("';' character blocked", $this->tableName, $sql);

            $res = $this->conn->query($sql);

            // throw;
            if ($res === false) {
                $method = explode(' ', strtoupper($sql))[0];
                throw ModelCrudException::sqlError($method, $this->tableName, $sql, $this->conn->error);
            }

            return $res;
        }

        // private ------------------------------

        private function parseUnknownDataElementToSql(mixed $element): string {
            if (is_bool($element)) {
                return $element ? '1' : '0';
            }
			else if (is_numeric($element) && !(is_string($element) && ($element[0] == '+' || $element[0] == '0' && $element != '0'))) {
                return (string)$element;
            }
            else if (is_string($element) && !empty($element)) {
                return "'".$this->conn->real_escape_string($element)."'";
            }
            else if (is_array($element)) {
                array_walk_recursive($element, function(&$value){
                    if (is_string($value)){
                        if (strtolower($value) == 'null' || empty($value)) $value = null;
                        else if (strtolower($value) == 'true') $value = true;
                        else if (strtolower($value) == 'false') $value = false;
                    }
                });

                return "'".$this->conn->real_escape_string(json_encode($element, JSON_NUMERIC_CHECK))."'";
            }
            else return 'NULL';
        }
    }

    class ModelCrudException extends RuntimeException {

        // ⚠️❗

        private ?string $sql = null;
 
		private function __construct(string $message, int $code, ?string $sql = null) {
			parent::__construct($message, $code);
            $this->sql = $sql;
		}

		public static function invalidFieldsConfig(string $tableName, string $property): self {
			return new self(
				"⚠️ [$property] array does not exist or is empty for table [$tableName]",
				500
			);
		}
		public static function noValidFields(string $tableName, array $providedFields, ?int $id = null): self {
			$rowInfo = $id !== null ? " for row with id [$id]" : '';
			return new self(
				"⚠️ No valid field to write in table [$tableName]$rowInfo. Provided fields: ".implode(', ', $providedFields),
				422
			);
		}
		public static function sqlError(string $method, string $tableName, string $sql, string $mysqlError): self {
			return new self(
				"❗MySQL $method error on table [$tableName]: $mysqlError",
				409,
                $sql
			);
		}
		public static function forbiddenQuery(string $reason, string $tableName, string $sql): self {
			return new self(
				"⚠️ Blocked query on table [$tableName]: $reason",
				500,
                $sql
			);
		}

        public function getSql(): ?string {
			return $this->sql;
		}
	}

?>
