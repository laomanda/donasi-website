<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Route::post('/test-midtrans-payload', [\App\Http\Controllers\Api\Frontend\DonationController::class, 'store']);
$request = Request::create('/api/v1/test', 'POST', [
    'donor_name' => 'Test Expiry',
    'donor_phone' => '08123456789',
    'amount' => 50000,
    'is_anonymous' => false
]);

$controller = app(\App\Http\Controllers\Api\Frontend\DonationController::class);
$response = $controller->store($request);
echo $response->getContent();
