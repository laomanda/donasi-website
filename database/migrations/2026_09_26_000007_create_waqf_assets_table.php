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
        Schema::create('waqf_assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code', 50)->unique();
            $table->string('asset_name', 255);
            $table->foreignId('category_id')->constrained('waqf_asset_categories');
            $table->foreignId('wakif_id')->nullable()->constrained('wakifs')->nullOnDelete();
            $table->date('acquisition_date');
            $table->decimal('quantity', 10, 2)->default(1.00);
            $table->unsignedInteger('useful_life_month')->default(0);
            $table->decimal('acquisition_value', 15, 2)->default(0.00);
            $table->decimal('current_value', 15, 2)->default(0.00);
            $table->text('location')->nullable();
            $table->enum('condition', ['excellent', 'good', 'damaged', 'under_maintenance'])->default('good');
            $table->enum('status', ['active', 'disposed', 'transferred'])->default('active');
            $table->timestamps();

            $table->index('asset_code');
            $table->index('category_id');
            $table->index('wakif_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waqf_assets');
    }
};
