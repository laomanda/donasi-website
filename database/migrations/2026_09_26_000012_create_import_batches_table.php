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
        Schema::create('import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 255);
            $table->string('module', 50);
            $table->enum('status', ['processing', 'completed', 'failed'])->default('processing');
            $table->foreignId('imported_by')->constrained('users');
            $table->timestamps();

            $table->index(['module', 'status']);
            $table->index('imported_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_batches');
    }
};
