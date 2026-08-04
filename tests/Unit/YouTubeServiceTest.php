<?php

namespace Tests\Unit;

use App\Services\YouTubeService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class YouTubeServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('social.youtube.latest');
        Cache::forget('social.youtube.stale');
        config()->set('services.youtube', [
            'base_url' => 'https://youtube.test/v3',
            'api_key' => 'backend-secret',
            'channel_id' => 'channel-1',
        ]);
        config()->set('services.social_media', ['timeout' => 5, 'limit' => 6, 'cache_ttl' => 600, 'stale_ttl' => 86400]);
    }

    public function test_it_normalizes_youtube_videos(): void
    {
        Http::fake(['*' => Http::response(['items' => [[
            'id' => ['videoId' => 'video-1'],
            'snippet' => [
                'title' => 'Video &amp; DPF',
                'publishedAt' => '2026-08-04T10:00:00Z',
                'thumbnails' => ['high' => ['url' => 'https://cdn.test/video.jpg']],
            ],
        ]]], 200)]);

        $items = app(YouTubeService::class)->latest();

        $this->assertSame('Video & DPF', $items[0]['title']);
        $this->assertSame('https://www.youtube.com/watch?v=video-1', $items[0]['video_url']);
        $this->assertArrayNotHasKey('key', $items[0]);
    }

    public function test_it_returns_stale_youtube_cache_on_failure(): void
    {
        Cache::put('social.youtube.stale', [['id' => 'stale-video']], 600);
        Http::fake(['*' => Http::response([], 500)]);

        $this->assertSame([['id' => 'stale-video']], app(YouTubeService::class)->latest());
    }
}
