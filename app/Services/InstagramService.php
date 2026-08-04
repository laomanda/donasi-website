<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InstagramService
{
    private const FRESH_CACHE_KEY = 'social.instagram.latest';

    private const STALE_CACHE_KEY = 'social.instagram.stale';

    public function latest(): array
    {
        $fresh = Cache::get(self::FRESH_CACHE_KEY);
        if (is_array($fresh)) {
            return $fresh;
        }

        $token = trim((string) config('services.instagram.access_token'));
        $userId = trim((string) config('services.instagram.user_id'));

        if ($token === '' || $userId === '') {
            return $this->stale();
        }

        try {
            $response = Http::timeout($this->timeout())
                ->get($this->mediaUrl($userId), [
                    'access_token' => $token,
                    'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
                    'limit' => $this->limit(),
                ]);

            if (! $response->successful()) {
                throw new \RuntimeException("Instagram returned HTTP {$response->status()}");
            }

            $items = collect($response->json('data', []))
                ->take($this->limit())
                ->map(fn (array $item) => [
                    'id' => (string) ($item['id'] ?? ''),
                    'type' => strtolower((string) ($item['media_type'] ?? 'image')),
                    'thumbnail_url' => (string) (($item['media_type'] ?? '') === 'VIDEO'
                        ? ($item['thumbnail_url'] ?? $item['media_url'] ?? '')
                        : ($item['media_url'] ?? $item['thumbnail_url'] ?? '')),
                    'caption' => Str::limit(trim((string) ($item['caption'] ?? '')), 160),
                    'post_url' => (string) ($item['permalink'] ?? ''),
                    'published_at' => $item['timestamp'] ?? null,
                ])
                ->filter(fn (array $item) => $item['id'] !== '' && $item['post_url'] !== '')
                ->values()
                ->all();

            return $this->storeSnapshot($items);
        } catch (\Throwable $exception) {
            Log::warning('Instagram feed refresh failed.', ['message' => $exception->getMessage()]);

            return $this->stale();
        }
    }

    private function mediaUrl(string $userId): string
    {
        $baseUrl = rtrim((string) config('services.instagram.base_url', 'https://graph.instagram.com'), '/');
        $version = trim((string) config('services.instagram.api_version'));
        $prefix = $version !== '' ? "/{$version}" : '';

        return "{$baseUrl}{$prefix}/{$userId}/media";
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
