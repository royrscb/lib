<?php

abstract class ModelCrud
{
    // Atributes ----------------------------------------------------------------------------------

    // private ---
    private object $conn;

    // protected ---
    protected object $db;
    
    protected array $creatableFields = [];
    protected array $updatableFields = [];
    
    protected bool $preventForeachRow = false;

    // public ---
    public string $tableName;

    // Constructor --------------------------------------------------------------------------------
    public final function __construct(object $conn, object $db, ?string $tableName = null)
    {
        $this->conn = $conn;
        $this->db = $db;
        $this->tableName = $tableName ?? self::toSnakeCase(get_class($this));
    }

    // public -------------------------------------------------------------------------------------

    // CRUD
    public function create(array $data): ?array
    {
        if (empty($this->creatableFields))
            throw ModelCrudException::invalidFieldsConfig($this->tableName, 'creatableFields');

        $sql = $this->buildInsertSql($this->creatableFields, $data);
        $this->executeQuery($sql);

        return $this->read($this->conn->insert_id);
    }
    public function read(?int $id = null, ?string $fkName = null, ?string $filter = null, ?string $order = null): ?array
    {
        $sql = $this->buildSelectSql($id, $fkName, $filter, $order);
        $res = $this->executeQuery($sql);

        $allRows = [];
        while ($row = $res->fetch_assoc()) {
            if (!$this->preventForeachRow) {
                $this->onReadRow($row);
            }

            array_push($allRows, $row);
        }

        if (isset($id) && !isset($fkName)) { // Query 1
            if (empty($allRows)) return null;
            else return $allRows[0];
        }
        else return $allRows;
    }
    public function update(int $id, array $data): ?array
    {
        if (empty($this->updatableFields))
            throw ModelCrudException::invalidFieldsConfig($this->tableName, 'updatableFields');

        $sql = $this->buildUpdateSql($id, $this->updatableFields, $data);
        
        $this->executeQuery($sql);

        return $this->read($id);
    }
    public function delete(int $id): void
    {
        $sql = $this->buildDeleteSql($id);
        $this->executeQuery($sql);
    }

    // protected ----------------------------------------------------------------------------------

    // virtual method to override for classes that inherits
    protected function onReadRow(array &$row)
    { }

    // Build CRUD SQLs ---
    protected final function buildInsertSql(array $fields, array $data): string
    {
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
    protected final function buildSelectSql(?int $id = null, ?string $fkName = null, ?string $filter = null, ?string $order = null): string
    {
        $sql = "SELECT * FROM $this->tableName";

        if (isset($id)) {
            if (isset($fkName)) $sql .= " WHERE ".$fkName."_id=$id";
            else $sql .= " WHERE id=$id";
        }

        if (isset($filter)) {
            $sql .= str_contains(strtoupper($sql), 'WHERE ')
                ? " AND ($filter)"
                : " WHERE $filter";
        }
        if (isset($order)) {
            $sql .= " ORDER BY $order";
        }

        return $sql;
    }
    protected final function buildUpdateSql(int $id, array $fields, array $data): string
    {
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
    protected final function buildDeleteSql(int $id): string
    {
        return "DELETE FROM $this->tableName WHERE id=$id";
    }
    // ---

    protected final function realEscapeString(string $s): string
    {
        return $this->conn->realEscapeString($s);
    }
    
    protected final function executeQuery(string $sql): bool|object
    {
        if (str_contains(strtoupper($sql), 'DROP '))
            throw ModelCrudException::forbiddenQuery('DROP statement blocked', $this->tableName, $sql);
        if (str_contains(strtoupper($sql), 'ALTER '))
            throw ModelCrudException::forbiddenQuery('ALTER statement blocked', $this->tableName, $sql);
        if (str_contains($sql, ';'))
            throw ModelCrudException::forbiddenQuery("';' character blocked", $this->tableName, $sql);

        $res = $this->conn->query($sql);

        if ($res === false)
            throw ModelCrudException::sqlError(explode(' ', $sql)[0], $this->tableName, $sql, $this->conn->error);

        return $res;
    }

    // private ------------------------------------------------------------------------------------

    // Converts HolaQue_Tal into hola_que_tal
    private static function toSnakeCase(string $string): string
    {
        $string = preg_replace('/(?<!^)[A-Z]/', '_$0', $string);
        return strtolower(preg_replace('/_+/', '_', $string));
    }

    private function parseUnknownDataElementToSql(mixed $element): string
    {
        if (is_bool($element)) {
            return $element ? '1' : '0';
        }
        else if (is_numeric($element) && !(is_string($element) && ($element[0] == '+' || $element[0] == '0' && $element != '0'))) {
            return (string)$element;
        }
        else if (is_string($element) && !empty($element)) {
            return "'".$this->conn->realEscapeString($element)."'";
        }
        else if (is_array($element)) {
            array_walk_recursive($element, function(&$value){
                if (is_string($value)){
                    if (strtolower($value) == 'null' || empty($value)) $value = null;
                    else if (strtolower($value) == 'true') $value = true;
                    else if (strtolower($value) == 'false') $value = false;
                }
            });

            return "'".$this->conn->realEscapeString(json_encode($element, JSON_NUMERIC_CHECK))."'";
        }
        else return 'NULL';
    }
}

class ModelCrudException extends RuntimeException
{
    // ⚠️❗

    private ?string $sql = null;

    private function __construct(string $message, int $code, ?string $sql = null)
    {
        parent::__construct($message, $code);
        $this->sql = $sql;
    }

    public static function invalidFieldsConfig(string $tableName, string $property): self
    {
        return new self(
            "⚠️ [$property] array does not exist or is empty for table [$tableName]",
            500
        );
    }
    public static function noValidFields(string $tableName, array $providedFields, ?int $id = null): self
    {
        $rowInfo = $id !== null ? " for row with id [$id]" : '';
        return new self(
            "⚠️ No valid field to write in table [$tableName]$rowInfo. Provided fields: ".implode(', ', $providedFields),
            422
        );
    }
    public static function sqlError(string $method, string $tableName, string $sql, string $mysqlError): self
    {
        return new self(
            "❗MySQL $method error on table [$tableName]: $mysqlError",
            409,
            $sql
        );
    }
    public static function forbiddenQuery(string $reason, string $tableName, string $sql): self
    {
        return new self(
            "⚠️ Blocked query on table [$tableName]: $reason",
            500,
            $sql
        );
    }

    public function getSql(): ?string
    {
        return $this->sql;
    }
}
