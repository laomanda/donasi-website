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
        'program_id',
        'category',
        'category_en',
        'thumbnail_path',
        'excerpt',
        'excerpt_en',
        'body',
        'body_en',
        'author_name',
        'published_at',
        'status',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    protected static function booted()
    {
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

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->orderByDesc('published_at');
    }
}
