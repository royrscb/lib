<?php

abstract class DbTable
{
    // Atributes -----------------------------------------------------------------------------------

    // public ---
    public readonly string $tableName;

    // protected ---
    protected readonly Database $db;

    // Columns (snake_case) the generic CRUD may write. Anything not listed here can not be touched from outside.
    protected array $creatableColumns = [];
    protected array $updatableColumns = [];

    protected bool $preventForeachRow = false;

    // Constructor ---------------------------------------------------------------------------------

    /**
     * @param Database    $db        Whole database.
     * @param string|null $tableName Defaults to the class name in snake_case (OrderItem => order_item).
     */
    public final function __construct(Database $db, ?string $tableName = null)
    {
        $this->db = $db;
        $this->tableName = $tableName ?? self::toSnakeCase(static::class);
    }

    // public --------------------------------------------------------------------------------------

    /**
     * Inserts a row using the entries of $data whose key is listed in $creatableColumns
     * (any other is ignored).
     *
     * @return array|null The created row.
     * @throws DbTableException 500 if $creatableColumns is empty, 422 if $data has none of them,
     *                          409 on a duplicate key.
     */
    public function create(array $data): ?array
    {
        if (empty($this->creatableColumns))
            throw DbTableException::invalidColumnsConfig($this->tableName, 'creatableColumns');

        $columns = [];
        $params = [];

        foreach ($this->creatableColumns as $column) {
            if (key_exists($column, $data)) {
                $columns[] = "`$column`";
                $params[] = $this->toDbValue($data[$column]);
            }
        }

        if (empty($columns))
            throw DbTableException::noValidFields($this->tableName, array_keys($data));

        $columnList = implode(', ', $columns);
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $sql = "INSERT INTO `$this->tableName` ($columnList) VALUES ($placeholders)";

        $this->query($sql, $params);

        return $this->readById($this->db->lastInsertId());
    }

    /**
     * Reads the rows that match $where (all of them if there is no $where).
     *
     * To filter by a foreign key use $where: read(where: 'user_id = ?', params: [$userId]).
     *
     * @param string|null $where  YOUR OWN SQL fragment with ? placeholders ('email = ?'); never put
     *                            user data inside it.
     * @param array       $params Values for the ? placeholders of $where.
     * @param string|null $order  'name', 'name DESC, id'... (validated).
     * @return array List of rows (empty array if there are none).
     * @throws InvalidArgumentException If $order is not valid.
     */
    public function read(?string $where = null, array $params = [], ?string $order = null): array
    {
        $sql = "SELECT * FROM `$this->tableName`";

        if ($where !== null)
            $sql .= " WHERE $where";

        if ($order !== null) {
            if (!preg_match('/^[\w`.]+(\s+(ASC|DESC))?(\s*,\s*[\w`.]+(\s+(ASC|DESC))?)*$/i', $order))
                throw new InvalidArgumentException("Invalid order: $order", 500);

            $sql .= " ORDER BY $order";
        }

        $result = $this->query($sql, $params);

        $rows = [];
        while ($row = $result->fetch_assoc()) {
            if (!$this->preventForeachRow) {
                $this->onReadRow($row);
            }

            $rows[] = $row;
        }

        return $rows;
    }
    
    /**
     * Reads the row with that id.
     *
     * @return array|null The row, or null if it does not exist.
     */
    public function readById(int $id): ?array
    {
        return $this->readOne('id = ?', [$id]);
    }

    /**
     * Reads the first row that matches $where.
     *
     * Meant for conditions that match a single row (a unique column): it reads every match and
     * keeps the first one.
     *
     * @param string $where  YOUR OWN SQL fragment with ? placeholders ('email = ?'); never put
     *                       user data inside it.
     * @param array  $params Values for the ? placeholders of $where.
     * @return array|null The row, or null if none matches.
     */
    public function readOne(string $where, array $params = []): ?array
    {
        return $this->read($where, $params)[0] ?? null;
    }

