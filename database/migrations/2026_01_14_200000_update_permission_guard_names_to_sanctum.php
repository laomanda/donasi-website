<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')
            ->where('guard_name', '!=', 'sanctum')
            ->update(['guard_name' => 'sanctum']);

        DB::table('permissions')
            ->where('guard_name', '!=', 'sanctum')
            ->update(['guard_name' => 'sanctum']);
    }

    public function down(): void
    {
        DB::table('roles')
            ->where('guard_name', 'sanctum')
            ->update(['guard_name' => 'web']);

        DB::table('permissions')
            ->where('guard_name', 'sanctum')
            ->update(['guard_name' => 'web']);
    }
};
