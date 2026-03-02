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
        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropColumn([
                'name_en',
                'short_bio',
                'short_bio_en',
                'long_bio',
                'long_bio_en',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_members', function (Blueprint $table) {
            $table->string('name_en')->nullable()->after('name');
            $table->string('short_bio', 255)->nullable()->after('photo_path');
            $table->string('short_bio_en', 255)->nullable()->after('short_bio');
            $table->text('long_bio')->nullable()->after('short_bio_en');
            $table->text('long_bio_en')->nullable()->after('long_bio');
        });
    }
};
