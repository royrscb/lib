<?php

// The only file that scripts in api/ and gateway/ include.
// Code is executed on load only here; every other file just defines classes and functions.

define('APP_ROOT', __DIR__);

// 1. Error handling first, so that a failure while loading the .env is handled too
require_once APP_ROOT.'/lib/Env.php';
require_once APP_ROOT.'/lib/Errors.php';
Errors::register();

// 2. Configuration
Env::load(APP_ROOT.'/.env');
define('PROJECT_NAME', Env::getOrNull('PROJECT_NAME'));
define('PROJECT_SLUG', Env::get('PROJECT_SLUG'));
date_default_timezone_set('UTC');

// 3. Plain functions (classes are autoloaded, see below)
require_once APP_ROOT.'/lib/helpers.php';

// 4. Autoload: looks for Class.php in lib/ and in db_tables/
spl_autoload_register(function (string $class): void {
    // Classes, enums and exceptions that live inside the file of another class
    static $inFileOf = [
        'AuthRole'             => 'Auth',
        'AuthOwner'            => 'Auth',
        'HttpMethod'           => 'Request',
        'ApiAccess'            => 'Api',
        'DbTableException'     => 'DbTable',
        'MiscDataType'         => 'MiscData',
        'TelegramBotToken'     => 'Telegram',
        'TelegramChat'         => 'Telegram',
        'TelegramMessage'      => 'Telegram',
        'TelegramBot'          => 'Telegram',
        'StripeCustomers'      => 'Stripe',
        'StripePaymentIntents' => 'Stripe',
    ];

    if (!preg_match('/^\w+$/', $class))
        return;

    $file = $inFileOf[$class] ?? $class;

    foreach ([APP_ROOT.'/lib', APP_ROOT.'/db_tables'] as $dir) {
        if (is_file("$dir/$file.php")) {
            require_once "$dir/$file.php";
            return;
        }
    }
});