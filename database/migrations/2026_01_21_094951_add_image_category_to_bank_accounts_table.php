<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('account_name');
            $table->string('category')->default('bank_transfer')->after('image_path'); // bank_transfer, ewallet, qr
            $table->string('type')->default('text')->after('category'); // text, image_only
            // Make existing fields nullable
            $table->string('account_number')->nullable()->change();
            $table->string('account_name')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            //
        });
    }
};
