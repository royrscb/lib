<?php

require_once __DIR__.'/La.php';
require_once __DIR__.'/Database.php';

const ADMIN = 'ADMIN';
const SESSION_NAME = 'session_'.PROJECT_NAME;
const REMEMBERME_COOKIE_NAME = 'rmmbrm_'.PROJECT_NAME;
const ADMIN_SECRET = 'Bua chiavi aixo asobre es react axi que us cageu jejjeecrete que es aixo jajlsolllxddd';

function make_cookie(){
    return hash_hmac('sha256', ADMIN, ADMIN_SECRET);
}

function create_session($setRemembermeCookie){
    if(session_status() == PHP_SESSION_NONE) session_start();
    $_SESSION[SESSION_NAME] = ADMIN;

    if($setRemembermeCookie) {
        $lifespanSeconds = time()+(86400*100); // 100 dies
        $ok = setcookie(REMEMBERME_COOKIE_NAME, make_cookie(), $lifespanSeconds, '/');
    }
}

function iam_admin($info, $throwExceptionOnFalse = true){
    // session check
    if(session_status() == PHP_SESSION_NONE) session_start();
    if(($_SESSION[SESSION_NAME] ?? false) == ADMIN) return true;

    // cookie check
    if(($_COOKIE[REMEMBERME_COOKIE_NAME] ?? false) == make_cookie()){
        create_session(true);
        return true;
    }

    if($throwExceptionOnFalse) throwException(403, '<b>Forbidden ADMIN: </b> '.$info);
    else return false;
}
