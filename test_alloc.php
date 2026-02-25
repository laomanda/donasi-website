<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$alloc = App\Models\Allocation::latest()->first();
echo json_encode($alloc);
