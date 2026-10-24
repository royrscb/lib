<?php

enum AuthRole: string
{
    case Admin = 'admin';
    case User = 'user';
}

final readonly class AuthOwner
{
    public AuthRole $role;
    public ?int $id;

    private function __construct(AuthRole $role, ?int $id)
    {
        $this->role = $role;
        $this->id = $id;
    }

    public static function admin(): self
    {
        return new self(AuthRole::Admin, null);
    }

    public static function user(int $id): self
    {
        return new self(AuthRole::User, $id);
    }

    /**
     * Owner described by the data of toArray(), or null if there is none or it is not valid.
     */
    public static function fromArray(?array $data): ?self
    {
        return match (AuthRole::tryFrom($data['role'] ?? '')) {
            AuthRole::Admin => self::admin(),
            AuthRole::User  => isset($data['id']) ? self::user((int)$data['id']) : null,
            null            => null,
        };
    }

    /**
     * Plain data that fromArray() reads back.
     */
    public function toArray(): array
    {
        return ['role' => $this->role->value, 'id' => $this->id];
    }

    /**
     * Owner named by toSlug(), or null if the slug is not valid.
     */
    public static function fromSlug(string $slug): ?self
    {
        [$roleName, $id] = array_pad(explode('-', $slug), 2, null);

        return match (AuthRole::tryFrom($roleName)) {
            AuthRole::Admin => self::admin(),
            AuthRole::User  => ctype_digit($id ?? '') ? self::user((int)$id) : null,
            null            => null,
        };
    }

    /**
     * Short text that names the owner: 'admin' or 'user-<id>'.
     */
    public function toSlug(): string
    {
        $slug = $this->role->value;
        if ($this->role === AuthRole::User)
            $slug .= '-' . $this->id;

        return $slug;
    }
}

final class Auth
{
    private const string ENV_PROJECT_SLUG = 'PROJECT_SLUG';
    private const string ENV_AUTH_SECRET = 'AUTH_SECRET';
    private const string ENV_ADMIN_HASHWORD = 'ADMIN_HASHWORD';

    private const string SESSION_KEY = 'auth';
    private const int PERSISTENT_LOGIN_DAYS = 100;

    private static ?array $me = null;
    private static bool $isMeResolved = false;

    // public --------------------------------------------------------------------------------------

    /**
     * Logs in the admin, whose hashword is in the .env (ADMIN_HASHWORD).
     *
     * @param string $password   Plain password.
     * @param bool   $persistent Keep the login for PERSISTENT_LOGIN_DAYS days with a cookie.
     * @return array|null The identity (see me()), or null if the password is wrong or the .env has no admin.
     */
    public static function loginAdmin(string $password, bool $persistent = false): ?array
    {
        $hashword = self::getAdminHashword();

        if ($hashword === null || !password_verify($password, $hashword))
            return null;

        return self::start(AuthOwner::admin(), $persistent);
    }

    /**
     * Logs a regular user in with (email or username) + (password).
     * Only for apps with users. Never gives the admin role.
     *
     * @param string $emailOrUsername Email or username.
     * @param string $password        Plain password.
     * @param bool   $persistent      Keep the login for PERSISTENT_LOGIN_DAYS days with a cookie.
     * @return array|null The identity (see me()), or null if the credentials are wrong.
     */
    public static function loginUser(string $emailOrUsername, string $password, bool $persistent = false): ?array
    {
        $users = self::users();
        $user = $users->readByEmail($emailOrUsername) ?? $users->readByUsername($emailOrUsername);

        if ($user === null || !$users->verifyPassword($user['id'], $password))
            return null;

        return self::start(AuthOwner::user($user['id']), $persistent);
    }

    /**
     * Closes the session and forgets this device's persistent login cookie.
     */
    public static function logout(): void
    {
        self::startSession();

        // Tokens are signed, not stored: forgetting this device is just deleting its cookie
        self::deleteCookie(self::getPersistentCookieName());
        self::deleteCookie(session_name());

        $_SESSION = [];
        session_destroy();

        self::$me = null;
        self::$isMeResolved = true;
    }

