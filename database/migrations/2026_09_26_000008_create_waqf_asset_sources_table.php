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
        Schema::create('waqf_asset_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('waqf_assets')->cascadeOnDelete();
            $table->string('source_type', 50); // e.g. wakif, hasil_pengelolaan
            $table->decimal('amount', 15, 2)->default(0.00);
            $table->string('description', 255)->nullable();
            $table->timestamps();

            $table->index('asset_id');
            $table->index('source_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waqf_asset_sources');
    }
};
