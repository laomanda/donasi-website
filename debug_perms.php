<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check permissions
echo "=== ALL PERMISSIONS ===" . PHP_EOL;
$perms = DB::table('permissions')->get(['id', 'name', 'guard_name']);
foreach ($perms as $p) {
    echo $p->id . " | " . $p->name . " | " . $p->guard_name . PHP_EOL;
}
echo PHP_EOL;

// Check what error a specific permission would fail
$testName = 'manage articles';
$exists = DB::table('permissions')->where('name', $testName)->exists();
echo "'" . $testName . "' exists in DB: " . ($exists ? 'YES' : 'NO') . PHP_EOL;
