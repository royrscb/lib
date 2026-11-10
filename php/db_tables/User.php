<?php

declare(strict_types=1);

final class User extends DbTable
{
    private const array IDENTITY_COLUMNS = ['username', 'email'];
    private const array IDENTITY_UNIQUE_KEYS = [
        'uq_user_username' => 'username',
        'uq_user_email' => 'email',
    ];

    private const int USERNAME_MAX_LENGTH = 32;
    private const array USERNAME_ALLOWED_CHARS = ['_', '.'];

    private const int PASSWORD_MIN_LENGTH = 8;
    private const int PASSWORD_MAX_LENGTH = 32;

    protected array $creatableColumns =
    [
        'username',
        'email',
        'hashword',
    ];
    protected array $readableColumns =
    [
        'username',
        'email',
    ];
    protected array $updatableColumns =
    [
        'username',
        'email',
    ];

    // public --------------------------------------------------------------------------------------

    // DbTable override ---

    /**
     * Creates a user. The client sends a plain 'password' and only its hash is stored;
     * a 'hashword' sent by the client is ignored.
     *
     * @return array The created user row without its password hash.
     */
    public function create(array $data): array
    {
        unset($data['hashword']);

        foreach (self::IDENTITY_COLUMNS as $column) {
            if (!array_key_exists($column, $data))
                throw new RuntimeException("'$column' is required", 422);
        }

        $data = $this->validateIdentity($data);

        try {
            $password = array_get_string($data, 'password');
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
        self::validatePassword($password);
        $data['hashword'] = password_hash($password, PASSWORD_DEFAULT);

        unset($data['password']);

        try {
            return parent::create($data);
        } catch (DbTableException $e) {
            self::throwIdentityConflict($e);
        }
    }

    /**
     * Updates a user, rejecting a username or email already used by another user.
     */
    public function update(int $id, array $data): ?array
    {
        $data = $this->validateIdentity($data);

        try {
            return parent::update($id, $data);
        } catch (DbTableException $e) {
            self::throwIdentityConflict($e);
        }
    }
    
    // ---

    /**
     * Finds a user by email.
     *
     * @return array|null The user (without hashword), or null if there is no such email.
     */
    public function readByEmail(string $email): ?array
    {
        return $this->readOne('email = ?', [$email]);
    }

    /**
     * Finds a user by username.
     *
     * @return array|null The user (without hashword), or null if there is no such username.
     */
    public function readByUsername(string $username): ?array
    {
        return $this->readOne('username = ?', [$username]);
    }

    /**
     * Changes the password after verifying the current one.
     */
    public function changePassword(int $id, string $currentPassword, string $newPassword): void
    {
        self::validatePassword($newPassword);
        $row = $this->query(
            "SELECT hashword FROM $this->tableName WHERE id = ?",
            [$id]
        )->fetch_assoc();

        if ($row === null)
            throw new RuntimeException('Not found', 404);
        if (!is_string($row['hashword']) || !password_verify($currentPassword, $row['hashword']))
            throw new RuntimeException('Current password is incorrect', 403);
        if (password_verify($newPassword, $row['hashword']))
            throw new RuntimeException('New password must be different from the current password', 422);

        $this->query(
            "UPDATE $this->tableName SET hashword = ? WHERE id = ? AND hashword = ?",
            [password_hash($newPassword, PASSWORD_DEFAULT), $id, $row['hashword']]
        );

        if ($this->db->affectedRows() === 0)
            throw new RuntimeException('Current password is incorrect', 403);
    }

    /**
     * Checks a plain password against the user's stored hash (for login).
     * If the hashing algorithm has changed since the hash was created, the hash is upgraded.
     *
     * The caller resolves the user from an email address or username and passes that user's id here.
     *
     * @return bool false if the password is wrong, the user has no password, or the id does not exist.
     */
    public function verifyPassword(int $id, string $password): bool
    {
        $hashword = $this->query(
            "SELECT hashword FROM $this->tableName WHERE id = ?",
            [$id]
        )->fetch_column();

        // false = no such user, null = user created without a password
        if (!is_string($hashword) || !password_verify($password, $hashword))
            return false;

        // The password was already accepted, so a stricter length policy must not make existing users fail to log in during rehash.
        if (password_needs_rehash($hashword, PASSWORD_DEFAULT)) {
            $this->query(
                "UPDATE $this->tableName SET hashword = ? WHERE id = ?",
                [password_hash($password, PASSWORD_DEFAULT), $id]
            );
        }

        return true;
    }

    /**
     * Stored password hash of the user. Meant for Auth, which signs tokens with it: since it changes
     * when the password changes, the tokens signed with it stop being valid.
     *
     * @return string|null The hash, or null if the id does not exist or the user has no password.
     */
    public function getHashword(int $id): ?string
    {
        $hashword = $this->query(
            "SELECT hashword FROM $this->tableName WHERE id = ?",
            [$id]
        )->fetch_column();

        // false = no such user, null = user created without a password
        return is_string($hashword) && $hashword !== '' ? $hashword : null;
    }

    // private -------------------------------------------------------------------------------------

    private function validateIdentity(array $data): array
    {
        foreach (self::IDENTITY_COLUMNS as $column) {
            if (!array_key_exists($column, $data))
                continue;

            try {
                $value = trim(array_get_string($data, $column));
            } catch (InvalidArgumentException $e) {
                throw new RuntimeException($e->getMessage(), 422, $e);
            }

            match ($column) {
                'email' => is_valid_email($value)
                    ?: throw new RuntimeException("'email' is invalid", 422),
                'username' => self::validateUsername($value),
                default => throw new LogicException("Unknown identity column '$column'"),
            };

            $data[$column] = $value;
        }

        return $data;
    }

    private static function throwIdentityConflict(DbTableException $e): never
    {
        $column = self::IDENTITY_UNIQUE_KEYS[$e->getDuplicateKey() ?? ''] ?? null;
        if ($column === null)
            throw $e;

        throw new RuntimeException("'$column' already exists", 409, $e);
    }

    private static function validateUsername(string $username): void
    {
        $allowedChars = implode('', self::USERNAME_ALLOWED_CHARS);

        if (mb_strlen($username) > self::USERNAME_MAX_LENGTH || !preg_match('/^[A-Za-z0-9'.$allowedChars.']+$/', $username))
            throw new RuntimeException(
                "'username' must be 1-".self::USERNAME_MAX_LENGTH
                ." characters and contain only ASCII letters, digits, and these characters: ".implode(', ', self::USERNAME_ALLOWED_CHARS),
                422
            );
    }

    private static function validatePassword(mixed $password): void
    {
        if (!is_string($password)
            || !preg_match('/^[\x21-\x7E]+$/D', $password)
            || strlen($password) < self::PASSWORD_MIN_LENGTH
            || strlen($password) > self::PASSWORD_MAX_LENGTH
        )
            throw new RuntimeException(
                "'password' must be between ".self::PASSWORD_MIN_LENGTH." and ".self::PASSWORD_MAX_LENGTH
                ." printable ASCII characters without spaces",
                422
            );
    }
}

/*
CREATE TABLE `user` (
    `id`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(32)  COLLATE utf8mb4_unicode_ci NOT NULL,
    `email`    VARCHAR(254) COLLATE utf8mb4_unicode_ci NOT NULL,
    `hashword` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_username` (`username`),
    UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/