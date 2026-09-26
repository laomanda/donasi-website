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
        Schema::create('asset_depreciations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('waqf_assets')->cascadeOnDelete();
            $table->foreignId('period_id')->constrained('accounting_periods');
            $table->decimal('depreciation_expense', 15, 2)->default(0.00);
            $table->decimal('accumulated_depreciation', 15, 2)->default(0.00);
            $table->decimal('book_value', 15, 2)->default(0.00);
            $table->timestamps();

            $table->index(['asset_id', 'period_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_depreciations');
    }
};
