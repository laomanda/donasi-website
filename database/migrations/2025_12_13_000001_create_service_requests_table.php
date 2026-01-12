<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('phone', 30);
            $table->string('city', 100)->nullable();

            // jenis layanan: jemput, konfirmasi, konsultasi
            $table->string('service_type', 30);

            $table->text('notes')->nullable();

            // status: baru, diproses, selesai, dibatalkan
            $table->string('status', 20)->default('baru');
            $table->string('handled_by')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('service_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
