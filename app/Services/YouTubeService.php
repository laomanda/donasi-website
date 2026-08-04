<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YouTubeService
{
    private const FRESH_CACHE_KEY = 'social.youtube.latest';

    private const STALE_CACHE_KEY = 'social.youtube.stale';

    public function latest(): array
    {
        $fresh = Cache::get(self::FRESH_CACHE_KEY);
        if (is_array($fresh)) {
            return $fresh;
        }

        $apiKey = trim((string) config('services.youtube.api_key'));
        $channelId = trim((string) config('services.youtube.channel_id'));

        if ($apiKey === '' || $channelId === '') {
            return $this->stale();
        }

        try {
            $baseUrl = rtrim((string) config('services.youtube.base_url', 'https://www.googleapis.com/youtube/v3'), '/');
            $response = Http::timeout($this->timeout())->get("{$baseUrl}/search", [
                'part' => 'snippet',
                'channelId' => $channelId,
                'maxResults' => $this->limit(),
                'order' => 'date',
                'type' => 'video',
                'key' => $apiKey,
            ]);

            if (! $response->successful()) {
                throw new \RuntimeException("YouTube returned HTTP {$response->status()}");
            }

            $items = collect($response->json('items', []))
                ->take($this->limit())
                ->map(function (array $item) {
                    $videoId = (string) data_get($item, 'id.videoId', '');

                    return [
                        'id' => $videoId,
                        'thumbnail_url' => (string) (data_get($item, 'snippet.thumbnails.high.url')
                            ?: data_get($item, 'snippet.thumbnails.medium.url')
                            ?: data_get($item, 'snippet.thumbnails.default.url', '')),
                        'title' => html_entity_decode((string) data_get($item, 'snippet.title', ''), ENT_QUOTES | ENT_HTML5),
                        'video_url' => $videoId !== '' ? "https://www.youtube.com/watch?v={$videoId}" : '',
                        'published_at' => data_get($item, 'snippet.publishedAt'),
                    ];
                })
                ->filter(fn (array $item) => $item['id'] !== '' && $item['video_url'] !== '')
                ->values()
                ->all();

            return $this->storeSnapshot($items);
        } catch (\Throwable $exception) {
            Log::warning('YouTube feed refresh failed.', ['message' => $exception->getMessage()]);

            return $this->stale();
        }
    }

    private function storeSnapshot(array $items): array
    {
        Cache::put(self::FRESH_CACHE_KEY, $items, now()->addSeconds($this->cacheTtl()));
        Cache::put(self::STALE_CACHE_KEY, $items, now()->addSeconds($this->staleTtl()));

        return $items;
    }

    private function stale(): array
    {
        $items = Cache::get(self::STALE_CACHE_KEY, []);

        return is_array($items) ? $items : [];
    }

    private function timeout(): int
    {
        return max(1, (int) config('services.social_media.timeout', 5));
    }

    private function limit(): int
    {
        return min(12, max(1, (int) config('services.social_media.limit', 6)));
    }

    private function cacheTtl(): int
    {
        return max(60, (int) config('services.social_media.cache_ttl', 600));
    }

    private function staleTtl(): int
    {
        return max($this->cacheTtl(), (int) config('services.social_media.stale_ttl', 86400));
    }
}
