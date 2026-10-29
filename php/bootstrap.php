<?php
// The only file that scripts in api/ and gateway/ include.
// Code is executed on load only here; every other file just defines classes and functions.

declare(strict_types=1);

define('APP_ROOT', __DIR__);

require_once APP_ROOT.'/lib/Errors.php';
Errors::register();

require_once APP_ROOT.'/lib/Env.php';
Env::load(APP_ROOT.'/.env');

require_once APP_ROOT.'/lib/helpers.php';

date_default_timezone_set('UTC');

spl_autoload_register(function (string $class): void {
    // Folders with classes, relative to APP_ROOT
    static $dirs = [
        'lib',
        'db_tables'
    ];

    // Classes, enums and exceptions that live inside the file of another class
    static $inFileOf = [
        // lib ---
        'AuthRole'             => 'Auth',
        'AppEnv'               => 'Env',
        'ApiAccess'            => 'Api',
        'DbTableException'     => 'DbTable',
        'TelegramBotTokenEnv'  => 'Telegram',
        'TelegramChatIdEnv'    => 'Telegram',
        'TelegramMessage'      => 'Telegram',
        'TelegramBot'          => 'Telegram',
        // db_tables ---
        'MiscDataType'         => 'MiscData',
        'MiscDataException'    => 'MiscData',
    ];

    // Only plain names, so a class name can never point to another folder
    if (!preg_match('/^\w+$/', $class))
        return;

    $classFile = $inFileOf[$class] ?? $class;

    foreach ($dirs as $dir) {
        if (is_file(APP_ROOT."/$dir/$classFile.php")) {
            require_once APP_ROOT."/$dir/$classFile.php";
            return;
        }
    }
});