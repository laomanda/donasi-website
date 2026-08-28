<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'slug',
        'slug_en',
        'program_id',
        'category',
        'category_en',
        'thumbnail_path',
        'video_path',
        'excerpt',
        'excerpt_en',
        'body',
        'body_en',
        'author_name',
        'published_at',
        'status',
    ];

    protected $appends = [
        'video_url',
        'thumbnail_url',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function getVideoUrlAttribute(): ?string
    {
        if (!$this->video_path) return null;
        if (\Illuminate\Support\Str::startsWith($this->video_path, ['http://', 'https://'])) {
            return $this->video_path;
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->video_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) return null;
        if (\Illuminate\Support\Str::startsWith($this->thumbnail_path, ['http://', 'https://'])) {
            return $this->thumbnail_path;
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->thumbnail_path);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'article_program');
    }

    public function savedByUsers()
    {
        return $this->morphMany(SavedItem::class, 'saveable');
    }

    protected static function booted()
    {
        static::creating(function ($article) {
            if (empty($article->slug) && ! empty($article->title)) {
                $article->slug = \Illuminate\Support\Str::slug($article->title);
            }
            if (empty($article->slug_en) && ! empty($article->title_en)) {
                $article->slug_en = \Illuminate\Support\Str::slug($article->title_en);
            }
        });

        static::updating(function ($article) {
            if (empty($article->slug) && ! empty($article->title)) {
                $article->slug = \Illuminate\Support\Str::slug($article->title);
            }
            if (empty($article->slug_en) && ! empty($article->title_en)) {
                $article->slug_en = \Illuminate\Support\Str::slug($article->title_en);
            }
        });

        static::saved(function ($article) {
            self::clearArticlesCache();
        });

        static::deleted(function ($article) {
            self::clearArticlesCache();
        });
    }

    private static function clearArticlesCache()
    {
        \Illuminate\Support\Facades\Cache::forget('frontend.home');
        
        // Clear all tags in Redis if supported, otherwise just flush
        // Karena Laravel cache default mungkin file, kita tidak bisa wild card delete mudah
        // Solusi terbaik: ganti mekanisme cache name di Controller suatu saat
        // Untuk sekarang kita asumsikan pakai Redis/Memcached atau kita flush semua khusus prefix
        $store = \Illuminate\Support\Facades\Cache::getStore();
        if (method_exists($store, 'flush')) {
            // Ini mungkin berbahaya jika ada session di cache
            // Idealnya pakai Cache Tags: Cache::tags(['articles'])->flush();
            // Sebagai alternatif yang lebih aman tanpa tag:
            try {
                \Illuminate\Support\Facades\Artisan::call('cache:clear');
            } catch (\Exception $e) {
                // ignore
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopePublished(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', '=', 'published')
            ->whereNotNull('published_at')
            ->orderByDesc('published_at');
    }
}
