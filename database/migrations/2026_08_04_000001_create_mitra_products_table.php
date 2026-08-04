<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mitra_products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('nama_mitra')->nullable();
            $table->string('title_id');
            $table->string('title_en');
            $table->text('description_id');
            $table->text('description_en');
            $table->string('whatsapp_number', 16);
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mitra_products');
    }
};
