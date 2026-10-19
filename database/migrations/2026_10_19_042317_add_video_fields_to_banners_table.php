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
        Schema::table('banners', function (Blueprint $table) {
            $table->string('media_type', 20)->default('image')->after('id');
            $table->string('image_path')->nullable()->change();
            $table->string('video_path')->nullable()->after('image_path');
            $table->unsignedSmallInteger('video_duration')->nullable()->after('video_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['media_type', 'video_path', 'video_duration']);
            $table->string('image_path')->nullable(false)->change();
        });
    }
};
