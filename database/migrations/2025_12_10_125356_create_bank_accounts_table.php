<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();

            $table->string('bank_name');      // BCA, BRI, BNI, dll
            $table->string('account_number'); // nomor rekening
            $table->string('account_name');   // nama lembaga / pemilik

            $table->boolean('is_visible_public')->default(true); // tampil di public?
            $table->unsignedInteger('order')->default(0);        // urutan tampilan

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
