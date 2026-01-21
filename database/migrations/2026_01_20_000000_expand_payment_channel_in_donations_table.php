<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('donations')) {
            return;
        }

        DB::statement('ALTER TABLE donations MODIFY payment_channel VARCHAR(255) NULL');
    }

    public function down(): void
    {
        if (! Schema::hasTable('donations')) {
            return;
        }

        DB::statement('ALTER TABLE donations MODIFY payment_channel VARCHAR(50) NULL');
    }
};
