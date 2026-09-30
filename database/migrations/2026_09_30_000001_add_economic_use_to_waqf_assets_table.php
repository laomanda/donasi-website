<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Additive classification schema for waqf assets (RoWA foundation).
     * Existing rows remain explicitly null (unclassified).
     */
    public function up(): void
    {
        Schema::table('waqf_assets', function (Blueprint $table) {
            $table->string('economic_use', 20)->nullable()->after('status')->index();
            $table->decimal('productive_percentage', 5, 2)->nullable()->after('economic_use');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waqf_assets', function (Blueprint $table) {
            $table->dropIndex(['economic_use']);
            $table->dropColumn(['economic_use', 'productive_percentage']);
        });
    }
};
