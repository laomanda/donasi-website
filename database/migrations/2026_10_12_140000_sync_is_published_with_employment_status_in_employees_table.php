<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('employees')
            ->where('employment_status', 'active')
            ->update(['is_published' => true]);

        DB::table('employees')
            ->where('employment_status', '!=', 'active')
            ->update(['is_published' => false]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed
    }
};
