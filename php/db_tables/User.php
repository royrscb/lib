<?php

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
     * @return array|null The created user (without hashword), as returned by DbTable::create().
     */
    public function create(array $data): ?array
    {
        unset($data['hashword']);

        if (isset($data['password']))
            $data['hashword'] = password_hash($data['password'], PASSWORD_DEFAULT);

        unset($data['password']);

        return parent::create($data);
    }

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
     * Stores a plain password hash. Does nothing if the id does not exist.
     */
    public function setPassword(int $id, string $password): void
    {
        $hashword = password_hash($password, PASSWORD_DEFAULT);

        $this->query(
            "UPDATE `$this->tableName` SET hashword = ? WHERE id = ?",
            [$hashword, $id]
        );
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
            "SELECT hashword FROM `$this->tableName` WHERE id = ?",
            [$id]
        )->fetch_column();

        // false = no such user, null = user created without a password
        if (!is_string($hashword) || !password_verify($password, $hashword))
            return false;

        // Direct update instead of setPassword(): the password was already accepted, so a
        // stricter length policy must not make existing users fail to log in
        if (password_needs_rehash($hashword, PASSWORD_DEFAULT)) {
            $this->query(
                "UPDATE `$this->tableName` SET hashword = ? WHERE id = ?",
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
            "SELECT hashword FROM `$this->tableName` WHERE id = ?",
            [$id]
        )->fetch_column();

        // false = no such user, null = user created without a password
        return is_string($hashword) && $hashword !== '' ? $hashword : null;
    }
}