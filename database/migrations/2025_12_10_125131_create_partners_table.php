<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partners', function (Blueprint $table) {
            $table->id();

            $table->string('name');               // nama mitra
            $table->string('logo_path')->nullable(); // path logo
            $table->string('url')->nullable();    // website/sosmed

            $table->text('description')->nullable(); // deskripsi singkat

            $table->unsignedInteger('order')->default(0); // urutan tampilan
            $table->boolean('is_active')->default(true);  // tampil di public?

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
