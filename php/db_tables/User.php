<?php

declare(strict_types=1);

final class User extends DbTable
{
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

    /**
     * Creates a user. The client sends a plain 'password' and only its hash is stored;
     * a 'hashword' sent by the client is ignored.
     *
     * @return array The created user (without hashword), as returned by DbTable::create().
     */
    public function create(array $data): array
    {
        unset($data['hashword']);

        $this->validateIdentity($data);

        try {
            $password = array_get_string($data, 'password');
        } catch (InvalidArgumentException $e) {
            throw new RuntimeException($e->getMessage(), 422, $e);
        }
        self::validatePassword($password);
        $data['hashword'] = password_hash($password, PASSWORD_DEFAULT);

        unset($data['password']);

        return parent::create($data);
    }

    /**
     * Updates a user, rejecting a username or email already used by another user.
     */
    public function update(int $id, array $data): ?array
    {
        $this->validateIdentity($data, $id);

        return parent::update($id, $data);
    }

    /**
     * Finds a user by email.
     *
     * @return array|null The user (without hashword), or null if there is no such email.
     */
    public function readByEmail(string $email): ?array
    {
        return $this->readOne('LOWER(email) = ?', [self::normalizeIdentity($email)]);
    }

    /**
     * Finds a user by username.
     *
     * @return array|null The user (without hashword), or null if there is no such username.
     */
    public function readByUsername(string $username): ?array
    {
        return $this->readOne('LOWER(username) = ?', [self::normalizeIdentity($username)]);
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
     * To log in by email or username, find the user first with readByEmail() / readByUsername() and pass its id here.
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

    private function validateIdentity(array &$data, ?int $exceptId = null): void
    {
        foreach (['username', 'email'] as $column) {
            if ($exceptId !== null && !array_key_exists($column, $data))
                continue;

            try {
                $value = trim(array_get_string($data, $column));
            } catch (InvalidArgumentException $e) {
                throw new RuntimeException($e->getMessage(), 422, $e);
            }

            if ($column === 'email') {
                if (!is_valid_email($value))
                    throw new RuntimeException("'email' is invalid", 422);
            } else if ($column === 'username') {
                self::validateUsername($value);
            }

            $data[$column] = $value;
            $this->assertUnique($column, self::normalizeIdentity($value), $exceptId);
        }
    }

    private static function normalizeIdentity(string $value): string
    {
        return mb_strtolower($value, 'UTF-8');
    }

    private function assertUnique(string $column, string $value, ?int $exceptId): void
    {
        if ($this->readOne(
            "LOWER(`$column`) = ?".($exceptId === null ? '' : ' AND id <> ?'),
            $exceptId === null ? [$value] : [$value, $exceptId]
        ) !== null)
            throw new RuntimeException("'$column' already exists", 409);
    }

    private static function validateUsername(string $username): void
    {
        $allowedChars = ['_', '.'];

        if (!preg_match('/^[A-Za-z'.implode('', $allowedChars).']+$/', $username))
            throw new RuntimeException(
                "'username' may only contain ASCII letters and these characters: ".implode(', ', $allowedChars),
                422
            );
    }

    private static function validatePassword(mixed $password): void
    {
        if (!is_string($password) || strlen($password) < 8 || strlen($password) > 64)
            throw new RuntimeException("'password' must be between 8 and 64 chars", 422);
    }
}