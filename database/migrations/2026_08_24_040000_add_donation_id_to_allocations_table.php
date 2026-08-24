<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('allocations', function (Blueprint $table) {
            if (!Schema::hasColumn('allocations', 'donation_id')) {
                $table->foreignId('donation_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('donations')
                    ->nullOnDelete();
            }

            // Make user_id nullable if it's not already
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('allocations', function (Blueprint $table) {
            if (Schema::hasColumn('allocations', 'donation_id')) {
                $table->dropForeign(['donation_id']);
                $table->dropColumn('donation_id');
            }

            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};
