<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_members', function (Blueprint $table) {
            $table->id();

            $table->string('name');               // nama anggota
            $table->string('slug')->nullable();   // slug unik (opsional)

            $table->string('position_title');     // jabatan (Direktur, Ketua, Staff, dll)

            // grup: pembina, pengawas, pengurus, staff, relawan, lainnya
            $table->string('group', 50)->nullable();

            $table->string('photo_path')->nullable(); // foto

            $table->string('short_bio', 255)->nullable(); // bio singkat
            $table->text('long_bio')->nullable();         // bio lengkap

            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();

            $table->boolean('show_contact')->default(false); // tampilkan kontak di public?

            $table->unsignedInteger('order')->default(0); // urutan dalam grup
            $table->boolean('is_active')->default(true);  // tampil di public?

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_members');
    }
};
