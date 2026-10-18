<?php

enum MiscDataType: string
{
    case Number = 'number';
    case Bool = 'bool';
    case String = 'string';
    case Date = 'date';
    case DateTime = 'dateTime';
    case Json = 'json';
}

final class MiscData
{
    private const string tableName = 'misc_data';

    private mysqli $conn;

    // Constructor --------------------------
    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    // public -------------------------------

    public function create(string $type, string $key, Mixed $value): Mixed
    {
        $typeEnum = MiscDataType::tryFrom($type);

        if ($typeEnum === null)
            throw new InvalidArgumentException("Invalid MiscData type: '$type'");

        if ($typeEnum === MiscDataType::Json)
            $value = json_encode($value, JSON_THROW_ON_ERROR);

        $escKey = $this->conn->real_escape_string($key);
        $escValue = $this->conn->real_escape_string($value);
        $sql = "INSERT INTO ".self::tableName." (type, `key`, value) VALUES('$type', '$escKey', '$escValue')";
        
        $this->executeQuery($sql);

        return $this->read($key);
    }

    public function read(?string $key = null): Mixed
    {
        $sql = 'SELECT * FROM '.self::tableName;

        if ($key !== null) {
            $escKey = $this->conn->real_escape_string($key);
            $sql .= " WHERE `key` = '$escKey'";
        }

        $res = $this->executeQuery($sql);

        $dataObj = [];
        while ($row = $res->fetch_assoc()){
            $dataObj[$row['key']] = $this->parseValue($row['type'], $row['value']);
        }

        if ($key !== null) // Single object
            return $dataObj[$key] ?? null;

        return empty($dataObj) ? new stdClass() : $dataObj;
    }

    public function update(string $key, Mixed $value): Mixed
    {
        $escKey = $this->conn->real_escape_string($key);
        $typeSql = "SELECT type FROM ".self::tableName." WHERE `key` = '$escKey'";
        $res = $this->executeQuery($typeSql);

        if (!($row = $res->fetch_assoc()))
            throw new OutOfBoundsException('UPDATE '.self::tableName.":<br>key: \"$key\" does not exist");

        $type = MiscDataType::tryFrom($row['type']);

        if ($type === MiscDataType::Json)
            $value = json_encode($value, JSON_THROW_ON_ERROR);

        $escValue = $this->conn->real_escape_string($value);
        $sql = "UPDATE ".self::tableName." SET value = '$escValue' WHERE `key` = '$escKey'";

        $this->executeQuery($sql);

        return $this->read($key);
    }

    public function delete(string $key): void
    {
        $escKey = $this->conn->real_escape_string($key);
        $sql = "DELETE FROM ".self::tableName." WHERE `key` = '$escKey'";
        $this->executeQuery($sql);
    }

    // private ------------------------------

    private function parseValue(string $type, ?string $value): Mixed
    {
        if ($value === null)
            return null;

        $typeEnum = MiscDataType::tryFrom($type);

        if ($typeEnum === null)
            throw new UnexpectedValueException("Unknown MiscData type: '$type'");

        return match ($typeEnum) {
            MiscDataType::String, MiscDataType::Date, MiscDataType::DateTime => $value,
            MiscDataType::Number => (float)$value,
            MiscDataType::Bool => $value !== '0',
            MiscDataType::Json => json_decode($value, true, 512, JSON_THROW_ON_ERROR),
        };
    }

    private function executeQuery(string $sql): bool|mysqli_result
    {
        $upperSql = strtoupper($sql);

        if (str_contains($upperSql, 'DROP '))
            throw new InvalidArgumentException('DROP statement blocked');
        else if (str_contains($upperSql, 'ALTER '))
            throw new InvalidArgumentException('ALTER statement blocked');
        else if (str_contains($sql, ';'))
            throw new InvalidArgumentException("';' character blocked");

        $res = $this->conn->query($sql);
        
        // throw;
        if ($res === false) {
            $method = explode(' ', $upperSql)[0];
            throw new mysqli_sql_exception(
                "❗MySQL $method error on table [".self::tableName."]: $this->conn->error",
                $this->conn->errno
            );
        }

        return $res;
    }
}