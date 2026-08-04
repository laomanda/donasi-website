<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SocialMediaSettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::firstOrCreate(['key' => 'social.instagram_enabled'], ['value' => '0']);
        Setting::firstOrCreate(['key' => 'social.youtube_enabled'], ['value' => '0']);
    }
}
