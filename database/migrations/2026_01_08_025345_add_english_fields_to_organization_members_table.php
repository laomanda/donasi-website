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
            $table->string('name_en')->nullable()->after('name');
            $table->string('position_title_en')->nullable()->after('position_title');
            $table->string('group_en', 50)->nullable()->after('group');
            $table->string('short_bio_en', 255)->nullable()->after('short_bio');
            $table->text('long_bio_en')->nullable()->after('long_bio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropColumn([
                'name_en',
                'position_title_en',
                'group_en',
                'short_bio_en',
                'long_bio_en',
            ]);
        });
    }
};
