<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Arrays of categories based on categoryTranslations.ts
        $programCategories = [
            ['id' => 'Pendidikan', 'en' => 'Education'],
            ['id' => 'Kesehatan', 'en' => 'Health'],
            ['id' => 'Sosial', 'en' => 'Social'],
            ['id' => 'Dakwah', 'en' => 'Dakwah'],
            ['id' => 'Ekonomi', 'en' => 'Economy'],
            ['id' => 'Lingkungan', 'en' => 'Environment'],
            ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
            ['id' => 'Wakaf', 'en' => 'Waqf'],
            ['id' => 'Zakat', 'en' => 'Zakat'],
            ['id' => 'Infrastruktur', 'en' => 'Infrastructure'],
        ];

        $articleCategories = [
            ['id' => 'Berita', 'en' => 'News'],
            ['id' => 'Artikel', 'en' => 'Article'],
            ['id' => 'Kegiatan', 'en' => 'Activity'],
            ['id' => 'Edukasi', 'en' => 'Education'],
            ['id' => 'Inspirasi', 'en' => 'Inspiration'],
            ['id' => 'Laporan', 'en' => 'Report'],
            ['id' => 'Opini', 'en' => 'Opinion'],
            ['id' => 'Tips', 'en' => 'Tips'],
            ['id' => 'Tokoh', 'en' => 'Figure'],
            ['id' => 'Sejarah', 'en' => 'History'],
        ];

        $faker = \Faker\Factory::create('id_ID');

        // --- SEED PROGRAMS (30 items) ---
        $this->command->info('Seeding 30 Programs...');
        for ($i = 0; $i < 30; $i++) {
            $cat = $faker->randomElement($programCategories);
            $title = $faker->sentence(4);
            $titleEn = 'EN: ' . $title; // Simple distinct title for EN

            // Mixed Stasuses
            $status = $faker->randomElement(['active', 'active', 'active', 'completed', 'draft']); 
            
            DB::table('programs')->insert([
                'title' => $title,
                'title_en' => $titleEn,
                'slug' => Str::slug($title) . '-' . Str::random(5),
                'category' => $cat['id'],
                'category_en' => $cat['en'],
                'short_description' => $faker->paragraph(2),
                'short_description_en' => 'EN: ' . $faker->paragraph(2),
                'description' => $faker->paragraphs(3, true),
                'description_en' => 'EN: ' . $faker->paragraphs(3, true),
                'benefits' => "- Bantuan langsung\n- Pahala jariyah\n- Pemberdayaan",
                'benefits_en' => "- Direct aid\n- Perpetual reward\n- Empowerment",
                'target_amount' => $faker->numberBetween(10000000, 500000000),
                'collected_amount' => $faker->numberBetween(0, 50000000),
                'thumbnail_path' => null, // Will use placeholder
                'banner_path' => null,
                'is_highlight' => $faker->boolean(20), // 20% likely
                'status' => $status,
                'deadline_days' => $faker->randomElement([30, 60, 90, null]),
                'published_at' => ($status === 'draft') ? null : Carbon::now()->subDays(rand(0, 60)),
                'created_at' => Carbon::now()->subDays(rand(0, 60)),
                'updated_at' => Carbon::now(),
            ]);
        }

        // --- SEED ARTICLES (50 items) ---
        $this->command->info('Seeding 50 Articles...');
        for ($i = 0; $i < 50; $i++) {
            $cat = $faker->randomElement($articleCategories);
            $title = $faker->sentence(6);
            $titleEn = 'EN: ' . $title;

            $status = $faker->randomElement(['published', 'published', 'published', 'draft']);

            DB::table('articles')->insert([
                'title' => $title,
                'title_en' => $titleEn,
                'slug' => Str::slug($title) . '-' . Str::random(5),
                'category' => $cat['id'],
                'category_en' => $cat['en'],
                'excerpt' => $faker->paragraph(1),
                'excerpt_en' => 'EN: ' . $faker->paragraph(1),
                'body' => '<p>' . implode('</p><p>', $faker->paragraphs(5)) . '</p>',
                'body_en' => '<p>EN: ' . implode('</p><p>', $faker->paragraphs(5)) . '</p>',
                'thumbnail_path' => null,
                'author_name' => $faker->name,
                'status' => $status,
                'published_at' => ($status === 'draft') ? null : Carbon::now()->subDays(rand(0, 100)),
                'created_at' => Carbon::now()->subDays(rand(0, 100)),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
