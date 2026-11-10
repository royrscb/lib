<?php

declare(strict_types=1);

/**
 * Supported authentication roles.
 */
enum AuthRole: string
{
    case Admin = 'admin';
    case User = 'user';
}

/**
 * Authenticated identity with typed role and id, plus the user data returned by the API.
 */
final readonly class AuthIdentity implements JsonSerializable
{
    public AuthRole $role;
    public ?int $id;
    /** @var array<string, mixed> */
    public array $data;

    /**
     * @param array<string, mixed> $data User fields included in API responses.
     */
    private function __construct(AuthRole $role, ?int $id, array $data = [])
    {
        $this->role = $role;
        $this->id = $id;
        $this->data = $data;
    }

    /**
     * Creates the admin identity.
     */
    public static function admin(): self
    {
        return new self(AuthRole::Admin, id: null);
    }

    /**
     * Creates a user identity from a user row.
     *
     * @param int $id User id.
     * @param array<string, mixed> $data User fields returned by the database.
     */
    public static function user(int $id, array $data = []): self
    {
        unset($data['id']);

        return new self(AuthRole::User, $id, $data);
    }

    /**
     * Builds an identity from the role and id stored in a session.
     *
     * @param array<string, mixed>|null $data Session data.
     */
    public static function fromSessionArray(?array $data): ?self
    {
        return match (AuthRole::tryFrom($data['role'] ?? '')) {
            AuthRole::Admin => self::admin(),
            AuthRole::User  => isset($data['id']) ? self::user((int)$data['id']) : null,
            null            => null,
        };
    }

    /**
     * Session representation containing only the role and user id.
     *
     * @return array{role: string, id: int|null}
     */
    public function toSessionArray(): array
    {
        return ['role' => $this->role->value, 'id' => $this->id];
    }

    /**
     * Builds an identity from the slug 'admin' or 'user-<id>'.
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
     * Short text naming this identity for signed persistent-login tokens.
     */
    public function toSlug(): string
    {
        $slug = $this->role->value;
        if ($this->role === AuthRole::User)
            $slug .= '-' . $this->id;

        return $slug;
    }

    /**
     * Serializes the identity using the existing API response shape.
     *
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return ['id' => $this->id] + $this->data + ['role' => $this->role];
    }
}

/**
 * Manages login sessions, persistent login cookies, and authorization checks.
 */
final class Auth
{
    // const ---------------------------------------------------------------------------------------

    // Env vars ---
    private const string ENV_PROJECT_SLUG = 'PROJECT_SLUG';
    private const string ENV_AUTH_SECRET = 'AUTH_SECRET';
    private const string ENV_ADMIN_HASHWORD = 'ADMIN_HASHWORD';
    private const string ENV_AUTH_PERSISTENT_LOGIN_DAYS = 'AUTH_PERSISTENT_LOGIN_DAYS';
    // ---

    private const string TOKEN_HASH_ALGORITHM = 'sha256';
    private const string SESSION_KEY = 'auth';

    // Attributes ----------------------------------------------------------------------------------

    private static ?AuthIdentity $me = null;
    private static bool $isMeResolved = false;

    // public --------------------------------------------------------------------------------------

    /**
     * Logs in the admin, whose hashword is in the .env (ADMIN_HASHWORD).
     *
     * @param string $password   Plain password.
     * @param bool   $persistent Keep the login with a cookie for the configured number of days.
     * @return AuthIdentity|null The authenticated admin identity, or null if the password is wrong or
     *                       the .env has no admin.
     */
    public static function loginAdmin(string $password, bool $persistent = false): ?AuthIdentity
    {
        $hashword = self::getAdminHashword();

        if ($hashword === null || !password_verify($password, $hashword))
            return null;

        return self::start(AuthIdentity::admin(), $persistent);
    }

    /**
     * Logs a regular user in with (email or username) + (password).
     * Only for apps with users. Never gives the admin role.
     *
     * @param string $emailOrUsername Email or username.
     * @param string $password        Plain password.
     * @param bool   $persistent      Keep the login with a cookie for the configured number of days.
     * @return AuthIdentity|null The authenticated user identity, or null if the credentials are wrong.
     */
    public static function loginUser(string $emailOrUsername, string $password, bool $persistent = false): ?AuthIdentity
    {
        $userTable = self::getUserTable();
        $user = $userTable->readByEmail($emailOrUsername) ?? $userTable->readByUsername($emailOrUsername);

        if ($user === null || !$userTable->verifyPassword($user['id'], $password))
            return null;

        return self::start(AuthIdentity::user($user['id']), $persistent);
    }

    /**
     * Creates a signed token for the currently authenticated identity.
     * The token expires after the configured persistent-login period.
     */
    public static function getPersistentToken(): ?string
    {
        $owner = self::me();

        if ($owner === null)
            return null;

        return self::createPersistentToken($owner);
    }
    
    /**
     * Renews the persistent login cookie of this device (only if it has one)
     * for another AUTH_PERSISTENT_LOGIN_DAYS.
     */
    public static function renewPersistentCookie(): void
    {
        $owner = self::me();
        $cookieName = self::getPersistentCookieName();

        if ($owner === null || !isset($_COOKIE[$cookieName]))
            return;

        $token = self::createPersistentToken($owner);

        if ($token !== null)
            self::setCookie(
                $cookieName,
                $token,
                time() + 86400 * Env::getInt(self::ENV_AUTH_PERSISTENT_LOGIN_DAYS)
            );
    }

    /**
     * Closes the session and forgets this device's persistent login cookie.
     */
    public static function logout(): void
    {
        $sessionCookieName = self::getSessionName();
        if (session_status() === PHP_SESSION_ACTIVE || is_string($_COOKIE[$sessionCookieName] ?? null)) {
            self::startSession();

            $_SESSION = [];
            session_destroy();
        }

        // Tokens are signed, not stored: forgetting this device is just deleting its cookie
        self::deleteCookie(self::getPersistentCookieName());
        self::deleteCookie($sessionCookieName);

        self::$me = null;
        self::$isMeResolved = true;
    }

    /**
     * Regenerates the current user's session after a password change.
     * Bearer clients (the app) have no session: their old token stops working because the
     * password changed, so they must log in again.
     */
    public static function passwordChanged(int $id): void
    {
        // return;
        if (Request::header('Authorization') !== null) {
            self::$me = null;
            self::$isMeResolved = false;
            return;
        }

        self::startSession();

        $owner = AuthIdentity::fromSessionArray($_SESSION[self::SESSION_KEY] ?? null);
        if ($owner?->role !== AuthRole::User || $owner->id !== $id)
            throw new LogicException('The current session does not belong to this user');

        if (!session_regenerate_id(true))
            throw new RuntimeException('Could not regenerate session after password change', 500);

        $_SESSION[self::SESSION_KEY] = $owner->toSessionArray();

        $cookieName = self::getPersistentCookieName();
        if (isset($_COOKIE[$cookieName])) {
            $token = self::createPersistentToken($owner);
            if ($token !== null)
                self::setCookie(
                    $cookieName,
                    $token,
                    time() + 86400 * Env::getInt(self::ENV_AUTH_PERSISTENT_LOGIN_DAYS)
                );
        }

        self::$me = null;
        self::$isMeResolved = false;
    }

    /**
     * Returns the authenticated identity, or null if nobody is logged in.
     *
     * Restores the login from the persistent login cookie if there is no session, and drops sessions
     * whose identity no longer exists.
     *
     * @return AuthIdentity|null
     */
    public static function me(): ?AuthIdentity
    {
        if (self::$isMeResolved)
            return self::$me;

        $bearerToken = self::getBearerToken();

        // return;
        if ($bearerToken !== null) {
            $owner = self::verifyPersistentToken($bearerToken);
            self::$me = $owner !== null ? self::identify($owner) : null;
            self::$isMeResolved = true;

            return self::$me;
        }

        $sessionCookie = $_COOKIE[self::getSessionName()] ?? null;
        if (session_status() !== PHP_SESSION_ACTIVE && !is_string($sessionCookie)) {
            $owner = self::verifyPersistentToken();

            if ($owner === null) {
                self::$me = null;
                self::$isMeResolved = true;
                return null;
            }

            self::startSession();
            if (!session_regenerate_id(true))
                throw new RuntimeException('Could not regenerate session after restoring login', 500);
        } else {
            self::startSession();

            $owner = AuthIdentity::fromSessionArray($_SESSION[self::SESSION_KEY] ?? null);

            if ($owner === null) {
                $owner = self::verifyPersistentToken();

                if ($owner !== null && !session_regenerate_id(true))
                    throw new RuntimeException('Could not regenerate session after restoring login', 500);
            }
        }

        self::$me = $owner !== null ? self::identify($owner) : null;
        self::$isMeResolved = true;

        if (self::$me === null)
            unset($_SESSION[self::SESSION_KEY]);
        else
            $_SESSION[self::SESSION_KEY] = $owner->toSessionArray();

        return self::$me;
    }

    /**
     * Whether the logged-in identity is the admin.
     */
    public static function isAdmin(): bool
    {
        return self::me()?->role === AuthRole::Admin;
    }
    /**
     * Whether the logged-in identity is a regular user.
     */
    public static function isUser(): bool
    {
        return self::me()?->role === AuthRole::User;
    }

    /**
     * Requires the admin.
     *
     * @throws RuntimeException 401 if nobody is logged in, 403 if it is a user.
     */
    public static function requireAdmin(): void
    {
        $me = self::me() ?? throw new RuntimeException('Unauthorized', 401);

        if ($me->role !== AuthRole::Admin)
            throw new RuntimeException('Forbidden', 403);
    }
    /**
     * Requires a user: any user if $id is null, or only the user with that id
     * (for "a user can only touch their own data").
     * The check is against the identity authenticated for the current request.
     *
     * @param int|null $id         Id of the user, or null for any user.
     * @param bool     $allowAdmin Whether the admin also passes, as if it were that user (or any user).
     * @throws RuntimeException 401 if nobody is logged in, 403 if it is another user or the admin is not allowed.
     */
    public static function requireUser(?int $id = null, bool $allowAdmin = true): void
    {
        $me = self::me()
            ?? throw new RuntimeException('Unauthorized', 401);

        if ($allowAdmin && $me->role === AuthRole::Admin)
            return;

        if ($me->role !== AuthRole::User || ($id !== null && $me->id !== $id))
            throw new RuntimeException('Forbidden', 403);
    }
    /**
     * Checks a token sent in a header against a .env variable (for machines: webhooks, gateways).
     * For example, a Telegram webhook can be checked against its configured secret header.
     *
     * @throws RuntimeException 500 if the variable is not configured, 403 if the token is wrong.
     */
    public static function requireToken(string $envName, string $header = 'X-Api-Token'): void
    {
        $expected = Env::getOrNull($envName)
            ?? throw new RuntimeException("Token '$envName' is not configured", 500);

        if (!hash_equals($expected, Request::header($header) ?? ''))
            throw new RuntimeException('Forbidden', 403);
    }
    /**
     * For cron jobs: allowed from the command line, or over the web with a token.
     *
     * @throws RuntimeException 500 if the token environment variable is missing on web requests,
     *                           403 if the request header does not match it.
     */
    public static function requireCliOrToken(string $envName, string $header = 'X-Api-Token'): void
    {
        if (PHP_SAPI !== 'cli')
            self::requireToken($envName, $header);
    }

    // private -------------------------------------------------------------------------------------

    private static function getUserTable(): User
    {
        return Database::instance()->table(User::class);
    }

    // Password hash of the admin from the .env, or null if the app has no admin
    private static function getAdminHashword(): ?string
    {
        return Env::getOrNull(self::ENV_ADMIN_HASHWORD);
    }

    // Opens the session for an owner and returns the identity
    private static function start(AuthIdentity $owner, bool $persistent): ?AuthIdentity
    {
        self::startSession();
        session_regenerate_id(true);

        $_SESSION[self::SESSION_KEY] = $owner->toSessionArray();
        $token = $persistent ? self::createPersistentToken($owner) : null;

        if ($token !== null) {
            self::setCookie(
                name: self::getPersistentCookieName(),
                value: $token,
                expiresUnixTime: time() + 86400 * Env::getInt(self::ENV_AUTH_PERSISTENT_LOGIN_DAYS)
            );
        }
        else {
            self::deleteCookie(self::getPersistentCookieName());
        }

        self::$me = self::identify($owner);
        self::$isMeResolved = true;

        if (self::$me === null)
            unset($_SESSION[self::SESSION_KEY]);

        return self::$me;
    }

    // Identity of an owner, or null if it is invalid or no longer exists
    private static function identify(AuthIdentity $owner): ?AuthIdentity
    {
        if ($owner->role === AuthRole::Admin)
            return self::getAdminHashword() !== null ? AuthIdentity::admin() : null;

        // Admin-only apps have no User class: any session pointing to a user is invalid
        if ($owner->id === null || !class_exists(User::class))
            return null;

        // Read every time, so deleting the user takes effect at once
        $user = self::getUserTable()->readById($owner->id);

        if ($user === null)
            return null;

        return AuthIdentity::user($owner->id, $user);
    }

    // Token of an owner, or null if it cannot be made.
    // Format: "<who>.<expires>.<mac>". The MAC covers all fields and the owner's hashword.
    private static function createPersistentToken(AuthIdentity $owner): ?string
    {
        $hashword = self::getOwnerHashword($owner);

        if ($hashword === null)
            return null;

        $expiresAt = time() + 86400 * Env::getInt(self::ENV_AUTH_PERSISTENT_LOGIN_DAYS);
        $who = $owner->toSlug();
        
        $payload = "$who.$expiresAt";
        $mac = hash_hmac(self::TOKEN_HASH_ALGORITHM, "$payload.$hashword", Env::get(self::ENV_AUTH_SECRET));

        return "$payload.$mac";
    }

    // Owner stored in a persistent-login cookie or bearer token, or null if it is absent or invalid.
    private static function verifyPersistentToken(?string $token = null): ?AuthIdentity
    {
        $token ??= $_COOKIE[self::getPersistentCookieName()] ?? null;

        if (!is_string($token))
            return null;

        $parts = explode('.', $token);
        if (count($parts) !== 3 || !ctype_digit($parts[1]))
            return null;

        $expiresAt = filter_var($parts[1], FILTER_VALIDATE_INT);
        if ($expiresAt === false || $expiresAt <= time() || (string)$expiresAt !== $parts[1])
            return null;

        $owner = AuthIdentity::fromSlug($parts[0]);
        if ($owner === null)
            return null;

        $hashword = self::getOwnerHashword($owner);
        if ($hashword === null)
            return null;

        $payload = "$parts[0].$expiresAt";
        $expectedMac = hash_hmac(self::TOKEN_HASH_ALGORITHM, "$payload.$hashword", Env::get(self::ENV_AUTH_SECRET));

        if (!hash_equals($expectedMac, $parts[2]))
            return null;

        return $owner;
    }

    private static function getOwnerHashword(AuthIdentity $owner): ?string
    {
        // Admin-only apps have no User class.
        return match ($owner->role) {
            AuthRole::Admin => self::getAdminHashword(),
            AuthRole::User  => $owner->id !== null && class_exists(User::class)
                ? self::getUserTable()->getHashword($owner->id) : null
        };
    }

    private static function getBearerToken(): ?string
    {
        $authorization = Request::header('Authorization');
        if ($authorization === null || !preg_match('/^Bearer\s+(\S+)$/iD', trim($authorization), $matches))
            return null;

        return $matches[1];
    }

    private static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE)
            return;

        session_name(self::getSessionName());
        ini_set('session.use_strict_mode', '1');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => Request::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }

    private static function getSessionName(): string
    {
        return 'sess'.Env::get(self::ENV_PROJECT_SLUG);
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
            'secure'   => Request::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
    }
    private static function deleteCookie(string $name): void
    {
        self::setCookie($name, '', 1);
    }
}