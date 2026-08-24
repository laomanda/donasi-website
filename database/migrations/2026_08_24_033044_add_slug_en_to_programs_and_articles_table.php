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
        Schema::table('programs', function (Blueprint $table) {
            $table->string('slug_en')->nullable()->after('slug')->index();
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->string('slug_en')->nullable()->after('slug')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('slug_en');
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn('slug_en');
        });
    }
};
