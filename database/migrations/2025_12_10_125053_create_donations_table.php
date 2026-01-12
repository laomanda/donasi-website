<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();

            // program_id bisa null kalau donasi umum
            $table->foreignId('program_id')
                ->nullable()
                ->constrained('programs')
                ->nullOnDelete();

            $table->string('donation_code', 50)->unique(); // DPF-2025-0001

            // data donatur (boleh sebagian null)
            $table->string('donor_name')->nullable();
            $table->string('donor_email')->nullable();
            $table->string('donor_phone', 30)->nullable();

            $table->decimal('amount', 15, 2); // nominal donasi

            $table->boolean('is_anonymous')->default(false); // sembunyikan nama di public?

            // sumber & detail pembayaran
            $table->string('payment_source', 20); // midtrans / manual
            $table->string('payment_method', 50)->nullable(); // bank_transfer, qris, gopay, cash, dll
            $table->string('payment_channel', 50)->nullable(); // bca, bri, qris, dll

            // status: pending, paid, failed, expired, cancelled
            $table->string('status', 20)->default('pending')->index();

            // info dari Midtrans (boleh null untuk manual)
            $table->string('midtrans_order_id', 100)->nullable()->index();
            $table->string('midtrans_transaction_id', 100)->nullable();
            $table->json('midtrans_va_numbers')->nullable();
            $table->json('midtrans_raw_response')->nullable();

            // bukti transfer manual
            $table->string('manual_proof_path')->nullable();

            $table->timestamp('paid_at')->nullable(); // waktu donasi dinyatakan paid

            $table->text('notes')->nullable(); // catatan internal admin

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