    /**
     * Updates the row with that id using the entries of $data whose key is listed in
     * $updatableColumns (any other is ignored).
     *
     * @return array|null The updated row.
     * @throws DbTableException 500 if $updatableColumns is empty, 422 if $data has none of them,
     *                          409 on a duplicate key.
     */
    public function update(int $id, array $data): ?array
    {
        if (empty($this->updatableColumns))
            throw DbTableException::invalidColumnsConfig($this->tableName, 'updatableColumns');

        $assignments = [];
        $params = [];

        foreach ($this->updatableColumns as $column) {
            if (key_exists($column, $data)) {
                $assignments[] = "`$column` = ?";
                $params[] = $this->toDbValue($data[$column]);
            }
        }

        if (empty($assignments))
            throw DbTableException::noValidFields($this->tableName, array_keys($data), $id);

        $params[] = $id;
        $this->query("UPDATE `$this->tableName` SET ".implode(', ', $assignments).' WHERE id = ?', $params);

        return $this->readById($id);
    }

    /**
     * Deletes the row with that id. Does nothing if it does not exist.
     */
    public function delete(int $id): void
    {
        $this->query("DELETE FROM `$this->tableName` WHERE id = ?", [$id]);
    }

    // protected -----------------------------------------------------------------------------------

    // Virtual method to override in child classes. Runs for every row read: hide or transform columns here.
    protected function onReadRow(array &$row): void
    { }

    // Prepared statement for the own methods of a db table (total(), byMonth()...).
    // Values always go in $params: query('SELECT ... WHERE date >= ?', [$from])
    protected final function query(string $sql, array $params = []): mysqli_result|true
    {
        try {
            return $this->db->query($sql, $params);
        }
        catch (mysqli_sql_exception $e) {
            throw DbTableException::sqlError(strtok(ltrim($sql), ' '), $this->tableName, $sql, $e->getMessage(), (int)$e->getCode());
        }
    }

    // private -------------------------------------------------------------------------------------

    // Converts HolaQue_Tal into hola_que_tal
    private static function toSnakeCase(string $string): string
    {
        $string = preg_replace('/(?<!^)[A-Z]/', '_$0', $string);
        return strtolower(preg_replace('/_+/', '_', $string));
    }

    // Prepares a client value to be stored in the database. Empty string => NULL
    private function toDbValue(mixed $value): int|float|string|null
    {
        if (is_bool($value))
            return $value ? 1 : 0;

        if (is_int($value) || is_float($value))
            return $value;

        if (is_string($value))
            return $value === '' ? null : $value;

        if (is_array($value)) { // Stored as JSON
            array_walk_recursive($value, function (&$v) {
                if (is_string($v)) {
                    if (strtolower($v) === 'null' || $v === '') $v = null;
                    else if (strtolower($v) === 'true') $v = true;
                    else if (strtolower($v) === 'false') $v = false;
                }
            });

            return json_encode($value, JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        }

        return null;
    }
}

class DbTableException extends RuntimeException
{
    // ⚠️❗

    private ?string $sql = null;

    private function __construct(string $message, int $code, ?string $sql = null)
    {
        parent::__construct($message, $code);
        $this->sql = $sql;
    }

    /**
     * The db table's $property array is empty (programming error, 500).
     */
    public static function invalidColumnsConfig(string $tableName, string $property): self
    {
        return new self(
            "⚠️ [$property] array does not exist or is empty for table [$tableName]",
            500
        );
    }

    /**
     * None of the provided fields can be written (client error, 422).
     */
    public static function noValidFields(string $tableName, array $providedFields, ?int $id = null): self
    {
        $rowInfo = $id !== null ? " for row with id [$id]" : '';
        return new self(
            "⚠️ No valid field to write in table [$tableName]$rowInfo. Provided fields: ".implode(', ', $providedFields),
            422
        );
    }

    /**
     * Wraps a MySQL error: a duplicate key (1062) is a 409, anything else a 500.
     */
    public static function sqlError(string $method, string $tableName, string $sql, string $mysqlError, int $mysqlErrno = 0): self
    {
        // 1062 = duplicate key: a client conflict, not a server failure
        if ($mysqlErrno === 1062)
            return new self("Duplicate entry on table [$tableName]", 409, $sql);

        return new self(
            "❗MySQL $method error on table [$tableName]: $mysqlError",
            500,
            $sql
        );
    }

    /**
     * The SQL that failed, if there is one.
     */
    public function getSql(): ?string
    {
        return $this->sql;
    }
}