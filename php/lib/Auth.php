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
    private const string ENV_PERSISTENT_LOGIN_DAYS = 'AUTH_PERSISTENT_LOGIN_DAYS';
    // ---

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
     * Closes the session and forgets this device's persistent login cookie.
     */
    public static function logout(): void
    {
        $sessionCookie = self::getSessionName();
        if (session_status() === PHP_SESSION_ACTIVE || is_string($_COOKIE[$sessionCookie] ?? null)) {
            self::startSession();

            $_SESSION = [];
            session_destroy();
        }

        // Tokens are signed, not stored: forgetting this device is just deleting its cookie
        self::deleteCookie(self::getPersistentCookieName());
        self::deleteCookie($sessionCookie);

        self::$me = null;
        self::$isMeResolved = true;
    }

    /**
     * Regenerates the current user's session after a password change.
     */
    public static function passwordChanged(int $id): void
    {
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
                    time() + 86400 * Env::getInt(self::ENV_PERSISTENT_LOGIN_DAYS)
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

        $sessionCookie = $_COOKIE[self::getSessionName()] ?? null;
        if (session_status() !== PHP_SESSION_ACTIVE && !is_string($sessionCookie)) {
            $owner = self::readPersistentToken();

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
                $owner = self::readPersistentToken();

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
        self::$isMeResolved = false;

        $token = $persistent ? self::createPersistentToken($owner) : null;

        if ($token !== null)
            self::setCookie(
                self::getPersistentCookieName(),
                $token,
                time() + 86400 * Env::getInt(self::ENV_PERSISTENT_LOGIN_DAYS)
            );
        else
            self::deleteCookie(self::getPersistentCookieName());

        return self::me();
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
    // Persistent login with no extra table: the cookie is a signed token (HMAC) and nothing is stored.
    // Format: "<who>.<mac>", where <who> is "admin" or "user-<id>".
    // The mac covers who + the hashword of the owner and is keyed with AUTH_SECRET. So:
    // - Logging in again renews the cookie for the configured number of days (the token itself does not expire).
    // - Changing the password of the owner invalidates their cookies.
    // - Leaking the database alone is not enough to forge cookies: AUTH_SECRET is not in it.
    // A token cannot be revoked per device: logout only deletes the cookie of this device.
    private static function createPersistentToken(AuthIdentity $owner): ?string
    {
        // Hashword of the owner, which ties the token to the password. Admin-only apps have no User class
        $hashword = match ($owner->role) {
            AuthRole::Admin => self::getAdminHashword(),
            AuthRole::User  => $owner->id !== null && class_exists(User::class)
                ? self::getUserTable()->getHashword($owner->id) : null,
        };

        if ($hashword === null)
            return null;

        $secret = Env::get(self::ENV_AUTH_SECRET);
        $who = $owner->toSlug();

        return "$who.".hash_hmac('sha256', "$who.$hashword", $secret);
    }
    // Owner stored in the persistent login cookie of this request, or null if there is none or it is not valid
    private static function readPersistentToken(): ?AuthIdentity
    {
        $token = $_COOKIE[self::getPersistentCookieName()] ?? null;

        if (!is_string($token))
            return null;

        $owner = AuthIdentity::fromSlug(explode('.', $token)[0]);

        if ($owner === null)
            return null;

        $expected = self::createPersistentToken($owner);

        return $expected !== null && hash_equals($expected, $token) ? $owner : null;
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