<?php

namespace App\Services;

use App\Models\Setting;

class SocialMediaService
{
    public function __construct(
        private InstagramService $instagram,
        private YouTubeService $youtube,
    ) {}

    public function landingFeed(): array
    {
        $instagramEnabled = $this->enabled('social.instagram_enabled');
        $youtubeEnabled = $this->enabled('social.youtube_enabled');

        return [
            'instagram' => $instagramEnabled ? $this->instagram->latest() : [],
            'youtube' => $youtubeEnabled ? $this->youtube->latest() : [],
            'meta' => [
                'instagram_enabled' => $instagramEnabled,
                'youtube_enabled' => $youtubeEnabled,
            ],
        ];
    }

    private function enabled(string $key): bool
    {
        return filter_var(Setting::getValue($key, '0'), FILTER_VALIDATE_BOOL);
    }
}
