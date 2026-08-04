<?php

namespace Tests\Unit;

use App\Services\InstagramService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class InstagramServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('social.instagram.latest');
        Cache::forget('social.instagram.stale');
        config()->set('services.instagram', [
            'base_url' => 'https://graph.instagram.test',
            'api_version' => 'v1',
            'user_id' => 'ig-user',
            'access_token' => 'backend-secret',
        ]);
        config()->set('services.social_media', ['timeout' => 5, 'limit' => 6, 'cache_ttl' => 600, 'stale_ttl' => 86400]);
    }

    public function test_it_normalizes_instagram_posts(): void
    {
        Http::fake(['*' => Http::response(['data' => [[
            'id' => 'post-1',
            'media_type' => 'VIDEO',
            'media_url' => 'https://cdn.test/video.mp4',
            'thumbnail_url' => 'https://cdn.test/thumb.jpg',
            'caption' => 'Aktivitas terbaru DPF',
            'permalink' => 'https://instagram.test/p/post-1',
            'timestamp' => '2026-08-04T10:00:00+0000',
        ]]], 200)]);

        $items = app(InstagramService::class)->latest();

        $this->assertSame('post-1', $items[0]['id']);
        $this->assertSame('https://cdn.test/thumb.jpg', $items[0]['thumbnail_url']);
        $this->assertArrayNotHasKey('access_token', $items[0]);
    }

    public function test_it_returns_stale_instagram_cache_on_failure(): void
    {
        Cache::put('social.instagram.stale', [['id' => 'stale-post']], 600);
        Http::fake(['*' => Http::response([], 500)]);

        $this->assertSame([['id' => 'stale-post']], app(InstagramService::class)->latest());
    }
}
