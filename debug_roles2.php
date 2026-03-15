<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check all roles with their guard
$roles = DB::table('roles')->get(['id', 'name', 'guard_name']);
echo "=== ALL ROLES ===" . PHP_EOL;
foreach ($roles as $role) {
    echo $role->id . " | " . $role->name . " | " . $role->guard_name . PHP_EOL;
}
echo PHP_EOL;

// Check all permissions with their guard
echo "=== PERMISSION GUARDS ===" . PHP_EOL;
$perms = DB::table('permissions')->groupBy('guard_name')->select('guard_name', DB::raw('count(*) as total'))->get();
foreach ($perms as $p) {
    echo $p->guard_name . " => " . $p->total . " permissions" . PHP_EOL;
}
echo PHP_EOL;

// Simulate the unique check - what would fail
$testName = 'malica'; // Try expected name
$existing = DB::table('roles')->where('name', $testName)->where('guard_name', 'sanctum')->first();
echo "Does '$testName' with sanctum guard exist? " . ($existing ? "YES (id: " . $existing->id . ")" : "NO") . PHP_EOL;

// Try raw without guard_name scope
$existingRaw = DB::table('roles')->where('name', $testName)->first();
echo "Does '$testName' (any guard) exist? " . ($existingRaw ? "YES" : "NO") . PHP_EOL;
