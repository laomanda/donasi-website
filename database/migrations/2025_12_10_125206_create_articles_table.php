<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('slug')->unique();

            $table->string('category', 50)->nullable(); // berita, literasi, edukasi, dll

            $table->string('thumbnail_path')->nullable(); // gambar sampul
            $table->text('excerpt')->nullable();         // ringkasan

            $table->longText('body');                    // isi artikel (HTML)

            $table->string('author_name')->nullable();   // nama penulis

            $table->timestamp('published_at')->nullable();
            // status: draft / published
            $table->string('status', 20)->default('draft')->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
