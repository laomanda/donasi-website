<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$donations = \App\Models\Donation::latest()->take(5)->get();
foreach($donations as $d) {
    echo $d->id . " | " . $d->midtrans_order_id . " | " . $d->status . " | " . $d->created_at . "\n";
}
