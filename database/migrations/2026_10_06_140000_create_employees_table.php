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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code', 50)->unique();
            $table->string('slug', 120)->unique();
            $table->string('name', 150);
            $table->string('position', 150);
            $table->string('division', 150)->nullable();
            $table->string('id_card_image');
            $table->string('employment_status', 20)->default('active')->index();
            $table->unsignedInteger('display_order')->nullable()->unique();
            $table->boolean('is_published')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index([
                'is_published',
                'employment_status',
                'display_order',
            ], 'employees_public_directory_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
