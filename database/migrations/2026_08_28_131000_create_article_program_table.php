<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('article_program')) {
            Schema::create('article_program', function (Blueprint $table) {
                $table->id();
                $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
                $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['article_id', 'program_id']);
            });
        }

        // Migrate existing article program_id into article_program
        $articles = DB::table('articles')->whereNotNull('program_id')->get();
        foreach ($articles as $art) {
            DB::table('article_program')->insertOrIgnore([
                'article_id' => $art->id,
                'program_id' => $art->program_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_program');
    }
};
