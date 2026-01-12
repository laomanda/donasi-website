<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_requests', function (Blueprint $table) {
            $table->id();

            $table->string('donor_name');               // nama muzakki
            $table->string('donor_phone', 30);          // WA/telepon

            $table->text('address_full');               // alamat lengkap
            $table->string('city', 100)->nullable();    // kota (opsional)
            $table->string('district', 100)->nullable(); // kecamatan/kelurahan (opsional)

            $table->string('zakat_type', 50);           // fitrah, mal, profesi, dll
            $table->string('estimation')->nullable();   // estimasi nominal/berat (teks bebas)

            $table->string('preferred_time')->nullable(); // jadwal penjemputan yang diinginkan

            // status: baru, dijadwalkan, selesai, dibatalkan
            $table->string('status', 20)->default('baru')->index();

            $table->string('assigned_officer')->nullable(); // nama petugas (teks bebas)
            $table->text('notes')->nullable();              // catatan admin

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_requests');
    }
};
