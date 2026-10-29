<?php

declare(strict_types=1);

final class Database
{

    // const ---------------------------------------------------------------------------------------

    // Env vars ---
    private const string ENV_DB_HOSTNAME = 'DB_HOSTNAME';
    private const string ENV_DB_USERNAME = 'DB_USERNAME';
    private const string ENV_DB_PASSWORD = 'DB_PASSWORD';
    private const string ENV_DB_DATABASE = 'DB_DATABASE';
    // ---

    // Attributes ----------------------------------------------------------------------------------

    private static ?self $instance = null;

    private mysqli $conn;

    private int $lastInsertId = 0;
    private int $affectedRows = 0;

    private ?MiscData $miscData = null;
    /** @var array<string, DbTable> */
    private array $tables = [];

    // Constructor and Instance --------------------------------------------------------------------

    private function __construct()
    {
        $this->conn = self::connect();
    }

    public static function instance(): self
    {
        return self::$instance ??= new self();
    }
    
    // public --------------------------------------------------------------------------------------

    public function miscData(): MiscData
    {
        return $this->miscData ??= new MiscData($this);
    }

    /**
     * @template T of DbTable
     * @param class-string<T> $class
     * @return T
     */
    public function table(string $class): DbTable
    {
        if (!is_subclass_of($class, DbTable::class))
            throw new InvalidArgumentException("$class is not a DbTable");

        return $this->tables[$class] ??= new $class($this);
    }

    /**
     * Prepared statement. Values must ALWAYS go in $params, never inside the SQL.
     *
     * @param array<int, int|float|string|null> $params
     * @return mysqli_result|true Result set for a SELECT, true for INSERT/UPDATE/DELETE
     * @throws mysqli_sql_exception if the statement fails
     *
     * @example
     *   // SELECT: iterate the result
     *   $result = $db->query('SELECT * FROM `user` WHERE email = ? AND id > ?', ['a@b.com', 10]);
     *   while ($row = $result->fetch_assoc()) { ... }
     *
     *   // INSERT: read the new id afterwards
     *   $db->query('INSERT INTO `user` (name, email) VALUES (?, ?)', ['Ana', 'ana@b.com']);
     *   $id = $db->lastInsertId();
     *
     *   // WRONG: never concatenate user data into the SQL
     *   $db->query("SELECT * FROM `user` WHERE email = '$email'");
     */
    public function query(string $sql, array $params = []): mysqli_result|true
    {
        $stmt = $this->conn->prepare($sql);

        try {
            if ($params) {
                $types = '';
                foreach ($params as $param)
                    $types .= match (true) { is_int($param) => 'i', is_float($param) => 'd', default => 's' };

                $stmt->bind_param($types, ...$params);
            }

            $stmt->execute();

            $this->lastInsertId = $stmt->insert_id;
            $this->affectedRows = $stmt->affected_rows;

            $result = $stmt->get_result();
        } finally {
            $stmt->close();
        }

        return $result === false ? true : $result;
    }

    public function lastInsertId(): int
    {
        return $this->lastInsertId;
    }
    public function affectedRows(): int
    {
        return $this->affectedRows;
    }

    // private -------------------------------------------------------------------------------------

    private static function connect(): mysqli
    {
        // Failures throw mysqli_sql_exception
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $conn = mysqli_init();
        $conn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, true);
        $conn->real_connect(
            Env::get(self::ENV_DB_HOSTNAME),
            Env::get(self::ENV_DB_USERNAME),
            Env::get(self::ENV_DB_PASSWORD, allowEmpty: true),
            Env::get(self::ENV_DB_DATABASE),
        );
        $conn->set_charset('utf8mb4');

        return $conn;
    }
}
