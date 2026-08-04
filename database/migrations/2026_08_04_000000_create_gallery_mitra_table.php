<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_mitra', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->string('caption_id', 255);
            $table->string('caption_en', 255);
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_mitra');
    }
};