    /**
     * Who is logged in (whoami), or null if nobody.
     *
     * - The admin: ['id' => null, 'role' => AuthRole::Admin]. The admin has no user row, hence no id.
     * - A user: the user row plus 'role' => AuthRole::User.
     *
     * Restores the login from the persistent login cookie if there is no session, and drops sessions
     * whose identity no longer exists.
     *
     * @return array|null
     */
    public static function me(): ?array
    {
        if (self::$isMeResolved)
            return self::$me;

        self::startSession();

        $owner = AuthOwner::fromArray($_SESSION[self::SESSION_KEY] ?? null);

        if ($owner === null) {
            $owner = self::readPersistentToken();

            if ($owner !== null)
                session_regenerate_id(true);
        }

        self::$me = $owner !== null ? self::identify($owner) : null;
        self::$isMeResolved = true;

        if (self::$me === null)
            unset($_SESSION[self::SESSION_KEY]);
        else
            $_SESSION[self::SESSION_KEY] = $owner->toArray();

        return self::$me;
    }

    /**
     * Whether the logged-in identity is the admin.
     */
    public static function isAdmin(): bool
    {
        return (self::me()['role'] ?? null) === AuthRole::Admin;
    }
    /**
     * Whether the logged-in identity is a regular user.
     */
    public static function isUser(): bool
    {
        return (self::me()['role'] ?? null) === AuthRole::User;
    }

    /**
     * Requires anybody logged in (user or admin).
     *
     * @return array The identity (see me()).
     * @throws RuntimeException 401 if nobody is logged in.
     */
    public static function requireLogin(): array
    {
        return self::me() ?? throw new RuntimeException('Unauthorized', 401);
    }
    /**
     * Requires the admin.
     *
     * @throws RuntimeException 401 if nobody is logged in, 403 if it is a user.
     */
    public static function requireAdmin(): void
    {
        if (self::requireLogin()['role'] !== AuthRole::Admin)
            throw new RuntimeException('Forbidden', 403);
    }
    /**
     * Requires the user with that id (for "a user can only touch their own data").
     *
     * @param int  $id         Id of the user.
     * @param bool $allowAdmin Whether the admin also passes, as if it were that user.
     * @throws RuntimeException 401 if nobody is logged in, 403 if it is another user or the admin is not allowed.
     */
    public static function requireUser(int $id, bool $allowAdmin = true): void
    {
        $me = self::requireLogin();

        if ($allowAdmin && $me['role'] === AuthRole::Admin)
            return;

        if ($me['role'] !== AuthRole::User || (int)$me['id'] !== $id)
            throw new RuntimeException('Forbidden', 403);
    }
    /**
     * Checks a token sent in a header against a .env variable (for machines: webhooks, gateways).
     * Example for the Telegram webhook:
     * requireToken('TELEGRAM_WEBHOOK_SECRET', 'X-Telegram-Bot-Api-Secret-Token').
     *
     * @throws RuntimeException 500 if the variable is not configured, 403 if the token is wrong.
     */
    public static function requireToken(string $envName, string $header = 'X-Api-Token'): void
    {
        $expected = Env::get($envName, '');
        if ($expected === '')
            throw new RuntimeException("Token '$envName' is not configured", 500);

        if (!hash_equals($expected, Request::header($header) ?? ''))
            throw new RuntimeException('Forbidden', 403);
    }
    /**
     * For cron jobs: allowed from the command line, or over the web with a token.
     *
     * @throws RuntimeException See requireToken().
     */
    public static function requireCliOrToken(string $envName, string $header = 'X-Api-Token'): void
    {
        if (PHP_SAPI !== 'cli')
            self::requireToken($envName, $header);
    }

    // private -------------------------------------------------------------------------------------

    private static function users(): User
    {
        return Database::instance()->table(User::class);
    }

