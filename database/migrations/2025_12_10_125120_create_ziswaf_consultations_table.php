<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ziswaf_consultations', function (Blueprint $table) {
            $table->id();

            $table->string('name');                 // nama penanya
            $table->string('phone', 30)->nullable(); // WA (direkomendasikan)
            $table->string('email')->nullable();

            $table->string('topic', 100);          // zakat profesi, dll
            $table->text('message');               // pertanyaan lengkap

            // status: baru, dibalas, ditutup
            $table->string('status', 20)->default('baru')->index();

            $table->text('admin_notes')->nullable(); // ringkasan jawaban

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ziswaf_consultations');
    }
};
