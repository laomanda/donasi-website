<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| cPanel primary-domain entry point
|--------------------------------------------------------------------------
|
| Use this file only when cPanel forces the domain document root to
| /home/u1121903/public_html. Keep the Laravel project outside public_html,
| for example at /home/u1121903/dpf, then replace public_html/index.php with
| this file's contents.
|
*/

$appPath = dirname(__DIR__).'/dpf';

if (file_exists($maintenance = $appPath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $appPath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $appPath.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
