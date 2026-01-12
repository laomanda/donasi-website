<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // nama program
            $table->string('slug')->unique(); // untuk URL unik /program/{slug}

            // kategori program, fleksibel pakai string
            $table->string('category', 50)->nullable();

            $table->text('short_description');        // ringkasan singkat
            $table->longText('description')->nullable(); // penjelasan lengkap
            $table->text('benefits')->nullable();     // manfaat program (boleh multi-baris)

            $table->decimal('target_amount', 15, 2)->nullable(); // target donasi
            $table->decimal('collected_amount', 15, 2)->default(0); // total donasi paid

            $table->string('thumbnail_path')->nullable(); // gambar card
            $table->string('banner_path')->nullable();    // gambar hero/detail

            $table->boolean('is_highlight')->default(false); // program unggulan?

            // status: draft, active, completed, archived
            $table->string('status', 20)->default('draft');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