    // Password hash of the admin from the .env, or null if the app has no admin
    private static function getAdminHashword(): ?string
    {
        $hashword = Env::get(self::ENV_ADMIN_HASHWORD, '');

        return $hashword !== '' ? $hashword : null;
    }

    // Opens the session for an owner and returns the identity
    private static function start(AuthOwner $owner, bool $persistent): ?array
    {
        self::startSession();
        session_regenerate_id(true);
        $_SESSION[self::SESSION_KEY] = $owner->toArray();
        self::$isMeResolved = false;

        if ($persistent) {
            $token = self::createPersistentToken($owner);
            if ($token !== null) {
                self::setCookie(self::getPersistentCookieName(), $token, time() + 86400 * self::PERSISTENT_LOGIN_DAYS);
            }
        }

        return self::me();
    }

    // Identity of an owner, or null if it is invalid or no longer exists
    private static function identify(AuthOwner $owner): ?array
    {
        if ($owner->role === AuthRole::Admin)
            return self::getAdminHashword() !== null ? ['id' => $owner->id, 'role' => $owner->role] : null;

        // Admin-only apps have no User class: any session pointing to a user is invalid
        if ($owner->id === null || !class_exists(User::class))
            return null;

        // Read every time, so deleting the user takes effect at once
        $user = self::users()->readById($owner->id);

        if ($user === null)
            return null;

        return $user + ['role' => AuthRole::User];
    }

    // Token of an owner, or null if it cannot be made.
    // Persistent login with no extra table: the cookie is a signed token (HMAC) and nothing is stored.
    // Format: "<who>.<mac>", where <who> is the slug of the owner (see AuthOwner::toSlug()).
    // The mac covers who + the hashword of the owner and is keyed with AUTH_SECRET. So:
    // - Logging in again renews the cookie for PERSISTENT_LOGIN_DAYS days (the token itself does not expire).
    // - Changing the password of the owner invalidates their cookies.
    // - Leaking the database alone is not enough to forge cookies: AUTH_SECRET is not in it.
    // A token cannot be revoked per device: logout only deletes the cookie of this device.
    private static function createPersistentToken(AuthOwner $owner): ?string
    {
        // Hashword of the owner, which ties the token to the password. Admin-only apps have no User class
        $hashword = match ($owner->role) {
            AuthRole::Admin => self::getAdminHashword(),
            AuthRole::User  => $owner->id !== null && class_exists(User::class)
                ? self::users()->getHashword($owner->id) : null,
        };

        if ($hashword === null)
            return null;

        // An empty key would sign every token with nothing secret
        $secret = Env::get(self::ENV_AUTH_SECRET);
        if ($secret === '')
            throw new RuntimeException('Env var '.self::ENV_AUTH_SECRET.' is empty', 500);

        $who = $owner->toSlug();

        return "$who.".hash_hmac('sha256', "$who.$hashword", $secret);
    }
    // Owner stored in the persistent login cookie of this request, or null if there is none or it is not valid
    private static function readPersistentToken(): ?AuthOwner
    {
        $token = $_COOKIE[self::getPersistentCookieName()] ?? null;

        if (!is_string($token))
            return null;

        $owner = AuthOwner::fromSlug(explode('.', $token)[0]);

        if ($owner === null)
            return null;

        $expected = self::createPersistentToken($owner);

        return $expected !== null && hash_equals($expected, $token) ? $owner : null;
    }

    private static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE)
            return;

        session_name('sess'.preg_replace('/\W/', '', Env::get(self::ENV_PROJECT_SLUG)));
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }

    private static function isHttps(): bool
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    }
    
    private static function getPersistentCookieName(): string
    {
        return 'persist_'.Env::get(self::ENV_PROJECT_SLUG);
    }
    private static function setCookie(string $name, string $value, int $expiresUnixTime): void
    {
        setcookie($name, $value, [
            'expires'  => $expiresUnixTime,
            'path'     => '/',
            'secure'   => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
    }
    private static function deleteCookie(string $name): void
    {
        self::setCookie($name, '', 1);
    }
}