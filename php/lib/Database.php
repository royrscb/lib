<?php

require_once __DIR__ . '/Env.php';
require_once __DIR__ . '/ModelCrud.php';

final class Database
{
    private static ?self $instance = null;
    private mysqli $conn;
        
    // Tables ---
    private ?MiscData $misc_data = null; public function miscData(): MiscData { return $this->misc_data ??= new MiscData($this->conn); }

    private ?User $user = null; public function user(): User { return $this->user ??= new User($this->conn, $this); }
    // ---

    public static function instance(): self
    {
        return self::$instance ??= new Self();
    }

    private function __construct()
    {
        Env::load(__DIR__ . '/../.env');
        $this->conn = $this->connect();
    }

    private function connect(): mysqli
    {
        $hostname = getenv('DB_HOSTNAME');
        $username = getenv('DB_USERNAME');
        $password = getenv('DB_PASSWORD');
        $database = getenv('DB_DATABASE');

        $conn = mysqli_init();
        $conn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, true);

        if (!$conn->real_connect($hostname, $username, $password, $database))
            throw new mysqli_sql_exception($conn->connect_error, $conn->connect_errno);

        $conn->set_charset('utf8mb4');

        return $conn;
    }
}
