<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn([
                'title_en',
                'category_en',
                'short_description_en',
                'description_en',
                'benefits_en',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->string('title_en')->nullable()->after('title');
            $table->string('category_en', 50)->nullable()->after('category');
            $table->text('short_description_en')->nullable()->after('short_description');
            $table->longText('description_en')->nullable()->after('description');
            $table->text('benefits_en')->nullable()->after('benefits');
        });
    }
};
