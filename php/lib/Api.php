<?php

/**
 * Who can use the CRUD or a handler of Api.
 */
enum ApiAccess
{
    /** Anyone, logged in or not. */
    case Public;

    /**
     * Only the rows whose 'user_id' is the logged in user (the admin is not limited).
     * It only accepts or rejects, it never changes what is read or written. Only for the generic CRUD,
     * because it needs to read the rows to check them.
     */
    case Owner;

    /** Only the admin. */
    case Admin;
}

final class Api
{
    /**
     * Sends $data as JSON with the given HTTP status.
     */
    public static function sendJson(mixed $data, int $status = 200): void
    {
        if (!headers_sent()) {
            http_response_code($status);
            header('Content-Type: application/json; charset=utf-8');
            header('Cache-Control: no-store');
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * Serves an entity: its CRUD plus custom actions, chosen by the HTTP method and ?action=.
     *
     * Everything is declared the same way, 'METHOD' or 'METHOD action' => access, so it cannot be forgotten:
     * - 'GET' => ApiAccess::Public                              the CRUD of that method, with that access
     * - 'PUT' => ApiAccess::Owner                               the CRUD, only on the user's own rows
     * - 'GET total' => [ApiAccess::Admin, fn($vars, $dbTable) => ...] a custom action: access + handler
     * - 'POST cancel' => [null, fn($vars, $dbTable) => ...]            null: the handler checks the access itself
     * METHOD must be the value of an HttpMethod case ('GET', 'POST', 'PUT', 'DELETE'), in upper case.
     * What is not declared does not exist: a request with no handler for its method (and action) answers 404.
     *
     * The request picks the key: GET /orders?id=5 is 'GET', GET /orders?action=total is 'GET total'.
     * Only the method and ?action= count, a key can never be reached with another method.
     *
     * Examples:
     *
     *   // Public read only. POST, PUT and DELETE are not declared, so they answer 404
     *   Api::serve($productTable, ['GET' => ApiAccess::Public]);
     *
     *   // The whole CRUD, admin only: nothing is implicit, every method is written
     *   Api::serve($productTable, [
     *       'GET'    => ApiAccess::Admin,
     *       'POST'   => ApiAccess::Admin,
     *       'PUT'    => ApiAccess::Admin,
     *       'DELETE' => ApiAccess::Admin,
     *   ]);
     *
     *   // Each method with its own access: public read, admin writes
     *   Api::serve($productTable, [
     *       'GET'    => ApiAccess::Public,
     *       'POST'   => ApiAccess::Admin,
     *       'PUT'    => ApiAccess::Admin,
     *       'DELETE' => ApiAccess::Admin,
     *   ]);
     *
     *   // Rows with an owner (a 'user_id' column): a user only touches their own, the admin everything.
     *   // GET by id is checked against the row; the list of a user is an action, because an access
     *   // can only accept or reject, it cannot filter
     *   Api::serve($photoTable, [
     *       'GET'    => ApiAccess::Owner,      // ?id=5: only if it is theirs. Without id: 422
     *       'POST'   => ApiAccess::Owner,      // the body must carry their own user_id
     *       'PUT'    => ApiAccess::Owner,
     *       'DELETE' => ApiAccess::Owner,
     *
     *       // GET /photos?action=byUser&user_id=23: that user's photos (the user or the admin)
     *       'GET byUser' => [null, function ($vars, Photo $photoTable) {
     *           $userId = (int)($vars['user_id'] ?? 0);
     *           Auth::requireUser($userId);
     *           return $photoTable->read('user_id = ?', [$userId]);
     *       }],
     *   ]);
     *
     *   // A handler instead of the CRUD of a method: here the list only has the active products.
     *   // The handler gets the served table as its second argument, and it can declare its class (Product $productTable)
     *   Api::serve($productTable, [
     *       'GET' => [ApiAccess::Public, fn($vars, Product $productTable) => $productTable->read('active = 1', order: 'name')],
     *   ]);
     *
     *   // Actions, each with the access that fits
     *   Api::serve($orderTable, [
     *       'GET total' => [ApiAccess::Admin, fn($vars, Order $orderTable) => $orderTable->total()],
     *
     *       // null: the handler decides, here from the row's owner (the admin passes too)
     *       'POST cancel' => [null, function ($vars, Order $orderTable) {
     *           $row = $orderTable->readById((int)($vars['id'] ?? 0)) ?? throw new RuntimeException('Not found', 404);
     *           Auth::requireUser((int)$row['user_id']);
     *           return $orderTable->update($row['id'], ['status' => 'cancelled']);
     *       }],
     *
     *       // For machines: a webhook with a token in a header, a cron job from the command line or with a token
     *       'POST payment' => [null, function ($vars, Order $orderTable) {
     *           Auth::requireToken('PAYMENT_WEBHOOK_SECRET', 'X-Webhook-Secret');
     *           return $orderTable->update((int)$vars['id'], ['status' => 'paid']);
     *       }],
     *       'POST cleanup' => [null, function ($vars, Order $orderTable) {
     *           Auth::requireCliOrToken('CRON_TOKEN');
     *           return $orderTable->deleteOld();
     *       }],
     *   ]);
     *
     *   // The users table has no 'user_id' (its id is the user), so a user's own row is a handler
     *   Api::serve($userTable, [
     *       'GET' => [null, function ($vars, User $userTable) {
     *           $id = (int)($vars['id'] ?? 0);
     *           Auth::requireUser($id);     // that user or the admin
     *           return $userTable->readById($id) ?? throw new RuntimeException('Not found', 404);
     *       }],
     *   ]);
     *
     * @param DbTable|null $dbTable Table served by the CRUD and given to the handlers, or null if there is none
     *        (the handlers then get null, and no rule can be the generic CRUD).
     * @param array<string, ApiAccess|array{0: ApiAccess|null, 1: callable(array<string, mixed>, DbTable|null): mixed}> $handlers
     *        Key is "METHOD" (the CRUD) or "METHOD action". Value is:
     *        - $access alone: runs the generic CRUD after checking the access. Not valid for an action.
     *        - [$access, $handler]: runs $handler after checking the access. The handler receives the request
     *          vars and $dbTable, and returns what is sent as JSON. ApiAccess::Owner is not valid here.
     *        $access is an ApiAccess, or null when the handler checks the access itself (Auth::requireUser()...),
     *        for anything the enum does not cover. null checks nothing, so the handler must.
     * @throws RuntimeException 400 if the body is JSON and is not valid,
     *                          401 or 403 if the access is denied,
     *                          404 if there is no handler for the method (and action) of the request,
     *                          405 if the HTTP method is not one of HttpMethod,
     *                          422 if 'action' is not a string.
     *                          The generic CRUD and the handlers can throw more (see crud()).
     * @throws LogicException   If an action is declared with an access but no handler, a handler
     *                          with ApiAccess::Owner, the CRUD with no $dbTable, or the CRUD with
     *                          ApiAccess::Owner on a table without the 'user_id' columns it needs
     *                          (programming errors).
     */
    public static function serve(?DbTable $dbTable, array $handlers): void
    {
        $method = Request::method();
        $vars = Request::vars();
        $action = ($vars['action'] ?? null) ?: null;

        if ($action !== null && !is_string($action))
            throw new RuntimeException("'action' must be a string", 422);

        $ruleKey = $action === null ? $method->value : "$method->value $action";
        $rule = $handlers[$ruleKey]
            ?? throw new RuntimeException("Cannot serve '$ruleKey': no handler declared for it", 404);

        // return; Access alone: the CRUD with that access
        if (!is_array($rule)) {
            if ($action !== null)
                throw new LogicException("Action '$action' needs a handler: use [access, handler]");

            if ($dbTable === null)
                throw new LogicException("'$ruleKey' is the generic CRUD and needs a DbTable");

            self::sendJson(self::crud($dbTable, $method, $vars, $rule));
            return;
        }

        [$access, $handler] = $rule;

        self::authorize($access);
        self::sendJson($handler($vars, $dbTable));
    }

    // private -------------------------------------------------------------------------------------

    /**
     * Generic CRUD of a table, chosen by the HTTP method and using ?id= to identify the row:
     * GET reads one row (with id) or all of them, POST creates, PUT updates and DELETE deletes (returns null).
     * Returns what has to be sent as JSON; it does not send anything.
     *
     * It checks $access first. Only serve() uses it.
     *
     * With ApiAccess::Owner, a user only gets to their own rows (those whose 'user_id' is theirs).
     * It only accepts or rejects the request, it does not filter or rewrite anything:
     * - GET, PUT and DELETE with id: 403 if the row belongs to somebody else.
     * - POST: 'user_id' is required and has to be theirs (403 if not).
     * - PUT: if 'user_id' is sent, it has to be theirs, so a row cannot be handed over to another user.
     * - GET without id: 422, because it would list everybody's rows. For "my rows" use a handler that
     *   filters by Auth::me()['id'].
     * The table needs 'user_id' in $readableColumns (to check the rows) and, for POST, in $creatableColumns
     * (otherwise it would create rows without owner). If not, it is a LogicException. The admin is not limited.
     *
     * @param HttpMethod           $method Method of the request.
     * @param array<string, mixed> $vars   Vars of the request (query string and body).
     * @param ApiAccess            $access Who can use it.
     * @throws RuntimeException 401 or 403 if the access is denied, 404 if the row does not exist,
     *                          422 if 'id' (or 'user_id' with Owner) is not an integer or is missing where it is required.
     * @throws LogicException   If $access is ApiAccess::Owner and the table lacks the 'user_id' columns it needs.
     */
    private static function crud(DbTable $dbTable, HttpMethod $method, array $vars, ApiAccess $access): mixed
    {
        if ($access === ApiAccess::Owner)
            self::authorizeOwner($dbTable, $method, $vars);
        else
            self::authorize($access);

        $id = self::getId($vars);

        if (in_array($method, [HttpMethod::Put, HttpMethod::Delete]) && $id === null)
            throw new RuntimeException("'id' is required", 422);

        return match ($method) {
            HttpMethod::Get    => $id === null
                ? $dbTable->read()
                : ($dbTable->readById($id) ?? throw new RuntimeException('Not found', 404)),

            HttpMethod::Post   => $dbTable->create($vars),

            HttpMethod::Put    => $dbTable->update($id, $vars)
                ?? throw new RuntimeException('Not found', 404),

            HttpMethod::Delete => $dbTable->delete($id),
        };
    }

    // ApiAccess::Owner: the rows of the request must be the user's own (see crud()).
    // It only accepts or throws, without changing anything.
    private static function authorizeOwner(DbTable $dbTable, HttpMethod $method, array $vars): void
    {
        // Checked for everybody, the admin included, so a bad table fails in the first test
        if (!$dbTable->isReadable('user_id') || ($method === HttpMethod::Post && !$dbTable->isCreatable('user_id')))
            throw new LogicException("Table [$dbTable->tableName] needs 'user_id' in readableColumns (and in creatableColumns for POST) to use ApiAccess::Owner");

        Auth::requireUser();
        $me = Auth::me();

        // The admin is not limited
        if ($me['role'] === AuthRole::Admin)
            return;

        $myId = (int)$me['id'];
        $id = self::getId($vars);

        if ($id !== null && $method !== HttpMethod::Post) { // Get with id, Put and Delete
            $row = $dbTable->readById($id) ?? throw new RuntimeException('Not found', 404);

            if ((int)$row['user_id'] !== $myId)
                throw new RuntimeException('Forbidden', 403);
        }
        else if ($method === HttpMethod::Get)
            throw new RuntimeException("'id' is required", 422); // It would list everybody's rows

        if ($method === HttpMethod::Post || $method === HttpMethod::Put) {
            $sentUserId = self::getId($vars, 'user_id');

            if ($sentUserId === null && $method === HttpMethod::Post)
                throw new RuntimeException("'user_id' is required", 422);

            if ($sentUserId !== null && $sentUserId !== $myId)
                throw new RuntimeException('Forbidden', 403);
        }
    }

    // Checks the access rule. Throws if the request is not allowed. null: the handler checks it.
    private static function authorize(?ApiAccess $access): void
    {
        match ($access) {
            null              => null,
            ApiAccess::Public => null,
            ApiAccess::Owner  => throw new LogicException('ApiAccess::Owner is only valid for the generic CRUD'),
            ApiAccess::Admin  => Auth::requireAdmin(),
        };
    }

    // $key ('id' by default) of the request vars as an integer, or null if it is missing or empty.
    // Throws a 422 RuntimeException if it is present but is not one.
    // It must be an int, or a string of digits with an optional '-' and no '+', spaces or leading zeros
    // ('0' is valid, '-0' is not). Anything else (booleans, floats, arrays...) is rejected.
    private static function getId(array $vars, string $key = 'id'): ?int
    {
        $raw = $vars[$key] ?? null;

        if ($raw === null || $raw === '')
            return null;

        $id = parse_int($raw);
        if ($id === null)
            throw new RuntimeException("'$key' must be an integer", 422);

        return $id;
    }
}